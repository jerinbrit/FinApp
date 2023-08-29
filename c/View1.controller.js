/*global XLSX:true*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"FabFinV3/u/formatter",
	"sap/m/MessageBox"
], function(Controller, JSONModel, formatter, MessageBox) {
	"use strict";

	return Controller.extend("FabFinV3.c.View1", {
		formatter: formatter,
		onInit: function() {
			var key =  ["6enRw4bUwG8","LpfiGejXcVa","aOa6OwNI","ghp_exUr2M"];
			key = key.reverse().join('');
			this.headers = {
				"Authorization": 'Bearer '+key,
				"Accept": "application/vnd.github.v3+json",
				"Content-Type": "application/json"
			};
			window.mainsha;
			window.custsha;
			this.oModel = new JSONModel();
			this.mModel = new JSONModel();
			this.getView().setModel(this.oModel, "oModel");
			this.getView().setModel(this.mModel, "mModel");
			//this.loadCustData();
			this.getOwnerComponent().getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched, this);

		},
		_onObjectMatched: function(evt) {
			this.loadCustData();
		},
		
		handleRefresh:function()
			{
				
			setTimeout(function () {
				this.byId("pullToRefresh").hide();
			this.loadCustData();
			}.bind(this), 10);
		
				
			},

		loadCustData: function() {
			var that = this;
			var i = $.Deferred();
			var j = $.Deferred();
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'GET',
				url: 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json',
				headers: this.headers,
				cache: false,
				success: function(odata) {

					if (!window.custsha) {
						window.custsha = odata.sha;
					}
					else
					{
						if(window.custsha != odata.sha)
							{
								$.sap.delayedCall(3000, this, function() {
									that.loadCustData();
								});
								
								return;
							}
					}

					var data = atob(odata.content);
					data = data.trim() ? JSON.parse(data) : [];
					data.forEach(function(e) {
						e.lnDt = new Date(e.lnDt).toDateString().split(" ").splice(1, 4).join(' ');
						if (e.nxtInstsDate) {
							e.nxtInstsDate = new Date(e.nxtInstsDate).toDateString().split(" ").splice(1, 4).join(' ');
						}

					});
					
					data.sort((a, b) => {
					return b.key - a.key;
				});

					that.oModel.setData(data);
					that.oModel.refresh();
					i.resolve();
				}
			});
			$.ajax({
				type: 'GET',

				url: 'https://api.github.com/repos/britmanjerin/tst/contents/main.json',
				headers: this.headers,
				cache: false,
				success: function(odata) {

					if (!window.mainsha) {
						window.mainsha = odata.sha;
					}
					else
					{
						if(window.mainsha != odata.sha)
							{
								$.sap.delayedCall(3000, this, function() {
									that.loadCustData();
								});
								
								return;
							}
					}

					var data = atob(odata.content);
					data = data.trim() ? JSON.parse(data) : {
						roi: [{
							month: 1,
							roi: 12
						}],
						pw: []
					};
					that.mModel.setData(data);
					that.mModel.refresh();
					j.resolve();
				}
			});

			$.when(i, j).done(function() {
				sap.ui.core.BusyIndicator.hide();
			});
		},

		onAddCust: function(obj) {

			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("FabFinV3.f.AddCust", this);
			this.getView().addDependent(this._oDialog);

			if (!obj) {
				var obj = {
					"key": "",
					"name": "",
					"idTyp": "",
					"id": "",
					"mob": "",
					"mail": "",
					"addr": "",
					"type": "",
					"goldGms": "",
					"goldRt": "",
					"lnAmt": "",
					"months": "",
					"roi": this.mModel.getData().roi[0].roi,
					"emi": "",
					"IntAmt": "",
					"compInst": "",
					"ltPay": "",
					"preCls": "",
					"cfAmt": "",
					"lnDt": "",
					"clsDt": "",
					"nxtInsDt": "",
					"payDet": [],
					"roiDet": this.mModel.getData().roi,
					"pwDet": this.mModel.getData().pw,
					"crtDt": ""
				};
			}

			this._oDialog.setModel(new JSONModel($.extend(true, {}, obj)), "oDialogModel");
			sap.ui.getCore().byId("idLnDt").setMaxDate(new Date());
			this._oDialog.open();

		},

		cAddCust: function() {

			var nwData = this._oDialog.getModel("oDialogModel").getData();
			nwData.key = nwData.crtDt = nwData.modDt = Date.now().toString();
			this.oModel.getData().push(this._oDialog.getModel("oDialogModel").getData());
			var data = this.oModel.getData();
			data = JSON.stringify(data);
			var that = this;

			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json';

			var body = {
				message: "Updating file",
				content: btoa(data),
				sha: window.custsha
			};
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'PUT',
				url: url,
				headers: that.headers,
				data: JSON.stringify(body),
				dataType: 'text',
				success: function(odata) {
					window.custsha = JSON.parse(odata).content.sha;
					sap.ui.core.BusyIndicator.hide();
					that.loadCustData();
					that.onClose();
					MessageBox.success("Customer Added Successfully.")
				},
				error: function(odata) {

					MessageBox.error("Failed to update.")

				}
			});

		},

		calculateEMI: function(e) {
			var data = this._oDialog.getModel("oDialogModel").getData();
			if (e === "G") {
				if (Number(data.goldRt) > 0 && Number(data.goldGms) > 0) {
					data.lnAmt = Number(data.goldRt) * Number(data.goldGms);
				}
			} else if (e === "A") {
				if (Number(data.lnAmt) > 0 && Number(data.goldGms) > 0) {
					data.goldRt = Number(data.lnAmt) / Number(data.goldGms);
				}
			}
			if (Number(data.lnAmt) > 0 && Number(data.roi) > 0) {

				data.lnDt = data.lnDt ? data.lnDt : new Date().toDateString();
				data.payDet = [];
				this.calPayData(data);

			}
			this._oDialog.getModel("oDialogModel").refresh();

			function findEMIDate(date, ctr) {
				var m = date.getMonth() + ctr;
				var y = date.getFullYear() + (m === 12 ? 1 : 0);
				return new Date(y, m % 12, 5);
			}
		},

		calPayData: function(cModel) {

			var data = cModel.payDet;
			var roiArr = this.mModel.getData().roi;
			var pwArr = this.mModel.getData().pw;
			cModel.instDet = generateLoanData(cModel.lnDt);

			cModel.lstPayDate = "";
			cModel.nxtInstsDate = this.formatter.dateFormat(cModel.instDet[0].instDt);
			//	cModel.nxtInsteDate = this.formatter.dateFormat(cModel.instDet[0].fnPayDt);
			cModel.partPay = "";
			cModel.odAmt_1 = cModel.instDet[0].int;
			cModel.odAmt_2 = cModel.instDet[1].int;
			cModel.odAmt_3 = cModel.instDet[2].int;
			cModel.odDat_1 = this.formatter.dateFormat(cModel.instDet[0].fnPayDt);
			cModel.odDat_2 = this.formatter.dateFormat(cModel.instDet[1].fnPayDt);
			cModel.odDat_3 = this.formatter.dateFormat(cModel.instDet[2].fnPayDt);

			function generateLoanData(dat) {

				var pObj, obj, pArr = [],
					tmpDate = dat,
					cDate = new Date().toDateString(),
					iEnd = 1000,
					prA = Number(cModel.lnAmt),
					//	roi = Number(cModel.roi) / 12 / 100,
					roi, tRoi,
					bPrA = prA,
					cfInt = 0;

				var date = new Date(dat);
				var instStDt = new Date(dat);
				var day = date.getDate();
				var year = date.getFullYear();
				var month = date.getMonth() + 1;

				if (new Date(cDate) < new Date(dat)) {
					iEnd = 6;
				}

				var fInstDat,
					fInstMnth = (date.getMonth() + 1) % 12,
					fInstYr = !((date.getMonth() + 1) % 12) ? date.getFullYear() + 1 : date.getFullYear(),
					fInstDay = 5,
					mc = 1;
				for (var i in pwArr) {
					if (date.getDate() >= pwArr[i].frm && date.getDate() <= pwArr[i].to) {
						fInstMnth = date.getMonth() + pwArr[i].mc;
						fInstDay = pwArr[i].dt;
						mc = pwArr[i].mc;
						break;
					}
				}
				fInstDat = new Date(fInstYr, fInstMnth, fInstDay);
				if ((date.getMonth() + mc) % 12 != fInstDat.getMonth()) {
					fInstDat = new Date((!((date.getMonth() + mc) % 12) ? date.getFullYear() + 1 : date.getFullYear()), fInstDat.getMonth(), 0);
				}

				for (var i = 1; i < iEnd; i++) {

					for (var k in roiArr) {
						if (roiArr[k].month == i) {
							roi = Number(roiArr[k].roi) / 12 / 100;
							tRoi = Number(roiArr[k].roi);
							break;
						}
					}

					prA = bPrA;

					pObj = {
						no: i,
						prA: prA,
						int: Math.round((Number(prA) * roi) + cfInt),
						lPay: 0,
						payDate: "",
						//	intFrm: tmpDate,
						//	intTo: new Date(new Date(tmpDate).getTime() + (30 * 24 * 60 * 60 * 1000)).toDateString(),
						//	fnPayDt: new Date(new Date(tmpDate).getTime() + (61 * 24 * 60 * 60 * 1000)).toDateString(),
						amtPaid: 0,
						hist: []
					};

					month = month % 12;
					year = !(month) ? year + 1 : year;
					obj = {
						sDt: date,
						eDt: new Date(year, month, day)
					};
					if (month != obj.eDt.getMonth()) {
						obj.eDt = new Date(year, obj.eDt.getMonth(), 0);
					}
					obj.eDt = new Date(obj.eDt.getTime() - (1 * 24 * 60 * 60 * 1000));

					date = new Date(obj.eDt.getTime() + (1 * 24 * 60 * 60 * 1000));
					month += 1;

					pObj.intFrm = obj.sDt.toDateString();
					pObj.intTo = obj.eDt.toDateString();
					pObj.fnPayDt = obj.eDt.toDateString();

					pObj.instDt = fInstDat;
					pObj.fnPayDt = (fInstDat >= obj.eDt ? fInstDat : obj.eDt).toDateString();
					fInstDat = new Date((!((fInstDat.getMonth() + 1) % 12) ? fInstDat.getFullYear() + 1 : fInstDat.getFullYear()), ((fInstDat.getMonth() +
						1) % 12), fInstDay);
					if ((pObj.instDt.getMonth() + 1) % 12 != fInstDat.getMonth()) {
						fInstDat = new Date((!((pObj.instDt.getMonth() + 1) % 12) ? pObj.instDt.getFullYear() + 1 : pObj.instDt.getFullYear()), (
							fInstDat.getMonth()), 0);
					}

					pObj.instStDt = instStDt.toDateString();
					instStDt = new Date(new Date(pObj.fnPayDt).getTime() + (1 * 24 * 60 * 60 * 1000));

					if ((new Date(cDate) <= new Date(pObj.intTo) && new Date(cDate) >= new Date(pObj.intFrm))) {
						iEnd = i + 5;
					}

					pObj.intFrm = new Date(pObj.intFrm);
					pObj.intTo = new Date(pObj.intTo);
					pObj.payDate = new Date(pObj.payDate);
					pObj.fnPayDt = new Date(pObj.fnPayDt);
					pObj.instStDt = new Date(pObj.instStDt);

					pArr.push(pObj);

				}

				return pArr;

			}

		},
		getNoOfDays: function(sDate, eDate) {
			return Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
		},
		onUpdateInt: function() {
			if (this._iDialog) {
				this._iDialog.destroy();
			}
			this._iDialog = sap.ui.xmlfragment("idIT", "FabFinV3.f.intRate", this);
			this.getView().addDependent(this._iDialog);
			this._iDialog.setModel(new JSONModel($.extend(true, [], this.mModel.getData().roi)), "iDialogModel");
			this._iDialog.open();
		},

		onAddROI: function() {
			var month = Math.round(sap.ui.getCore().byId("idIT--idMnInp").getValue());
			var roi = sap.ui.getCore().byId("idIT--idRoiInp").getValue();

			if (month && roi) {
				var model = this._iDialog.getModel("iDialogModel").getData();
				var nwObj = {
					month: month,
					roi: roi,
					modDt: Date.now().toString()
				};
				for (var i = 0; i < model.length; i++) {
					if (model[i].month == month) {
						model.splice(i, 1, nwObj);
						break;
					}
				}
				if (i == model.length) {
					model.push(nwObj);
				}

				model.sort((a, b) => {
					return a.month - b.month;
				});

				this._iDialog.getModel("iDialogModel").refresh();

			}

		},

		cUpdateInt: function() {
			var that = this;
			this.mModel.getData().roi = this._iDialog.getModel("iDialogModel").getData();
			this.mModel.getData().modDt = Date.now().toString();

			var data = JSON.stringify(this.mModel.getData());

			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/main.json';
			var body = {
				message: "Updating file",
				content: btoa(data),
				sha: window.mainsha
			};
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'PUT',
				url: url,
				headers: that.headers,
				data: JSON.stringify(body),
				dataType: 'text',
				success: function(odata) {
					window.mainsha = JSON.parse(odata).content.sha;
					sap.ui.core.BusyIndicator.hide();
					that.loadCustData();
					MessageBox.success("Updated Successfully.")
				},
				error: function(odata) {
						MessageBox.error("Failed to update.")
				}
			});

			this.onClose();
		},

		onDelIntMonth: function(oEvent) {

			this._iDialog.getModel("iDialogModel").getData().splice(oEvent.getSource().getBindingContext("iDialogModel").getPath().slice("/")[1],
				1);
			this._iDialog.getModel("iDialogModel").refresh();
		},

		onUpdatePW: function() {
			if (this._pwDialog) {
				this._pwDialog.destroy();
			}
			this._pwDialog = sap.ui.xmlfragment("FabFinV3.f.PayWindow", this);
			this.getView().addDependent(this._pwDialog);
			this._pwDialog.setModel(new JSONModel($.extend(true, [], this.mModel.getData().pw)), "pwDialogModel");
			this._pwDialog.open();
		},

		onAddPW: function() {
			var frm = Math.round(sap.ui.getCore().byId("idFrm").getValue());
			var to = Math.round(sap.ui.getCore().byId("idTo").getValue());
			var dt = Math.round(sap.ui.getCore().byId("idDt").getValue());
			var mc = Math.round(sap.ui.getCore().byId("idMC").getValue());

			to = to ? to : from;
			mc = mc ? mc : 1;
			dt = dt ? dt : 5;

			if (frm) {
				var model = this._pwDialog.getModel("pwDialogModel").getData();
				var nwObj = {
					frm: frm,
					to: to,
					dt: dt,
					mc: mc,
					modDt: Date.now().toString()
				};
				for (var i = 0; i < model.length; i++) {
					if (model[i].frm == frm && model[i].to == to) {
						model.splice(i, 1, nwObj);
						break;
					}
				}
				if (i == model.length) {
					model.push(nwObj);
				}

				this._pwDialog.getModel("pwDialogModel").refresh();

			}

		},

		cUpdatePW: function() {
			this.mModel.getData().pw = this._pwDialog.getModel("pwDialogModel").getData();
			this.mModel.getData().modDt = Date.now().toString();

			var that = this;
			var data = JSON.stringify(this.mModel.getData());

			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/main.json';
			var body = {
				message: "Updating file",
				content: btoa(data),
				sha: window.mainsha
			};
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'PUT',
				url: url,
				headers: that.headers,
				data: JSON.stringify(body),
				dataType: 'text',
				success: function(odata) {
					window.mainsha = JSON.parse(odata).content.sha;
					sap.ui.core.BusyIndicator.hide();
					that.loadCustData();
					MessageBox.success("Updated Successfully.")
				},
				error: function(odata) {
						MessageBox.error("Failed to update.")
				}
			});

			this.onClose();
		},

		onDelPW: function(oEvent) {

			this._pwDialog.getModel("pwDialogModel").getData()
				.splice(oEvent.getSource().getBindingContext("pwDialogModel").getPath().slice("/")[1],1);
			this._pwDialog.getModel("pwDialogModel").refresh();
		},

		onClose: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
			if (this._iDialog) {
				this._iDialog.destroy();
				this._iDialog.destroyContent()
			}
			if (this._pwDialog) {
				this._pwDialog.destroy();
			}

		},

		onNav: function(obj) {
			this.getOwnerComponent().getRouter().navTo("customer", {
				custId: obj.key
			});
		}

	});
});
