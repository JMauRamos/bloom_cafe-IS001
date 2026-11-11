from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.

def ver_mis_pedidos(request):
    return render(request, 'pedidos/mis_pedidos.html')

def pagar_pedido(request):
    return render(request, 'pedidos/checkout.html')

@login_required(login_url='inicio')
def dashboard(request):
    return render(request, 'panel_admin/dashboard.html')

@login_required(login_url='inicio')
def pedidos_admin(request):
    return render(request, 'panel_admin/pedidos_admin.html')

@login_required(login_url='inicio')
def productos_admin(request):
    return render(request, 'panel_admin/productos_admin.html')