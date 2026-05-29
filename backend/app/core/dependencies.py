from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.user import User, UserRole

DBSessionDep = Annotated[Session, Depends(get_db)]
DentistUserDep = Annotated[User, Depends(require_role(UserRole.DENTIST))]
PatientUserDep = Annotated[User, Depends(require_role(UserRole.PATIENT))]
