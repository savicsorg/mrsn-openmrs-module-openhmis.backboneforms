var GenericSubclass = openhmis.GenericModel.extend({
	schema: {
		name: { type: "Text" },
		age: { type: "Number" },
		parent: { type: "Object", objRef: true },
		siblings: { type: 'List', itemType: 'NestedModel', model: null, objRef: true },
		metadata: { type: "Object", readOnly: true }
	},
	toString: function() {
		return this.get("name");
	}
});
GenericSubclass.prototype.schema.siblings.model = GenericSubclass;

describe('GenericModel', function() {
	it("should provide a string representation of itself, using 'display' attribute if it exists", function() {
		var display = "Generic Model";
		var model = new openhmis.GenericModel({ display: display });
		expect(model.toString()).toEqual(display);
	});
	
	it("should obey trackUnsaved option and be unsaved when new or when changed", function() {
		// Option not enabled
		var model = new openhmis.GenericModel();
		expect(model.isUnsaved()).toEqual(undefined);
		
		expect(model.setUnsaved).toThrow("trackUnsaved option should be enabed to use this funtion.");

		// Option enabled -- new object
		model = new openhmis.GenericModel({}, { trackUnsaved: true });
		 // We'll wait for a change to say that a new model is unsaved
		expect(model.isUnsaved()).toBeFalsy();

		// Option enabled, existing model
		model = new openhmis.GenericModel({ uuid: "f546f45d-b000-4f9f-be93-1ec29aea0a8b" }, { trackUnsaved: true });
		expect(model.isUnsaved()).toBeFalsy();
		
		// Fire change event
		model.set("foo", "bar");
		expect(model.isUnsaved()).toBeTruthy();		
	});
	
	it("should throw exception if no url property is set", function() {
		var model = new openhmis.GenericModel();
		expect(model.url).toThrow('A "url" property or function must be specified');
	});
	
	it("should allow setting a url root", function() {
		var path = "/path/to/model";
		var model = new openhmis.GenericModel({}, { urlRoot: path });
		expect(model.url()).toEqual(path);
	});
	
	it("should compose url from meta.restUrl and openhmis config", function() {
		var model = new openhmis.GenericModel();
		model.meta = {
			restUrl: 'foobar'
		}
		expect(model.url()).toEqual(openhmis.url.rest + model.meta.restUrl);
	});
	
	it("should serialize itself according to Backbone if no schema is specified", function() {
		var model = new openhmis.GenericModel({
			foo: "bar"
		});
		var obj = model.toJSON();
		expect(obj.foo).toEqual("bar");
	});
	
	it("should serialize itself according to the schema if one is specified", function() {
		var model = new GenericSubclass({
			name: "Brian",
			age: 20,
			parent: new openhmis.GenericModel({ uuid: "e2756470-1c28-11e2-892e-0800200c9a66"}),
			siblings: [
				new GenericSubclass({ name: "Ian", uuid: "6b422dda-703d-4c45-b61c-c92eea2fbb3f" }),
				new GenericSubclass({ name: "Eric", uuid: "883f9142-84ce-42e2-af5d-2b86dc6d535f" })
			],
			metadata: { some: "thing", you: "wanted", to: "know"},
			foo: "bar"
		});
		var obj = model.toJSON();
		// These should be included
		expect(obj.name).toEqual("Brian");
		expect(obj.age).toEqual(20);
		// This should be represented as a string as per objRef
		expect(obj.parent).toEqual("e2756470-1c28-11e2-892e-0800200c9a66");
		// The sibling objects should be saved as object references, so the
		// array should contain two strings
		expect(obj.siblings[0]).toEqual("6b422dda-703d-4c45-b61c-c92eea2fbb3f");
		expect(obj.siblings[1]).toEqual("883f9142-84ce-42e2-af5d-2b86dc6d535f");		
		// This has readOnly=true, so we don't want to try to set it
		expect(obj.metadata).toBeUndefined();
		// This isn't part of the schema
		expect(obj.foo).toBeUndefined();
	});
});

describe("GenericCollection", function() {
	it("should convert an array to a string list", function() {
		var patientArray = [
			new openhmis.Patient({ name: "Bob Shorten" }),
			new openhmis.Patient({ name: "Fred Lane" })
		]
		var schema = {
			model: openhmis.Patient
		}
		var list = openhmis.GenericCollection.prototype.toString.call(patientArray, schema);
		expect(list).toEqual("Bob Shorten, Fred Lane");
	});
	
	it("should convert a GenericCollection instance to a string list", function() {
		var collection = new openhmis.GenericCollection(
			[
				{ name: "Buster" },
				{ name: "Rufus" }
			],
			{
				model: GenericSubclass
			}
		);
		expect(collection.toString()).toEqual("Buster, Rufus");
	});
	
	it("should allow setting a base url", function() {
		var model = new openhmis.GenericModel();
		var collection = new openhmis.GenericCollection([ model ], { baseUrl: "/path/to/collection" });
		expect(model.url()).toEqual("/path/to/collection");
	});
	
	it("should allow setting just a resource url", function() {
		var model = new openhmis.GenericModel();
		var collection = new openhmis.GenericCollection([ model ], { url: "resource" });
		expect(model.url()).toEqual(openhmis.url.rest + "resource");
	});
	
	it("should allow setting a base url and resource url", function() {
		var model = new openhmis.GenericModel();
		var collection = new openhmis.GenericCollection([ model ], {
			baseUrl: "/path/to/",
			url: "resource"
		});
		expect(model.url()).toEqual("/path/to/resource");		
	});
	
	it("should search its model for a url root", function() {
		var modelClass = openhmis.GenericModel.extend({
			urlRoot: "/path/to/resource"
		});
		var model = new modelClass();
		var collection = new openhmis.GenericCollection([ model ], { model: modelClass });
		expect(model.url()).toEqual("/path/to/resource");
		expect(collection.url).toEqual("/path/to/resource");
	});
});
