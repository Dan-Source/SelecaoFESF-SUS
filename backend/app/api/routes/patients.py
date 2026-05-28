from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.db.session import get_db
from app.models.schedule_slot import ScheduleSlot
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.schemas.auth import UserResponse
from app.schemas.schedule import ScheduleResponse
from app.services.appointment_service import book_appointment, cancel_appointment, list_patient_appointments

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/dentists", response_model=list[UserResponse])
def list_dentists(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    _ = current_user
    statement = select(User).where(User.role == UserRole.DENTIST).order_by(User.name)
    return list(db.scalars(statement).all())


@router.get("/dentists/{dentist_id}/slots", response_model=list[ScheduleResponse])
def list_free_slots(
    dentist_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    _ = current_user
    statement = (
        select(ScheduleSlot)
        .where(ScheduleSlot.dentist_id == dentist_id, ScheduleSlot.available.is_(True))
        .order_by(ScheduleSlot.start_time)
    )
    return list(db.scalars(statement).all())


@router.post("/me/appointments", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    payload: AppointmentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    return book_appointment(db, current_user.id, payload.slot_id)


@router.get("/me/appointments", response_model=list[AppointmentResponse])
def list_my_appointments(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    return list_patient_appointments(db, current_user.id)


@router.delete("/me/appointments/{appointment_id}", status_code=204)
def delete_my_appointment(
    appointment_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    cancel_appointment(db, current_user.id, appointment_id)
    return Response(status_code=204)
