from django.urls import path
from . import views

urlpatterns = [
    path('mis_pedidos/', views.ver_mis_pedidos, name='mis_pedidos'),
    path('api/mis_pedidos/<str:telefono>/', views.api_mis_pedidos, name='api_mis_pedidos'),
    path('checkout/', views.checkout, name='checkout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('en_preparacion/', views.pedidos_admin, name='pedidos_admin'),
    path('productos/', views.productos_admin, name='productos_admin'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/eliminar/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),
    path('productos/editar/<int:producto_id>/', views.editar_producto, name='editar_producto'),
    path('productos/disponibilidad/<int:producto_id>/', views.cambiar_disponibilidad, name='cambiar_disponibilidad'),
    path('api/pedido/<int:pedido_id>/cambiar_estado/', views.avanzar_estado_pedido, name='cambiar_estado_pedido'),
    path('api/pedido/<int:pedido_id>/detalle/', views.api_detalle_pedido, name='api_detalle_pedido'),
]