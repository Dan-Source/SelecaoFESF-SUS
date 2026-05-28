from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentResponse
from app.schemas.schedule import ScheduleCreate, ScheduleResponse
from app.services.appointment_service import list_dentist_appointments
from app.services.schedule_service import create_slot, delete_dentist_slot, list_dentist_slots

router = APIRouter(prefix="/dentists", tags=["dentists"])


@router.post("/me/slots", response_model=ScheduleResponse, status_code=201)
def create_my_slot(
    payload: ScheduleCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.DENTIST))],
):
    return create_slot(db, current_user.id, payload.start_time, payload.end_time)


@router.get("/me/slots", response_model=list[ScheduleResponse])
def list_my_slots(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.DENTIST))],
):
    return list_dentist_slots(db, current_user.id)


@router.delete("/me/slots/{slot_id}", status_code=204)
def delete_my_slot(
    slot_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.DENTIST))],
):
    delete_dentist_slot(db, current_user.id, slot_id)
    return Response(status_code=204)


@router.get("/me/appointments", response_model=list[AppointmentResponse])
def list_my_appointments(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.DENTIST))],
):
    return list_dentist_appointments(db, current_user.id)
