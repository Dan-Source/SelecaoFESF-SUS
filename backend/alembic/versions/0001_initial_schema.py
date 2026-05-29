"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-29 00:00:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("PATIENT", "DENTIST", name="userrole"), nullable=False),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "schedule_slots",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("dentist_id", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("available", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["dentist_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("dentist_id", "start_time", "end_time", name="uq_dentist_slot"),
    )
    op.create_index(op.f("ix_schedule_slots_id"), "schedule_slots", ["id"], unique=False)
    op.create_index(op.f("ix_schedule_slots_start_time"), "schedule_slots", ["start_time"], unique=False)

    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("slot_id", sa.Integer(), nullable=False),
        sa.Column("dentist_id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["dentist_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["patient_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["slot_id"], ["schedule_slots.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("slot_id", name="uq_appointment_slot"),
    )
    op.create_index(op.f("ix_appointments_id"), "appointments", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_appointments_id"), table_name="appointments")
    op.drop_table("appointments")

    op.drop_index(op.f("ix_schedule_slots_start_time"), table_name="schedule_slots")
    op.drop_index(op.f("ix_schedule_slots_id"), table_name="schedule_slots")
    op.drop_table("schedule_slots")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS userrole")
