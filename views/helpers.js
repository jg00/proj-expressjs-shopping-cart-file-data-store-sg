module.exports = {
  // Return error in the form of an object using 'express-validator''s .mapped() method
  getError(errors, prop) {
    try {
      return errors.mapped()[prop].msg; // Note error for prop may not exists and just return ''.
    } catch (err) {
      return "";
    }
  },
};
