# CanCan

[![Build Status](https://travis-ci.org/vdemedes/cancan.svg?branch=master)](https://travis-ci.org/vdemedes/cancan) [![Coverage Status](https://coveralls.io/repos/vdemedes/cancan/badge.svg?branch=master&service=github)](https://coveralls.io/github/vdemedes/cancan?branch=master)

CanCan provides a simple API for handling authorization of actions.
Permissions are defined for each class using a simple `can` function.


<h1 align="center">
	<br>
	<img width="100" src="media/logo.png">
	<br>
	<br>
	<br>
</h1>

## Installation

```
$ npm install cancan --save
```


## User Guide

<a href="https://onbucket.com/vdemedes/cancan"><img src="https://onbucket.com/images/logo.png" width="28" align="top"></a> [Read the interactive user guide on Bucket](https://onbucket.com/vdemedes/cancan)


## Quick Look

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


## Tests

```
$ npm test
```

## License

MIT © [Vadym Demedes](http://vadimdemedes.com)
