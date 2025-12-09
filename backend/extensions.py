from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
cors = CORS()
# Limiter is initialized here with key_func
limiter = Limiter(key_func=get_remote_address)
