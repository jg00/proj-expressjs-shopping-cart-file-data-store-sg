const express = require("express");
const multer = require("multer");

const { handleErrors, requireAuth } = require("./middlewares");
const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const productsIndexTemplate = require("../../views/admin/products/index");
const productsEditTemplate = require("../../views/admin/products/edit");
const { requireTitle, requirePrice } = require("./validators");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Product List Form
router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productsRepo.getAll();

  res.send(productsIndexTemplate({ products }));
});

// New Product Form
router.get("/admin/products/new", requireAuth, (req, res) => {
  res.send(productsNewTemplate({}));
});

// Create New Product
router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate),
  async (req, res) => {
    // Will need check if file not selected.
    // const image = req.file.buffer.toString("base64"); // safely represent an image in a string format

    let image;
    if (req.file) {
      image = req.file.buffer.toString("base64");
    }

    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });

    res.redirect("/admin/products"); // Indicate to browser to automatically change url and make a new get request in this case to the endpoint.
  }
);

// Edit Product Form
router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productsRepo.getOne(req.params.id);

  if (!product) {
    return res.send("Product not found");
  }

  res.send(productsEditTemplate({ product }));
});

// Update Product
router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsEditTemplate, async (req) => {
    // console.log("req", req); // req received from inside handleErrors as argument to callback when called
    // Optional second argument callback to include additional product data to be rendered
    const product = await productsRepo.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    const changes = req.body; // { title: 'Product', price: 10.01, image: <buffer> }

    if (req.file) {
      changes.images = req.file.buffer.toString("base64");
    }

    // update() throws exception if id not found
    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send("Could not find item");
    }

    res.redirect("/admin/products");
  }
);

// Delete Product
router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  await productsRepo.delete(req.params.id);

  res.redirect("/admin/products");
});

module.exports = router;

/*
  1 Routes (6) for products
  GET   /admin/products - form for list
  GET   /admin/products/new - form to create new product
  POST  /admin/products/new - submit new product
  GET   /admin/products/:id/edit - form to edit current product
  POST  /admin/products/:id/edit - submit update
  POST  /admin/products/:id/delete - delete product

  2 Check enctype=multipart/form-data 
  req.on('data', (data) => console.log(data.toString())
*/
