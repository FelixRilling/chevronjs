import { Chevron } from "../Chevron";
/**
 * Decorator function to be used as TypeScript decorator
 * in order to wire an injectable into a class property.
 *
 * @public
 * @param {Chevron} instance Chevron instance to use.
 * @param {*} key Key of the injectable.
 */
declare const Autowired: (instance: Chevron, key: any) => (target: any, propertyKey: string | symbol) => void;
export { Autowired };
