from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AppointmentCreate(BaseModel):
    slot_id: int


class AppointmentResponse(BaseModel):
    id: int
    slot_id: int
    dentist_id: int
    patient_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
