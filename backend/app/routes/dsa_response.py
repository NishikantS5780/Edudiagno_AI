import base64
from typing import Dict
from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app import config, database, schemas
from app.dependencies.authorization import authorize_candidate

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
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):
    await interview_connection_manager.connect(
        interview_id=interview_id, websocket=websocket
    )
    async for data in websocket.iter_json():
        print(data["hi"])


@router.post("")
async def create_dsa_response(
    response_data: schemas.CreateDSAResponse,
    db: Session = Depends(database.get_db),
    interview_id=Depends(authorize_candidate),
):

    import aiohttp

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://backend.codedamn.com/api/public/request-dsa-code-execution-batch",
            headers={"FERMION-API-KEY": config.settings.FERMION_API_KEY},
            json={
                "data": [
                    {
                        "data": {
                            "entries": [
                                {
                                    "language": "C",
                                    "runConfig": {
                                        "customMatcherToUseForExpectedOutput": "ExactMatch",
                                        "expectedOutputAsBase64UrlEncoded": base64.urlsafe_b64encode(
                                            "hi".encode()
                                        )
                                        .decode()
                                        .rstrip("="),
                                        # "stdinStringAsBase64UrlEncoded": "",
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
                                        '#include<stdio.h>\nint main(){printf("hi");}'.encode()
                                    )
                                    .decode()
                                    .rstrip("="),
                                }
                            ]
                        }
                    }
                ]
            },
        ) as response:

            print("Status:", response.status)
            print("Content-type:", response.headers["content-type"])

            result = await response.json()
            print("Body:", result)
    return {"message": "executing"}


@router.post("/callback")
async def execution_callback(request: Request):
    data = await request.json()
    print(data)
    return


@router.get("")
async def get_dsa_response(
    dsa_response_data: schemas.UpdateDSAResponse, db: Session = Depends(database.get_db)
):
    return {}


@router.put("")
async def update_dsa_response(db: Session = Depends(database.get_db)):
    return {}
