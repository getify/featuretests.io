"use strict";

// process.on("uncaughtException",function(err){
// 	console.log("uncaught",JSON.stringify(err));
// });

var
	// config constants
	PROD = (process.env.NODE_ENV == "production"),
	ROOT_DIR = global.ROOT_DIR = __dirname,

	// node modules
	fs = require("fs"),
	http = require("http"),
	httpserv = http.createServer(),
	node_static = require("node-static"),
	path = require("path"),
	url_parser = require("url"),
	watch = require("watch"),
	config,
	static_file_opts,
	static_files,

	// hybrid (server+browser) modules
	ASQ,
	grips,
	EventEmitter2,
	Events,
	Tmpls,
	Pages,
	View,
	Request,
	Reflect_supports,
	API,

	routes = [],

	WEB_DIR = path.join(ROOT_DIR,"web")
;

// pull in config settings
config = require(process.env.SERVER_CONFIG);

// setup static file server
static_file_opts = {
	serverInfo: config.SERVER_NAME,
	cache: config.STATIC_FILE_CACHE_LENGTH,
	gzip: PROD
};
static_files = new node_static.Server(WEB_DIR,static_file_opts);

// load/initialize hybrid (server+browser) modules
global.ASQ = ASQ = require("asynquence");
require("asynquence-contrib");
global.grips = grips = require("grips")[
	// either pull in production or debug of grips engine
	PROD ? "grips" : "debug"
];
global.EventEmitter2 = EventEmitter2 = require("eventemitter2").EventEmitter2;
global.Events = Events = new EventEmitter2({
	wildcard: true,
	maxListeners: 50
});
global.Pages = Pages = require(path.join(WEB_DIR,"js","Pages.js"));
global.View = View = require(path.join(WEB_DIR,"js","View.js"));
global.Request = Request = require(path.join(WEB_DIR,"js","Request.js"));
global.Reflect_supports = Reflect_supports = require(path.join(WEB_DIR,"rs.js"));
global.API = API = require(path.join(WEB_DIR,"js","API.js"));

// load/initialize templates
loadTemplateBundle(path.join(WEB_DIR,"js","Tmpls.js"));

// watch for updated template bundle to reload
watch.createMonitor(
	/*root=*/path.join(WEB_DIR,"js"),
	/*options=*/{
		ignoreUnreadableDir: true,
		ignoreNotPermitted: true,
		filter: function filter(filepath) {
			// only monitor the template-bundle "Tmpls.js"
			return /Tmpls\.js$/.test(filepath);
		}
	},
	/*handler=*/function handler(monitor) {
		monitor.on("created",loadTemplateBundle);
		monitor.on("changed",loadTemplateBundle);
	}
);

// setup HTTP routes
routes.push(
	// always set server name
	function serverName(req,res) {
		res.setHeader("Server",config.SERVER_NAME);
	}
);

if (PROD) {
	routes.push(
		// perform hostname/protocol redirects?
		function canonicalRedirect(req,res) {
			if (
				req.headers["host"] == "featuretests.com" ||
				req.headers["host"] == "www.featuretests.com" ||
				req.headers["host"] == "www.featuretests.io" ||
				req.headers["x-forwarded-proto"] !== "https"
			) {
				res.writeHead(301, { Location: config.SITE_URL });
				res.end();
				return true;
			}
		}
	);

	routes.push(
		// ensure security headers for all responses
		function securityHeaders(req,res) {
			// From: https://developer.mozilla.org/en-US/docs/Security/CSP/Introducing_Content_Security_Policy
			res.setHeader("Content-Security-Policy",config.CSP_HEADER);

			// From: https://developer.mozilla.org/en-US/docs/Security/HTTP_Strict_Transport_Security
			res.setHeader("Strict-Transport-Security",config.HSTS_HEADER);
		}
	);

	routes.push(
		function CORSpreflight(req,res) {
			// CORS preflight requests?
			if (req.method == "OPTIONS") {
				if (req.headers["access-control-request-method"] in config.CORS_HEADERS) {
					res.writeHead(200,config.CORS_HEADERS[req.headers["access-control-request-method"]]);
					res.end();
				}
				// otherwise, bail because we won't handle this kind of request!
				else {
					res.writeHead(403,config.CORS_HEADERS.GET);
					res.end();
				}
				return true;
			}
		}
	);
}

routes.push(
	// await full request
	function fullRequest(req,res) {
		req.body = "";
		return ASQ.react(function listener(next){
			req.addListener("data",function(chunk){
				req.body += chunk;
			});
			req.addListener("end",next);
			req.resume();
		});
	}
);

routes.push(
	// favicon
	function favicon(req,res) {
		try {
			if (req.method == "GET" && req.url == "/favicon.ico") {
				fs.statSync(path.join(WEB_DIR,"favicon.ico"));
			}
			return;
		}
		catch (err) {}

		// empty favicon.ico response
		res.writeHead(204,{
			"Content-Type": "image/x-icon",
			"Cache-Control": "public, max-age: 604800"
		});
		res.end();
		return true;
	}
);

