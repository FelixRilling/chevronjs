'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');

/**
 * Gets name of a value.
 *
 * If the value has a name or description property, the value of that is returned.
 * If the value is a string, it is returned as is.
 * Otherwise null is returned.
 *
 * @since 10.2.0
 * @memberOf Object
 * @param value Value to check.
 * @returns The name of the value.
 * @example
 * name(class Foo{})
 * // => "Foo"
 *
 * name(function bar(){})
 * // => "bar"
 *
 * name(Symbol("abc"))
 * // => "abc"
 *
 * name("foo")
 * // => "foo"
 *
 * name(1)
 * // => null
 */
const name = (value) => {
    if (lodash.isString(value)) {
        return value;
    }
    // eslint-disable-next-line no-extra-parens
    if (lodash.isObject(value) && lodash.isString(value.name)) {
        // eslint-disable-next-line no-extra-parens
        return value.name;
    }
    if (lodash.isSymbol(value) && lodash.isString(value.description)) {
        return value.description;
    }
    return null;
};

const createNonFunctionInitializerError = () => new TypeError("Non-functions cannot be bootstrapped by this bootstrapper.");
const classBootstrapper = (initializer, dependencies) => {
    if (!lodash.isFunction(initializer)) {
        throw createNonFunctionInitializerError();
    }
    return Reflect.construct(initializer, dependencies);
};
const functionBootstrapper = (initializer, dependencies) => (...args) => {
    if (!lodash.isFunction(initializer)) {
        throw createNonFunctionInitializerError();
    }
    return initializer(...dependencies, ...args);
};
const identityBootstrapper = (initializer) => initializer;
const Bootstrappers = {
    CLASS: classBootstrapper,
    FUNCTION: functionBootstrapper,
    IDENTITY: identityBootstrapper
};

const singletonScoper = (name) => `SINGLETON_${name}`;
const prototypeScoper = () => null;
const Scopes = {
    SINGLETON: singletonScoper,
    PROTOTYPE: prototypeScoper
};

const guessName = (initializer) => {
    const guessedName = name(initializer);
    if (lodash.isNil(guessedName)) {
        throw new TypeError(`Could not guess name of ${initializer}, please explicitly define one.`);
    }
    return guessedName;
};
const getInjectableName = (name) => lodash.isString(name) ? name : guessName(name);
const createCircularDependencyError = (entryName, resolveStack) => {
    return new Error(`Circular dependencies found: '${[...resolveStack, entryName].join("->")}'.`);
};
class Chevron {
    constructor() {
        this.injectables = new Map();
    }
    registerInjectable(initializer, bootstrapFn = Bootstrappers.IDENTITY, dependencies = [], name = null, scopeFn = Scopes.SINGLETON) {
        const entryName = lodash.isString(name) ? name : guessName(initializer);
        if (this.injectables.has(entryName)) {
            throw new Error(`Name already exists: '${entryName}'.`);
        }
        this.injectables.set(entryName, {
            bootstrapFn,
            scopeFn,
            dependencies,
            initializer,
            instances: new Map()
        });
    }
    getInjectableInstance(name, context = null) {
        return this.getBootstrappedInjectableInstance(name, context, new Set());
    }
    hasInjectable(name) {
        return this.injectables.has(getInjectableName(name));
    }
    hasInjectableInstance(name, context = null) {
        const { entry, instanceName } = this.resolveInjectableInstance(name, context);
        return instanceName != null && entry.instances.has(instanceName);
    }
    resolveInjectableInstance(name, context) {
        const entryName = getInjectableName(name);
        if (!this.injectables.has(entryName)) {
            throw new Error(`Injectable '${name}' does not exist.`);
        }
        const entry = this.injectables.get(entryName);
        const instanceName = entry.scopeFn(entryName, entry, context);
        return { entryName, entry, instanceName };
    }
    getBootstrappedInjectableInstance(name, context, resolveStack) {
        const { entryName, entry, instanceName } = this.resolveInjectableInstance(name, context);
        if (instanceName != null && entry.instances.has(instanceName)) {
            return entry.instances.get(instanceName);
        }
        /*
         * Start bootstrapping value.
         */
        if (resolveStack.has(entryName)) {
            throw createCircularDependencyError(entryName, resolveStack);
        }
        resolveStack.add(entryName);
        const instance = entry.bootstrapFn(entry.initializer, entry.dependencies.map(dependencyName => this.getBootstrappedInjectableInstance(dependencyName, context, resolveStack)));
        if (instanceName != null) {
            entry.instances.set(instanceName, instance);
        }
        resolveStack.delete(entryName);
        return instance;
    }
}

const Injectable = (instance, bootstrapFn = Bootstrappers.IDENTITY, dependencies = [], name = null, scopeFn = Scopes.SINGLETON) => (target) => {
    instance.registerInjectable(target, bootstrapFn, dependencies, name, scopeFn);
    return target;
};

const Autowired = (instance, name, context = null) => (target, propertyKey) => {
    target[propertyKey] = instance.getInjectableInstance(name, context);
};

exports.Autowired = Autowired;
exports.Bootstrappers = Bootstrappers;
exports.Chevron = Chevron;
exports.Injectable = Injectable;
exports.Scopes = Scopes;
//# sourceMappingURL=chevron.common.js.map
