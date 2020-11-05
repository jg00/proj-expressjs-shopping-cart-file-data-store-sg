const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

// Hash Password Step 2a - Create a promised based version of scrypt.
const scrypt = util.promisify(crypto.scrypt); // 1 Provide promisify a function that usually receives a callback. 2 Returns a new version of that function that returns a promise.

class UsersRepository extends Repository {
  // 10 For Validating Passwords.
  async comparePasswords(saved, supplied) {
    // saved -> password saved in the database.  'hashed.salt'
    // supplied -> password provided by the user

    const [hashed, salt] = saved.split(".");
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString("hex");
  }

  // 3 Create New User and Add To Full List.  Salt and Hash the Password.
  async create(attrs) {
    // attrs => {email: '', password: ''} // At this point we have the raw version of the password.
    attrs.id = this.randomId();

    // Hash Password Step 1 - Generate a random salt
    const salt = crypto.randomBytes(8).toString("hex");

    // Hash Password Step 2b - Return a hashed version (of type <Buffer>) of the combination of the password + random salt.
    // As a side step we are using a promisified version of scrypt.  (See steps at the top)
    const buf = await scrypt(attrs.password, salt, 64);

    const records = await this.getAll();

    // Hash Password Step 3 - We now store the "hashed password + delimieter(.) + generated salt"
    const record = {
      ...attrs,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record; // Mainly to return the specific user.id created and added to the cookie.
  }
}

module.exports = new UsersRepository("users.json");

// Important notes, reference, test
/*
// Ref 3 - The second way is export an instance of the class with the configured file name store.

  // ANOTHER FILE..
  1. no need to create instance
  2. we immediatly can call methods on that instance
  3. we only ever will have one instance of that class. <<--

  const repo = require('./users')
  repo.getAll()
  repo.getOne()

  // YET ANOTHER FILE..
  1. Here too we only ever will work directly with that one instance of the class.

  const repo = require('./users')
  repo.getAll();
*/

/*
// Ref 2 - Two ways to exxport.  We could export the entire class and new up an instance.  
   1 a problem may be is this could accidentally be new'd up in another file with a different file name we want to save the data to.
   2 we have to remember to create a new instance before we can access methods inside the class

`  module.exports = UserRepository

  // ANOTHER FILE..
  const UsersRepository = require('./users')`
  const repo = new UsersRepository('users.json')

  // YET ANOTHER FILE..
  const UsersRepository = require('./users')`
  const repo = new UsersRepository('user.json') <-- notice we accidentally make a small type in the file name argument.  Now we have two file stores.
*/

/*
// Ref 1 - Test Only
// Test --> node users.js
const test = async () => {
  const repo = new UsersRepository("users.json");

  // Test create user
  // await repo.create({ email: "test@test.com", password: "password" });

  // Test getAll() users
  // const users = await repo.getAll();
  // console.log(users);

  // Test getOne(id)
  // const user = await repo.getOne("5e4d7ba7");
  // const user = await repo.getOne("blahblah");
  // console.log(user);

  // Test delete(id)
  // await repo.delete("18ffa7eb");

  // Test update(id, attrs)
  // await repo.create({ email: "test@test2.com" });
  // await repo.update("0193075a", { password: "mypassword2" });
  // await repo.update("0193075a", { password: "MyPassword123" });
  // await repo.update("garbageid", { password: "mypassword" });

  // Test getOneBy({}) - Filter object with any arbitrary set of key/value pairs to filter by.
  const user = await repo.getOneby({
    email: "test@test3.com",
    password: "MyPassword123",
  });
  console.log(user);
};

test();
*/
