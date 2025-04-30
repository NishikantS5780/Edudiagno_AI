from fastapi import Request, HTTPException
from app.utils import jwt


def authorize_recruiter(request: Request):
    authorization_header = request.headers.get("authorization")
    if not authorization_header:
        raise HTTPException(status_code=401, detail="unauthorized")
    token = authorization_header.split("Bearer ")[1]
    decoded_data = jwt.decode(token)

    return decoded_data["id"]


def authorize_candidate(request: Request):
    authorization_header = request.headers.get("authorization")
    if not authorization_header:
        raise HTTPException(status_code=401, detail="unauthorized")
    token = authorization_header.split("Bearer ")[1]
    decoded_data = jwt.decode(token)

    return decoded_data["interview_id"]


def authorize_quiz_access(request: Request):
    authorization_header = request.headers.get("authorization")
    if not authorization_header:
        raise HTTPException(status_code=401, detail="unauthorized")
    token = authorization_header.split("Bearer ")[1]
    decoded_data = jwt.decode(token)
    
    # Check if it's a recruiter token
    if "id" in decoded_data:
        return {"type": "recruiter", "id": decoded_data["id"]}
    # Check if it's a candidate token
    elif "interview_id" in decoded_data:
        return {"type": "candidate", "id": decoded_data["interview_id"]}
    else:
        raise HTTPException(status_code=401, detail="Invalid token type")
