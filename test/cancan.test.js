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

describe ('CanCan', function () {
  it ('should allow one action', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('read', Product);
      }
    }
    
    cancan.setup(Ability);
    
    let user = new User();
    let product = new Product();
    
    can(user, 'read', product).should.equal(true);
    cannot(user, 'read', product).should.equal(false);
    can(user, 'create', product).should.equal(false);
  });
  
  it ('should allow many actions', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can(['read', 'create', 'destroy'], Product);
      }
    }
    
    cancan.setup(Ability);
    
    let user = new User();
    let product = new Product();
    
    can(user, 'read', product).should.equal(true);
    can(user, 'create', product).should.equal(true);
    can(user, 'destroy', product).should.equal(true);
  });
  
  it ('should allow all actions using "manage"', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('manage', Product);
      }
    }
    
    cancan.setup(Ability);
    
    let user = new User();
    let product = new Product();
    
    can(user, 'read', product).should.equal(true);
    can(user, 'create', product).should.equal(true);
    can(user, 'update', product).should.equal(true);
    can(user, 'destroy', product).should.equal(true);
    can(user, 'modify', product).should.equal(true);
  });
  
  it ('should allow all actions and all objects', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('manage', 'all');
      }
    }
    
    cancan.setup(Ability);
    
    let user = new User();
    let product = new Product();
    
    can(user, 'read', user).should.equal(true);
    can(user, 'read', product).should.equal(true);
  });
  
  it ('should allow only certain items', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('read', Product, { published: true });
      }
    }
    
    cancan.setup(Ability);
    
    let user = new User();
    let privateProduct = new Product();
    let publicProduct = new Product({ published: true });
    
    can(user, 'read', privateProduct).should.equal(false);
    can(user, 'read', publicProduct).should.equal(true);
  });
  
  it ('should allow only certain items via validator function', function () {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('read', Product, function (product) {
          return product.get('published') === true;
        });
      }
    }
      
    cancan.setup(Ability);
    
    let user = new User();
    let privateProduct = new Product();
    let publicProduct = new Product({ published: true });

    can(user, 'read', privateProduct).should.equal(false);
    can(user, 'read', publicProduct).should.equal(true);
  });
  
  it ('should throw an exception', function (done) {
    class Ability extends cancan.Ability {
      configure (user) {
        this.can('read', Product, function (product) {
          return product.get('published') === true;
        });
      }
    }
      
    cancan.setup(Ability);
    
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
    
    done(new Error);
  });
});
