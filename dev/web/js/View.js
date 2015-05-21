(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("View",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function getPageHTML(url,data) {
		return context.ASQ(function ASQ(done){
			var page_url = Pages.recognize(url);
			if (page_url == "/") page_url = "/index";
			var html = context.grips.render(page_url + ".html#page",data || {});
			done(url,html);
		});
	}

	function getPageContentHTML(url,data,initData) {
		return context.ASQ(function ASQ(done){
			var page_url = Pages.recognize(url);
			if (page_url == "/") page_url = "/index";
			var html = context.grips.render(page_url + ".html#content",data || {});
			done(url,html,initData);
		});
	}

	function getPartialHTML(partial,data) {
		return context.ASQ(function ASQ(done){
			var html = context.grips.render(partial,data || {});
			done(partial,html);
		});
	}

	var public_api = {
		getPageHTML: getPageHTML,
		getPageContentHTML: getPageContentHTML,
		getPartialHTML: getPartialHTML
	};

	return public_api;
});
