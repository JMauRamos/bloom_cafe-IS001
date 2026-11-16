// static/js/carrito.js

// Función para renderizar el carrito visualmente
function actualizarVistaCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.querySelector('.productos_carrito');
    const totalSpan = document.getElementById('total_carrito');
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p></p>';
        totalSpan.innerText = '$0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    carrito.forEach((item, index) => {
        total += item.subtotal;
        
        let extrasHtml = '';
        if (item.extras && item.extras.length > 0) {
            const nombresExtras = item.extras.map(e => e.nombre).join(', ');
            extrasHtml = `<small>+ ${nombresExtras} </small>`;
        }
        
        html += `
            <div class="producto_carrito">
                <img src="${item.producto_imagen}" alt="${item.producto_nombre}">
                <div class="desc_carrito">
                    <div class="producto_precio">
                        <p class="nombre_producto">${item.producto_nombre}</p>
                        <p><span class="precio_carrito">$${item.subtotal.toFixed(2)}</span></p>
                    </div>
                    <p>${item.variante_nombre || ''}</p>
                    <p>Extras: </p>
                    ${extrasHtml}
                    <div class="editar_producto"> 
                        <div class="cantidad_producto">
                            <div class="mas_menos" onclick="cambiarCantidadCarrito(${index}, -1)"><i class="bi bi-dash"></i></div>
                            <div><span class="cantidad">${item.cantidad}</span></div>
                            <div class="mas_menos" onclick="cambiarCantidadCarrito(${index}, 1)"><i class="bi bi-plus"></i></div>
                        </div>
                        <div class="eliminar_producto" onclick="eliminarDelCarrito(${index})">
                            <i class="bi bi-trash-fill"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    totalSpan.innerText = `$${total.toFixed(2)}`;
}

function cambiarCantidadCarrito(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito'));
    carrito[index].cantidad += cambio;
    
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    } else {
        const precioUnitario = carrito[index].variante_precio + (carrito[index].extras || []).reduce((sum, e) => sum + e.precio_extra, 0);
        carrito[index].subtotal = precioUnitario * carrito[index].cantidad;
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarVistaCarrito();
}

function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito'));
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarVistaCarrito();
}

document.addEventListener('DOMContentLoaded', actualizarVistaCarrito);