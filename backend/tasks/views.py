
from django.db.models import F, Count, Q
from django.utils import timezone

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Task
from .permissions import IsAssigneeOrCreatorOrReadOnly
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsAssigneeOrCreatorOrReadOnly,
    ]

    def get_queryset(self):
        queryset = Task.objects.select_related(
            "assigned_to",
            "created_by",
        ).order_by(F("due_date").asc(nulls_last=True))

        status_param = self.request.query_params.get("status")

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def task_statistics(request):
    """
    Return statistics for tasks assigned to the authenticated user.

    todo: Todo tasks that are not overdue.
    in_progress: Tasks currently in progress.
    done: Completed tasks.
    overdue: Past-due tasks that are not done.
    """
    now = timezone.now()

    queryset = Task.objects.filter(
        assigned_to=request.user
    )

    stats = queryset.aggregate(
        todo=Count(
            "id",
            filter=(
                Q(status="todo")
                & (
                    Q(due_date__gte=now)
                    | Q(due_date__isnull=True)
                )
            ),
        ),
        in_progress=Count(
            "id",
            filter=Q(status="in_progress"),
        ),
        done=Count(
            "id",
            filter=Q(status="done"),
        ),
        overdue=Count(
            "id",
            filter=(
                Q(status__in=["todo", "in_progress"])
                & Q(due_date__lt=now)
            ),
        ),
    )

    return Response(stats, status=status.HTTP_200_OK)
