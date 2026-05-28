from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"
    __table_args__ = (
        UniqueConstraint("dentist_id", "start_time", "end_time", name="uq_dentist_slot"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    dentist_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    dentist = relationship("User", back_populates="dentist_slots", foreign_keys=[dentist_id])
    appointment = relationship("Appointment", back_populates="slot", uselist=False)
