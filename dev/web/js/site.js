(function(global){
	"use strict";

	$(document).ready(function(){
		Events.emit("ready");

		// initialize templates
		Events.emit("Tmpls");
	});
})(window);
