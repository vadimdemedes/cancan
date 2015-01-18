/**
 * Dependencies
 */

var { isArray } = require('./util');


/**
 * CanCan
 *
 * Contains methods to verify abilities
 * configured previously using Ability class
 */

class CanCan {
  static can (user, action, target) {
    let ability = new this.Ability();
    ability.configure(user);
    
    return ability._test(action, target);
  }
  
  static cannot () {
    return !this.can.apply(this, arguments);
  }
  
  static authorize () {
    let isAllowed = this.can.apply(this, arguments);
    
    if (!isAllowed) {
      let err = new Error('Not authorized.');
      err.status = 401;
      throw err;
    }
  }
  
  static setup (ability) {
    this.Ability = ability;
  }
}

// bind CanCan's methods to save context
['can', 'cannot', 'authorize', 'setup'].forEach(method => CanCan[method] = CanCan[method].bind(CanCan));


/**
 * Ability
 *
 * Customize abilities using this class
 */

class Ability {
  constructor () {
    // all defined rules
    // will be stored here
    this.rules = [];
  }
  
  configure () {
    
  }
  
  can (actions, targets, attrs) {
    // ensure that actions and targets
    // are always arrays
    if (!isArray(actions)) actions = [actions];
    if (!isArray(targets)) targets = [targets];
    
    targets.forEach(target => {
      actions.forEach(action => {
        this._registerAbility(action, target, attrs)
      });
    });
  }
  
  
  /** Private Methods **/
  
  _registerAbility (action, target, attrs) {    
    let rule = { action, target, attrs };
    
    this.rules.push(rule);
  }
  
  _test (action, target) {
    if (!action || !target) return false;
    
    // filter out rules that
    // don't match
    let rules = this.rules.filter(rule => {
      // action should be either equal
      // or "manage" to allow everything
      let actionMatches = 'manage' === rule.action || action === rule.action;
      
      // target should either be a child of target
      // or "all" to allow everything
      let targetMatches = 'all' === rule.target || target instanceof rule.target;
      
      // by default assume that
      // all attributes match
      let attrsMatch = true;
      
      if (rule.attrs) {
        // check if there is a function
        // that executes custom validation
        if ('function' === typeof rule.attrs) {
          attrsMatch = rule.attrs(target);
        }
        
        // iterate over object
        // and compare each property
        if ('object' === typeof rule.attrs) {
          Object.keys(rule.attrs).forEach(key => {
            let expectedValue = rule.attrs[key];
            
            // support objects with .get() method
            // fallbacks to "usual" property lookup
            let actualValue = typeof target.get === 'function' ? target.get(key) : target[key];

            if (actualValue !== expectedValue) attrsMatch = false;
          });
        }
        
      }
      
      // if all checks are satisfied, allow this rule
      return actionMatches && targetMatches && attrsMatch;
    });
    
    // allow only if there are matching rules
    return !!rules.length;
  }
}


/**
 * Expose CanCan
 */

var exports = module.exports = CanCan;

exports.Ability = Ability;
