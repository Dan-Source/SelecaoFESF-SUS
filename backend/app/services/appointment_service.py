from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, ResourceNotFoundError, ValidationError
from app.models.appointment import Appointment
from app.models.schedule_slot import ScheduleSlot


def book_appointment(db: Session, patient_id: int, slot_id: int) -> Appointment:
    slot = db.scalar(select(ScheduleSlot).where(ScheduleSlot.id == slot_id).with_for_update())
    if not slot:
        raise ResourceNotFoundError("Horario nao encontrado")
    if not slot.available:
        raise ValidationError("Horario indisponivel")

    slot.available = False
    appointment = Appointment(
        slot_id=slot.id,
        dentist_id=slot.dentist_id,
        patient_id=patient_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(appointment)

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ConflictError("Conflito ao agendar horario") from exc

    db.refresh(appointment)
    return appointment


def list_patient_appointments(db: Session, patient_id: int) -> list[Appointment]:
    statement = select(Appointment).where(Appointment.patient_id == patient_id).order_by(Appointment.created_at.desc())
    return list(db.scalars(statement).all())


def list_dentist_appointments(db: Session, dentist_id: int) -> list[Appointment]:
    statement = select(Appointment).where(Appointment.dentist_id == dentist_id).order_by(Appointment.created_at.desc())
    return list(db.scalars(statement).all())


def cancel_appointment(db: Session, patient_id: int, appointment_id: int) -> int:
    appointment = db.scalar(select(Appointment).where(Appointment.id == appointment_id).with_for_update())
    if appointment is None or appointment.patient_id != patient_id:
        raise ResourceNotFoundError("Consulta nao encontrada")

    slot = db.scalar(select(ScheduleSlot).where(ScheduleSlot.id == appointment.slot_id).with_for_update())
    if slot:
        slot.available = True

    dentist_id = appointment.dentist_id
    db.delete(appointment)
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ConflictError("Conflito ao cancelar consulta") from exc
    return dentist_id
