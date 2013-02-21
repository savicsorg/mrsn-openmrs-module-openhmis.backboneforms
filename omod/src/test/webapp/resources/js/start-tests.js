(function() {
curl(
	{
		baseUrl: openhmis.url.resources
	},
	[
		'js/lib/jquery',
		// This will load a bunch of generic openhmis classes, as well as
		// Patient which is used in tests
		'js/model/patient'
	],
	function($, openhmis) {
		var testBaseUrl = '/src/test/webapp/resources/js';
		curl(
			[
				'js!' + testBaseUrl + '/openhmis.js',
				'js!' + testBaseUrl + '/model/generic.js',
				'js!' + testBaseUrl + '/view/generic.js',
				'js!' + testBaseUrl + '/view/paginate.js',
				'js!' + testBaseUrl + '/lib/i18n.js'
			],
			function() {
				$(function() {
					window.reporter = new jasmine.HtmlReporter(); jasmine.getEnv().addReporter(reporter);
					jasmine.getEnv().execute();
				});
			}
		);
	}
);
})();