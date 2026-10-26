from .views import TaskViewSet, task_statistics
from rest_framework.routers import DefaultRouter
from django.urls import path

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

# Place stats endpoint before router URLs to ensure correct path /api/tasks/stats/
urlpatterns = [
    path('tasks/stats/', task_statistics, name='task-stats'),
] + router.urls


