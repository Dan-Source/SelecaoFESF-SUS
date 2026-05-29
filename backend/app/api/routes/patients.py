from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.cache import cache_delete_many, cache_get_json, cache_set_json
from app.core.cache import dentist_slots_all_key, dentist_slots_free_key, dentists_list_key
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
    key = dentists_list_key()
    cached = cache_get_json(key)
    if cached is not None:
        return cached

    statement = select(User).where(User.role == UserRole.DENTIST).order_by(User.name)
    dentists = list(db.scalars(statement).all())
    payload = [UserResponse.model_validate(item).model_dump(mode="json") for item in dentists]
    cache_set_json(key, payload)
    return dentists


@router.get("/dentists/{dentist_id}/slots", response_model=list[ScheduleResponse])
def list_free_slots(
    dentist_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    _ = current_user
    key = dentist_slots_free_key(dentist_id)
    cached = cache_get_json(key)
    if cached is not None:
        return cached

    statement = (
        select(ScheduleSlot)
        .where(ScheduleSlot.dentist_id == dentist_id, ScheduleSlot.available.is_(True))
        .order_by(ScheduleSlot.start_time)
    )
    slots = list(db.scalars(statement).all())
    payload = [ScheduleResponse.model_validate(item).model_dump(mode="json") for item in slots]
    cache_set_json(key, payload)
    return slots


@router.post("/me/appointments", response_model=AppointmentResponse, status_code=201)
def create_appointment(
    payload: AppointmentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(UserRole.PATIENT))],
):
    appointment = book_appointment(db, current_user.id, payload.slot_id)
    cache_delete_many([
        dentist_slots_free_key(appointment.dentist_id),
        dentist_slots_all_key(appointment.dentist_id),
    ])
    return appointment


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
    dentist_id = cancel_appointment(db, current_user.id, appointment_id)
    cache_delete_many([
        dentist_slots_free_key(dentist_id),
        dentist_slots_all_key(dentist_id),
    ])
    return Response(status_code=204)
