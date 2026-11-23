document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form_detalles');
    const botonConfirmar = document.getElementById('confirmar_pedido');
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');

    if (!form) return;

        const MARGEN_MINUTOS = 10;
    
    function actualizarHorasDisponibles() {
        if (!fechaInput || !horaSelect) return;
        
        const fechaSeleccionada = fechaInput.value;
        if (!fechaSeleccionada) return;

        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${año}-${mes}-${dia}`;

        const esHoy = fechaSeleccionada === fechaHoy;

        const ahora = new Date();
        ahora.setMinutes(ahora.getMinutes() + MARGEN_MINUTOS);
        const horaMinima = ahora.getHours() * 60 + ahora.getMinutes();

        const opciones = horaSelect.querySelectorAll('option[value]');
        opciones.forEach(opcion => {
            const valor = opcion.value;
            if (!valor) return;

            const [h, m] = valor.split(':').map(Number);
            const minutosOpcion = h * 60 + m;

            if (esHoy && minutosOpcion < horaMinima) {
                opcion.disabled = true;
                if (!opcion.textContent.includes('(No disponible)')) {
                    opcion.textContent += ' (No disponible)';
                }
            } else {
                opcion.disabled = false;
                opcion.textContent = opcion.textContent.replace(' (No disponible)', '');
            }
        });

        if (horaSelect.selectedOptions[0]?.disabled) {
            horaSelect.value = '';
        }
    }

    if (fechaInput) {
        fechaInput.addEventListener('change', actualizarHorasDisponibles);
        actualizarHorasDisponibles();
    }

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