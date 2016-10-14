"use strict";
/**
 * Collects dependencies and initializes module
 * @private
 * @param {Object} module The module to check
 * @param {Object} list The list of dependencies
 * @param {Function} cf The Constructor function
 * @returns {Object} Initialized module
 */
function default_1(module, list, cf) {
    //Only init if its not already initializes
    if (!module.rdy) {
        var dependencies_1 = [];
        //Collect an ordered Array of dependencies
        module.deps.forEach(function (item) {
            var dependency = list[item];
            //If the dependency name is found in the list of deps, add it
            if (dependency) {
                dependencies_1.push(dependency.fn);
            }
        });
        //Init module
        //Call Constructor fn with module/deps
        module = cf(module, dependencies_1);
        module.rdy = true;
    }
    return module;
}
exports.__esModule = true;
exports["default"] = default_1;
