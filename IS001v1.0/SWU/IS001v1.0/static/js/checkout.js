document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form_detalles');
    const botonConfirmar = document.getElementById('confirmar_pedido');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        if (carrito.length === 0) {
            alert("Tu carrito está vacío. Agrega productos antes de confirmar.");
            return;
        }

        const formData = new FormData(form);
        const datosFormulario = {};

        formData.forEach((value, key) => {
            datosFormulario[key] = value;
        });

        const csrfToken = datosFormulario['csrfmiddlewaretoken'];
        delete datosFormulario['csrfmiddlewaretoken'];

        const payload = {
            carrito: carrito,
            datos_formulario: datosFormulario
        };

        botonConfirmar.disabled = true;
        botonConfirmar.innerText = "Procesando pedido...";

        try {
            const response = await fetch('/pedidos/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.removeItem('carrito');

                alert(`¡Pedido confirmado con éxito! Tu número de orden es el #${data.pedido_id}`);

                const telefonoCliente = datosFormulario['num_tel'];

                window.location.href = `/pedidos/mis_pedidos/?telefono=${telefonoCliente}`;

                return;
            }

            if (
                response.status === 409 &&
                Array.isArray(data.extras_agotados) &&
                data.extras_agotados.length > 0
            ) {
                const idsAgotados = new Set(
                    data.extras_agotados.map(id => String(id))
                );

                const extrasRetirados = [];

                carrito.forEach(item => {
                    const extrasOriginales = Array.isArray(item.extras)
                        ? item.extras
                        : [];

                    item.extras = extrasOriginales.filter(extra => {
                        if (idsAgotados.has(String(extra.ingrediente_id))) {
                            extrasRetirados.push(extra.nombre);
                            return false;
                        }

                        return true;
                    });

                    const precioExtras = item.extras.reduce((total, extra) => {
                        return total + Number(extra.precio_extra || 0);
                    }, 0);

                    const precioUnitario = Number(item.variante_precio) + precioExtras;

                    item.subtotal = precioUnitario * Number(item.cantidad);
                });

                localStorage.setItem('carrito', JSON.stringify(carrito));

                const nombresRetirados = [...new Set(extrasRetirados)];

                alert(
                    `Los siguientes extras ya no están disponibles:\n\n${nombresRetirados.join(', ')}\n\nSe retiraron de tu carrito y se actualizó el precio.\n\nRevisa el nuevo total antes de confirmar tu pedido nuevamente.`
                );

                if (typeof actualizarVistaCarrito === 'function') {
                    actualizarVistaCarrito();
                } else {
                    window.location.reload();
                }

                return;
            }

            alert(`Error al procesar el pedido: ${data.error || 'Intenta nuevamente.'}`);

        } catch (error) {
            console.error("Error de conexión:", error);

            alert("Hubo un problema de conexión con el servidor. Revisa tu internet e intenta de nuevo.");

        } finally {
            botonConfirmar.disabled = false;
            botonConfirmar.innerText = "Confirmar Pedido";
        }
    });
});