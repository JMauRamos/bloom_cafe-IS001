
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
import json
from django.http import JsonResponse
from django.db import transaction
from django.db.models import ProtectedError
from django.contrib import messages
from datetime import date
from .models import Pedido, DetallePedido, Modificacion
from menu.models import VarianteProducto, Ingrediente, Producto, Categoria, Tamaño
from usuarios.decorators import solo_duena
from decimal import Decimal, InvalidOperation
from django.urls import reverse


def ver_mis_pedidos(request):
    return render(request, 'pedidos/mis_pedidos.html')


@login_required(login_url='inicio')
@solo_duena
def dashboard(request):
    return render(request, 'panel_admin/dashboard.html')

@login_required(login_url='inicio')
def pedidos_admin(request):
    hoy = date.today()

    pedidos = Pedido.objects.prefetch_related(
        'detalles__variante_producto__producto'
    ).order_by('-id')

    pedidos_hoy = pedidos.filter(fecha_entrega=hoy)

    contexto = {
        'pedidos': pedidos,
        'total_hoy': pedidos_hoy.count(),
        'pendientes': pedidos_hoy.filter(estado='PENDIENTE').count(),
        'preparando': pedidos_hoy.filter(estado='PREPARANDO').count(),
        'listos': pedidos_hoy.filter(estado='LISTO').count(),
        'entregados': pedidos_hoy.filter(estado='ENTREGADO').count(),
        'conteos': {
            'todos': pedidos.count(),
            'pendientes': pedidos.filter(estado='PENDIENTE').count(),
            'preparando': pedidos.filter(estado='PREPARANDO').count(),
            'listos': pedidos.filter(estado='LISTO').count(),
            'entregados': pedidos.filter(estado='ENTREGADO').count(),
            'cancelados': pedidos.filter(estado='CANCELADO').count(),
        },
        'hoy': hoy,
    }

    return render(request, 'panel_admin/pedidos_admin.html', contexto)


@login_required(login_url='inicio')
@require_POST
def avanzar_estado_pedido(request, pedido_id):
    pedido = get_object_or_404(Pedido, id=pedido_id)

    if pedido.estado in ['ENTREGADO', 'CANCELADO']:
        return JsonResponse({
            'error': 'El pedido ya está finalizado'
        }, status=400)

    pedido.avanzar_estado()

    return JsonResponse({
        'status': 'success',
        'nuevo_estado': pedido.get_estado_display(),
    })


def api_detalle_pedido(request, pedido_id):
    try:
        pedido = Pedido.objects.prefetch_related(
            'detalles__variante_producto__producto',
            'detalles__variante_producto__tamaño',
            'detalles__modificaciones__ingrediente',
        ).get(id=pedido_id)

        detalles_list = []

        for detalle in pedido.detalles.all():
            modificaciones = []

            for mod in detalle.modificaciones.all():
                modificaciones.append({
                    'nombre': mod.ingrediente.nombre,
                    'accion': mod.get_accion_display() if hasattr(mod, 'get_accion_display') else mod.accion,
                    'costo_extra': float(mod.ingrediente.costo_extra),
                })

            detalles_list.append({
                'producto': detalle.variante_producto.producto.nombre,
                'variante': detalle.variante_producto.tamaño.nombre if detalle.variante_producto.tamaño else 'Único',
                'cantidad': detalle.cantidad,
                'precio_unitario': float(detalle.precio_unitario),
                'subtotal': float(detalle.subtotal),
                'notas': detalle.notas_extra or '',
                'modificaciones': modificaciones,
            })

        data = {
            'id': pedido.id,
            'cliente': pedido.nombre_cliente,
            'telefono': pedido.telefono_cliente,
            'estado': pedido.get_estado_display(),
            'fecha': pedido.fecha_entrega.strftime('%d/%m/%Y') if pedido.fecha_entrega else '',
            'hora': pedido.hora_entrega.strftime('%H:%M') if pedido.hora_entrega else '',
            'lugar_entrega': pedido.get_lugar_entrega_display(),
            'metodo_pago': pedido.get_metodo_pago_display(),
            'total': float(pedido.total),
            'detalles': detalles_list,
        }

        return JsonResponse(data)

    except Pedido.DoesNotExist:
        return JsonResponse({
            'error': 'Pedido no encontrado'
        }, status=404)


