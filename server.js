const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();

// ✅ usar variable de entorno
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// ✅ servir frontend (si lo tienes en /public)
app.use(express.static(__dirname));

// página principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/create-checkout-session", async (req, res) => {
  const { cart } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cart.map(item => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name
          },
          unit_amount: item.price * 100
        },
        quantity: item.quantity
      })),

      // ⚠️ IMPORTANTE: usar dominio dinámico
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creando la sesión" });
  }
});

// ✅ usar puerto dinámico
const PORT = process.env.PORT || 4242;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
