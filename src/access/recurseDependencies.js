"use strict";

import {
    _more,
    _error,
    _isUndefined
} from "../constants";

/**
 * Loops trough dependencies, recurse if new dependencies has dependencies itself; then execute fn.
 *
 * @private
 * @param {Object} _this The context
 * @param {Array} service The dependencyList to iterate
 * @param {Function} fn The function run over each dependency
 * @returns void
 */
export default function recurseDependencies(_this, service, fn) {
    //loop trough deps
    service.deps.forEach(name => {
        const dependency = _this.chev.get(name);

        if (dependency) {
            //recurse over sub-deps
            recurseDependencies(_this, dependency, fn);
            //run fn
            fn(dependency);
        } else {
            //if not found error with name
            throw _this.id + _more + _error + service.name + _more + "dependency " + name + _isUndefined;
        }
    });
}
