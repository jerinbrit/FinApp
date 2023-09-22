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

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
				jQuery.sap.includeStyleSheet("cs/style.css");
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
				this.getRouter().initialize();
		}
	});
});
