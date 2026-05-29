from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.schedule_slot import ScheduleSlot


def create_slot(db: Session, dentist_id: int, start_time: datetime, end_time: datetime) -> ScheduleSlot:
    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="Horario invalido")

    slot = ScheduleSlot(dentist_id=dentist_id, start_time=start_time, end_time=end_time, available=True)
    db.add(slot)
    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Horario ja existe para este odontologo") from exc

    db.refresh(slot)
    return slot


def list_dentist_slots(db: Session, dentist_id: int) -> list[ScheduleSlot]:
    statement = select(ScheduleSlot).where(ScheduleSlot.dentist_id == dentist_id).order_by(ScheduleSlot.start_time)
    return list(db.scalars(statement).all())


def delete_dentist_slot(db: Session, dentist_id: int, slot_id: int) -> None:
    slot = db.scalar(select(ScheduleSlot).where(ScheduleSlot.id == slot_id).with_for_update())
    if not slot or slot.dentist_id != dentist_id:
        raise HTTPException(status_code=404, detail="Horario nao encontrado")

    if not slot.available:
        raise HTTPException(status_code=400, detail="Nao e possivel excluir horario com consulta")

    db.delete(slot)
    db.commit()
