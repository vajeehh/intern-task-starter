
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Task


class TaskApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.alice = User.objects.create_user(
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            username="bob",
            password="password123",
        )

    def test_list_requires_auth(self):
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 401)

    def test_list_tasks(self):
        self.client.force_authenticate(self.alice)
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)

    def test_task_stats(self):
        self.client.force_authenticate(self.alice)

        Task.objects.create(
            title="Todo1",
            status="todo",
            assigned_to=self.alice,
            created_by=self.alice,
            due_date=timezone.now() + timezone.timedelta(days=1),
        )

        Task.objects.create(
            title="InProgress",
            status="in_progress",
            assigned_to=self.alice,
            created_by=self.alice,
            due_date=timezone.now() + timezone.timedelta(days=1),
        )

        Task.objects.create(
            title="DoneTask",
            status="done",
            assigned_to=self.alice,
            created_by=self.alice,
            due_date=timezone.now(),
        )

        Task.objects.create(
            title="OverdueTask",
            status="todo",
            assigned_to=self.alice,
            created_by=self.alice,
            due_date=timezone.now() - timezone.timedelta(days=1),
        )

        response = self.client.get("/api/tasks/stats/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["todo"], 1)
        self.assertEqual(response.data["in_progress"], 1)
        self.assertEqual(response.data["done"], 1)
        self.assertEqual(response.data["overdue"], 1)
