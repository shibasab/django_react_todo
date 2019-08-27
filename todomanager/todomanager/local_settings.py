import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = "2f2-hp*a%hi$dos^0$vf3c2)vg=c_k$7!b#!w13r7^m$_^&($-"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    }
}


DEBUG = True
