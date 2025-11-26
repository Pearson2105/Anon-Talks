#!/bin/sh
python -c "from app import create_app; app=create_app(); app.app_context().push(); from extensions import db; db.create_all()"
exec "$@"
