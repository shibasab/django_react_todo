from rest_framework import routers
from .api import TodoViewSet

#api/todoにアクセス
router = routers.DefaultRouter()
router.register('api/todo', TodoViewSet, 'todo')

urlpatterns = router.urls
