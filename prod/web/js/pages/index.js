(function(context){

	function init(){
		$excode = $("[rel='js-examplecode']");

		window["Reflect.supports"]("all",function(results){
			var test_results = [];

			test_results.push(
				"{",
					"&nbsp;&nbsp;&nbsp;..",
					"&nbsp;&nbsp;&nbsp;letConst: " + !!results.letConst,
					"&nbsp;&nbsp;&nbsp;spreadRest: " + !!results.spreadRest,
					"&nbsp;&nbsp;&nbsp;generator: " + !!results.generator,
					"&nbsp;&nbsp;&nbsp;arrow: " + !!results.arrow,
					"&nbsp;&nbsp;&nbsp;unicodeRegExp: " + !!results.unicodeRegExp,
					"&nbsp;&nbsp;&nbsp;..",
				"}"
			);

			View.getPartialHTML("/index.html#examplecode",{
				test_results: test_results
			})
			.val(function val(partial,html){
				$excode.replaceWith(html);
				$excode = $("[rel='js-examplecode']");
			});
		});
	}

	function teardown(){
		$excode = null;
	}

	var $excode;

	Pages.page_scripts["/index"] = {
		init: init,
		teardown: teardown
	};

})(window);
