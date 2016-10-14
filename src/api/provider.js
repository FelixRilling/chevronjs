"use strict";
var prepare_1 = require("../init/prepare");
/**
 * Adds a new module to the container
 * @param {String} type The type of the module. ex: "factory"
 * @param {Function} cf The constructor function of the module
 * @param {String} name The name to register the module under. ex: "myFactory"
 * @param {Array} deps Array of dependenciy names
 * @param {Function} fn Content of the module
 * @returns {Object} Chevron instance
 */
function default_1(type, cf, name, deps, fn) {
    var _this = this;
    var entry = {
        type: type,
        name: name,
        deps: deps,
        fn: fn,
        rdy: false,
        init: function () {
            return prepare_1["default"](_this.chev, entry, cf);
        }
    };
    //Saves entry to chev container
    _this.chev.set(name, entry);
    return _this;
}
exports.__esModule = true;
exports["default"] = default_1;
