from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    usage_count: int
    is_admin: bool
    is_tester: bool

    class Config:
        from_attributes = True

