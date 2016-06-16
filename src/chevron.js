/*
chevronjs v0.5.0

Copyright (c) 2016 Felix Rilling

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

(function(window) {

    class Chevron {
        constructor(name = "Chevron") {
                let _this = this;

                _this.options = {
                    name
                };
                _this.container = {};

                /*####################/
                * Internal Chevron
                /####################*/
                _this.cv = {
                    //Returns if Array of dependencies exists
                    load(dependencyList, done) {
                        let result = true;

                        _this.cv.ut.each(dependencyList, dependency => {
                            /*if (!_this.cv.exists(dependency)) {
                              error();
                            }*/
                        });
                        if (result) {
                            done();
                        }

                        return result;
                    },
                    //Bundle dependencies for service/factory
                    collect(dependencyList, map, error) {
                        let result = {};

                        _this.cv.ut.each(dependencyList, dependency => {
                            let service = _this.container[dependency];
                            if (_this.cv.ut.isDefined(service)) {
                                //Init factory if not done already
                                if (service.type === "factory" && !service.constructed) {
                                    let name = dependency,
                                        bundle = _this.cv.collect(service.dependencies,
                                            item => {
                                                return item;
                                            },
                                            missing => {
                                                _this.cv.throwMissingDep(name, service.type, missing);
                                            });

                                    _this.cv.construct(name, bundle);
                                }
                                result[dependency] = map(service);
                            } else {
                                error(dependency);
                            }
                        });

                        return result;
                    },
                    add(name, dependencyList, type, content, args) {
                        let service = _this.container[name] = {
                            dependencies: dependencyList || [],
                            type: type || null,
                            content: content || null,
                            inject: {
                                middleware: []
                                    //decorator: null
                            },
                        };
                        //Add type specific props
                        if (type === "factory") {
                            service.args = args || [];
                            service.constructed = false;
                        } else if (type === "service") {
                            service.content = function() {
                                _this.cv.runInjects(name, arguments);
                                return content.apply(this, arguments);
                            };
                        }
                    },
                    //construct factory
                    construct(name, bundle) {
                        let Factory = _this.container[name],
                            container = Object.create(Factory.prototype || Object.prototype),
                            newArgs = Array.from(Factory.args || []);

                        newArgs.shift();

                        _this.cv.ut.eachObject(bundle, (dependency, name) => {
                            container[name] = dependency.content;
                        });

                        Factory.content = (Factory.content.apply(container, newArgs) || container);
                        Factory.constructed = true;
                        return Factory.content;
                    },
                    //Inject decorator/middleware into service
                    inject(name, type, fn) {
                        _this.container[name].inject[type].push(fn);
                    },
                    runInjects(name, args) {
                        let service = _this.container[name],
                            bundle = _this.cv.collect(service.dependencies,
                                item => {
                                    return item.content;
                                },
                                missing => {
                                    _this.cv.throwMissingDep(name, service.type, missing);
                                }),
                            newArgs = Array.from(args || []);
                        newArgs.unshift(name);

                        if (_this.cv.ut.isDefined(service.inject.middleware)) {
                            _this.cv.ut.each(service.inject.middleware, fn => {

                                fn.apply(this, newArgs);
                            });
                        }
                    },
                    //return if service has type
                    hasType(name, type) {
                        return _this.container[name].type === type;
                    },
                    //returns if dependency exists
                    exists(name) {
                        return _this.cv.ut.isDefined(_this.container[name]);
                    },
                    //throws errors
                    throwMissingDep(name, type, missing) {
                        _this.cv.ut.log(
                            name,
                            "error",
                            type,
                            `dependency '${missing}' not found`
                        );
                    },
                    throwNotFound(name) {
                        _this.cv.ut.log(
                            name,
                            "error",
                            "type",
                            `service '${name}' not found`
                        );
                    },
                    throwDupe(name, type) {
                        _this.cv.ut.log(
                            name,
                            "error",
                            type,
                            `service '${name}' is already defined`
                        );
                    },
                    /*####################/
                    * Internal Chevron Utility
                    /####################*/
                    ut: {
                        //Iterate Array
                        each(arr, fn) {
                            for (let i = 0, l = arr.length; i < l; i++) {
                                fn(arr[i], i);
                            }
                        },
                        eachObject(object, fn) {
                            let keys = Object.keys(object);
                            for (let i = 0, l = keys.length; i < l; i++) {
                                fn(object[keys[i]], keys[i], i);
                            }
                        },
                        //return if val is defined
                        isDefined(val) {
                            return typeof val !== "undefined";
                        },
                        //log
                        log(name, type, element, msg) {
                            let str = `${_this.options.name} ${type} in ${element} '${name}': ${msg}`;
                            if (type === "error") {
                                throw str;
                            } else {
                                console.log(str);
                            }
                        }
                    }
                };

            }
            /*####################/
            * Main exposed methods
            /####################*/
        provider(name, dependencyList, content, type, args) {
                let _this = this;

                _this.cv.load(dependencyList, () => {
                        if (!_this.cv.exists(name)) {
                            _this.cv.add(name, dependencyList, type, content, args);
                        } else {
                            _this.cv.throwDupe(name, type);
                        }
                    }
                    /*, missing => {
                                        _this.cv.throwMissingDep(name, type, missing);
                                    }*/
                );
                return _this;
            }
            //accepts function
        service(name, dependencies, fn) {
                let _this = this;

                return _this.provider(
                    name,
                    dependencies,
                    fn,
                    "service");
            }
            //accepts constructor function
        factory(name, dependencies, Class, args) {
                let _this = this;
                args.unshift(null);

                return _this.provider(
                    name,
                    dependencies,
                    Class,
                    "factory",
                    args
                );
            }
            //Injects a decorator to the container/service
            /*decorator(fn, service) {

            }*/
            //Injects a middleware to the container/service
        middleware(fn, applies) {
                let _this = this;

                _this.cv.ut.eachObject(_this.container, (service, name) => {
                    //Inject for some services only if argument is present
                    if (_this.cv.ut.isDefined(applies)) {
                        if (applies.includes(name)) {
                            _this.cv.inject(name, "middleware", fn);
                        }
                    } else {
                        _this.cv.inject(name, "middleware", fn);
                    }
                });

                return _this;
            }
            //Lets you access services with their dependencies injected
        access(name) {
                let _this = this,
                    result,
                    service = _this.container[name];

                //Check if accessed service is registered
                if (!_this.cv.ut.isDefined(service)) {
                    _this.cv.throwNotFound(name);
                }

                if (service.type === "service") {
                    let bundle = _this.cv.collect(service.dependencies,
                        item => {
                            return item.content;
                        },
                        missing => {
                            _this.cv.throwMissingDep(name, service.type, missing);
                        }
                    );
                    result = service.content.bind(bundle);
                } else if (service.type === "factory") {
                    let bundle = _this.cv.collect(service.dependencies,
                        item => {
                            return item;
                        },
                        missing => {
                            _this.cv.throwMissingDep(name, service.type, missing);
                        }
                    );
                    if (!service.constructed) {
                        result = _this.cv.construct(name, bundle);
                    }
                }

                return result;
            }
            //returns Array of dependencies
        list() {
            return this.container;
        }
    }

    window.Chevron = Chevron;
})(window);
