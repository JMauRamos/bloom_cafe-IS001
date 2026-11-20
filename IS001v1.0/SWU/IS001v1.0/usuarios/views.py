from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout

def login_empleado(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        usuario = authenticate(request, username=username, password=password)

        if usuario is not None:
            if usuario.rol == 'DUENA':
                login(request, usuario)
                return redirect('dashboard')

            elif usuario.rol == 'EMPLEADO':
                login(request, usuario)
                return redirect('pedidos_admin')

            else:
                return render(request, 'usuarios/login.html', {'error': 'No tienes un rol válido asignado.'})

        else:
            return render(request, 'usuarios/login.html', {'error': 'Usuario o contraseña incorrectos'})

    return render(request, 'usuarios/login.html')

def logout_empleado(request):
    logout(request)
    return redirect('inicio')