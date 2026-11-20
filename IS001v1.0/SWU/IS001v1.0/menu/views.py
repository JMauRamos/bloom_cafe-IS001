
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, Http404
from .models import Producto, Categoria, Ingrediente
from django.db.models import Prefetch


def vista_menu(request):
    productos = Producto.objects.filter(
        disponibilidad=True
    ).prefetch_related('ingredientes')

    productos_disponibles = [
        producto for producto in productos
        if producto.puede_prepararse
    ]

    ids_disponibles = [
        producto.id for producto in productos_disponibles
    ]

    categorias = Categoria.objects.prefetch_related(
        Prefetch(
            'productos',
            queryset=Producto.objects.filter(
                id__in=ids_disponibles
            )
        )
    )

    return render(request, 'menu/menu.html', {
        'categorias': categorias
    })


def ver_producto(request, id_producto):
    producto = get_object_or_404(Producto, id=id_producto)

    if not producto.puede_prepararse:
        raise Http404("Producto no disponible")

    variantes = producto.variantes.filter(disponibilidad=True)

    extras = Ingrediente.objects.filter(
        es_extra=True,
        disponibilidad=True
    )

    contexto = {
        'producto': producto,
        'variantes': variantes,
        'extras': extras
    }

    return render(request, 'menu/producto.html', contexto)