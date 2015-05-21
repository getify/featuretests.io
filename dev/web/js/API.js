(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("API",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	var public_api = {};

	return public_api;
});
