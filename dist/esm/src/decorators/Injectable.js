/**
 * Decorator function to be used as TypeScript decorator
 * in order to declare a value to be an injectable which is added to the chevron instance.
 *
 * @param {Chevron} instance Chevron instance to use.
 * @param {string} type Type of the injectable.
 * @param {string[]} dependencies Array of dependency keys.
 * @param {*?} key Custom key of the injectable. If none is given, the initializer will be used.
 */
const Injectable = (instance, type, dependencies, key) => (target) => {
    instance.set(type, dependencies, target, key);
    return target;
};
export { Injectable };
//# sourceMappingURL=Injectable.js.map