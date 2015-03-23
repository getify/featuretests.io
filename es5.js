(function ES5Tests(o){
	var a = Array.prototype, b = String.prototype,
		c = Function.prototype, d = Number.prototype,
		e = Date.prototype,
		global = (new Function("return this;"))();

	o.es5 = o.es5 || {};

	// syntax
	o.es5.literalGettersSetters = o.tryIt("'use strict'; var a = { get b(){}, set b(c){} };");

	// semantics
	o.es5.strictMode = !o.tryIt("'use strict'; with({}){}");
	o.es5.keywordProperty = o.tryIt("'use strict'; var a = { try: 2 }; a.try;")

	// APIs
	o.es5.ObjectStatics = ("defineProperty" in Object) && ("defineProperties" in Object) &&
		("getOwnPropertyDescriptor" in Object) && ("create" in Object) && ("getPrototypeOf" in Object) &&
		("getOwnPropertyNames" in Object) && ("isSealed" in Object) && ("isFrozen" in Object) &&
		("isExtensible" in Object) && ("seal" in Object) && ("freeze" in Object) && ("preventExtensions" in Object);
	o.es5.ArrayStatics = ("isArray" in Array);
	o.es5.ArrayMethods = ("map" in a) && ("reduce" in a) && ("reduceRight" in a) && ("filter" in a) && ("forEach" in a) &&
		("every" in a) && ("some" in a) && ("indexOf" in a) && ("lastIndexOf" in a);
	o.es5.StringMethods = ("trim" in b);
	o.es5.NumberMethods = ("toFixed" in d);
	o.es5.DateStatics = ("now" in Date) && ("parse" in Date);
	o.es5.DateMethods = ("toISOString" in e);
	o.es5.functionBind = ("bind" in c);

})(FeatureTests);
