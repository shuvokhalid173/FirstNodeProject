"use strict";
exports.__esModule = true;
var Human = /** @class */ (function () {
    function Human(name, age) {
        this.Name = name;
        this.Age = age;
    }
    Human.prototype.print = function () {
        console.log('Name : ' + this.Name + ' Age : ' + this.Age);
    };
    return Human;
}());
exports.Human = Human;
