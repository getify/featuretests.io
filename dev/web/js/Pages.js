(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Pages",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	function parseUri(e){var a=parseUri.options,f=a.parser[a.strictMode?"strict":"loose"].exec(e),b={},c=14;while(c--)b[a.key[c]]=f[c]||"";b[a.q.name]={};b[a.key[12]].replace(a.q.parser,function(h,d,g){if(d)b[a.q.name][d]=g});return b}parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};

	function getPageURL(url) {
		var uriparts = parseUri(url);
		if (!uriparts.path) {
			return "/";
		}
		else {
			return uriparts.path;
		}
	}

	function siteInit() {
		$title = $("title");
		$body = $(context.document.body);
		page_title = $("title").html();

		// load and run script for current page
		current_page_url = getPageURL(context.document.location.href.toString());

		// fetch current page's script (if any)
		fetchPageScript(current_page_url);

		// listen for forward/back nav
		History.Adapter.bind(context,"statechange",function statechange(){
			var state = History.getState(), url;

			if ((url = getPageURL(state.url)) !== current_page_url) {
				gotoPage(url,/*suppressHistory=*/true,{
					PROD: public_api.PROD
				});
			}
		});

		// ajaxify links
		$body.on("click","a:not([data-ignore])",function click(evt){
			var href = evt.currentTarget.getAttribute("href");

			// disable JS-only (or just empty) links
			if (evt.currentTarget.getAttribute("href") === "#") {
				evt.preventDefault();
				evt.stopImmediatePropagation();
			}
			// recognized page?
			else if (recognize(href) !== false) {
				evt.preventDefault();
				evt.stopImmediatePropagation();

				gotoPage(href,/*suppressHistory=*/false,{
					PROD: public_api.PROD
				});
			}
		});
	}

	function pageContentHTML(url,html,loadData) {
		$("#content").replaceWith(html);

		fetchPageScript(current_page_url,loadData.initData);

		if (!loadData.suppressHistory) {
			History.pushState(null,null,url);
			document.title = page_title;
			if (/#.*$/.test(url)) {
				window.history.go(0);
			}
		}
	}

	function pageContentHTMLError(err) {
		context.Events.emit("notify.error",err.toString());
	}

	function gotoPage(url,suppressHistory,initData) {
		var content_html, page_url;

		page_url = recognize(url);

		if (page_url !== false) {
			if (page_url !== current_page_url) {
				// teardown the existing page
				pageScriptAPI(current_page_url).teardown();

				context.Events.emit("notify.reset");

				current_page_url = page_url;

				context.View.getPageContentHTML(page_url,null,{
					suppressHistory: suppressHistory,
					initData: initData
				})
				.val(function val(_,html,data){
					return ASQ.messages(url,html,data);
				})
				.val(pageContentHTML)
				.or(pageContentHTMLError);

				return;
			}
		}

		if (url !== context.document.location.href.toString()) {
			context.document.location.href = url;
			current_page_url = getPageURL(url);
		}
	}

	function replaceURL(url) {
		History.replaceState(null,null,url);
		document.title = page_title;
	}

	function pageScriptAPI(url) {
		return public_api.page_scripts[(url === "/" ? "/index" : url)] || public_api.page_scripts["."];
	}

	function fetchPageScript(url,initData) {
		url = getPageURL(url);

		// remap the root page URL just for the purposes of this function
		if (url === "/") url = "/index";

		if (!(url in public_api.page_scripts)) {
			$LAB
			.script("/js/pages" + url + (public_api.PROD ? ".min" : "") + ".js")
			.wait(function wait(){
				pageScriptAPI(url).init(initData);
			});
		}
		else {
			pageScriptAPI(url).init(initData);
		}
	}

	// ******************

	function recognize(url) {
		var page_url = getPageURL(url),
			tmp_url = page_url;

		if (tmp_url == "/") tmp_url = "/index";

		if ((tmp_url + ".html") in context.grips.collections) {
			return page_url;
		}
		else {
			return false;
		}
	}

	context = context || {};

	var $ = context.$ || {},
		$LAB = context.$LAB || {},
		History = context.History || {},

		$title,
		$body,
		$content,

		current_page_url,
		current_page_num,

		public_api,

		page_title
	;

	context.Events.on("ready",siteInit);
	context.Events.on("gotoPage",gotoPage);
	context.Events.on("replaceURL",replaceURL);

	// module API
	public_api = {
		PROD: false,
		page_scripts: {
			// default no-ops
			".": { init:function init(){}, teardown:function teardown(){} }
		},

		recognize: recognize,

		disabled: true
	};

	return public_api;
});
