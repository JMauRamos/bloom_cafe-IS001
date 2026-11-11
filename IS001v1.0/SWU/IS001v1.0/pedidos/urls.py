from django.urls import path
from . import views

urlpatterns = [
    path('mis_pedidos', views.ver_mis_pedidos, name='mis_pedidos'),
    path('checkout', views.pagar_pedido, name='checkout'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('en_preparacion', views.pedidos_admin, name='pedidos_admin'),
    path('productos', views.productos_admin, name='productos_admin')
]