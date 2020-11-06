const express = require("express");
const cartsRepo = require("../repositories/carts");
const productsRepo = require("../repositories/products");
const cartShowTemplate = require("../views/carts/show");

const router = express.Router();

// Receive POST request to add item to cart
router.post("/cart/products", async (req, res) => {
  // 1 Cart - end up with new cart or retrieve existing cart
  let cart;
  if (!req.session.cartId) {
    // Create cart and store cartId to req.session.cartId
    cart = await cartsRepo.create({ items: [] });
    req.session.cartId = cart.id;
  } else {
    // Retrieve cart
    cart = await cartsRepo.getOne(req.session.cartId);
  }

  // 2 Cart Product - end up with adding new product with qty 1 or update qty for existing product
  const existingItem = cart.items.find(
    (item) => item.id === req.body.productId
  ); // { id: 111, quantity: 1 }
  if (existingItem) {
    // Either increment quantity for existing product in cart and save cart
    existingItem.quantity++;
  } else {
    // Add new product id to cart
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }

  // 3 Update Cart - at this point we have a cart in the repository we just need to update specific cart items property
  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  res.redirect("/cart");
});

// Receive GET request to display all items in cart
router.get("/cart", async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect("/"); // Back to products list
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  // For each item retrieve product details and associate with the cart item
  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);

    // Check in case product no longer exists and deleted by admin
    if (product) {
      item.product = product; // nested for display and passed as argument to template only.
    } else {
      // console.log(item); // { id: '0c1b7412', quantity: 1 }
      // console.log(cart); // { items: [ { id: '0c1b7412', quantity: 1 } ], id: '932b6b5f' }

      item.product = {
        title: `Item ${item.id} - No longer available`,
        price: 0,
        quantity: 0,
      };
    }
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive POST request to delete item from cart
router.post("/cart/products/delete", async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => {
    return item.id !== itemId;
  });

  await cartsRepo.update(req.session.cartId, {
    items: items,
  });

  res.redirect("/cart");
});

module.exports = router;
