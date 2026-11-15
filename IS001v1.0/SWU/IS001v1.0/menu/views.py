from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .models import Producto, Categoria
from django.db.models import Prefetch

# Create your views here.

def vista_menu(request):
    disponibles = Producto.objects.filter(disponibilidad=True)
    categorias = Categoria.objects.prefetch_related(Prefetch('productos', queryset=disponibles))
    return render(request, 'menu/menu.html', {'categorias': categorias})

def ver_producto(request, id_producto):
    producto = get_object_or_404(Producto, id=id_producto)
    variantes = producto.variantes.filter(disponibilidad=True)
    contexto = {'producto': producto, 'variantes': variantes}
    return render(request, 'menu/producto.html', contexto)