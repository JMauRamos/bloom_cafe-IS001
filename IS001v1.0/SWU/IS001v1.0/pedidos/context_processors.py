def conteo_pedidos(request):
    if not request.user.is_authenticated:
        return {}
    from pedidos.models import Pedido
    return {
        'pedidos_pendientes_count': Pedido.objects.filter(estado='PENDIENTE').count(),
    }