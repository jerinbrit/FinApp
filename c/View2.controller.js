/*global XLSX:true*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"FabFinV3/u/formatter",
	"sap/m/MessageBox"
], function(Controller, JSONModel, formatter, MessageBox) {
	"use strict";

	return Controller.extend("FabFinV3.c.View2", {

		formatter: formatter,

		onInit: function() {
			var key = ["6enRw4bUwG8", "LpfiGejXcVa", "aOa6OwNI", "ghp_exUr2M"];
			key = key.reverse().join('');
			this.headers = {
				"Authorization": 'Bearer ' + key,
				"Accept": "application/vnd.github.v3+json",
				"Content-Type": "application/json"
			};
			window.custsha;
			this.getView().setModel(new JSONModel({}), "refreshModel")
			this.getOwnerComponent().getRouter().getRoute("customer").attachPatternMatched(this._onObjectMatched, this);

			this.byId("idInstTab").addEventDelegate({
				onAfterRendering: function() {
					this.highlightRow();
				}
			}, this);

			//this.getMonthRange()
		},
		_onObjectMatched: function(evt) {
			this.custId = evt.getParameter("arguments").custId;
			this.loadCustData(evt.getParameter("arguments").custId);
			this.oModel = new JSONModel();
			this.getView().setModel(this.oModel, "oModel");
			this.cModel = new JSONModel();
			this.getView().setModel(this.cModel, "cModel");
			this.getView().getModel("refreshModel").getData().r = false;
		},
		handleRefresh: function() {
			setTimeout(function() {
				this.byId("pullToRefresh").hide();
				this.loadCustData(this.custId);
			}.bind(this), 10);
		},
		highlightRow: function() {
			if (FabFinV3.currRow) {
				var items = this.byId("idInstTab").getItems();
				items.forEach(function(e) {
					e.removeStyleClass("classHighlightGreen");
					try {
						$("#" + e.getId() + "-sub").css("background", "#FFFFFF");
					} catch (err) {}
					if (FabFinV3.currRow == e.getId()) {
						e.addStyleClass("classHighlightGreen");
						try {
							$("#" + e.getId() + "-sub").css("background", "#ebffeb");
						} catch (err) {}

					}
				});
			}
		},
		loadCustData: function(custId) {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'GET',
				headers: this.headers,
				url: 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json',
				cache: false,
				success: function(odata) {
					if (!window.custsha) {
						window.custsha = odata.sha;
					} else {
						if (window.custsha != odata.sha) {
							$.sap.delayedCall(3000, this, function() {
								that.loadCustData(custId);
							});

							return;
						}
					}

					var data = atob(odata.content);
					data = data.trim() ? JSON.parse(data) : [];

					that.oModel.setData(data);
					that.oModel.refresh();

					var eflag = true,
						lflag = true,
						cfAmt,
						AmtPaid;
					for (var i in data) {
						if (data[i].key === custId) {

							if (data[i].lnCls) {
								that.calcSummary(data[i]);
							}

							that.cModel.setData(data[i]);
							that.calPayData();
							that.cModel.refresh();
							break;
						}
					}
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		calcSummary: function(data) {
			var totAmt = 0,
				intAmt = 0,
				defAmt = Number(data.defAmt) < 0 ? Math.abs(data.defAmt) : 0;
			data.payDet.forEach(function(e) {
				totAmt += Number(e.amt);
			});
			intAmt = totAmt - Number(data.lnAmt);

			intAmt = intAmt > 0 ? intAmt : 0;

			this.byId("idTotPaid").setText("Total Amount Paid: " + totAmt);
			this.byId("idIntEarn").setText("Interest Earned: " + intAmt);
			this.byId("idDefAmt").setText("Default Amount: " + defAmt);
		},

		calPayData: function() {

			var cModel = this.cModel.getData();

			var roiArr = cModel.roiDet;

			var pwArr = cModel.pwDet;

			var data = cModel.payDet;

			var currRoi = Number(cModel.roi);

			var curDtObj = {};

			FabFinV3.currInst = 0;
			FabFinV3.currRow = "";
			var that = this;
			cModel.instDet = generateLoanData(cModel.lnDt);

			try {

				curDtObj.intTD = Math.round(curDtObj.prA * this.getNoOfDays(new Date(cModel.lnDt), new Date(new Date().toDateString())) *
					currRoi / 100 * 1 / 365);

				cModel.intTD = curDtObj;

			} catch (err) {}

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
				var isLnClsd;

				if (new Date(cDate) < new Date(dat)) {
					iEnd = 6;
				}

				var fInstDat,
					fInstMnth = (date.getMonth() + 1) % 12,
					fInstYr = !((date.getMonth() + 1) % 12) ? date.getFullYear() + 1 : date.getFullYear(),
					fInstDay = 5,
					mc = 1;;
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
						amtPaid: 0,
						hist: [],
						roi: tRoi
					};

					pObj.cfInt = cfInt;

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

					for (var j in data) {
						if (new Date(data[j].payDate) <= new Date(pObj.fnPayDt) && new Date(data[j].payDate) >= new Date(pObj.instStDt)) {
							pObj.amtPaid += Number(data[j].amt);
							pObj.payDate = Number(data[j].amt) > 0 ? data[j].payDate : pObj.payDate;
							pObj.hist.push(data[j]);
							isLnClsd = data[j].lnClsr ? true : false;

						}
					}

					instStDt = new Date(new Date(pObj.fnPayDt).getTime() + (1 * 24 * 60 * 60 * 1000));

					if (pObj.amtPaid > pObj.int) {
						bPrA -= (pObj.amtPaid - pObj.int);
					}
					cfInt = 0;
					if (pObj.amtPaid < pObj.int) {
						cfInt = (pObj.int - pObj.amtPaid);
					}

					pObj.bPrA = bPrA;

					//	tmpDate = new Date(new Date(pObj.intTo).getTime() + (1 * 24 * 60 * 60 * 1000)).toDateString();

					if (new Date(cDate) <= new Date(pObj.intTo) && new Date(cDate) >= new Date(pObj.intFrm)) {
						iEnd = i + 5;
						currRoi = tRoi;
						curDtObj = pObj;

						FabFinV3.currInst = pObj.no;
						that.getView().getModel("refreshModel").getData().r = true;
						that.getView().getModel("refreshModel").refresh();

						//	that.byId("idAmtDue").setText ("Total Amount Due: "+pObj.int);

					}

					pObj.intFrm = new Date(pObj.intFrm);
					pObj.intTo = new Date(pObj.intTo);
					pObj.payDate = pObj.payDate ? new Date(pObj.payDate) : "";
					pObj.fnPayDt = new Date(pObj.fnPayDt);
					pObj.instStDt = new Date(pObj.instStDt);

					if (isLnClsd) {
						pObj.int = Number(pObj.amtPaid) - Number(pObj.prA);
						pObj.int = pObj.int > 0 ? pObj.int : 0;
						pObj.bPrA = 0;
						FabFinV3.currInst = 0;

					}

					pArr.push(pObj);

					if (isLnClsd) {
						break;
					}

				}

				return pArr;

			}

		},

		onSelLC: function(oEvent) {
			var cData = this.cModel.getData();
			var payDate = sap.ui.getCore().byId("idPayDate").getValue() || new Date().toDateString();
			var lstPayDate;
			for (var i = cData.instDet.length - 1; i >= 0; i--) {
				if (cData.instDet[i].payDate) {
					lstPayDate = cData.instDet[i].payDate;
					break;
				}
			}

			if (lstPayDate > new Date(payDate)) {
				MessageBox.error("There is already a future date payment made on " + lstPayDate + ".");
				oEvent.getSource().setSelected(false);
				return;
			}

			sap.ui.getCore().byId("idOthrAmtVB").setVisible(oEvent.getSource().getSelected());
			this.calAmtTD();

		},

		calAmtTD: function(flg) {
			if (flg === '1') {
				sap.ui.getCore().byId("idOthrAmtVB").setVisible(false);
				sap.ui.getCore().byId("idCB").setSelected(false);
			}
			var cData = this.cModel.getData();
			var othrAmt = sap.ui.getCore().byId("idOthrAmt").getValue();
			var payDate = sap.ui.getCore().byId("idPayDate").getValue() || new Date().toDateString();
			var curDtObj;
			for (var i = cData.instDet.length - 1; i >= 0; i--) {
				if (new Date(payDate) <= new Date(cData.instDet[i].intTo) && new Date(payDate) >= new Date(cData.instDet[i].intFrm)) {
					curDtObj = cData.instDet[i];
					break;
				}
			}

			cData.intTD = curDtObj;
			var intCurMnth = curDtObj.int - curDtObj.cfInt;
			var intTD = Math.round(curDtObj.prA * this.getNoOfDays(new Date(curDtObj.intFrm), new Date(payDate)) *
				curDtObj.roi / 100 * 1 / 365);

			var amtToPay = (curDtObj.prA + curDtObj.cfInt + Number(othrAmt) + Math.round(curDtObj.prA * this.getNoOfDays(new Date(curDtObj.intFrm),
				new Date(payDate)) * curDtObj.roi / 100 * 1 / 365) - curDtObj.amtPaid);

			sap.ui.getCore().byId("idTot").setText(amtToPay);

		},

		onAddInst: function(oEvent) {
			if (this._iDialog) {
				this._iDialog.destroy();
			}
			this._iDialog = sap.ui.xmlfragment("FabFinV3.f.AddInst", this);
			this.getView().addDependent(this._iDialog);

			var cModel = this.cModel.getData();

			sap.ui.getCore().byId("idPayDate").setMinDate(new Date(cModel.lnDt));
			sap.ui.getCore().byId("idPayDate").setMaxDate(new Date());

			this._iDialog.open();
		},

		onSubmit: function(oEvent) {

			var payDate = sap.ui.getCore().byId("idPayDate").getValue() || new Date().toDateString();
			var payAmt = sap.ui.getCore().byId("idPayAmt").getValue();
			var lnClsr = sap.ui.getCore().byId("idCB").getSelected();
			var othrAmt = Number(sap.ui.getCore().byId("idOthrAmt").getValue());

			var cData = this.cModel.getData();

			if (lnClsr) {

				var amtToPay = Number(sap.ui.getCore().byId("idTot").getText());
				if (Number(payAmt) < amtToPay) {
					if (amtToPay - Number(payAmt) > 100) {
						MessageBox.error("Pending Amount to be collected is " + (amtToPay));
						return;
					}
				}

				cData.defAmt = amtToPay - Number(payAmt);
				cData.clsDt = Date.now().toString();
				cData.lnCls = "X";
				cData.othrAmt = othrAmt;

				if (othrAmt < 0) {
					cData.defAmt += othrAmt;
				}

			}
			/*
				if(Number(payAmt)<0 && (new Date(payDate) < new Date(cData.lstPayDate) ))
							{
									MessageBox.error("Reversal not possible as there is already a future payment made on "+cData.lstPayDate+".");
									return;
							}
			*/
			if (Number(payAmt) > 0) {
				if (cData.lstPayDate) {
					if (new Date(cData.lstPayDate) < new Date(payDate)) {
						cData.lstPayDate = this.formatter.dateFormat(new Date(payDate));
					}
				} else {
					cData.lstPayDate = this.formatter.dateFormat(new Date(payDate));
				}
			}

			if (!lnClsr) {
				var amtPaid;
				for (var i = cData.instDet.length - 1; i >= 0; i--) {
					if (new Date(payDate) <= new Date(cData.instDet[i].fnPayDt) && new Date(payDate) >= new Date(cData.instDet[i].instStDt)) {

						if (Number(payAmt) < 0) {
							if ((-Number(payAmt)) > cData.instDet[i].amtPaid) {
								MessageBox.error("Reversal amount greater than paid amount " + cData.instDet[i].amtPaid + ".");
								return;
							}
						}

					}
				}

				for (var i = cData.instDet.length - 1; i >= 0; i--) {

					if (new Date(cData.lstPayDate) <= new Date(cData.instDet[i].fnPayDt) && new Date(cData.lstPayDate) >= new Date(cData.instDet[i].instStDt)) {
						amtPaid = cData.instDet[i].amtPaid + Number(payAmt);
						if (amtPaid == 0) {
							cData.lstPayDate = "";
							var histAmt = 0,
								prvPyDt;
							for (var j = i - 1; j >= 0; j--) {
								histAmt = 0;
								cData.instDet[j].hist.sort((a, b) => {
									return new Date(a.payDate) - new Date(b.payDate);
								});
								for (var k = 0; k < cData.instDet[j].hist.length; k++) {
									histAmt += Number(cData.instDet[j].hist[k].amt)
									if (Number(cData.instDet[j].hist[k].amt) > 0) {
										prvPyDt = cData.instDet[j].hist[k].payDate;
									}
								}
								if (histAmt > 0) {
									cData.lstPayDate = prvPyDt;
									break;
								}
							}
						}
						break;
					}
				}

				if (cData.lstPayDate) {
					for (var i = cData.instDet.length - 1; i >= 0; i--) {
						if (new Date(cData.lstPayDate) <= new Date(cData.instDet[i].fnPayDt) && new Date(cData.lstPayDate) >= new Date(cData.instDet[i].instStDt)) {
							amtPaid = cData.instDet[i].amtPaid + Number(payAmt);
							var ctr = i;
							if (amtPaid < cData.instDet[i].int) {
								cData.partPay = "X";
							} else {
								cData.partPay = "";
								ctr = i + 1;
							}

							cData.nxtInstsDate = this.formatter.dateFormat(cData.instDet[ctr].instDt);
							cData.odAmt_1 = cData.partPay === "X" ? cData.instDet[ctr].int - amtPaid : cData.instDet[ctr].int;
							cData.odAmt_2 = cData.instDet[ctr + 1].int;
							cData.odAmt_3 = cData.instDet[ctr + 2].int;
							cData.odDat_1 = this.formatter.dateFormat(cData.instDet[ctr].fnPayDt);
							cData.odDat_2 = this.formatter.dateFormat(cData.instDet[ctr + 1].fnPayDt);
							cData.odDat_3 = this.formatter.dateFormat(cData.instDet[ctr + 2].fnPayDt);
							break;
						}
					}
				} else {
					cData.nxtInstsDate = this.formatter.dateFormat(cData.instDet[0].instDt);
					cData.odAmt_1 = cData.instDet[0].int;
					cData.odAmt_2 = cData.instDet[1].int;
					cData.odAmt_3 = cData.instDet[2].int;
					cData.odDat_1 = this.formatter.dateFormat(cData.instDet[0].fnPayDt);
					cData.odDat_2 = this.formatter.dateFormat(cData.instDet[1].fnPayDt);
					cData.odDat_3 = this.formatter.dateFormat(cData.instDet[2].fnPayDt);
				}

			} else {
				cData.nxtInstsDate = "";
				cData.odAmt_1 = "";
				cData.odAmt_2 = "";
				cData.odAmt_3 = "";
				cData.odDat_1 = "";
				cData.odDat_2 = "";
				cData.odDat_3 = "";
			}

			if (payDate && payAmt) {

				cData.payDet.push({
					payDate: payDate,
					amt: payAmt,
					othrAmt: othrAmt,
					lnClsr: lnClsr ? "X" : "",
					crtDt: Date.now().toString()
				});

				cData.modDt = Date.now().toString();
				delete cData.instDet;
				delete cData.intTD
				var oData = this.oModel.getData();

				for (var j in oData) {
					if (oData[j].key === cData.key) {
						oData.splice(j, 1, cData);
						break;
					}
				}

				var that = this;
				var data = JSON.stringify(oData);

				var body = {
					message: "Updating file",
					content: btoa(data),
					sha: window.custsha
				};
				var url = 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json';
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
						that.loadCustData(cData.key);
						that.onCl();
						MessageBox.success("Updated Successfully.")
					},
					error: function(odata) {
						MessageBox.error("Failed to update.")
					}
				});

			}
		},

		onUpdateInt: function() {
			if (this._itDialog) {
				this._itDialog.destroy();
			}
			this._itDialog = sap.ui.xmlfragment("FabFinV3.f.intRate", this);
			this.getView().addDependent(this._itDialog);
			this._itDialog.setModel(new JSONModel($.extend(true, [], this.cModel.getData().roiDet)), "iDialogModel");
			this._itDialog.open();
		},

		onAddROI: function() {
			var month = Math.round(sap.ui.getCore().byId("idMnInp").getValue());
			var roi = sap.ui.getCore().byId("idRoiInp").getValue();

			if (month && roi) {
				var model = this._itDialog.getModel("iDialogModel").getData();
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

				this._itDialog.getModel("iDialogModel").refresh();
			}

		},

		cUpdateInt: function() {

			var cData = this.cModel.getData();

			cData.roiDet = this._itDialog.getModel("iDialogModel").getData();
			cData.modDt = Date.now().toString();
			delete cData.instDet;
			delete cData.intTD
			var oData = this.oModel.getData();

			for (var j in oData) {
				if (oData[j].key === cData.key) {
					oData.splice(j, 1, cData);
					break;
				}
			}

			var that = this;
			var data = JSON.stringify(oData);

			var body = {
				message: "Updating file",
				content: btoa(data),
				sha: window.custsha
			};

			var url = 'https://api.github.com/repos/britmanjerin/tst/contents/cust.json';
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
					that.loadCustData(cData.key);
					MessageBox.success("Updated Successfully.")
				},
				error: function(odata) {
					MessageBox.error("Failed to update.")
				}
			});

			this.onClose();
		},

		onDelIntMonth: function(oEvent) {

			this._itDialog.getModel("iDialogModel").getData().splice(oEvent.getSource().getBindingContext("iDialogModel").getPath().slice(
					"/")[
					1],
				1);
			this._itDialog.getModel("iDialogModel").refresh();
		},

		onShowHistory: function(oEvent) {

			if (this._hDialog) {
				this._hDialog.destroy();
			}
			this._hDialog = sap.ui.xmlfragment("FabFinV3.f.payHistory", this);
			this.getView().addDependent(this._hDialog);
			this._hDialog.bindElement("cModel>" + oEvent.getSource().getBindingContext("cModel").getPath());

			this._hDialog.open();
		},

		onCl: function() {
			if (this._iDialog) {
				this._iDialog.destroy();
			}
			if (this._hDialog) {
				this._hDialog.destroy();
			}
		},
		onClose: function() {
			if (this._itDialog) {
				this._itDialog.destroy();
			}

		},

		getNoOfDays: function(sDate, eDate) {
			return Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
		},

		getMonthRange: function(date) {
			date = new Date("Dec 31,2023");
			var day = date.getDate();
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			//	var nxtMonth = month+1;
			var obj, arr = [];
			for (var i = 0; i < 24; i++) {
				month = month % 12;
				year = !(month) ? year + 1 : year;
				obj = {
					sDt: date,
					eDt: new Date(year, month, day)
				};

				if (month != obj.eDt.getMonth()) {
					obj.eDt = new Date(year, obj.eDt.getMonth(), 0);
				}
				date = obj.eDt;
				obj.eDt = new Date(obj.eDt.getTime() - (1 * 24 * 60 * 60 * 1000));

				arr.push(obj);

				date = new Date(obj.eDt.getTime() + (1 * 24 * 60 * 60 * 1000));
				month += 1;

			}
			return arr;
		},
		onNavBack: function() {
			this.getOwnerComponent().getRouter().navTo("home");
		}

	});
});
