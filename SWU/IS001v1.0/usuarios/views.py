from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

# Create your views here.

def login_empleado(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        usuario = authenticate(request, username=username, password=password)
        
        if usuario is not None:
            login(request, usuario)
            if usuario.rol == 'EMPLEADO':
                return redirect('dashboard')
            else:
                return redirect('admin:index') 
        else:
            return render(request, 'usuarios/login.html', {'error': 'Usuario o contraseña incorrectos'})
    return render(request, 'usuarios/login.html')

def logout_empleado(request):
    logout(request)
    return redirect('inicio')