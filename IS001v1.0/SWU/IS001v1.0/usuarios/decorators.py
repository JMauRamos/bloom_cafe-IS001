from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from functools import wraps


def solo_duena(view_func):

    @wraps(view_func)
    @login_required(login_url='inicio')
    def wrapper(request, *args, **kwargs):

        if request.user.rol != 'DUENA':
            raise PermissionDenied

        return view_func(request, *args, **kwargs)

    return wrapper