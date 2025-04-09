from typing import Optional
from pydantic import BaseModel


class RecruiterRegistration(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    designation: str
    company_name: str
    industry: str
    country: str
    state: str
    city: str
    zip: str
    address: str


class Recruiter(BaseModel):
    name: str
    email: str
    phone: str
    designation: str
    company_name: str
    company_logo: str
    website: str
    industry: str
    min_company_size: int
    max_company_size: int
    country: str
    state: str
    city: str
    zip: str
    address: str

    class Config:
        orm_mode = True
