sap.ui.define([
	"sap/m/ObjectMarker"
], function(ObjectMarker) {
	"use strict";
	return ObjectMarker.extend("FabFinV3.u.CustomMarker", {
		metadata: {},
		renderer: {},
		onAfterRendering: function() {
			try {
				this.mAggregations._innerControl.setText();
				this.getType() === "Unsaved" ? this.mAggregations._innerControl.setIcon("sap-icon://restart") : this.mAggregations._innerControl.setIcon(
					"sap-icon://unpaid-leave");

			} catch (err) {}
		}
	});
});
