from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class Empleado(AbstractUser):
    ROLES = [('DUENA', 'Dueña'), ('EMPLEADO', 'Empleado')]
    rol = models.CharField(max_length=20, choices=ROLES, default='EMPLEADO')