import base64
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import config, database, schemas

router = APIRouter()


@router.post("")
async def create_dsa_response(
    dsa_response_data: schemas.CreateDSAResponse, db: Session = Depends(database.get_db)
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
                                        # "callbackUrlOnExecutionCompletion": "",
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
    return {}


@router.get("")
async def get_dsa_response(
    dsa_response_data: schemas.UpdateDSAResponse, db: Session = Depends(database.get_db)
):
    return {}


@router.put("")
async def update_dsa_response(db: Session = Depends(database.get_db)):
    return {}
