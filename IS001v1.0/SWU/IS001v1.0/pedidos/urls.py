from django.urls import path
from . import views

urlpatterns = [
    path('mis_pedidos/', views.ver_mis_pedidos, name='mis_pedidos'),
    path('api/mis_pedidos/<str:telefono>/', views.api_mis_pedidos, name='api_mis_pedidos'),
    path('checkout/', views.checkout, name='checkout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('en_preparacion/', views.pedidos_admin, name='pedidos_admin'),
    path('productos/', views.productos_admin, name='productos_admin')
]