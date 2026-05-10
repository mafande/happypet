let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Inicializar Stripe con la clave pública
const stripe = Stripe("pk_test_51Ssj5FF4dVY3vbmSIitzraqbkvCGC498HASTU18POkQGDUhh9zGsnA3F7TcTelQqrQUNOyZbod0NlUhZvTs8vmgJ00wyVFH9g8");

/******* carrito *****/
const cartToggle = document.getElementById("cart-toggle");
const cartContainer = document.getElementById("cart-container");

// Muestra/ oculta el carrito en móvil
cartToggle.addEventListener("click", () => {
  cartContainer.classList.toggle("open");
});

// Cierra el carrito al clicar fuera (solo móvil)
document.addEventListener("click", (e) => {
  if (
    !cartContainer.contains(e.target) &&
    !cartToggle.contains(e.target)
  ) {
    cartContainer.classList.remove("open");
  }
});

// Muestra u oculta el carrito según contenido
function updateCartVisibility() {
  const hasProducts = cart.length > 0;
  const isMobile = window.innerWidth <= 768;

  /*** prueba mostar icono carrito desktop ***/
  const isDesktop = window.innerWidth >768;
  
  if (isDesktop) {
    cartToggle.style.display = "block";
  }
/** fin prueba desktop ***/
  
    if (hasProducts) {
    // Muestra el carrito
    cartContainer.style.display = "block";

    // Muestra el botón carrito
    cartToggle.style.display = "block";

    // En desktop dejamos espacio lateral
    if (!isMobile) {
      document.body.classList.add("cart-visible");
    }

  } else {

    // Oculta el carrito
    cartContainer.style.display = "none";
    
    // Quita el espacio lateral
    document.body.classList.remove("cart-visible");
    
    if (isMobile){
    // Oculta el botón carrito
    cartToggle.style.display = "none";
      }
  }
}
//función para el contador del carrito 
function updateCartCount() {

  const cartCount = document.getElementById("cart-count");

  // suma todas las cantidades
  const totalItems = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  cartCount.textContent = totalItems;

  // ocultar contador si no hay productos
  if (totalItems === 0) {
    cartCount.style.display = "none";
  } else {
    cartCount.style.display = "flex";
  }
}
/******* fin carrito *******/

/******* Integración con Stripe *******/
document.getElementById("buy-button").addEventListener("click", async () => {

  try {

    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    localStorage.setItem("lastOrder", JSON.stringify(cart));

    console.log("Enviando carrito:", cart);

    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart })
    });

    console.log("Respuesta servidor:", response);

    const session = await response.json();

    console.log("Session:", session);

    if (!session.id) {
      alert("Error creando la sesión de Stripe");
      return;
    }

    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    });

    console.log(result);

  } catch (error) {

    console.error("ERROR:", error);
    alert("Ha ocurrido un error");

  }

});

/******** FUNCIONES ********/
// Añadir producto
function addToCart(id, name, price) {
  const product = cart.find(item => item.id === id);

  if (product) {
    product.quantity++;
  } else {
    cart.push({
      id,
      name,
      price,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}

// Pinta el carrito
function renderCart() {
  const cartElement = document.getElementById("cart");
  const totalElement = document.getElementById("total");

  cartElement.innerHTML = "";
  let total = 0;
  cart.forEach(item => {

    const li = document.createElement("li");

    li.innerHTML = `
      ${item.name} x${item.quantity} - ${item.price * item.quantity} €
      <button onclick="removeOne(${item.id})">➖</button>
      <button onclick="removeItem(${item.id})">🗑️</button>
    `;

    cartElement.appendChild(li);

    total += item.price * item.quantity;
  });

  totalElement.textContent = `Total: ${total} €`;

  updateCartCount();//actualiza el contador de elementos del carrito
  updateCartVisibility();
}

// Borrar solo 1 unidad
function removeOne(id) {

  const product = cart.find(item => item.id === id);

  if (!product) return;

  if (product.quantity > 1) {
    product.quantity--;
  } else {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

// Borrar producto completo
function removeItem(id) {

  cart = cart.filter(item => item.id !== id);

  saveCart();
  renderCart();
}

// Guardar carrito
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


/*
// Vaciar carrito completo
function clearCart() {

  localStorage.removeItem("cart");

  cart = [];

  renderCart();
}
*/

// Al cargar la página
window.addEventListener("load", () => {
  renderCart();
});
// Al cambiar entre desktop y móvil
window.addEventListener("resize", () => {
  updateCartVisibility();
});