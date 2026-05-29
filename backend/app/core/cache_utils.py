from app.core.cache import cache_delete_many, dentist_slots_all_key, dentist_slots_free_key


def invalidate_dentist_slots_cache(dentist_id: int) -> None:
    cache_delete_many([
        dentist_slots_all_key(dentist_id),
        dentist_slots_free_key(dentist_id),
    ])
