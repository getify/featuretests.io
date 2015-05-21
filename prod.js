"use strict";

exports.SERVER_NAME = "featuretests";
exports.SITE_URL = "http://localhost:8013",

exports.SERVER_ADDR = "127.0.0.1";
exports.SERVER_PORT = 8013;

exports.STATIC_FILE_CACHE_LENGTH = 14400;

exports.CORS_HEADERS = {
	"HEAD": {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": false,
		"Access-Control-Allow-Methods": "HEAD, OPTIONS",
		"Access-Control-Allow-Headers": "Accept, Content-Type, User-Agent, X-Requested-With"
	},
	"GET": {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": false,
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Accept, Content-Type, User-Agent, X-Requested-With"
	},
	"POST": {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": false,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Accept, Content-Type, User-Agent, X-Requested-With"
	}
};
exports.CSP_HEADER = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://featuretests.io ajax.googleapis.com",
	"connect-src 'self'",
	"child-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'"
].join("; ");
exports.HSTS_HEADER = "max-age=" + 1E9 + "; includeSubdomains";