routes.push(
	// static file request?
	function staticResources(req,res) {
		if (
			(req.method == "GET" || req.method == "HEAD") &&
			/^\/(?:js\/(?=.+)|css\/(?=.+)|images\/(?=.+)|robots\.txt\b|humans\.txt\b|favicon\.ico\b|rs\.js\b|featuretests\.(html|js)\b)/
			.test(req.url)
		) {
			return ASQ(function ASQ(done){
				static_files.serve(req,res,function finished(err){
					if (err) {
						res.writeHead(err.status,err.headers);
						res.end();
					}
					done(true);
				});
			});
		}
	}
);

routes.push(
	// API call?
	function apiRequest(req,res) {
		if (
			(req.method == "GET" || req.method == "POST" || req.method == "HEAD") &&
			/^\/api([\/?#]|$)/.test(req.url)
		) {
			NOTICE("routing",[req.method,req.url,JSON.stringify(req.headers)]);

			return ASQ(function ASQ(done){
				// standard Ajax response headers
				var headers = {
					"Content-type": "application/json; charset=UTF-8",
					"Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
					"Pragma": "no-cache",
					"Expires": "Thu, 01 Dec 1994 16:00:00 GMT"
				};

				// add in the CORS headers for x-domain Ajax
				if (req.method in config.CORS_HEADERS) {
					Object.assign(headers,config.CORS_HEADERS[req.method]);
				}

				// invoke the API
				Reflect_supports.api("all",function api(data){
					res.writeHead(200,headers);
					res.end(JSON.stringify(data));
					done(true);
				});
			});
		}
	}
);

routes.push(
	// a recognized full-page request (from cache)?
	function loadCachedPage(req,res) {
		var url;

		if (
			(req.method == "GET" || req.method == "HEAD") &&
			(url = Pages.recognize(req.url))
		) {
			NOTICE("routing",[req.method,req.url,JSON.stringify(req.headers)]);

			return ASQ(function ASQ(done){
				var orig_url = req.url;
				req.url = "/html" + ((url == "/") ? "/index" : url) + ".html";

				static_files.serve(req,res,function finished(err){
					// restore original URL
					req.url = orig_url;
					done(!err);
				});
			});
		}
	}
);

routes.push(
	// a recognized full-page request (from template)?
	function loadTemplatedPage(req,res) {
		var url;

		if (
			(req.method == "GET" || req.method == "HEAD") &&
			(url = Pages.recognize(req.url))
		) {
			return ASQ(function ASQ(done){
				// render from template
				View.getPageHTML(url,{
					PROD: PROD
				})
				.val(function pageHTML(url,html) {
					res.writeHead(200,{ "Content-type": "text/html; charset=UTF-8" });
					res.end(html);
					done(true);
				})
				.or(function failed(){
					done(false);
				});
			});
		}
	}
);

routes.push(
	// default route
	function defaultRoute(req,res) {
		ERROR("routing",[req.method,req.url,JSON.stringify(req.headers)]);

		res.writeHead(404);
		res.end();
	}
);


// server request handling
ASQ.react(function listen(trigger){
	httpserv.on("request",trigger);
})
.runner(router)
.or(responseError);


// start server
httpserv.listen(config.SERVER_PORT,config.SERVER_ADDR);


// *****************************

function *router(token) {
	var req = token.messages[0], res = token.messages[1], route, error;

	for (route of routes) {
		try {
			route = route(req,res);
			if (ASQ.isSequence(route)) {
				// wait to resolve the route
				route = yield route;
			}
			if (route === true) {
				break;
			}
		}
		catch (err) {
			// response error?
			throw {
				req: req,
				res: res,
				reason: err
			};
		}
	}
}

function logMessage(msg,returnVal) {
	var d = new Date();
	msg = "[" + d.toLocaleString() + "] " + msg;
	if (!!returnVal) {
		return msg;
	}
	else {
		console.log(msg);
	}
}

function NOTICE(location,msg,returnVal) {
	return logMessage("NOTICE(" + location + "): " + msg,!!returnVal);
}

function ERROR(location,msg,returnVal) {
	return logMessage("ERROR(" + location + "): " + msg,!!returnVal);
}

function responseError(respErr) {
	try {
		if (respErr.req && respErr.res) {
			if (respErr.req.headers &&
				respErr.req.headers["accept"] == "application/json"
			) {
				respErr.reason = JSON.stringify({
					error: respErr.reason
				});
			}
			respErr.res.writeHead(500);
			respErr.res.end(respErr.reason.toString());
			return true;
		}
	} catch(e) {}

	ERROR("responseError",
		respErr ? ((respErr.stack + "") || respErr.toString()) : "Unknown response error"
	);
}

function loadTemplateBundle(file) {
	var cache_entry;

	if (/Tmpls\.js$/.test(file)) {
		cache_entry = require.resolve(file);

		// templates already loaded into cache?
		if (require.cache[cache_entry]) {
			NOTICE("templates","Reloaded.");

			// clear the templates-module from the require cache
			delete require.cache[cache_entry];

			// clear out the grips collection cache
			Object.keys(grips.collections).forEach(function forEach(key){
				delete grips.collections[key];
			});
		}
		else {
			NOTICE("templates","Loaded.");
		}

		// load the templates-module and initialize it
		global.Tmpls = Tmpls = require(file);
		Events.emit("Tmpls");
	}
}

if (!Object.assign) {
	Object.defineProperty(Object,'assign',{
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(target, firstSource) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}
