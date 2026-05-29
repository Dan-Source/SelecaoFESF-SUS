from fastapi import APIRouter, Response
from sqlalchemy import select

from app.core.cache import cache_delete_many, cache_get_json, cache_set_json
from app.core.cache import dentist_slots_free_key, dentists_list_key
from app.core.cache_utils import invalidate_dentist_slots_cache
from app.core.dependencies import DBSessionDep, PatientUserDep
from app.models.schedule_slot import ScheduleSlot
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentResponse
from app.schemas.auth import UserResponse
from app.schemas.schedule import ScheduleResponse
from app.services.appointment_service import book_appointment, cancel_appointment, list_patient_appointments

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/dentists", response_model=list[UserResponse])
def list_dentists(
    db: DBSessionDep,
    current_user: PatientUserDep,
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
    db: DBSessionDep,
    current_user: PatientUserDep,
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
    db: DBSessionDep,
    current_user: PatientUserDep,
):
    appointment = book_appointment(db, current_user.id, payload.slot_id)
    invalidate_dentist_slots_cache(appointment.dentist_id)
    return appointment


@router.get("/me/appointments", response_model=list[AppointmentResponse])
def list_my_appointments(
    db: DBSessionDep,
    current_user: PatientUserDep,
):
    return list_patient_appointments(db, current_user.id)


@router.delete("/me/appointments/{appointment_id}", status_code=204)
def delete_my_appointment(
    appointment_id: int,
    db: DBSessionDep,
    current_user: PatientUserDep,
):
    dentist_id = cancel_appointment(db, current_user.id, appointment_id)
    invalidate_dentist_slots_cache(dentist_id)
    return Response(status_code=204)
