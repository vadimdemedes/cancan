"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

/**
 * Dependencies
 */

var isArray = require("isarray");


/**
 * CanCan
 *
 * Contains methods to verify abilities
 * configured previously using Ability class
 */

var CanCan = (function () {
  function CanCan() {}

  _prototypeProperties(CanCan, {
    can: {
      value: function can(user, action, target) {
        var ability = new this.Ability();
        ability.configure(user);

        return ability._test(action, target);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    cannot: {
      value: function cannot() {
        return !this.can.apply(this, arguments);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    authorize: {
      value: function authorize() {
        var isAllowed = this.can.apply(this, arguments);

        if (!isAllowed) {
          var err = new Error("Not authorized.");
          err.status = 401;
          throw err;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setup: {
      value: function setup(ability) {
        this.Ability = ability;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return CanCan;
})();

// bind CanCan's methods to save context
["can", "cannot", "authorize", "setup"].forEach(function (method) {
  return CanCan[method] = CanCan[method].bind(CanCan);
});


/**
 * Ability
 *
 * Customize abilities using this class
 */

var Ability = (function () {
  function Ability() {
    // all defined rules
    // will be stored here
    this.rules = [];
  }

  _prototypeProperties(Ability, null, {
    configure: {
      value: function configure() {},
      writable: true,
      enumerable: true,
      configurable: true
    },
    can: {
      value: function can(actions, targets, attrs) {
        var _this = this;
        // ensure that actions and targets
        // are always arrays
        if (!isArray(actions)) actions = [actions];
        if (!isArray(targets)) targets = [targets];

        targets.forEach(function (target) {
          actions.forEach(function (action) {
            _this._registerAbility(action, target, attrs);
          });
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _registerAbility: {


      /** Private Methods **/

      value: function RegisterAbility(action, target, attrs) {
        var rule = { action: action, target: target, attrs: attrs };

        this.rules.push(rule);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _test: {
      value: function Test(action, target) {
        if (!action || !target) return false;

        // filter out rules that
        // don't match
        var rules = this.rules.filter(function (rule) {
          // action should be either equal
          // or "manage" to allow everything
          var actionMatches = "manage" === rule.action || action === rule.action;

          // target should either be a child of target
          // or "all" to allow everything
          var targetMatches = "all" === rule.target || target instanceof rule.target;

          // by default assume that
          // all attributes match
          var attrsMatch = true;

          if (rule.attrs) {
            // check if there is a function
            // that executes custom validation
            if ("function" === typeof rule.attrs) {
              attrsMatch = rule.attrs(target);
            }

            // iterate over object
            // and compare each property
            if ("object" === typeof rule.attrs) {
              Object.keys(rule.attrs).forEach(function (key) {
                var expectedValue = rule.attrs[key];

                // support objects with .get() method
                // fallbacks to "usual" property lookup
                var actualValue = typeof target.get === "function" ? target.get(key) : target[key];

                if (actualValue !== expectedValue) attrsMatch = false;
              });
            }
          }

          // if all checks are satisfied, allow this rule
          return actionMatches && targetMatches && attrsMatch;
        });

        // allow only if there are matching rules
        return !!rules.length;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Ability;
})();




/**
 * Expose CanCan
 */

var exports = module.exports = CanCan;

exports.Ability = Ability;
