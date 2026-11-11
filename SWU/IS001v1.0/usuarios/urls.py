from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_empleado, name='login'),
    path('logout/', views.logout_empleado, name='logout'),
]