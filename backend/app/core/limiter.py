from slowapi import Limiter
from slowapi.util import get_remote_address

# Usa la IP para rastrear las peticiones
limiter = Limiter(key_func=get_remote_address)