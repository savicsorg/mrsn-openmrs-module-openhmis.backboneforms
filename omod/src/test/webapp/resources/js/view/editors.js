describe("Autocomplete Editor", function() {
	it("requires editors", function() {
		require(["js/view/editors"]);
	});
	
	it("should return the value of the selected item", function() {
		// For basic text autocomplete
		var testForm = new Backbone.Form({
			schema: {
				autocomplete: { type: "Autocomplete", options: ["Black", "White", "Red", "Green"]}
			}
		});
		testForm.render();
		var editor = testForm.fields["autocomplete"].editor;
		editor.setValue("Green");
		editor.onSelect(null, { item: { label: "Green", value: "Green" }});
		expect(testForm.getValue("autocomplete")).toEqual("Green");
		
		// For advanced object autocomplete
		var testModel = new openhmis.GenericModel({
			display: "Test Model",
			description: "A test model, of course"
		});
		testForm = new Backbone.Form({
			schema: {
				autocomplete: { type: "Autocomplete", options: new Backbone.Collection([ testModel ])}
			}
		});
		testForm.render();
		var editor = testForm.fields["autocomplete"].editor;
		editor.setValue(testModel.toString());
		editor.onSelect(null, { item: { label: testModel.toString(), value: testModel }});
		// The editor should return the full object
		expect(testForm.getValue("autocomplete")).toEqual(testModel);
		// Now change the text...
		var modifiedText = testModel.toString().substring(0, testModel.toString().length - 2);
		editor.setValue(modifiedText);
		// And we should just get the text
		expect(testForm.getValue("autocomplete")).toEqual(modifiedText);
	});
});