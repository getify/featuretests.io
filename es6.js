(function ES6Tests(o){
	var a = Array.prototype, b = String.prototype,
		c = Function.prototype, d = Number.prototype,
		global = (new Function("return this;"))();

	o.es6 = o.es6 || {};

	// syntax
	o.es6.letConst = o.tryIt("'use strict'; let a; const b = 2;");
	o.es6.defaultParam = o.tryIt("'use strict'; function a(b=2){}");
	o.es6.spreadRest = o.tryIt("'use strict'; var a = [1,2]; +function b(...c){}(...a);");
	o.es6.destructuring = o.tryIt("'use strict'; var a = [1,2], [b,c] = a, d = {e:1,f:2}, {e:E,f} = d;");
	o.es6.paramDestructuring = o.tryIt("'use strict'; function a({b,c}){}");
	o.es6.templateString = o.tryIt("'use strict'; var a = 1, b = `c${a}d`;");
	o.es6.forOf = o.tryIt("'use strict'; for (var a of [1]) {}");
	o.es6.arrow = o.tryIt("'use strict'; var a = () => {};");
	o.es6.generator = o.tryIt("'use strict'; function *a(){ yield; }");
	o.es6.conciseMethodProperty = o.tryIt("'use strict'; var a = 1, b = { c(){}, a };");
	o.es6.computedProperty = o.tryIt("'use strict'; var a = 1, b = { ['x'+a]: 2 };");
	o.es6.moduleExport = o.tryIt("'use strict'; export var a = 1;");
	o.es6.moduleImport = o.tryIt("'use strict'; import {a} from 'b';");
	o.es6["class"] = o.tryIt("'use strict'; class Foo {}; class Bar extends Foo {};");
	o.es6.numericLiteral = o.tryIt("'use strict'; var a = 0o1, b = 0b10;");
	o.es6.oldOctalLiteral = !o.tryIt("'use strict'; var a = 01;");
	o.es6.symbol = o.tryIt("'use strict'; var a = Symbol('b');");
	o.es6.unicodeEscape = o.tryIt("'use strict'; var a = '\\u{20BB7}';");
	o.es6.unicodeIdentifier = o.tryIt("'use strict'; var \\u{20BB7};");
	o.es6.unicodeRegExp = o.tryIt("'use strict'; var a = /\\u{20BB7}/u;");
	o.es6.stickyRegExp = o.tryIt("'use strict'; var a = /b/y;");

	// semantics
	o.es6.letTDZ = o.es6.letConst && !o.tryIt("'use strict'; a = 1; let a;");
	o.es6.constRedef = o.es6.letConst && !o.tryIt("'use strict'; const a = 1; a = 2;");
	o.es6.dunderProto = o.tryIt("'use strict'; var a = { b: 2 }, c = { __proto__: a }; if (!Object.if (c.b !== 2) throw 0;");
	o.es6.objectSuper = o.tryIt("'use strict'; var a = { b: 2 }, c = { d: function() { return super.b; } }; Object.setPrototypeOf(c,a); if (c.d() !== 2) throw 0;");
	o.es6.extendNatives = o.es6["class"] && o.tryIt("'use strict'; class Foo extends Array { }; var a = new Foo(); a.push(1,2,3); if (a.length !== 3) throw 0;");
	o.es6.TCO = o.tryIt("'use strict'; +function a(b){ if (b<6E4) a(b+1); }(0);");
	o.es6.symbolImplicitCoercion = !o.tryIt("'use strict'; var a = Symbol('a'); a + '';");
	o.es6.functionNameInference = o.tryIt("'use strict'; var a = { b: function(){} }; if (a.name != 'b') throw 0;");

	// APIs
	o.es6.ObjectStatics = ("getOwnSymbolNames" in Object) && ("assign" in Object) && ("is" in Object);
	o.es6.ArrayStatics = ("from" in Array) && ("of" in Array);
	o.es6.ArrayMethods = ("fill" in a) && ("find" in a) && ("findIndex" in a) && ("entries" in a) && ("keys" in a) && ("values" in a);
	o.es6.StringMethods = ("includes" in b) && ("repeat" in b);
	o.es6.NumberStatics = ("isNaN" in Number) && ("isInteger" in Number);
	o.es6.MathStatics = ("hypot" in Math) && ("acosh" in Math) && ("imul" in Math);
	o.es6.collections = ("Map" in global) && ("Set" in global) && ("WeakMap" in global) && ("WeakSet" in global);
	o.es6.Proxy = ("Proxy" in global);
	o.es6.Promise = ("Promise" in global);

})(FeatureTests);
