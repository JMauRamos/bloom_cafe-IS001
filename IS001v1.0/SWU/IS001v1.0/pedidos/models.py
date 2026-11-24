from django.db import models
from django.conf import settings

# Create your models here.

class Pedido(models.Model):
    METODOS_PAGO = [('TERMINAL', 'Terminal'), ('EFECTIVO', 'Efectivo')]
    LUGARES_ENTREGA = [('PUERTA', 'En Puerta'), ('BARRA', 'En Barra')]
    ESTADOS_PEDIDO = [('PENDIENTE', 'Pendiente'), ('PREPARANDO', 'En Preparacion'), ('LISTO', 'Listo para Entregar'), ('ENTREGADO', 'Entregado'), ('CANCELADO', 'Cancelado')]
    nombre_cliente = models.CharField(max_length=100)
    telefono_cliente = models.CharField(max_length=20)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=40, choices=ESTADOS_PEDIDO, default='PENDIENTE')
    fecha_registro = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name='Fecha de registro')
    fecha_entrega = models.DateField(verbose_name='Fecha de Entrega')
    hora_entrega = models.TimeField(verbose_name='Hora de Entrega')
    lugar_entrega = models.CharField(max_length=20, choices=LUGARES_ENTREGA)
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO)
    empleado_preparacion = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True, related_name='pedidos_preparados', verbose_name='Empleado que preparó')

    def avanzar_estado(self, empleado=None):
        if self.estado == 'PENDIENTE':
            self.estado = 'PREPARANDO'
            if empleado is not None and self.empleado_preparacion is None:
                self.empleado_preparacion = empleado
        elif self.estado == 'PREPARANDO':
            self.estado = 'LISTO'
        elif self.estado == 'LISTO':
            self.estado = 'ENTREGADO'

        self.save()

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='detalles', on_delete=models.CASCADE)
    variante_producto = models.ForeignKey('menu.VarianteProducto', on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    notas_extra = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.cantidad}x {self.variante_producto} (Pedido #{self.pedido.id})"

class Modificacion(models.Model):
    ACCIONES = [('AGREGAR', 'Agregar'), ('REMOVER', 'Remover')]
    detalle_pedido = models.ForeignKey(DetallePedido, related_name='modificaciones', on_delete=models.CASCADE)
    ingrediente = models.ForeignKey('menu.Ingrediente', related_name='ingredientes', on_delete=models.CASCADE)
    accion = models.CharField(max_length=15, choices=ACCIONES)
