const { validationResult } = require("express-validator"); // Validation now handled with 'express-validation' middleware

module.exports = {
  handleErrors(templateFunc, dataCb) {
    return async (req, res, next) => {
      const errors = validationResult(req); // Result of checks are attached to the req object
      console.log("middlewares.js handleErrors():", errors);

      // Provide template with errors and data if any through optional dataCb callback
      if (!errors.isEmpty()) {
        let data = {};
        if (dataCb) {
          data = await dataCb(req); //  { product: { title: 'Product', price: 11.01, image: '', id: '04fc729b' } }
        }

        return res.send(templateFunc({ errors, ...data })); // { errors: {}, product: {} }
      }

      next();
    };
  },

  requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.redirect("/signin");
    }

    next();
  },
};

/*
  Example: console.log({ errors, ...data }); // see example below
  {
    errors: Result { formatter: [Function: formatter], errors: [ [Object] ] },
    product: { title: 'Product', price: 11.01, image: '', id: '04fc729b' }
  }

*/
