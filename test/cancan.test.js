'use strict';

/**
 * Dependencies
 */

var cancan = require('../');

var { can, cannot, authorize } = cancan;

require('chai').should();


/**
 * Tests
 */

class User {

}

class Product {
  constructor (attrs = {}) {
    this.attrs = attrs;
  }

  get (key) {
    return this.attrs[key];
  }
}

describe ('cancan', function () {
  it ('allow one action', function () {

    cancan.configure(User, function (user) {
      this.can('read', Product);
    });

    let user = new User();
    let product = new Product();

    can(user, 'read', product).should.equal(true);
    cannot(user, 'read', product).should.equal(false);
    can(user, 'create', product).should.equal(false);
  });

  it ('allow many actions', function () {
    cancan.configure(User, function (user) {
      this.can(['read', 'create', 'destroy'], Product);
    });

    let user = new User();
    let product = new Product();

    can(user, 'read', product).should.equal(true);
    can(user, 'create', product).should.equal(true);
    can(user, 'destroy', product).should.equal(true);
  });

  it ('allow all actions using "manage"', function () {
    cancan.configure(User, function (user) {
      this.can('manage', Product);
    });

    let user = new User();
    let product = new Product();

    can(user, 'read', product).should.equal(true);
    can(user, 'create', product).should.equal(true);
    can(user, 'update', product).should.equal(true);
    can(user, 'destroy', product).should.equal(true);
    can(user, 'modify', product).should.equal(true);
  });

  it ('allow all actions and all objects', function () {
    cancan.configure(User, function (user) {
      this.can('manage', 'all');
    });

    let user = new User();
    let product = new Product();

    can(user, 'read', user).should.equal(true);
    can(user, 'read', product).should.equal(true);
  });

  it ('allow only certain items', function () {
    cancan.configure(User, function (user) {
      this.can('read', Product, { published: true });
    });

    let user = new User();
    let privateProduct = new Product();
    let publicProduct = new Product({ published: true });

    can(user, 'read', privateProduct).should.equal(false);
    can(user, 'read', publicProduct).should.equal(true);
  });

  it ('allow only certain items via validator function', function () {
    cancan.configure(User, function (user) {
      this.can('read', Product, function (product) {
        return product.get('published') === true;
      });
    });

    let user = new User();
    let privateProduct = new Product();
    let publicProduct = new Product({ published: true });

    can(user, 'read', privateProduct).should.equal(false);
    can(user, 'read', publicProduct).should.equal(true);
  });

  it ('throw an exception', function (done) {
    cancan.configure(User, function (user) {
      this.can('read', Product, function (product) {
        return product.get('published') === true;
      });
    });

    let user = new User();
    let privateProduct = new Product();
    let publicProduct = new Product({ published: true });

    authorize(user, 'read', publicProduct);

    try {
      authorize(user, 'read', privateProduct);
    } catch (e) {
      e.status.should.equal(401);
      return done();
    }

    done(new Error('Exception was not fired'));
  });
});
