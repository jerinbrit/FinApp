sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"FabFinV3/m/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("FabFinV3.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			UIComponent.prototype.init.apply(this, arguments);
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.getRouter().initialize();
			FabFinV3.fy = 0;
			FabFinV3.ExpType = [{
				key: "",
				text: "--Select--"
			}, {
				key: "1",
				text: "Infrastructure"
			}, {
				key: "2",
				text: "Hardware"
			}, {
				key: "3",
				text: "Internet"
			}, {
				key: "4",
				text: "Travel"
			}, {
				key: "5",
				text: "Salary"
			},{
				key: "6",
				text: "Utilities"
			},{
				key: "7",
				text: "Miscellaneous"
			}];

		}
	});
});
