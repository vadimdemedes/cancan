# CanCan

This is basically a port of Ryan Bates' [cancan](https://github.com/ryanb/cancan) Ruby gem.
CanCan provides a simple API for handling authorization of actions.
All permissions are defined in a single location (the `Ability` class) and not duplicated across controllers, views, and database queries.

[![Circle CI](https://circleci.com/gh/vdemedes/cancan.svg?style=svg)](https://circleci.com/gh/vdemedes/cancan)

## Features

- Dead-simple API
- Lightweight (70 sloc)
- No dependencies
- Tested

## Installation

```
$ npm install cancan --save
```

## Getting Started

**Note**: All examples are in ES6.

To start with, require CanCan and create shortcuts for its main methods:

```javascript
var CanCan = require('cancan');

var { can, cannot, authorize } = CanCan;
```

### 1. Define abilities

User permissions are defined in an `Ability` class.
An example class looks like this:

```javascript
class Ability {
  configure (user) {
    if (!user) {
      user = new User(); // guest user (not logged in)
    }
    
    if (user.admin === true) {
      this.can('manage', 'all');
    } else {
      this.can('read', 'all');
    }
  }
}
```

The `can` method is used to define permissions and requires two arguments.
The first one is the action you're setting the permission for, the second one is the class of object you're setting it on.
In the above example, `'manage'` allows all actions and `'all'` allows all objects.
Action can be any string and object can be any class (or 'all').

```javascript
this.can('read', Product);
```

Arrays can also be passed as arguments:

```javascript
this.can(['read', 'destroy'], [Product, Article]);
```

There is an optional, third argument, which restricts objects to those, that satisfy a condition.

```javascript
this.can('read', Product, { published: true }); // can read only products with published = true

this.can('read', Product, function (product) { // same thing, but using a function
  return product.published === true;
});
```

### 2. Check abilities and authorization

To check ability to do some action:

```javascript
// some product from the database
let product = yield Product.findOne();

// assume, that "user" is current user
if (can(user, 'edit', product)) {
  // can edit the product
}
```

There's also a stricter method `authorize`, which will emit an exception if the action is not allowed.
It is useful for applications based on Koa, where emitting an exception would abort a request.
If permission is given, nothing will be done and code will continue executing.

```javascript
authorize(user, 'edit', product);
```

### 3. Enjoy!

## Tests

[![Circle CI](https://circleci.com/gh/vdemedes/cancan.svg?style=svg)](https://circleci.com/gh/vdemedes/cancan)

```
$ npm test
```

## License

CanCan is released under the MIT license.
