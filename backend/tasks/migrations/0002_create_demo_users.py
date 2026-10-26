from django.db import migrations
from django.contrib.auth import get_user_model

def create_demo_users(apps, schema_editor):
    User = get_user_model()
    for username in ["demo_alice", "demo_bob", "demo_carol"]:
        User.objects.get_or_create(username=username, defaults={"password": "password123"})

def remove_demo_users(apps, schema_editor):
    User = get_user_model()
    User.objects.filter(username__in=["demo_alice", "demo_bob", "demo_carl"]).delete()

class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_demo_users, reverse_code=remove_demo_users),
    ]
