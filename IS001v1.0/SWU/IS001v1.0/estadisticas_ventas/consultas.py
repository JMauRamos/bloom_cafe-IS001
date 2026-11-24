from datetime import datetime, time, timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone

from pedidos.models import DetallePedido, Pedido


PERIODOS = {
    "dia": "Hoy",
    "semana": "Esta semana",
    "mes": "Este mes",
}

MESES = (
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
)


def _limites_periodo(periodo, hoy):
    if periodo == "semana":
        inicio = hoy - timedelta(days=hoy.weekday())
        fin = inicio + timedelta(days=7)
        etiqueta = f"Del {inicio:%d/%m/%Y} al {(fin - timedelta(days=1)):%d/%m/%Y}"
    elif periodo == "mes":
        inicio = hoy.replace(day=1)
        fin = (inicio.replace(day=28) + timedelta(days=4)).replace(day=1)
        etiqueta = f"{MESES[inicio.month - 1].capitalize()} {inicio.year}"
    else:
        inicio = hoy
        fin = hoy + timedelta(days=1)
        etiqueta = f"{hoy:%d/%m/%Y}"

    desde = timezone.make_aware(datetime.combine(inicio, time.min))
    hasta = timezone.make_aware(datetime.combine(fin, time.min))
    return desde, hasta, etiqueta


def obtener_estadisticas_ventas(periodo):
    """Devuelve pedidos, ventas y productos más vendidos para un periodo."""
    hoy = timezone.localdate()
    desde, hasta, etiqueta_periodo = _limites_periodo(periodo, hoy)

    pedidos = Pedido.objects.filter(
        fecha_registro__gte=desde,
        fecha_registro__lt=hasta,
    )

    resumen = pedidos.aggregate(
        cantidad_pedidos=Count("id"),
        pedidos_cancelados=Count("id", filter=Q(estado="CANCELADO")),
        ventas=Sum("total", filter=~Q(estado="CANCELADO")),
    )

    pedidos_vigentes = pedidos.exclude(estado="CANCELADO")
    total_unidades = DetallePedido.objects.filter(pedido__in=pedidos_vigentes).aggregate(
        unidades=Sum("cantidad")
    )["unidades"] or 0
    ventas_por_producto = list(
        DetallePedido.objects.filter(pedido__in=pedidos_vigentes)
        .values("variante_producto__producto__nombre")
        .annotate(
            unidades=Sum("cantidad"),
            importe=Sum("subtotal"),
        )
        .order_by("-unidades", "variante_producto__producto__nombre")[:5]
    )

    max_unidades = max((item["unidades"] for item in ventas_por_producto), default=0)
    for producto in ventas_por_producto:
        producto["nombre"] = producto.pop("variante_producto__producto__nombre")
        producto["porcentaje"] = max(
            8,
            round(producto["unidades"] * 100 / max_unidades),
        ) if max_unidades else 0

    pedidos_recientes = (
        pedidos.order_by("-fecha_registro")
        .prefetch_related("detalles__variante_producto__producto")[:5]
    )

    return {
        "fecha_actual": hoy,
        "etiqueta_periodo": etiqueta_periodo,
        "cantidad_pedidos": resumen["cantidad_pedidos"] or 0,
        "pedidos_cancelados": resumen["pedidos_cancelados"] or 0,
        "ventas": resumen["ventas"] or 0,
        "productos_vendidos": total_unidades,
        "productos_mas_vendidos": ventas_por_producto,
        "pedidos_recientes": pedidos_recientes,
        "hay_pedidos": pedidos.exists(),
        "hay_pedidos_sin_fecha": Pedido.objects.filter(fecha_registro__isnull=True).exists(),
    }
