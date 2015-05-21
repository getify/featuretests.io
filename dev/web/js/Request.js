(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Request",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function remote(url) {
		// running in browser context?
		if (typeof window != "undefined") {
			return context.ASQ(function ASQ(done){
					// use jQuery Ajax
					$.ajax({
						method: "GET",
						url: url,
						dataType: "text"
					})
					.done(function complete(content){
						done(content);
					})
					.fail(function failure(x,y,err){
						done.fail(err);
					});
				});
		}
		// server context
		else {
			var request = context.ASQ.wrap( require("request") );

			// use server http/s request
			return request(url).val(function val(resp,body){
					return body;
				});
		}
	}

	function local(filepath) {
		// running in browser context?
		if (typeof window != "undefined") {
			// delegate as Ajax request
			return remote(filepath);
		}
		// server context
		else {
			var fs = require("fs"), path = require("path");

			// use file system
			return context.ASQ.wrap(fs.readFile)(
					path.join(context.DIR_ROOT,"web",filepath)
				);
		}
	}

	var public_api = {
		remote: remote,
		local: local
	};

	return public_api;
});
