const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

// FETCH para traer los elementos del stock
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
});
cards.addEventListener('click', e => {
    addCarrito(e);
});

items.addEventListener('click', e => {
    btnAccion(e)
});

const fetchData = async () => {
    try {
        const res = await fetch('./assets/js/stock.json');
        const data = await res.json();
        pintarCards(data);
    } catch (error) {
        console.log(error);
    }
};

// Visualizamos los elementos del stock en las card del HTML y ligamos el "template" del html a el div id=cards.
const pintarCards = data => {
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.producto;
        templateCard.querySelector('h6').textContent = producto.nombre;
        templateCard.querySelector('p').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute("src", producto.imagen);
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
};

const addCarrito = e => {
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement);
        // Notificación TOASTIFY
        Toastify({
            text: "Se ha añadido un producto al carrito",
            className: "info",
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            style: {
                background: "linear-gradient(to right, rgba(203,65,164,1), rgba(118,153,229,1))",
            }
        }).showToast();
    };
    e.stopPropagation();
};

const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        producto: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    };

    carrito[producto.id] = {
        ...producto
    }; //Con los "..." (spread) estamos haciendo una copia de la información en la const producto.
    pintarCarrito();
};

const pintarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.producto;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone)
    });
    items.appendChild(fragment);

    pintarFooter();

    localStorage.setItem('carrito', JSON.stringify(carrito))
};

const pintarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">¡No has agregado productos al carrito todavía!</th>
        `
        return;
    };

    const nCantidad = Object.values(carrito).reduce((acc, {
        cantidad
    }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {
        cantidad,
        precio
    }) => acc + cantidad * precio, 0);

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {}; // En esta linea el carrito vuelve a 0
        pintarCarrito(); //Con esta linea visualizamos los cambios
        // SWEET ALERT
        swal({
            title: "¡Carrito vacío!",
            text: "Borraste todos los productos de tu carrito."
        });
    });
    const btnComprar = document.getElementById('comprar-carrito');
    btnComprar.addEventListener('click', () => {
        carrito = {}; // En esta linea el carrito vuelve a 0
        pintarCarrito(); //Con esta linea visualizamos los cambios
        // SWEET ALERT
        swal({
            title: "¡Felicitaciones!",
            text: "Muchas gracias por tu compra, ahora a disfrutar de tu cafe."
        });
    });
};

const btnAccion = e => {
    // Aumentamos la cantidad del producto.
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
        carrito[e.target.dataset.id] = {
            ...producto
        };
        pintarCarrito();
        // Notificación TOASTIFY
        Toastify({
            text: "Has añadido otra vez este producto",
            className: "info",
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            style: {
                background: "linear-gradient(to right, rgba(203,65,164,1), rgba(118,153,229,1))",
            }
        }).showToast();
    }
    // Disminuimos la cantidad del producto.
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }
        pintarCarrito();
        // Notificación TOASTIFY
        Toastify({
            text: "Has quitado un producto del carrito",
            className: "info",
            gravity: "bottom", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            style: {
                background: "linear-gradient(to right, rgba(203,65,164,1), rgba(118,153,229,1))",
            }
        }).showToast();
    }

    e.stopPropagation();
};