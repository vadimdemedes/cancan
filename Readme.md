# CanCan [![Circle CI](https://circleci.com/gh/vdemedes/cancan.svg?style=svg)](https://circleci.com/gh/vdemedes/cancan)

CanCan provides a simple API for handling authorization of actions.
Permissions are defined for each class using a simple `can` function.


<h1 align="center">
	<br>
	<img width="200" src="media/key.png">
	<br>
	<br>
	<br>
</h1>

### Installation

```
$ npm install cancan --save
```


### Quick Look

```js
const cancan = require('cancan');
const can = cancan.can;


// example classes
class AdminUser {}
class User {}

class Product {}


// define permissions
cancan.configure(User, function (user) {
  // this user can view
  // all instances of Product
  this.can('view', Product);
});

cancan.configure(AdminUser, function (user) {
  // this user can:
  //  1. view all products
  //  2. create a new product
  this.can('view', Product);
  this.can('create', Product);
});


// check access
let product = new Product();

let adminUser = new AdminUser();
let user = new User();

can(adminUser, 'view', product); // true
can(adminUser, 'create', product); // true

can(user, 'view', product); // true
can(user, 'create', product); // false
```


### Getting Started

To start with, require CanCan and create shortcuts for its main methods (optional):

```js
const cancan = require('cancan');

const authorize = cancan.authorize;
const cannot = cancan.cannot;
const can = cancan.can;
```


#### Define permissions

Permissions are defined for each class (e.g. User, GuestUser, AdminUser).
The function you pass configures permissions for the **current instance** of a chosen class.
In the following example, permissions are configured for instances of a *User* class.

```js
const can = cancan.can;

cancan.configure(User, function (user) {
  // only john can view products
  if (user.name === 'john') {
    this.can('view', Product);
  }

  // only drew can edit products
  if (user.name === 'drew') {
    this.can('edit', Product);
  }
});

let john = new User({ name: 'john' });
let drew = new User({ name: 'drew' });

let product = new Product();

can(john, 'view', product); // true
can(john, 'edit', product); // false

can(drew, 'view', product); // false
can(drew, 'edit', product); // true
```

The `can` (not `cancan.can`, but `this.can` in a configurator function) method is used to define permissions and requires two arguments.
The first one is the action you're setting the permission for, the second one is the class of object you're setting it on (target).

If action equals to `'manage'`, any action is allowed.
If target equals to `'all'`, any target is allowed.

```js
this.can('read', Product); // can read product
this.can('manage', Product); // can do everything with product
this.can('read', 'all'); // can read everything
this.can('manage', 'all'); // can do everything
```

Arrays are also accepted:

```js
this.can(['read', 'destroy'], [Product, Article]);
```

There is an optional, third argument, which restricts objects to those, that satisfy a condition.

```javascript
this.can('read', Product, { published: true }); // can read only products with published = true

this.can('read', Product, function (product) { // same thing, but using a function
  return product.published === true;
});
```

#### Check permissions

To check ability to do some action:

```js
// some product from the database
let product = yield Product.findOne();

// assume, that "user" is current user
if (can(user, 'edit', product)) {
  // can edit the product
}
```

There's also a stricter method `authorize`, which emits an exception if the action is not allowed.
It is useful for applications based on Koa, where emitting an exception would abort a request.
If permission is given, nothing will be done and code continues executing.

```javascript
authorize(user, 'edit', product);
```

### Tests

[![Circle CI](https://circleci.com/gh/vdemedes/cancan.svg?style=svg)](https://circleci.com/gh/vdemedes/cancan)

```
$ make test
```

### License

MIT © [Vadym Demedes](http://vadimdemedes.com)
