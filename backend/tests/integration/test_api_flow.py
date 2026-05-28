from datetime import datetime, timedelta, timezone


def _register(client, name, email, password, role):
    return client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": email, "password": password, "role": role},
    )


def _login(client, email, password):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_full_flow(client):
    dentist_reg = _register(client, "Dent", "dent@x.com", "123456", "dentist")
    patient_reg = _register(client, "Pat", "pat@x.com", "123456", "patient")

    assert dentist_reg.status_code == 201
    assert patient_reg.status_code == 201

    dentist_headers = _login(client, "dent@x.com", "123456")
    patient_headers = _login(client, "pat@x.com", "123456")

    now = datetime.now(timezone.utc)
    create_slot = client.post(
        "/api/v1/dentists/me/slots",
        headers=dentist_headers,
        json={
            "start_time": (now + timedelta(days=1)).isoformat(),
            "end_time": (now + timedelta(days=1, hours=1)).isoformat(),
        },
    )
    assert create_slot.status_code == 201
    slot_id = create_slot.json()["id"]

    free_slots = client.get(f"/api/v1/patients/dentists/{dentist_reg.json()['id']}/slots", headers=patient_headers)
    assert free_slots.status_code == 200
    assert len(free_slots.json()) == 1

    appointment = client.post(
        "/api/v1/patients/me/appointments",
        headers=patient_headers,
        json={"slot_id": slot_id},
    )
    assert appointment.status_code == 201

    # Same slot cannot be booked twice.
    double_book = client.post(
        "/api/v1/patients/me/appointments",
        headers=patient_headers,
        json={"slot_id": slot_id},
    )
    assert double_book.status_code == 400

    # Dentist cannot delete a slot with booked appointment.
    delete_slot = client.delete(f"/api/v1/dentists/me/slots/{slot_id}", headers=dentist_headers)
    assert delete_slot.status_code == 400

    # Cancel releases slot.
    appointment_id = appointment.json()["id"]
    cancel = client.delete(f"/api/v1/patients/me/appointments/{appointment_id}", headers=patient_headers)
    assert cancel.status_code == 204

    free_slots_after_cancel = client.get(
        f"/api/v1/patients/dentists/{dentist_reg.json()['id']}/slots", headers=patient_headers
    )
    assert free_slots_after_cancel.status_code == 200
    assert len(free_slots_after_cancel.json()) == 1
