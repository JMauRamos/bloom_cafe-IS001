let varianteSeleccionada = null;
let cantidadActual = 1;

function seleccionarVariante(boton) {

    document.querySelectorAll('.tamanos button').forEach(b => b.classList.remove('seleccionado'));
    
    boton.classList.add('seleccionado');
    
    varianteSeleccionada = {
        id: boton.dataset.varianteId,
        precio: parseFloat(boton.dataset.precio),
        nombre: boton.dataset.varianteNombre
    };
    
    actualizarPrecio();
}

function actualizarPrecio() {
    if (!varianteSeleccionada) return;
    
    let precioUnitario = varianteSeleccionada.precio;

    document.querySelectorAll('.extra-checkbox:checked').forEach(checkbox => {
        precioUnitario += parseFloat(checkbox.dataset.precioExtra);
    });
    
    const total = precioUnitario * cantidadActual;
    document.getElementById('precio').innerText = `$${total.toFixed(2)}`;
}

function cambiarCantidad(cambio) {
    cantidadActual += cambio;
    if (cantidadActual < 1) cantidadActual = 1;
    document.getElementById('num_contador').innerText = cantidadActual;
    actualizarPrecio();
}

function agregarAlCarrito() {
    const botonAgregar = document.querySelector('.agregar');
    
    if (!varianteSeleccionada) {
        alert("Por favor selecciona un tamaño.");
        return;
    }
    
    const extrasSeleccionados = [];
    document.querySelectorAll('.extra-checkbox:checked').forEach(checkbox => {
        extrasSeleccionados.push({
            ingrediente_id: checkbox.dataset.ingredienteId,
            precio_extra: parseFloat(checkbox.dataset.precioExtra),
            nombre: checkbox.dataset.nombre
        });
    });
    
    const itemCarrito = {
        producto_id: botonAgregar.dataset.productoId,
        producto_nombre: botonAgregar.dataset.productoNombre,
        producto_imagen: botonAgregar.dataset.productoImagen,
        variante_id: varianteSeleccionada.id,
        variante_precio: varianteSeleccionada.precio,
        variante_nombre: varianteSeleccionada.nombre,
        extras: extrasSeleccionados,
        cantidad: cantidadActual,
        subtotal: (varianteSeleccionada.precio + extrasSeleccionados.reduce((sum, e) => sum + e.precio_extra, 0)) * cantidadActual
    };
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const indexExistente = carrito.findIndex(item => 
        item.variante_id === itemCarrito.variante_id && 
        JSON.stringify(item.extras) === JSON.stringify(itemCarrito.extras)
    );
    
    if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += itemCarrito.cantidad;
        carrito[indexExistente].subtotal += itemCarrito.subtotal;
    } else {
        carrito.push(itemCarrito);
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    actualizarVistaCarrito();
    
    alert(`${itemCarrito.cantidad}x ${itemCarrito.producto_nombre} agregado al carrito.`);
}

document.addEventListener('DOMContentLoaded', () => {
    const primerBoton = document.querySelector('.tamanos button');
    if (primerBoton) {
        seleccionarVariante(primerBoton);
    }
});