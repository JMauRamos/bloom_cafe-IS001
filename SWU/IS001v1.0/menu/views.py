from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def vista_menu(request):
    return render(request, 'menu/menu.html')

def ver_producto(request):
    return render(request, 'menu/producto.html')