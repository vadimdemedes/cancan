'use strict';

const isFunction = require('is-function');
const isObject = require('is-plain-obj');
const autoBind = require('auto-bind');
const arrify = require('arrify');

function get(obj, key) {
	if (isFunction(obj.get)) {
		return obj.get(key);
	}

	return obj[key];
}

function isPartiallyEqual(target, obj) {
	return Object.keys(obj).every(key => {
		const value = obj[key];

		return get(target, key) === value;
	});
}

function getConditionFn(condition) {
	return (performer, target) => isPartiallyEqual(target, condition);
}

function defaultInstanceOf(instance, model) {
	return instance instanceof model;
}

function defaultCreateError() {
	return new Error('Authorization error.');
}

class CanCan {
	constructor(options) {
		autoBind(this);

		options = options || {};

		this.abilities = [];
		this.instanceOf = options.instanceOf || defaultInstanceOf;
		this.createError = options.createError || defaultCreateError;
	}

	allow(model, actions, targets, condition) {
		if (isObject(condition)) {
			condition = getConditionFn(condition);
		}

		arrify(actions).forEach(action => {
			arrify(targets).forEach(target => {
				this.abilities.push({
					model: model,
					action: action,
					target: target,
					condition: condition
				});
			});
		});
	}

	can(performer, action, target) {
		return this.abilities
			.filter(ability => this.instanceOf(performer, ability.model))
			.filter(ability => {
				return ability.target === 'all' ||
					target === ability.target ||
					this.instanceOf(target, ability.target);
			})
			.filter(ability => {
				return ability.action === 'manage' ||
					action === ability.action;
			})
			.filter(ability => {
				if (ability.condition) {
					return ability.condition(performer, target);
				}

				return true;
			})
			.length > 0;
	}

	cannot() {
		return !this.can.apply(this, arguments);
	}

	authorize() {
		if (this.cannot.apply(this, arguments)) {
			const err = this.createError.apply(null, arguments);
			throw err;
		}
	}
}

module.exports = CanCan;
