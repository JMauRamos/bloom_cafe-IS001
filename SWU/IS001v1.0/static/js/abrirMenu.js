const hamMenu = document.querySelector('#menu_trigger');
const cerrarMenu = document.querySelector('#cerrar_trigger');
const menu = document.querySelector('.menu_abrir');

hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('activo');
    menu.classList.toggle('activo');
});

cerrarMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('activo');
    menu.classList.toggle('activo');
});

document.addEventListener('click', (event) => {
    const clickMenu = menu.contains(event.target);
    const clickTrigger = hamMenu.contains(event.target);

    if (!clickMenu && !clickTrigger && menu.classList.contains('activo')) {
        menu.classList.remove('activo');
        hamMenu.classList.remove('activo');
    }
});