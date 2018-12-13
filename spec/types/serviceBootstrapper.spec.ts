import { serviceBootstrapper } from "../../src/injectableTypes/service";
import { dependencyArr } from "../../src/dependency/dependencyArr";

describe("serviceBootstrapper tests", () => {
    it("Asserts that serviceBootstrapper returns the wrapper function", () => {
        const result = 123;
        const testFn = () => result;

        expect(serviceBootstrapper(testFn, [])()).toBe(result);
    });

    it("Asserts that serviceBootstrapper returns the wrapper function when used with dependencies", () => {
        const result = 123;
        const testFn = (val: number) => val;

        expect(serviceBootstrapper(testFn, <dependencyArr>[result])()).toBe(
            result
        );
    });
});