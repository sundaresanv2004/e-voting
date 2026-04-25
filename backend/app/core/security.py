import hashlib
import secrets


def generate_secret_token(length: int = 32) -> str:
    return secrets.token_hex(length)


def hash_secret_token(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()
