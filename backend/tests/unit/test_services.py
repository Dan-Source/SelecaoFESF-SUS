from datetime import datetime, timedelta, timezone

import pytest

from app.models.schedule_slot import ScheduleSlot
from app.models.user import User, UserRole
from app.services.appointment_service import book_appointment, cancel_appointment
from app.services.schedule_service import create_slot, delete_dentist_slot


def _create_user(db, name: str, email: str, role: UserRole) -> User:
    user = User(name=name, email=email, hashed_password="hashed", role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def test_book_only_available_slot(db_session):
    dentist = _create_user(db_session, "Dentist", "dentist@example.com", UserRole.DENTIST)
    patient = _create_user(db_session, "Patient", "patient@example.com", UserRole.PATIENT)
    now = datetime.now(timezone.utc)

    slot = create_slot(db_session, dentist.id, now + timedelta(hours=1), now + timedelta(hours=2))
    appointment = book_appointment(db_session, patient.id, slot.id)

    assert appointment.slot_id == slot.id
    updated_slot = db_session.get(ScheduleSlot, slot.id)
    assert updated_slot.available is False


def test_cancel_appointment_releases_slot(db_session):
    dentist = _create_user(db_session, "Dentist", "dentist2@example.com", UserRole.DENTIST)
    patient = _create_user(db_session, "Patient", "patient2@example.com", UserRole.PATIENT)
    now = datetime.now(timezone.utc)

    slot = create_slot(db_session, dentist.id, now + timedelta(hours=3), now + timedelta(hours=4))
    appointment = book_appointment(db_session, patient.id, slot.id)
    cancel_appointment(db_session, patient.id, appointment.id)

    updated_slot = db_session.get(ScheduleSlot, slot.id)
    assert updated_slot.available is True


def test_dentist_cannot_delete_occupied_slot(db_session):
    dentist = _create_user(db_session, "Dentist", "dentist3@example.com", UserRole.DENTIST)
    patient = _create_user(db_session, "Patient", "patient3@example.com", UserRole.PATIENT)
    now = datetime.now(timezone.utc)

    slot = create_slot(db_session, dentist.id, now + timedelta(hours=5), now + timedelta(hours=6))
    _ = book_appointment(db_session, patient.id, slot.id)

    with pytest.raises(Exception):
        delete_dentist_slot(db_session, dentist.id, slot.id)
