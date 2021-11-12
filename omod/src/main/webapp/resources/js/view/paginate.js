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
		openhmis.url.backboneBase + 'js/lib/jquery',
		openhmis.url.backboneBase + 'js/lib/underscore',
		openhmis.url.backboneBase + 'js/lib/backbone',
		openhmis.url.backboneBase + 'js/lib/i18n',
		openhmis.url.backboneBase + 'js/openhmis'
	],
	function($, _, Backbone, i18n, openhmis) {
		/**
		 * PaginateView
		 *
		 * Show pagination status and controls based on a given
		 * GenericCollection.
		 */ 
		openhmis.PaginateView = Backbone.View.extend({
			tmplFile: openhmis.url.backboneBase + "template/paginate.html",
			tmplSelector: "#pagination",
			pageSizes: [ 5, 10, 25, 50, 100 ],
			initialize: function(options) {
				_.bindAll(this, "changePageSize", "checkPage");
				this.options = {
					numberOfPages: 5,
					pageSize: 10
				}
				if (options) {
					if (options.numberOfPages)
						this.options.numberOfPages = options.numberOfPages;
					if (options.pageSize)
						this.options.pageSize = options.pageSize;
				}
				this.template = this.getTemplate();
				this.pageSizeTemplate = this.getTemplate(null, "#pageSize");
				this.page = 1;
				this.model.on("reset", this.checkPage);
			},
			
			getPage: function() { return this.page; },
			
			setPage: function(page) {
				var pageNum = parseInt(page);
				if (isNaN(pageNum)) {
					switch (page) {
						case "first":
							this.page = 1;
							break;
						case "previous":
							if (this.page - 1 >= 1)
								this.page--;
							else
								throw openhmis.getMessage('openhmis.backboneforms.pagination.first.page.message');
							break;
						case "next":
							if (this.page + 1 <= Math.floor(this.model.totalLength / this.options.pageSize) + 1)
								this.page++;
							else
								throw openhmis.getMessage('openhmis.backboneforms.pagination.last.page.message');
							break;
						case "last":
							this.page = this.getMaxPageNum();
							break;
						default:
							throw "Invalid page.";
					}
				}
				else {
					if (pageNum < 1)
						throw openhmis.getMessage('openhmis.backboneforms.pagination.first.page.error');
					else if (pageNum > this.getMaxPageNum())
						throw openhmis.getMessage('openhmis.backboneforms.pagination.last.page.error');
					else
						this.page = pageNum;
				}
			},
			
			getPageSize: function() { return this.options.pageSize; },
			setPageSize: function(size) { this.options.pageSize = parseInt(size); },
			
			getStartIndex: function() {
				return ((this.page - 1) * this.options.pageSize) + 1;
			},
			
			getItemRange: function() {
				var last = this.page * this.options.pageSize;
				return {
					first: ((this.page - 1) * this.options.pageSize) + 1,
					last: this.model.totalLength < last ? this.model.totalLength : last
				}
			},
			
			getMaxPageNum: function() {
				if (this.model.totalLength === 0)
					return 1;
				return Math.floor(this.model.totalLength / this.options.pageSize)
					+ (this.model.totalLength % this.options.pageSize === 0 ? 0 : 1);
			},
			
			getPageRange: function() {
				var maxPages = this.getMaxPageNum();
				var numberOfPages = this.options.numberOfPages > maxPages ? maxPages : this.options.numberOfPages;
				var even = numberOfPages % 2 === 0;
				var shift = 0;
				var curPage = this.page - 1; // zero-based
				var first = curPage - Math.floor(numberOfPages / 2) - (even ? 1 : 0);
				if (first < 0) shift = Math.abs(first);
				else {
					var last = first + numberOfPages;
					if (last > maxPages)
						shift = maxPages - last;
				}
				return {
					first: first + shift + 1, // 1-based
					last: first + shift + numberOfPages
				}
			},
			
			changePageSize: function(event) {
				this.setPageSize($(event.target).val());
				this.fetch();
			},
			
			checkPage: function() {
				var max = this.getMaxPageNum();
				if (max > 0 && max < this.page) {
					this.page = max;
					this.fetch();
				}
			},
			
			getFetchOptions: function(options) {
				options = options ? options : {}
				if (options.page)
					this.setPage(options.page);
				options.queryString = openhmis.addQueryStringParameter(options.queryString, "startIndex=" + this.getStartIndex());
				options.queryString = openhmis.addQueryStringParameter(options.queryString, "limit=" + this.options.pageSize);
				return options;
			},
			
			fetch: function(options) {
				options = this.getFetchOptions(options);
				this.trigger("fetch", options, this);
			},

			render: function() {
				this.$el.html(this.template({
					list: this.model,
					page: this.page,
					itemRange: this.getItemRange(),
					pageRange: this.getPageRange(),
					__: i18n
				}));
				var self = this;
				this.$(".first").not(".ui-state-disabled").click(function() { self.fetch({ page: "first" }); $('.spinner').show() });
				this.$(".previous").not(".ui-state-disabled").click(function() { self.fetch({ page: "previous" }) });
				this.$("span.pages span").not(".ui-state-disabled").click(function(event) { self.fetch({ page: parseInt($(event.target).text()) }) });
				this.$(".next").not(".ui-state-disabled").click(function() { self.fetch({ page: "next" }) });
				this.$(".last").not(".ui-state-disabled").click(function() { self.fetch({ page: "last" }) });
				return this;
			},
			
			getRenderedPageSizeEl: function(el) {
				el = el ? el : $('<span id="paginationPageSize"></span>');
				$(el).html(this.pageSizeTemplate({
					list: this.model,
					pageSize: this.options.pageSize,
					pageSizes: this.pageSizes,
					__: i18n
				}));
				$(el).change(this.changePageSize);
				return el;
			}
		});
		
		return openhmis;
	}
);
