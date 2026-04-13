from pydantic import BaseModel
from typing import Optional

class SystemConnectRequest(BaseModel):
    systemName: str
    organizationCode: str
    hostName: Optional[str] = None
    macAddress: Optional[str] = None
    ipAddress: Optional[str] = None

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
    organizationLogo: Optional[str] = None
    tokenExpiresAt: Optional[str] = None

class SystemVerifyRequest(BaseModel):
    systemId: str
    secretToken: str
    macAddress: Optional[str] = None

class SystemVerifyResponse(BaseModel):
    valid: bool
    status: str
    message: str
    systemName: Optional[str] = None
    organizationName: Optional[str] = None
    organizationLogo: Optional[str] = None
