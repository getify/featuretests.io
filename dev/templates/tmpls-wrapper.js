(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Tmpls",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function init() {
		/*TEMPLATES*/
	}

	if (context.Events) {
		// hybrid event bindings
		context.Events.once(name,init);
	}

	var grips = context.grips;

	// module API
	var public_api = {
		init: init
	};

	return public_api;
});
