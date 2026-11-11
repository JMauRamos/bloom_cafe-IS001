from django.urls import path
from . import views

urlpatterns = [
    path('', views.vista_menu, name='menu_principal'),
    path('producto', views.ver_producto, name='ver_producto')
]
