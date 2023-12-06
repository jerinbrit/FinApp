sap.ui.define([ //test1
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) { 
	"use strict";

	return Controller.extend("FabFinV3.c.BaseController", {

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		openIntCalc: function() {
			if (this._icDialog) {
				this._icDialog.destroy();
			}
			this._icDialog = sap.ui.xmlfragment("FabFinV3.f.calculator", this);
			this.getView().addDependent(this._icDialog);
			this._icDialog.open();
		},

		onChangeTm: function(oEvent) {
			if (oEvent.getSource().getSelectedKey() == "3") {
				sap.ui.getCore().byId("idInpN").setShowValueHelp(true);
			} else {
				sap.ui.getCore().byId("idInpN").setShowValueHelp(false);
			}
		},
		calIntVal: function() {
			var p = sap.ui.getCore().byId("idInpP").getValue();
			var n = sap.ui.getCore().byId("idInpN").getValue();
			var r = sap.ui.getCore().byId("idInpI").getValue();

			if (p && n && r) {
				var d = sap.ui.getCore().byId("idNtyp").getSelectedKey();
				d = d == "1" ? 1 : d == "2" ? 12 : 365;
				sap.ui.getCore().byId("idIntVal").setText("Interest: Rs." + Math.round((p * ((n) / d) * r) / 100));
			}

		},

		onValHelp: function(oEvent) {
			if (this._icPopover) {
				this._icPopover.destroy();
			}
			var src = oEvent.getSource();
			var that = this;
			this._icPopover = new sap.m.Popover({
				showHeader: false,
				placement: "Bottom",
				content: [
					new sap.m.VBox({
						alignItems: "End",
						items: [new sap.m.DatePicker({
								placeholder: "From date",
								width: "10rem",
								valueFormat: "MMM dd,yyyy",
								change: function() {
									that._icPopover.openBy(src);
								}
							}).addStyleClass("sapUiTinyMargin").addStyleClass("classDt"),
							new sap.m.DatePicker({
								placeholder: "To date",
								width: "10rem",
								valueFormat: "MMM dd,yyyy",
								change: function() {
									that._icPopover.openBy(src);
								}
							}).addStyleClass("sapUiTinyMargin").addStyleClass("classDt"),
							new sap.m.Button({
								text: "Ok",
								press: function(evt) {
									var frmdat = evt.getSource().getParent().getItems()[0].getValue();
									var todat = evt.getSource().getParent().getItems()[1].getValue();
									if (frmdat && todat) {
										sap.ui.getCore().byId("idInpN").setValue(Math.ceil(Math.abs(new Date(todat) - new Date(frmdat)) / (1000 * 60 * 60 *
											24)) + 1);
										that._icPopover.close();
									}
								}
							}).addStyleClass("sapUiTinyMarginEnd")
						]
					})
				]
			});
			this._icPopover.openBy(src);
		},

		onClCalc: function() {
			this._icDialog.destroy();
		},

		onNavBack: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", {}, true);
			}
		},
		validateCookie: function(cname) {
			var name = cname + "=";
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "";
		}
	});

});
