from pydantic import BaseModel
from typing import Optional

class SystemConnectRequest(BaseModel):
    systemName: str
    organizationCode: str

class SystemConnectResponse(BaseModel):
    success: bool
    message: str
    systemId: Optional[str] = None
    organizationName: Optional[str] = None

class SystemStatusResponse(BaseModel):
    status: str
    message: str
    secretToken: Optional[str] = None
    organizationName: Optional[str] = None
