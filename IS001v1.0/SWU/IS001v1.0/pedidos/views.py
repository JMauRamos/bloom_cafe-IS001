from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
import json
from django.http import JsonResponse
from django.db import transaction
from .models import Pedido, DetallePedido, Modificacion
from menu.models import VarianteProducto, Ingrediente

# Create your views here.

def ver_mis_pedidos(request):
    return render(request, 'pedidos/mis_pedidos.html')

@login_required(login_url='inicio')
def dashboard(request):
    return render(request, 'panel_admin/dashboard.html')

@login_required(login_url='inicio')
def pedidos_admin(request):
    return render(request, 'panel_admin/pedidos_admin.html')

@login_required(login_url='inicio')
def productos_admin(request):
    return render(request, 'panel_admin/productos_admin.html')

def checkout(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            carrito = data.get('carrito', [])
            datos = data.get('datos_formulario', {})

            if not carrito:
                return JsonResponse({'error': 'El carrito está vacío'}, status=400)

            with transaction.atomic():
                
                pedido = Pedido.objects.create(
                    nombre_cliente=datos.get('nombre'),
                    telefono_cliente=datos.get('num_tel'),
                    lugar_entrega=datos.get('lugar_entrega'),
                    metodo_pago=datos.get('metodo_pago'),
                    fecha_entrega=datos.get('fecha'),
                    hora_entrega=datos.get('hora'),
                    total=0,
                    estado='PENDIENTE'
                )

                total_pedido = 0

                for item in carrito:
                    variante_producto = get_object_or_404(VarianteProducto, id=item['variante_id'])
                    
                    precio_unitario = variante_producto.precio
                    subtotal = precio_unitario * item['cantidad']
                    
                    detalle = DetallePedido.objects.create(
                        pedido=pedido,
                        variante_producto=variante_producto,
                        cantidad=item['cantidad'],
                        precio_unitario=precio_unitario,
                        subtotal=subtotal
                    )
                    
                    total_pedido += subtotal

                    extras = item.get('extras', [])
                    for extra in extras:
                        ingrediente = get_object_or_404(Ingrediente, id=extra['ingrediente_id'])
                        
                        Modificacion.objects.create(
                            detalle_pedido=detalle,
                            ingrediente=ingrediente,
                            accion='AGREGADO'
                        )
                        
                        total_pedido += ingrediente.costo_extra * item['cantidad']

                pedido.total = total_pedido
                pedido.save()

            return JsonResponse({
                'status': 'success', 
                'pedido_id': pedido.id
            })

        except Exception as e:
            print(f"Error al procesar el pedido: {e}")
            return JsonResponse({'error': 'Hubo un error al procesar el pedido en el servidor.'}, status=500)

    return render(request, 'pedidos/checkout.html')

def api_mis_pedidos(request, telefono):
    pedidos = Pedido.objects.filter(telefono_cliente=telefono).order_by('-id')
    
    lista_pedidos = []
    for pedido in pedidos:
        detalles = pedido.detalles.all()
        
        productos_info = []
        for detalle in detalles:
            productos_info.append({
                'cantidad': detalle.cantidad,
                'producto': detalle.variante_producto.producto.nombre,
                'variante': detalle.variante_producto.tamaño.nombre,
                'precio_unitario': detalle.precio_unitario,
                'subtotal' :detalle.subtotal,
            })
            
        lista_pedidos.append({
            'id': pedido.id,
            'estado': pedido.get_estado_display(),
            'fecha': pedido.fecha_entrega.strftime('%d/%m/%Y'),
            'hora': pedido.hora_entrega.strftime('%H:%M'),
            'total': float(pedido.total),
            'detalles': productos_info
        })
        
    return JsonResponse({'pedidos': lista_pedidos})