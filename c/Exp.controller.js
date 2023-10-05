sap.ui.define([
	"FabFinV3/c/BaseController",
	"sap/ui/model/json/JSONModel",
	"FabFinV3/u/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, formatter, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("FabFinV3.c.Exp", {
		formatter: formatter,
		onInit: function() {
			this.rCount = 0;
			this.eModel = new JSONModel();
			this.getView().setModel(this.eModel, "eModel");
			this.getView().setModel(new JSONModel(FabFinV3.ExpType), "etModel");
			this.byId("idExpDate").setMaxDate(new Date());
			this.getOwnerComponent().getRouter().getRoute("exp").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(evt) {

			if (window.testRun) {
				this.expurl = "https://api.github.com/repos/britmanjerin/tst/contents/exp.json";
				this.byId("idStopTR").setVisible(true);
			} else {
				this.expurl = "https://api.github.com/repos/britmanjerin/tst/contents/exp_p.json";
				this.byId("idStopTR").setVisible(false);
			}

			if (!this.headers) {
				var aKey = this.validateCookie("aKey");
				if (!aKey) {
					this.onNavLP();
					return;
				}
				this.headers = {
					"Authorization": 'Bearer ' + aKey,
					"Accept": "application/vnd.github.v3+json",
					"Content-Type": "application/json"
				};
			}

			this.loadExpData();
		},
		loadExpData: function() {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);

			$.ajax({
				type: 'GET',
				url: this.expurl,
				headers: this.headers,
				cache: false,
				success: function(odata) {
					if (!window.expsha) {
						window.expsha = odata.sha;
					} else {
						if (window.expsha != odata.sha) {

							if (that.rCount > 2) {
								window.location.reload();
							} else {
								that.rCount++;
								$.sap.delayedCall(3000, this, function() {
									that.loadExpData();
								});
							}
							return;
						}
						that.rCount = 0;
					}
					var data = atob(odata.content);
					data = data.trim() ? JSON.parse(data) : [];
					var tot = 0;
					data.sort((a, b) => {
						return new Date(b.dat) - new Date(a.dat);
					});
					data.forEach(function(e) {
						e.dat = new Date(e.dat).toDateString().split(" ").splice(1, 4).join(' ');
						tot += Number(e.amt);
					});

					that.eModel.setData(data);
					that.eModel.refresh();
					that.byId("idTotTxt").setText(tot);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError.responseJSON.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		getTypDesc: function(val) {
			var list = FabFinV3.ExpType;
			for (var i in list) {
				if (val == list[i].key) {
					return list[i].text;
				}
			}
		},
		onAddExp: function() {
			var eObj = {
				key: Date.now().toString(),
				desc: this.byId("idExpDesc").getValue().trim(),
				typ: this.byId("idExpTyp").getSelectedKey(),
				amt: this.byId("idExpAmt").getValue(),
				dat: this.byId("idExpDate").getValue(),
				modDt: Date.now().toString()
			}
			if (eObj.typ && eObj.amt && eObj.dat) {
				var that = this;
				var data = this.eModel.getData();
				data.push(eObj);
				var body = {
					message: "Updating file",
					content: btoa(JSON.stringify(data)),
					sha: window.expsha
				};
				var def = $.Deferred();
				that.updateFile(body, def);
				$.when(def).done(function() {
					MessageBox.success("Expense Added Successfully.");
					that.byId("idExpDesc").setValue();
					that.byId("idExpTyp").setSelectedKey("");
					that.byId("idExpAmt").setValue();
					that.byId("idExpDate").setValue();
				});
			}
		},
		onDelExp: function(evt) {
			var key = evt.getSource().getParent().getBindingContext("eModel").getObject().key;
			sap.m.MessageBox.confirm(
				"Are you sure want to delete?", {
					actions: ["Cancel", "Confirm"],
					onClose: function(sAction) {
						if (sAction === "Confirm") {
							delCust();
						}
					}
				}
			);
			var that = this;

			function delCust() {
				var eData = that.eModel.getData();
				for (var j in eData) {
					if (eData[j].key === key) {
						eData.splice(j, 1);
						break;
					}
				}
				var body = {
					message: "Updating file",
					content: btoa(JSON.stringify(eData)),
					sha: window.expsha
				};
				var def = $.Deferred();
				that.updateFile(body, def);
				$.when(def).done(function() {
					MessageBox.success("Deleted Successfully.")
				});
			}
		},

		updateFile: function(body, def) {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'PUT',
				url: this.expurl,
				headers: this.headers,
				data: JSON.stringify(body),
				dataType: 'text',
				success: function(odata) {
					window.expsha = JSON.parse(odata).content.sha;
					sap.ui.core.BusyIndicator.hide();
					that.loadExpData();
					def.resolve();
				},
				error: function(odata) {
					MessageBox.error("Failed to update.")
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onNavLP: function(obj) {
			this.getOwnerComponent().getRouter().navTo("login");
		},
		onTestRun: function(evt) {
			window.testRun = false;
			window.expsha = null;
			window.mainsha = null;
			window.custsha = null;
			this.onNavBack();
		},

	});
});
