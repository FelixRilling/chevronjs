var chevron = (function (exports, lodash) {
    'use strict';

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
        if (lodash.isObject(value) && lodash.isString(value.name)) {
            return value.name;
        }
        if (lodash.isSymbol(value) && lodash.isString(value.description)) {
            return value.description;
        }
        return null;
    };

    /**
     * Creates a {@link Factory} which constructs the initializer with the dependencies as parameters.
     *
     * @public
     * @throws TypeError when used with a non-function initializer.
     */
    const classFactoryFactory = () => (initializer, dependencies) => Reflect.construct(initializer, dependencies);
    /**
     * Creates a {@link Factory} which returns a function executing the initializer with the dependencies as parameters.
     *
     * @public
     * @throws TypeError when used with a non-function initializer.
     */
    const functionFactoryFactory = () => (initializer, dependencies) => initializer(...dependencies);
    /**
     * Creates a {@link Factory} which immediately returns the initializer.
     * This is useful for injectables which do not require any other initialization.
     * Note that by using this factory, no usage of dependencies for this value is possible.
     *
     * @public
     */
    const identityFactoryFactory = () => (initializer) => initializer;
    /**
     * Pseudo-enum of built-in {@link Factory}s.
     *
     * @public
     */
    const DefaultFactory = {
        CLASS: classFactoryFactory,
        FUNCTION: functionFactoryFactory,
        IDENTITY: identityFactoryFactory,
    };

    /**
     * Creates a {@link Scope} which forces usage of a single instance for every request.
     *
     * @public
     */
    const singletonScopeFactory = () => () => "__SINGLETON__";
    /**
     * Creates a {@link Scope} which forces instantiation of a new instance every time the injectable is requested.
     *
     * @public
     */
    const prototypeScopeFactory = () => () => null;
    /**
     * Pseudo-enum of built-in {@link Scope}s.
     *
     * @public
     */
    const DefaultScope = {
        SINGLETON: singletonScopeFactory,
        PROTOTYPE: prototypeScopeFactory,
    };

    /**
     * Tries to guess the string name of a nameable value. if none can be determined, an error is thrown.
     * See {@link Nameable} and {@link getName} for details.
     *
     * @private
     * @param value Value to to guess a name for.
     * @return Name of the value.
     * @throws TypeError when to name can be guessed.
     */
    const guessName = (value) => {
        const guessedName = name(value);
        if (guessedName == null) {
            throw new TypeError(`Could not guess name of '${String(value)}', please explicitly define one.`);
        }
        return guessedName;
    };
    /**
     * Creates an error circular injectable dependencies.
     *
     * @private
     * @param resolveStack Resolve stack.
     * @param injectableEntryName Current injectable name that caused the error.
     * @return Created error
     */
    const createCircularDependencyError = (resolveStack, injectableEntryName) => {
        const resolveStackFull = [...Array.from(resolveStack), injectableEntryName];
        const stackVisualization = resolveStackFull
            .map((name) => `'${name}'`)
            .join(" -> ");
        return new Error(`Circular dependencies found: ${stackVisualization}.`);
    };
    /**
     * Injectable container class.
     *
     * @public
     * @class
     * @typeparam TContext type of the context which cane be used for scoping.
     */
    class Chevron {
        /**
         * Creates a new, empty container.
         *
         * @public
         */
        constructor() {
            this.injectables = new Map();
        }
        /**
         * Registers a new injectable on this container.
         *
         * @public
         * @param initializer Initial value of this injectable. This can be any value, but usually  a class or a different kind of function.
         *      During retrieval, the initial value might be transformed by the factory (see {@link Factory} for details).
         *      If no name is provided in the options (see description of the options parameter, section "name"),
         *      a name will be determined from the initializer through {@link getName}.
         *      or a value which is nameable. For details on nameable values see {@link getName}.
         * @param options Options for this injectable. The following options exist:
         *      <ul>
         *          <li>name:
         *                  Name for this injectable. If this is not provided, the name will be determined based on the initializer.
         *                  (see description of the initializer parameter)
         *          </li>
         *          <li>factory:
         *                  Instantiation strategy to use when instantiating this injectable (see {@link Factory} for details).
         *                  By default, {@link DefaultFactory.IDENTITY} is used. If your injectable is a class or factory function,
         *                  consider using {@link DefaultFactory.CLASS} or {@link DefaultFactory.FUNCTION} instead respectively,
         *                  or provide your own.
         *          </li>
         *          <li>scope:
         *                  Scoping strategy to use when retrieving instances (see {@link Scope} for details).
         *                  By default, {@link DefaultScope.SINGLETON} is used. For different use cases,
         *                  see {@link DefaultScope.PROTOTYPE} or provide your own.
         *          </li>
         *      </ul>
         * @typeparam TInstance type a constructed instance will have.
         * @typeparam UInitializer type of the provided initializer.
         * @typeparam VDependency should not be set explicitly usually. Type of the dependencies used by this injectable.
         * @throws Error when an injectable with the requested name is already registered.
         * @throws TypeError when no name can be determined for this injectable or any of its dependencies.
         */
        registerInjectable(initializer, options = {}) {
            var _a, _b, _c, _d;
            const factory = (_a = options.factory) !== null && _a !== void 0 ? _a : DefaultFactory.IDENTITY();
            const scope = (_b = options.scope) !== null && _b !== void 0 ? _b : DefaultScope.SINGLETON();
            const name = (_c = options.name) !== null && _c !== void 0 ? _c : null;
            const dependencies = (_d = options.dependencies) !== null && _d !== void 0 ? _d : [];
            const injectableEntryName = name != null ? guessName(name) : guessName(initializer);
            if (this.injectables.has(injectableEntryName)) {
                throw new Error(`Name already exists: '${injectableEntryName}'.`);
            }
            this.injectables.set(injectableEntryName, {
                initializer,
                factory,
                scope,
                dependencyNames: dependencies.map((dependencyName) => guessName(dependencyName)),
                instances: new Map(),
            });
        }
        /**
         * Checks if an injectable with the name provided is registered for this container, regardless if its instantiated or not.
         * To check if an injectable is registered and instantiated, see {@link #hasInjectableInstance}.
         *
         * @public
         * @param name Either a raw string name or a nameable value that should be checked for. See {@link #registerInjectable} for details.
         * @return if an injectable with the name provided is registered on this container.
         * @throws TypeError when no name can be determined for the provided nameable.
         */
        hasInjectable(name) {
            return this.injectables.has(guessName(name));
        }
        /**
         * Checks if an injectable with the name provided is registered and instantiated for this container.
         * To check if an injectable is registered without checking for instantiation, see {@link #hasInjectable}.
         *
         * @public
         * @param name Either a raw string name or a nameable value that should be checked for. See {@link #registerInjectable} for details.
         * @param context Context to be used for instance checks. See {@link Scope} for details.
         * @return if an injectable with the name provided is registered and instantiated on this container.
         * @throws TypeError when no name can be determined for the provided nameable.
         */
        hasInjectableInstance(name, context = null) {
            if (!this.hasInjectable(name)) {
                return false;
            }
            const { injectableEntry, instanceName, } = this.resolveInjectableInstance(guessName(name), context);
            return (instanceName != null && injectableEntry.instances.has(instanceName));
        }
        /**
         * Retrieves an instantiated injectable, recursively instantiating dependencies if they were not instantiated before.
         *
         * @public
         * @param name Either a raw string name or a nameable value that should be retrieved. See {@link #registerInjectable} for details.
         * @param context Context to be used for instance checks. See {@link Scope} for details.
         * @return instantiated injectable for the given name.
         * @throws TypeError when no name can be determined for the provided nameable.
         * @throws Error when the injectable or a dependency cannot be found.
         * @throws Error when recursive dependencies are detected.
         * @typeparam TInstance type a constructed instance will have.
         */
        getInjectableInstance(name, context = null) {
            return this.accessInjectableInstance(guessName(name), context, new Set());
        }
        /**
         * Resolves an injectable by name, providing information about the injectable entry, its name and scope value.
         *
         * @private
         * @param injectableEntryName Raw string name of the injectable.
         * @param context Context to be used for instance checks. See {@link Scope} for details.
         * @return data object containing the injectable entry, its name and scope value.
         * @throws Error if no injectable for the name is found.
         */
        resolveInjectableInstance(injectableEntryName, context) {
            if (!this.injectables.has(injectableEntryName)) {
                throw new Error(`Injectable '${injectableEntryName}' does not exist.`);
            }
            const injectableEntry = this.injectables.get(injectableEntryName);
            const instanceName = injectableEntry.scope(context, injectableEntryName);
            return {
                injectableEntry,
                instanceName,
            };
        }
        /**
         * Retrieves an instantiated injectable, recursively instantiating dependencies if they were not instantiated before.
         *
         * @private
         * @param injectableEntryName Raw string name of the injectable.
         * @param context Context to be used for instance checks. See {@link Scope} for details.
         * @param resolveStack Stack of previously requested instantiations. used to detect circular dependencies.
         * @return instantiated injectable for the given name.
         * @throws Error if no injectable for the name is found.
         * @throws Error when a dependency cannot be found.
         * @throws Error when recursive dependencies are detected.
         */
        accessInjectableInstance(injectableEntryName, context, resolveStack) {
            const { injectableEntry, instanceName, } = this.resolveInjectableInstance(injectableEntryName, context);
            if (instanceName != null &&
                injectableEntry.instances.has(instanceName)) {
                return injectableEntry.instances.get(instanceName);
            }
            // Start instantiating value.
            if (resolveStack.has(injectableEntryName)) {
                throw createCircularDependencyError(resolveStack, injectableEntryName);
            }
            resolveStack.add(injectableEntryName);
            // Collect all dependencies, instantiating those which are not already in the process.
            const instantiatedDependencies = injectableEntry.dependencyNames.map((dependencyName) => this.accessInjectableInstance(dependencyName, null, // Do not delegate context
            resolveStack));
            const instance = injectableEntry.factory(injectableEntry.initializer, instantiatedDependencies, context, injectableEntryName);
            // A name of "null" means that the instance should not be cached, skip saving it.
            if (instanceName != null) {
                injectableEntry.instances.set(instanceName, instance);
            }
            resolveStack.delete(injectableEntryName);
            return instance;
        }
    }

    /**
     * Registers a new injectable on a container. See {@link Chevron#registerInjectable} for details.
     *
     * Decorator function for use with TypeScript. Use this decorator on a variable or function/class expression.
     *
     * Note that, as decorators only work for classes and class related constructs,
     * the factory defaults to {@link DefaultFactory.CLASS}.
     *
     * @public
     * @param instance {@link Chevron} instance to register the injectable on.
     * @param options Options for this injectable. See {@link Chevron#registerInjectable} for details.
     * @typeparam TInstance type a constructed instance will have.
     * @typeparam UDependency should not be set explicitly usually. Type of the dependencies used by this injectable.
     * @typeparam VContext should not be set explicitly usually. Type of the context used for scoping.
     * @throws Error when an injectable with the requested name is already registered.
     * @throws TypeError when no name can be determined for this injectable or any of its dependencies.
     */
    const Injectable = (instance, options = {}) => (target) => {
        if ((options === null || options === void 0 ? void 0 : options.factory) == null) {
            options.factory = DefaultFactory.CLASS();
        }
        instance.registerInjectable(target, options);
        return target;
    };

    exports.Chevron = Chevron;
    exports.DefaultFactory = DefaultFactory;
    exports.DefaultScope = DefaultScope;
    exports.Injectable = Injectable;

    return exports;

}({}, _));
//# sourceMappingURL=chevron.js.map
