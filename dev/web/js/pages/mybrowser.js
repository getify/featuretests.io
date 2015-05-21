(function(context){

	function runTests() {
		window["Reflect.supports"]("all",function(results,timestamp){
			var test_results = [];

			test_results = Object.keys(results).sort();
			test_results = test_results.map(function(key,idx){
				var display_key = key;
				if (key == "class") display_key = "\"" + display_key + "\"";
				return "&nbsp;&nbsp;&nbsp;" + display_key + ": " +
					!!results[key] + (idx < test_results.length - 1 ? "," : "");
			});

			View.getPartialHTML("/mybrowser.html#test_date",{
				timestamp: (new Date(timestamp)).toLocaleDateString()
			})
			.val(function val(partial,html){
				$("[rel='js-test-date']").replaceWith(html);
			});

			View.getPartialHTML("/mybrowser.html#test_results",{
				test_results: test_results
			})
			.val(function val(partial,html){
				$("[rel='js-test-results']").replaceWith(html);
			});
		});
	}

	function resetTests() {
		window["Reflect.supports"].clearLocalSiteCache();

		View.getPartialHTML("/mybrowser.html#test_date",{
			timestamp: "--"
		})
		.val(function val(partial,html){
			$("[rel='js-test-date']").replaceWith(html);
		});

		View.getPartialHTML("/mybrowser.html#test_results")
		.val(function val(partial,html){
			$("[rel='js-test-results']").replaceWith(html);
		});
	}

	function init() {
		$test_btn = $("[rel='js-test-btn']");
		$test_btn.click(function handler(evt){
			resetTests();
			runTests();
		});
		runTests();
	}

	function teardown(){
		$test_btn.unbind("click");
		$test_btn = null;
	}

	var $test_btn;

	// feature test for localStorage
	var local_storage_available = (function testLS(test) {
		try {
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		}
		catch (err) {
			return false;
		}
	})("storage:featuretests.io");

	Pages.page_scripts["/mybrowser"] = {
		init: init,
		teardown: teardown
	};

})(window);
