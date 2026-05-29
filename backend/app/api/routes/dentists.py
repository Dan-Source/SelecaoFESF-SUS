from fastapi import APIRouter, Response

from app.core.cache import cache_get_json, cache_set_json
from app.core.cache import dentist_slots_all_key
from app.core.cache_utils import invalidate_dentist_slots_cache
from app.core.dependencies import DBSessionDep, DentistUserDep
from app.schemas.appointment import AppointmentResponse
from app.schemas.schedule import ScheduleCreate, ScheduleResponse
from app.services.appointment_service import list_dentist_appointments
from app.services.schedule_service import create_slot, delete_dentist_slot, list_dentist_slots

router = APIRouter(prefix="/dentists", tags=["dentists"])


@router.post("/me/slots", response_model=ScheduleResponse, status_code=201)
def create_my_slot(
    payload: ScheduleCreate,
    db: DBSessionDep,
    current_user: DentistUserDep,
):
    slot = create_slot(db, current_user.id, payload.start_time, payload.end_time)
    invalidate_dentist_slots_cache(current_user.id)
    return slot


@router.get("/me/slots", response_model=list[ScheduleResponse])
def list_my_slots(
    db: DBSessionDep,
    current_user: DentistUserDep,
):
    key = dentist_slots_all_key(current_user.id)
    cached = cache_get_json(key)
    if cached is not None:
        return cached

    slots = list_dentist_slots(db, current_user.id)
    payload = [ScheduleResponse.model_validate(item).model_dump(mode="json") for item in slots]
    cache_set_json(key, payload)
    return slots


@router.delete("/me/slots/{slot_id}", status_code=204)
def delete_my_slot(
    slot_id: int,
    db: DBSessionDep,
    current_user: DentistUserDep,
):
    delete_dentist_slot(db, current_user.id, slot_id)
    invalidate_dentist_slots_cache(current_user.id)
    return Response(status_code=204)


@router.get("/me/appointments", response_model=list[AppointmentResponse])
def list_my_appointments(
    db: DBSessionDep,
    current_user: DentistUserDep,
):
    return list_dentist_appointments(db, current_user.id)
