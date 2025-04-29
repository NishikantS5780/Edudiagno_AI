import base64
from typing import Dict
from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect
from sqlalchemy import and_, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app import config, database, schemas
from app.dependencies.authorization import authorize_candidate
from app.models import DSAResponse, DSATestCase, DSATestCaseResponse, Interview
from app.utils import jwt

router = APIRouter()


class InterviewConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, interview_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[interview_id] = websocket

    def disconnect(self, interview_id: int):
        self.active_connections.pop(interview_id, None)

    async def send_data(self, interview_id: int, data):
        websocket = self.active_connections.get(interview_id)
        if websocket:
            await websocket.send_json(data)


interview_connection_manager = InterviewConnectionManager()


@router.websocket("")
async def ws(
    websocket: WebSocket,
    i_token=str,
):
    if not i_token:
        websocket.close(reason="Cannot Authenticate")
    decoded_data = jwt.decode(i_token)

    interview_id = decoded_data["interview_id"]

    await interview_connection_manager.connect(
        interview_id=interview_id, websocket=websocket
    )

    async for data in websocket.iter_json():
        print(data)
        await websocket.send_json({"message": "working..."})


@router.post("")
async def create_dsa_response(
    response_data: schemas.CreateDSAResponse,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    stmt = insert(DSAResponse).values(
        code=response_data.code,
        interview_id=interview_id,
        question_id=response_data.question_id,
    )
    upsert_stmt = stmt.on_conflict_do_update(
        index_elements=["interview_id", "question_id"],
        set_={
            "code": stmt.excluded.code,
        },
    ).returning(DSAResponse.id)

    result = db.execute(upsert_stmt)
    db.commit()
    dsa_response_id = result.all()[0]._mapping["id"]

    stmt = select(DSATestCase.id, DSATestCase.input, DSATestCase.expected_output).where(
        DSATestCase.dsa_question_id == response_data.question_id
    )
    test_cases = [dict(test_case._mapping) for test_case in db.execute(stmt).all()]
    import aiohttp

    entries = []
    for test_case in test_cases:
        entries.append(
            {
                "language": "C",
                "runConfig": {
                    "customMatcherToUseForExpectedOutput": "ExactMatch",
                    "expectedOutputAsBase64UrlEncoded": base64.urlsafe_b64encode(
                        test_case["expected_output"].encode()
                    )
                    .decode()
                    .rstrip("="),
                    "stdinStringAsBase64UrlEncoded": base64.urlsafe_b64encode(
                        test_case["input"].encode()
                    )
                    .decode()
                    .rstrip("="),
                    "callbackUrlOnExecutionCompletion": "https://codeappmedia.in/api/dsa-response/callback",
                    "shouldEnablePerProcessAndThreadCpuTimeLimit": False,
                    "shouldEnablePerProcessAndThreadMemoryLimit": False,
                    "shouldAllowInternetAccess": False,
                    # "compilerFlagString": "",
                    "maxFileSizeInKilobytesFilesCreatedOrModified": 1024,
                    "stackSizeLimitInKilobytes": 65536,
                    "cpuTimeLimitInMilliseconds": 2000,
                    "wallTimeLimitInMilliseconds": 5000,
                    "memoryLimitInKilobyte": 131072,
                    "maxProcessesAndOrThreads": 60,
                },
                "sourceCodeAsBase64UrlEncoded": base64.urlsafe_b64encode(
                    response_data.code.encode()
                )
                .decode()
                .rstrip("="),
            }
        )

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://backend.codedamn.com/api/public/request-dsa-code-execution-batch",
            headers={"FERMION-API-KEY": config.settings.FERMION_API_KEY},
            json={"data": [{"data": {"entries": entries}}]},
        ) as response:
            result = await response.json()
            taskIds = result[0]["output"]["data"]["taskIds"]

            dsa_test_case_responses = []
            for i in range(len(test_cases)):
                dsa_test_case_responses.append(
                    {
                        "status": "pending",
                        "dsa_response_id": dsa_response_id,
                        "task_id": taskIds[i],
                        "dsa_test_case_id": test_cases[i]["id"],
                    }
                )
            stmt = insert(DSATestCaseResponse).values(dsa_test_case_responses)
            stmt = stmt.on_conflict_do_update(
                index_elements=["dsa_response_id", "dsa_test_case_id"],
                set_={"status": "pending", "task_id": stmt.excluded.task_id},
            )
            db.execute(stmt)
            db.commit()

    return {"message": "executing"}


@router.post("/callback")
async def execution_callback(request: Request, db: Session = Depends(database.get_db)):
    data = await request.json()

    taskUID = data["taskUniqueId"]
    runStatus = data["runResult"]["runStatus"]
    stmt = (
        update(DSATestCaseResponse)
        .values({"status": runStatus})
        .where(DSATestCaseResponse.task_id == taskUID)
        .returning(DSATestCaseResponse.dsa_response_id)
    )
    result = db.execute(stmt)
    db.commit()
    dsa_response_id = result.all()[0]._mapping["dsa_response_id"]

    if runStatus != "successful":
        stmt = (
            select(
                Interview.id, DSATestCaseResponse.status, DSATestCase.expected_output
            )
            .join(DSAResponse, DSAResponse.interview_id == Interview.id)
            .join(
                DSATestCaseResponse,
                DSATestCaseResponse.dsa_response_id == DSAResponse.id,
            )
            .join(DSATestCase, DSATestCase.id == DSATestCaseResponse.dsa_test_case_id)
            .where(DSATestCaseResponse.task_id == taskUID)
        )
        data = db.execute(stmt).all()[0]._mapping
        interview_connection_manager.active_connections[data["id"]].send_json(
            {"event": "execution_reult", "status": "failed", "failed_test_case": data}
        )

    stmt = select(func.count(DSATestCaseResponse.id).label("passed_count")).where(
        and_(
            DSATestCaseResponse.dsa_response_id == dsa_response_id,
            DSATestCaseResponse.status == "successful",
        )
    )
    passed_count = db.execute(stmt).all()[0]["passed_count"]
    stmt = (
        select(func.count(DSATestCase.id).label("total_count"))
        .join(DSAResponse, DSAResponse.question_id == DSATestCase.dsa_question_id)
        .where(DSAResponse.id == dsa_response_id)
    )
    total_count = db.execute(stmt).all()[0]["total_count"]

    if total_count == passed_count:
        interview_connection_manager.active_connections[data[0].interview_id].send_json(
            {
                "event": "execution_result",
                "status": "successful",
                "passed_count": passed_count,
            }
        )


@router.get("")
async def get_dsa_response(
    dsa_response_data: schemas.UpdateDSAResponse, db: Session = Depends(database.get_db)
):
    return {}


@router.put("")
async def update_dsa_response(db: Session = Depends(database.get_db)):
    return {}
