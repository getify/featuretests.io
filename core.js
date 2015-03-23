(function core(){
	this.FeatureTests = this.FeatureTests || {};
	this.FeatureTests.tryIt = function tryIt(code) {
		try {
			(new Function(code))();
			return true;
		}
		catch (err) {
			return false;
		}
	}
})();
