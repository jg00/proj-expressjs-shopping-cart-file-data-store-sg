const express = require("express");

const { handleErrors } = require("./middlewares");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators");

const router = express.Router();

// Signup Form
router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

// Create User Account
router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation],
  handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password } = req.body;

    // 2 Create a user in our user repo to represent thi person
    const user = await usersRepo.create({ email, password });

    // 3 Store the id of that user inside the users cookie. req.session {} object is added by cookie-session.
    req.session.userId = user.id;

    res.redirect("/admin/products");
  }
);

// Sign Out User
router.get("/signout", (req, res, next) => {
  req.session = null;
  res.send("You are signed out");
});

// Sign In Form
router.get("/signin", (req, res, next) => {
  res.send(signinTemplate({}));
});

// POST Sign In Information
router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (req, res, next) => {
    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email });

    // 2 Store the id of that user inside the users cookie. req.session {} object is added by cookie-session.
    req.session.userId = user.id;

    // 3 Response
    res.redirect("/admin/products");
  }
);

module.exports = router;
