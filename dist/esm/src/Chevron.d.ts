import { InjectableOptions } from "./injectable/InjectableOptions";
import { Nameable } from "./injectable/Nameable";
/**
 * Injectable container class.
 *
 * @public
 * @class
 * @typeparam TContext type of the context which cane be used for scoping.
 */
declare class Chevron<TContext> {
    private readonly injectables;
    /**
     * Creates a new, empty container.
     *
     * @public
     */
    constructor();
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
    registerInjectable<TInstance, UInitializer, VDependency = any>(initializer: UInitializer, options?: InjectableOptions<TInstance, UInitializer, VDependency, TContext | null>): void;
    /**
     * Checks if an injectable with the name provided is registered for this container, regardless if its instantiated or not.
     * To check if an injectable is registered and instantiated, see {@link #hasInjectableInstance}.
     *
     * @public
     * @param name Either a raw string name or a nameable value that should be checked for. See {@link #registerInjectable} for details.
     * @return if an injectable with the name provided is registered on this container.
     * @throws TypeError when no name can be determined for the provided nameable.
     */
    hasInjectable(name: Nameable): boolean;
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
    hasInjectableInstance(name: Nameable, context?: TContext | null): boolean;
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
    getInjectableInstance<TInstance>(name: Nameable, context?: TContext | null): TInstance;
    /**
     * Resolves an injectable by name, providing information about the injectable entry, its name and scope value.
     *
     * @private
     * @param injectableEntryName Raw string name of the injectable.
     * @param context Context to be used for instance checks. See {@link Scope} for details.
     * @return data object containing the injectable entry, its name and scope value.
     * @throws Error if no injectable for the name is found.
     */
    private resolveInjectableInstance;
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
    private accessInjectableInstance;
}
export { Chevron };
//# sourceMappingURL=Chevron.d.ts.map