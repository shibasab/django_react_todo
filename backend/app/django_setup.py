import os
import django

# Django設定を読み込み
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "todomanager.settings")
django.setup()
