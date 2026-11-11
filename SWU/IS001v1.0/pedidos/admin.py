from django.contrib import admin
from .models import Pedido, DetallePedido, Modificacion

# Register your models here.

admin.site.register(Pedido)
admin.site.register(DetallePedido)
admin.site.register(Modificacion)