@login_required(login_url='inicio')
def productos_admin(request):
    productos = Producto.objects.all()
    total_productos = productos.count()
    productos_disponibles = productos.filter(disponibilidad=True).count()
    categorias = Categoria.objects.all()
    tamaños = Tamaño.objects.all()
    ingredientes = Ingrediente.objects.filter(es_extra=False)

    contexto = {
        'productos': productos,
        'total_productos': total_productos,
        'productos_disponibles': productos_disponibles,
        'categorias': categorias,
        'tamaños': tamaños,
        'ingredientes': ingredientes
    }

    return render(request, 'panel_admin/productos_admin.html', contexto)

@login_required(login_url='inicio')
@solo_duena
def crear_producto(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        categoria_id = request.POST.get('categoria')
        disponibilidad = request.POST.get('disponibilidad') == 'on'
        foto = request.FILES.get('foto_producto')

        producto = Producto.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            categoria_id=categoria_id,
            disponibilidad=disponibilidad,
            foto_producto=foto,
            precio=0
        )

        ids_ingredientes = request.POST.getlist('ingredientes[]')

        if ids_ingredientes:
            ingredientes_validos = Ingrediente.objects.filter(
                id__in=ids_ingredientes,
                es_extra=False
            )
            producto.ingredientes.set(ingredientes_validos)

        tamaños = request.POST.getlist('tamaño[]')
        precios = request.POST.getlist('precio_variante[]')
        min_precio = float('inf')

        for tam_id, precio_str in zip(tamaños, precios):
            if tam_id and precio_str:
                precio = float(precio_str)

                VarianteProducto.objects.create(
                    producto=producto,
                    tamaño_id=tam_id,
                    precio=precio
                )

                if precio < min_precio:
                    min_precio = precio

        if min_precio != float('inf'):
            producto.precio = min_precio
            producto.save()

        messages.success(request, f'Producto "{producto.nombre}" creado correctamente.')
        return redirect('productos_admin')

    contexto = {
        'categorias': Categoria.objects.all(),
        'tamaños': Tamaño.objects.all(),
        'ingredientes': Ingrediente.objects.filter(es_extra=False)
    }
    return render(request, 'panel_admin/crear_producto.html', contexto)

@solo_duena
def eliminar_producto(request, producto_id):

    if request.method == 'POST':
        producto = get_object_or_404(Producto, id=producto_id)
        nombre_producto = producto.nombre

        try:
            producto.variantes.all().delete()
            producto.delete()
            messages.success(request, f'El producto "{nombre_producto}" fue eliminado correctamente.')

        except ProtectedError:
            messages.error(
                request,
                'No se puede eliminar este producto porque tiene pedidos asociados.'
            )

        except Exception as e:
            messages.error(request, f'Error al eliminar: {e}')

    return redirect('productos_admin')


@login_required(login_url='inicio')
def editar_producto(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)

    if request.method == 'POST':
        producto.nombre = request.POST.get('nombre')
        producto.descripcion = request.POST.get('descripcion')
        producto.categoria_id = request.POST.get('categoria')
        producto.disponibilidad = request.POST.get('disponibilidad') == 'on'

        if request.FILES.get('foto_producto'):
            producto.foto_producto = request.FILES.get('foto_producto')

        producto.save()

        ids_ingredientes = request.POST.getlist('ingredientes[]')

        ingredientes_validos = Ingrediente.objects.filter(
            id__in=ids_ingredientes,
            es_extra=False
        )

        producto.ingredientes.set(ingredientes_validos)

        tamaños_enviados = []
        precios = request.POST.getlist('precio_variante[]')
        tamaños = request.POST.getlist('tamaño[]')
        min_precio = float('inf')

        for tam_id, precio_str in zip(tamaños, precios):
            if tam_id and precio_str:
                precio = float(precio_str)

                VarianteProducto.objects.update_or_create(
                    producto=producto,
                    tamaño_id=tam_id,
                    defaults={'precio': precio}
                )

                tamaños_enviados.append(int(tam_id))

                if precio < min_precio:
                    min_precio = precio

        for variante in producto.variantes.all():
            if variante.tamaño_id not in tamaños_enviados:
                try:
                    variante.delete()

                except ProtectedError:
                    messages.warning(
                        request,
                        f'No se eliminó el tamaño "{variante.tamaño.nombre}" porque ya tiene pedidos asociados.'
                    )

        if min_precio != float('inf'):
            producto.precio = min_precio
            producto.save()

        messages.success(
            request,
            f'Producto "{producto.nombre}" actualizado.'
        )

        return redirect('productos_admin')

    contexto = {
        'producto': producto,
        'categorias': Categoria.objects.all(),
        'tamaños': Tamaño.objects.all(),
        'ingredientes': Ingrediente.objects.filter(es_extra=False),
        'variantes_actuales': producto.variantes.select_related('tamaño').all(),
        'ingredientes_seleccionados': set(
            producto.ingredientes.values_list('id', flat=True)
        ),
    }
    return render(request, 'panel_admin/editar_producto.html', contexto)

