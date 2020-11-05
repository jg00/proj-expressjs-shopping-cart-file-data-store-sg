const layout = require("../layout");
const { getError } = require("../../helpers");

module.exports = ({ errors }) => {
  return layout({
    content: `
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-one-quarter">
            <form method="POST">
              <h1 class="title">Sign Up</h1>
              <div class="field">
                <label class="label">Email</label>
                <input required class="input" placeholder="Email" name="email" />
                <p class="help is-danger">${getError(errors, "email")}</p>
              </div>
              <div class="field">
                <label class="label">Password</label>
                <input required class="input" placeholder="Password" name="password" type="password" />
                <p class="help is-danger">${getError(errors, "password")}</p>
              </div>
              <div class="field">
                <label class="label">Password Confirmation</label>
                <input required class="input" placeholder="Password Confirmation" name="passwordConfirmation" type="password" />
                <p class="help is-danger">${getError(
                  errors,
                  "passwordConfirmation"
                )}</p>
              </div>
              <button class="button is-primary">Submit</button>
            </form>
            <a href="/signin">Have an account? Sign In</a>
          </div>
        </div>
      </div>
    `,
  });
};

/*
express-validator method
.mapped() -> Returns: an object where the keys are the field names, and the values are the validation errors
  1 validationResult(req) - see auth.js router.post("/signup")
  errors: [
    {
      value: 'test5@test.com',
      msg: 'Email in use',
      param: 'email',
      location: 'body'
    }
  ]

  2 errors.mapped() returns object where key is the param
  {
    email: {
      value: 'test5@test.com',
      msg: 'Email in use',
      param: 'email',
      location: 'body'
    }
  }
*/
