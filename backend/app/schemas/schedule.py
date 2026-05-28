from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ScheduleCreate(BaseModel):
    start_time: datetime
    end_time: datetime


class ScheduleResponse(BaseModel):
    id: int
    dentist_id: int
    start_time: datetime
    end_time: datetime
    available: bool

    model_config = ConfigDict(from_attributes=True)