@login_required(login_url='inicio')
@require_POST
def cambiar_disponibilidad(request, producto_id):

    producto = get_object_or_404(Producto, id=producto_id)

    producto.cambiar_disponibilidad()

    if producto.disponibilidad:
        messages.success(request, f'{producto.nombre} ahora está disponible.')
    else:
        messages.success(request, f'{producto.nombre} ahora no está disponible.')

    return redirect('productos_admin')

def checkout(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            carrito = data.get('carrito', [])
            datos = data.get('datos_formulario', {})

            if not carrito:
                return JsonResponse({
                    'error': 'El carrito está vacío'
                }, status=400)

            with transaction.atomic():
                for item in carrito:
                    try:
                        variante_id = int(item.get('variante_id'))

                    except (TypeError, ValueError):
                        return JsonResponse({
                            'error': 'Producto inválido.'
                        }, status=400)

                    variante = VarianteProducto.objects.select_related(
                        'producto'
                    ).filter(id=variante_id).first()

                    if (
                        variante is None
                        or not variante.disponibilidad
                        or not variante.producto.puede_prepararse
                    ):
                        return JsonResponse({
                            'error': 'No es posible preparar uno de los productos.'
                        }, status=409)

                extras_agotados = set()

                for item in carrito:
                    for extra in item.get('extras', []):
                        try:
                            ingrediente_id = int(extra.get('ingrediente_id'))
                        except (TypeError, ValueError, AttributeError):
                            continue

                        disponible = Ingrediente.objects.filter(
                            id=ingrediente_id,
                            es_extra=True,
                            disponibilidad=True
                        ).exists()

                        if not disponible:
                            extras_agotados.add(ingrediente_id)

                if extras_agotados:
                    return JsonResponse({
                        'error': 'Algunos extras ya no están disponibles. Revisa tu carrito antes de confirmar.',
                        'extras_agotados': sorted(extras_agotados)
                    }, status=409)

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
                    variante_producto = get_object_or_404(
                        VarianteProducto,
                        id=item['variante_id']
                    )

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
                        try:
                            ingrediente_id = int(
                                extra.get('ingrediente_id')
                            )
                        except (TypeError, ValueError, AttributeError):
                            continue

                        ingrediente = Ingrediente.objects.filter(
                            id=ingrediente_id,
                            es_extra=True,
                            disponibilidad=True
                        ).first()

                        if ingrediente is None:
                            continue

                        Modificacion.objects.create(
                            detalle_pedido=detalle,
                            ingrediente=ingrediente,
                            accion='AGREGADO'
                        )

                        total_pedido += (
                            ingrediente.costo_extra * item['cantidad']
                        )

                pedido.total = total_pedido
                pedido.save()

            return JsonResponse({
                'status': 'success',
                'pedido_id': pedido.id
            })

        except Exception as e:
            print(f"Error al procesar el pedido: {e}")

            return JsonResponse({
                'error': 'Hubo un error al procesar el pedido en el servidor.'
            }, status=500)

    return render(request, 'pedidos/checkout.html')


def api_mis_pedidos(request, telefono):
    pedidos = Pedido.objects.filter(
        telefono_cliente=telefono
    ).order_by('-id')

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
                'subtotal': detalle.subtotal,
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


@login_required(login_url='inicio')
def ingredientes_admin(request):
    if request.method == 'POST':
        accion = request.POST.get('accion')
        tipo = request.POST.get('tipo')

        if tipo not in ('ingrediente', 'extra'):
            messages.error(request, 'Tipo de registro inválido.')
            return redirect('ingredientes_admin')

        destino = reverse('ingredientes_admin')

        if tipo == 'extra':
            destino += '?tab=extras'

        if accion == 'cambiar_disponibilidad':
            registro_id = request.POST.get('registro_id', '')

            if not registro_id.isdigit():
                messages.error(request, 'Registro inválido.')
                return redirect(destino)

            registro = get_object_or_404(
                Ingrediente,
                id=int(registro_id),
                es_extra=(tipo == 'extra')
            )

            registro.disponibilidad = (
                request.POST.get('disponibilidad') == '1'
            )

            registro.save(update_fields=['disponibilidad'])

            return redirect(destino)

        elif accion == 'agregar':
            nombre = request.POST.get('nombre', '').strip()

            if not nombre or len(nombre) > 100:
                messages.error(request, 'Ingresa un nombre válido.')
                return redirect(destino)

            if Ingrediente.objects.filter(
                nombre__iexact=nombre,
                es_extra=(tipo == 'extra')
            ).exists():
                messages.error(
                    request,
                    'Ese nombre ya está registrado.'
                )
                return redirect(destino)

            costo_extra = Decimal('0.00')

            if tipo == 'extra':
                try:
                    costo_extra = Decimal(
                        request.POST.get('costo_extra') or '0'
                    )

                except (InvalidOperation, ValueError):
                    messages.error(
                        request,
                        'El costo no es válido.'
                    )
                    return redirect(destino)

                if (
                    not costo_extra.is_finite()
                    or costo_extra < 0
                    or costo_extra > Decimal('999.99')
                    or costo_extra.as_tuple().exponent < -2
                ):
                    messages.error(
                        request,
                        'Ingresa un costo válido.'
                    )
                    return redirect(destino)

            Ingrediente.objects.create(
                nombre=nombre,
                disponibilidad=(
                    request.POST.get('disponibilidad') == 'on'
                ),
                costo_extra=costo_extra,
                es_extra=(tipo == 'extra')
            )

            messages.success(
                request,
                'Registro agregado correctamente.'
            )

            return redirect(destino)

        elif accion == 'editar':
            registro_id = request.POST.get('registro_id', '')

            if not registro_id.isdigit():
                messages.error(request, 'Registro inválido.')
                return redirect(destino)

            registro = get_object_or_404(
                Ingrediente,
                id=int(registro_id),
                es_extra=(tipo == 'extra')
            )

            nombre = request.POST.get('nombre', '').strip()

            if not nombre or len(nombre) > 100:
                messages.error(request, 'Ingresa un nombre válido.')
                return redirect(destino)

            if Ingrediente.objects.filter(
                nombre__iexact=nombre,
                es_extra=(tipo == 'extra')
            ).exclude(id=registro.id).exists():
                messages.error(
                    request,
                    'Ese nombre ya está registrado.'
                )
                return redirect(destino)

            if tipo == 'extra':
                try:
                    costo_extra = Decimal(
                        request.POST.get('costo_extra', '')
                    )

                except (InvalidOperation, ValueError):
                    messages.error(
                        request,
                        'El costo no es válido.'
                    )
                    return redirect(destino)

                if (
                    not costo_extra.is_finite()
                    or costo_extra < 0
                    or costo_extra > Decimal('999.99')
                    or costo_extra.as_tuple().exponent < -2
                ):
                    messages.error(
                        request,
                        'Ingresa un costo válido.'
                    )
                    return redirect(destino)

                registro.nombre = nombre
                registro.costo_extra = costo_extra

                registro.save(
                    update_fields=['nombre', 'costo_extra']
                )

            else:
                registro.nombre = nombre
                registro.save(update_fields=['nombre'])

            messages.success(
                request,
                'Registro actualizado correctamente.'
            )

            return redirect(destino)

        elif accion == 'eliminar':
            registro_id = request.POST.get('registro_id', '')

            if not registro_id.isdigit():
                messages.error(request, 'Registro inválido.')
                return redirect(destino)

            registro = get_object_or_404(
                Ingrediente,
                id=int(registro_id),
                es_extra=(tipo == 'extra')
            )

            if Modificacion.objects.filter(
                ingrediente_id=registro.id
            ).exists():
                messages.error(
                    request,
                    'No se puede eliminar este registro porque aparece en pedidos existentes. Puedes marcarlo como agotado.'
                )
                return redirect(destino)

            nombre = registro.nombre
            registro.delete()

            messages.success(
                request,
                f'"{nombre}" fue eliminado correctamente.'
            )

            return redirect(destino)

        messages.error(request, 'Acción no válida.')
        return redirect(destino)

    ingredientes = Ingrediente.objects.filter(
        es_extra=False
    ).order_by('nombre')

    extras = Ingrediente.objects.filter(
        es_extra=True
    ).order_by('nombre')

    return render(request, 'panel_admin/ingredientes_admin.html', {
        'ingredientes': ingredientes,
        'extras': extras
    })


@login_required(login_url='inicio')
def extras_admin(request):
    extras = Ingrediente.objects.filter(
        es_extra=True
    ).order_by('nombre')

    return render(request, 'panel_admin/extras_admin.html', {
        'extras': extras
    })