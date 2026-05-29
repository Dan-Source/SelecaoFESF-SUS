import json
import logging
from typing import Any

from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)
_redis_client: Redis | None = None


def get_redis_client() -> Redis | None:
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    if not settings.redis_url:
        return None

    try:
        _redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
        _redis_client.ping()
    except RedisError:
        logger.warning("Redis indisponivel. A API seguira sem cache.")
        _redis_client = None

    return _redis_client


def cache_get_json(key: str) -> Any | None:
    client = get_redis_client()
    if client is None:
        return None

    try:
        cached = client.get(key)
        if cached is None:
            return None
        return json.loads(cached)
    except (RedisError, json.JSONDecodeError):
        logger.warning("Falha ao ler cache para chave '%s'", key)
        return None


def cache_set_json(key: str, payload: Any, ttl_seconds: int | None = None) -> None:
    client = get_redis_client()
    if client is None:
        return

    ttl = ttl_seconds if ttl_seconds is not None else settings.redis_cache_ttl_seconds
    try:
        client.set(name=key, value=json.dumps(payload), ex=ttl)
    except (RedisError, TypeError):
        logger.warning("Falha ao gravar cache para chave '%s'", key)


def cache_delete_many(keys: list[str]) -> None:
    if not keys:
        return

    client = get_redis_client()
    if client is None:
        return

    try:
        client.delete(*keys)
    except RedisError:
        logger.warning("Falha ao invalidar chaves de cache")


def dentist_slots_free_key(dentist_id: int) -> str:
    return f"dentist:{dentist_id}:slots:free"


def dentist_slots_all_key(dentist_id: int) -> str:
    return f"dentist:{dentist_id}:slots:all"


def dentists_list_key() -> str:
    return "dentists:list"
