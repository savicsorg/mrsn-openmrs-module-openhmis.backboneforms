/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * Copyright (C) OpenMRS, LLC.  All Rights Reserved.
 */
define(
[
	openhmis.url.backboneBase + 'js/lib/underscore',
	openhmis.url.backboneBase + 'js/lib/backbone',
	openhmis.url.backboneBase + 'js/openhmis'
],
function(_, Backbone, openhmis) {
	openhmis.ProgressCollection = Backbone.Collection.extend({
		initialize: function(models, options) {
			_.bindAll(this, "success", "error");
			this.pending = new Backbone.Collection();
			this.finished = new Backbone.Collection();
			this.failed = new Backbone.Collection();
			this.pending.add(models);
			this.on("add", this.pending.add);
		},
		
		success: function(model, resp) {
			if (this.pending.getByCid(model.cid)) {
				this._moveToQueue.call(this, model, this.finished);
				this.trigger("success", model);
			}
		},
		
		error: function(model, resp) {
			if (this.pending.getByCid(model.cid)) {
				this._moveToQueue.call(this, model, this.failed);
				this.trigger("error", model);
			}
		},
		
		getPercentDone: function() {
			return Math.round(((this.finished.length + this.failed.length) / this.length) * 100);
		},
		
		_moveToQueue: function(model, queue) {
			this.pending.remove(model);
			queue.add(model);
		}
	});
	
	openhmis.ProgressView = Backbone.View.extend({
		tagName: "div",
		className: "progress",
		
		initialize: function(options) {
			_.bindAll(this, "updateProgress");
			if (options) {
				this.message = options.message;
			}
			this.model.on("success error", this.updateProgress);
		},
		
		updateProgress: function() {
			var percent = this.model.getPercentDone();
			this.$progress.progressbar("option", "value", percent);
			this.trigger("progress", percent);
		},
		
		render: function() {
			var message = "";
			if (this.message)
				message = "<p>" + this.message + "</p>";
			this.$el.html(message + '<div class="progressbar"></div>');
			this.$progress = this.$("div.progressbar");
			this.$progress.progressbar({ value: false });
			return this;
		}
	});
});