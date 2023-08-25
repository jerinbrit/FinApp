/*global XLSX:true*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"FabFinV3/u/formatter"
], function(Controller, JSONModel, formatter) {
	"use strict";

	return Controller.extend("FabFinV3.c.View1", {
		formatter: formatter,
		onInit: function() {
			this.headers = {
				"Authorization": 'Bearer '+atob('Z2hwX0p4a1FacUM2djBuUVBRV0lpZEt4TmZVZGQ4QlBiUzM4N1ExSQ=='),
				"Accept": "application/vnd.github.v3+json",
				"Content-Type": "application/json"
			};
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

		/*downloadObjectAsJson(data, "new");
				function downloadObjectAsJson(exportObj, exportName) {
					var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
					var downloadAnchorNode = document.createElement('a');
					downloadAnchorNode.setAttribute("href", dataStr);
					downloadAnchorNode.setAttribute("download", exportName + ".json");
					document.body.appendChild(downloadAnchorNode); // required for firefox
					downloadAnchorNode.click();
					downloadAnchorNode.remove();
				}*/

		loadCustData: function() {
			var that = this;
			var i = $.Deferred();
			var j = $.Deferred();

			$.ajax({
				type: 'GET',
				url: 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json',
				headers: this.headers,
				success: function(odata) {
					var data = atob(odata.content);
					data = data.trim() ? JSON.parse(data) : [];
					that.oModel.setData(data);
					that.oModel.refresh();
					i.resolve();
				}
			});
			$.ajax({
				type: 'GET',

				url: 'https://api.github.com/repos/britmanjerin/tst/contents/main.json',
				headers: this.headers,
				success: function(odata) {
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

			/*	$.ajax({
					type: 'PUT',
					headers: {
						'X-Requested-With': 'XMLHttpRequest',
						'Access-Control-Allow-Origin': '*'
					},
					url: '/britmanjerin/FinApp/main/m/cust.json',

					data: data,
					success: function(e) {
						that.loadCustData();
						that.onClose();
					}
				});*/
				
		

			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json';
			$.ajax({
				type: 'GET',
				url: url,
				headers: that.headers,
				success: function(odata) {

					var body = {
						message: "Updating file",
						content: btoa(data),
						sha: odata.sha
					};

					$.ajax({
						type: 'PUT',
						url: url,
						headers: that.headers,
						data: JSON.stringify(body),
						dataType: 'text',
						success: function(odata) {

							that.loadCustData();
						that.onClose();

						},	error: function(odata) {

							that.loadCustData();
						that.onClose();

						}
					});
				}
			});

		/*	fetch(url, {
					that.headers
				})
				.then(response => response.json())
				.then(fileDetails => {

					var body = {
						message: "Updating file",
						content: btoa(data),
						sha: fileDetails.sha
					};

					return fetch(url, {
						method: 'PUT',
						headers,
						body: JSON.stringify(data)
					});
				})
				.then(response => {
					if (response.status === 200) {
						that.loadCustData();
						that.onClose();
					} else {
						console.log("Failed to update file:", response.statusText);
					}
				})
				.catch(error => {
					console.error("An error occurred:", error);
				});*/

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
			this._iDialog = sap.ui.xmlfragment("FabFinV3.f.intRate", this);
			this.getView().addDependent(this._iDialog);
			this._iDialog.setModel(new JSONModel($.extend(true, [], this.mModel.getData().roi)), "iDialogModel");
			this._iDialog.open();
		},

		onAddROI: function() {
			var month = Math.round(sap.ui.getCore().byId("idMnInp").getValue());
			var roi = sap.ui.getCore().byId("idRoiInp").getValue();

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
		/*	$.ajax({
				type: 'PUT',
				url: '/britmanjerin/FinApp/main/m/main.json',

				data: JSON.stringify(this.mModel.getData()),
				success: function(e) {}
			});*/
			
			var data=JSON.stringify(this.mModel.getData());
			
			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/main.json';
			$.ajax({
				type: 'GET',
				url: url,
				headers: that.headers,
				success: function(odata) {

					var body = {
						message: "Updating file",
						content: btoa(data),
						sha: odata.sha
					};

					$.ajax({
						type: 'PUT',
						url: url,
						headers: that.headers,
						data: JSON.stringify(body),
						dataType: 'text',
						success: function(odata) {},	error: function(odata) {}
					});
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
		/*	$.ajax({
				type: 'PUT',
				url: '/britmanjerin/FinApp/main/m/main.json',

				data: JSON.stringify(this.mModel.getData()),
				success: function(e) {}
			});*/
			
			
				var that=this;
				var data=JSON.stringify(this.mModel.getData());
			
			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/main.json';
			$.ajax({
				type: 'GET',
				url: url,
				headers: that.headers,
				success: function(odata) {

					var body = {
						message: "Updating file",
						content: btoa(data),
						sha: odata.sha
					};

					$.ajax({
						type: 'PUT',
						url: url,
						headers: that.headers,
						data: JSON.stringify(body),
						dataType: 'text',
						success: function(odata) {},	error: function(odata) {}
					});
				}
			});
			
			this.onClose();
		},

		onDelIntMonth: function(oEvent) {

			this._pwDialog.getModel("pwDialogModel").getData().splice(oEvent.getSource().getBindingContext("pwDialogModel").getPath().slice("/")[
					1],
				1);
			this._pwDialog.getModel("pwDialogModel").refresh();
		},

		onClose: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
			if (this._iDialog) {
				this._iDialog.destroy();
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
