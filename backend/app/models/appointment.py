from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (UniqueConstraint("slot_id", name="uq_appointment_slot"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    slot_id: Mapped[int] = mapped_column(ForeignKey("schedule_slots.id", ondelete="RESTRICT"), nullable=False)
    dentist_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    slot = relationship("ScheduleSlot", back_populates="appointment")
    dentist = relationship("User", back_populates="dentist_appointments", foreign_keys=[dentist_id])
    patient = relationship("User", back_populates="patient_appointments", foreign_keys=[patient_id])
