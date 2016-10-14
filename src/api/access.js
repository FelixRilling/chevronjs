"use strict";
/**
 * Access module with dependencies bound
 * @param {String} name The name of the module to access
 * @returns {Mixed} Initialized Object content
 */
function default_1(name) {
    return this.chev.get(name).init().fn;
}
exports.__esModule = true;
exports["default"] = default_1;
