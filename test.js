'use strict';

/**
 * Dependencies
 */

const cancan = require('./');
const test = require('ava');

const authorize = cancan.authorize;
const cannot = cancan.cannot;
const can = cancan.can;


/**
 * Example classes
 */

class User {

}

class Product {
  constructor (attrs) {
    this.attrs = attrs || {};
  }

  get (key) {
    return this.attrs[key];
  }
}


/**
 * Tests
 */

test ('allow one action', function (t) {
  t.plan(3);

  cancan.configure(User, function (user) {
    this.can('read', Product);
  });

  let user = new User();
  let product = new Product();

  t.true(can(user, 'read', product));
  t.false(cannot(user, 'read', product));
  t.false(can(user, 'create', product));
});

test ('allow many actions', function (t) {
  t.plan(3);

  cancan.configure(User, function (user) {
    this.can(['read', 'create', 'destroy'], Product);
  });

  let user = new User();
  let product = new Product();

  t.true(can(user, 'read', product));
  t.true(can(user, 'create', product));
  t.true(can(user, 'destroy', product));
});

test ('allow all actions using "manage"', function (t) {
  t.plan(5);

  cancan.configure(User, function (user) {
    this.can('manage', Product);
  });

  let user = new User();
  let product = new Product();

  t.true(can(user, 'read', product));
  t.true(can(user, 'create', product));
  t.true(can(user, 'update', product));
  t.true(can(user, 'destroy', product));
  t.true(can(user, 'modify', product));
});

test ('allow all actions and all objects', function (t) {
  t.plan(2);

  cancan.configure(User, function (user) {
    this.can('manage', 'all');
  });

  let user = new User();
  let product = new Product();

  t.true(can(user, 'read', user));
  t.true(can(user, 'read', product));
});

test ('allow only objects that satisfy given condition', function (t) {
  t.plan(2);

  cancan.configure(User, function (user) {
    this.can('read', Product, { published: true });
  });

  let user = new User();
  let privateProduct = new Product();
  let publicProduct = new Product({ published: true });

  t.false(can(user, 'read', privateProduct));
  t.true(can(user, 'read', publicProduct));
});

test ('allow only objects that pass a validation test', function (t) {
  t.plan(2);

  cancan.configure(User, function (user) {
    this.can('read', Product, function (product) {
      return product.get('published') === true;
    });
  });

  let user = new User();
  let privateProduct = new Product();
  let publicProduct = new Product({ published: true });

  t.false(can(user, 'read', privateProduct));
  t.true(can(user, 'read', publicProduct));
});

test ('throw an exception if permissions is not granted', function (t) {
  t.plan(1);

  cancan.configure(User, function (user) {
    this.can('read', Product, function (product) {
      return product.get('published') === true;
    });
  });

  let user = new User();
  let privateProduct = new Product();
  let publicProduct = new Product({ published: true });

  authorize(user, 'read', publicProduct);

  t.throws(function () {
    authorize(user, 'read', privateProduct);
  });
});
