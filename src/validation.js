/* eslint-disable max-classes-per-file */
class ValidationResult {
  constructor() {
    this.errors = [];
  }

  isOk() {
    return this.errors.length === 0;
  }

  caught(err) {
    this.errors.push(err);
    console.log('Validation caught error:', err);
  }

  toResponseObject() {
    return {
      status: this.isOk() ? 'ok' : 'error',
      errors: this.errors
    };
  }
}

class Validator {
  constructor() {
    this.result = new ValidationResult();
  }

  test(data, fn, errmsg) {
    if (!fn.call(null, data)) { this.result.caught(errmsg); }
  }

  caught(err) {
    this.result.caught(err);
  }
}

module.exports = { Validator, ValidationResult };
