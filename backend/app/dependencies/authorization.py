from fastapi import Request, HTTPException
from app.utils import jwt


def authorize_recruiter(request: Request):
    authorization_header = request.headers.get("authorization")
    if not authorization_header:
        raise HTTPException(status_code=401, detail="unauthorized")
    token = authorization_header.split("Bearer ")[1]
    decoded_data = jwt.decode(token)

    return decoded_data["id"]
