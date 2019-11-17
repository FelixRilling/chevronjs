import { Chevron } from "../../src/Chevron";
import { Bootstrappers } from "../../src/bootstrap/Bootstrappers";

describe("Chevron IT", () => {
    it("Asserts that plains construct", () => {
        const cv = new Chevron();
        const result = 123;

        const testPlainName = "testPlainName";
        cv.registerInjectable(
            result,
            Bootstrappers.IDENTITY,
            [],
            testPlainName
        );

        expect(cv.getInjectableInstance(testPlainName)).toBe(result);
    });

    it("Asserts that services construct", () => {
        const cv = new Chevron();
        const result = 123;

        const testServiceName = "testServiceName";
        const testServiceFn: () => number = () => result;
        cv.registerInjectable(
            testServiceFn,
            Bootstrappers.FUNCTION,
            [],
            testServiceName
        );

        expect(cv.getInjectableInstance(testServiceName)()).toBe(result);
    });

    it("Asserts that factories construct", () => {
        const cv = new Chevron();
        const result = 123;

        const testFactoryName = "testFactoryName";

        class TestFactoryClass {
            public getVal(): number {
                return result;
            }
        }

        cv.registerInjectable(
            TestFactoryClass,
            Bootstrappers.CLASS,
            [],
            testFactoryName
        );

        expect(cv.getInjectableInstance(testFactoryName).getVal()).toBe(result);
    });

    it("Asserts that single layer dependencies are resolved", () => {
        const cv = new Chevron();
        const result = 123;

        const testServiceName = "testServiceName";
        const testServiceFn: () => number = () => result;
        cv.registerInjectable(
            testServiceFn,
            Bootstrappers.FUNCTION,
            [],
            testServiceName
        );

        const testFactoryName = "testFactoryName";

        class TestFactoryClass {
            private readonly numberGenerator: () => number;

            public constructor(numberService: () => number) {
                this.numberGenerator = numberService;
            }

            public getVal(): number {
                return this.numberGenerator();
            }
        }

        cv.registerInjectable(
            TestFactoryClass,
            Bootstrappers.CLASS,
            [testServiceName],
            testFactoryName
        );

        expect(cv.getInjectableInstance(testFactoryName).getVal()).toBe(result);
    });

    it("Asserts that multi layer dependencies are resolved", () => {
        const cv = new Chevron();
        const result = 123;

        const testService1Name = "testService1Name";
        const testService1Fn: () => number = () => result;
        cv.registerInjectable(
            testService1Fn,
            Bootstrappers.FUNCTION,
            [],
            testService1Name
        );

        const testFactoryName1 = "testFactoryName1";

        class TestFactoryClass1 {
            public isAllowed(): boolean {
                return true;
            }
        }

        cv.registerInjectable(
            TestFactoryClass1,
            Bootstrappers.CLASS,
            [],
            testFactoryName1
        );

        const testService2Name = "testService2Name";
        const testService2Fn: (testService1: any, testFactory1: any) => any = (
            testService1,
            testFactory1
        ) => {
            if (!testFactory1.isAllowed()) {
                throw new Error("Oh no!");
            }

            return testService1();
        };
        cv.registerInjectable(
            testService2Fn,
            Bootstrappers.FUNCTION,
            [testService1Name, testFactoryName1],
            testService2Name
        );

        const testFactoryName2 = "testFactoryName2";
        const TestFactoryClass2 = class {
            private readonly numberService: () => number;

            public constructor(numberService: () => number) {
                this.numberService = numberService;
            }

            public getVal(): number {
                return this.numberService();
            }
        };
        cv.registerInjectable(
            TestFactoryClass2,
            Bootstrappers.CLASS,
            [testService2Name],
            testFactoryName2
        );

        expect(cv.getInjectableInstance(testFactoryName2).getVal()).toBe(
            result
        );
    });
    it("Asserts that the key can be inferred from the initializer", () => {
        const cv = new Chevron();
        const result = 123;

        class TestFactoryClass {
            public getVal(): number {
                return result;
            }
        }

        cv.registerInjectable(
            TestFactoryClass,
            Bootstrappers.CLASS,
            [],
            undefined
        );

        expect(cv.getInjectableInstance(TestFactoryClass).getVal()).toBe(
            result
        );
    });
});
