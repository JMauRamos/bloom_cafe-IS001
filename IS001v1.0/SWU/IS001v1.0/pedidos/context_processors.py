from django.db import DatabaseError


def conteo_pedidos(request):
    if not request.user.is_authenticated:
        return {}
    from pedidos.models import Pedido
    try:
        pendientes = Pedido.objects.filter(estado='PENDIENTE').count()
    except DatabaseError:
        pendientes = 0
    return {'pedidos_pendientes_count': pendientes}
