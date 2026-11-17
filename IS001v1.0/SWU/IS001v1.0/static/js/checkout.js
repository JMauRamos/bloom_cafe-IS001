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
                
            } else {
                alert(`Error al procesar el pedido: ${data.error}`);
                botonConfirmar.disabled = false;
                botonConfirmar.innerText = "Confirmar Pedido";
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Hubo un problema de conexión con el servidor. Revisa tu internet e intenta de nuevo.");
            
            botonConfirmar.disabled = false;
            botonConfirmar.innerText = "Confirmar Pedido";
        }
    });
});