from django.db import models

# Create your models here.

class Pedido(models.Model):
    METODOS_PAGO = [('TERMINAL', 'Terminal'), ('EFECTIVO', 'Efectivo')]
    LUGARES_ENTREGA = [('PUERTA', 'En Puerta'), ('BARRA', 'En Barra')]
    ESTADOS_PEDIDO = [('PENDIENTE', 'Pendiente'), ('PREPARANDO', 'En Preparacion'), ('LISTO', 'Listo para Entregar'), ('ENTREGADO', 'Entregado'), ('CANCELADO', 'Cancelado')]
    nombre_cliente = models.CharField(max_length=100)
    telefono_cliente = models.CharField(max_length=20)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=40, choices=ESTADOS_PEDIDO, default='PENDIENTE')
    fecha_entrega = models.DateField(verbose_name='Fecha de Entrega')
    hora_entrega = models.TimeField(verbose_name='Hora de Entrega')
    lugar_entrega = models.CharField(max_length=20, choices=LUGARES_ENTREGA)
    metodo_pago = models.CharField(max_length=20, choices=METODOS_PAGO)

    def avanzar_estado(self):
        if self.estado == 'PENDIENTE':
            self.estado = 'PREPARANDO'
        elif self.estado == 'PREPARANDO':
            self.estado = 'LISTO'
        elif self.estado == 'LISTO':
            self.estado = 'ENTREGADO'

        self.save()

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='detalles', on_delete=models.CASCADE)
    variante_producto = models.ForeignKey('menu.VarianteProducto', on_delete=models.PROTECT)
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    notas_extra = models.TextField(blank=True, null=True)

class Modificacion(models.Model):
    ACCIONES = [('AGREGAR', 'Agregar'), ('REMOVER', 'Remover')]
    detalle_pedido = models.ForeignKey(DetallePedido, related_name='modificaciones', on_delete=models.CASCADE)
    ingrediente = models.ForeignKey('menu.Ingrediente', related_name='ingredientes', on_delete=models.CASCADE)
    accion = models.CharField(max_length=15, choices=ACCIONES)