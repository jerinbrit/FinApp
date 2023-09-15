sap.ui.define([
	"FabFinV3/c/BaseController",
	"sap/ui/model/json/JSONModel",
	"FabFinV3/u/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/library"
], function(BaseController, JSONModel, formatter, MessageBox, MessageToast, mobileLibrary) {
	"use strict";
	FabFinV3.URLHelper = mobileLibrary.URLHelper;
	return BaseController.extend("FabFinV3.c.View2", {

		formatter: formatter,

		onInit: function() {

			window.custsha;
			this.rCount = 0;
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

			if (window.testRun) {
				this.custurl = "https://api.github.com/repos/britmanjerin/tst/contents/cust.json";
				this.byId("idStopTR").setVisible(true);
			} else {
				this.custurl = "https://api.github.com/repos/britmanjerin/tst/contents/cust_p.json";
				this.byId("idStopTR").setVisible(false);
			}

			this.byId("idInstTab").addStyleClass("classColumnHide");

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

			this.uModel = new JSONModel();
			this.getView().setModel(this.uModel, "uModel");
			this.setUModel();

			this.custId = evt.getParameter("arguments").custId;
			this.loadCustData(evt.getParameter("arguments").custId);
			this.oModel = new JSONModel();
			this.getView().setModel(this.oModel, "oModel");
			this.cModel = new JSONModel();
			this.getView().setModel(this.cModel, "cModel");
			this.getView().getModel("refreshModel").getData().r = false;

		},

		clickPhone: function(oEvent) {
			FabFinV3.URLHelper.triggerTel(oEvent.getSource().getText());
		},

		clickEmail: function(oEvent) {
			FabFinV3.URLHelper.triggerEmail(oEvent.getSource().getText(), "Info Request", false, false, false, true);
		},

		setUModel: function() {
			var adm = this.validateCookie("user").substr(0, 1) === "A" ? true : false;
			this.uModel.setData({
				"adm": adm
			});
		},

		handleRefresh: function() {
			this.byId("idInstTab").addStyleClass("classColumnHide");
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
					e.removeStyleClass("classOpacity");
					e.removeStyleClass("classHideRow");
					if (FabFinV3.currRow == e.getId()) {
						e.addStyleClass("classHighlightGreen");
						try {
							//	$("#" + e.getId() + "-sub").css("background", "#ebffeb");
							$("#" + e.getId() + "-sub").attr('style', 'background: rgb(171 226 171 / 40%)!important');
						} catch (err) {}
					}

					if (FabFinV3.nxtRow.length > 0) {
						FabFinV3.nxtRow.forEach(function(el) {

							if (el == e.getId()) {
								e.addStyleClass("classOpacity");
								try {
									$("#" + e.getId() + "-sub").css("opacity", "0.3");
								} catch (err) {}
							}

						});
					}

					if (FabFinV3.hideRow.length > 0) {
						FabFinV3.hideRow.forEach(function(el) {

							if (el == e.getId()) {
								e.addStyleClass("classHideRow");
								try {
									$("#" + e.getId() + "-sub").css("display", "none");
								} catch (err) {}
							}

						});
					}

				});

			}
		},
		loadCustData: function(custId) {
			var config = {};
			if (!this.uModel.getData().adm) {
				if (!sap.ui.getCore().getModel("config")) {
					this.onNavBack();
					return;
				} else {
					config = sap.ui.getCore().getModel("config").getData();
				}
			}

			this.getView().setModel(new JSONModel(config), "config");
			var rCount = 0;
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			$.ajax({
				type: 'GET',
				headers: this.headers,
				url: this.custurl,
				cache: false,
				success: function(odata) {
					if (!window.custsha) {
						window.custsha = odata.sha;
					} else {
						if (window.custsha != odata.sha) {

							if (that.rCount > 2) {
								window.location.reload();
							} else {
								that.rCount++;
								$.sap.delayedCall(3000, this, function() {
									that.loadCustData(custId);
								});

							}

							return;
						}

						that.rCount = 0;
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

							that.byId("idNotBtn").setVisible(false);
							if ((data[i].lnCls || data[i].lnRen) && (that.uModel.getData().adm || that.getView().getModel("config").getData().ls)) {
								that.calcSummary(data[i]);
							}

							that.cModel.setData(data[i]);
							that.calPayData();
							if ((that.uModel.getData().adm || that.getView().getModel("config").getData().not)) {
								var visNotBtn;

								try {
									if (data[i].notDet.length > 0) {
										visNotBtn = true;
									}
								} catch (err) {}

								visNotBtn = !visNotBtn ? that.formatter.setStatus_f(data[i], data[i].instDet).notVis : visNotBtn;

								if (visNotBtn) {
									if (!data[i].notDet) {
										data[i].notDet = [];
									}
									that.byId("idNotBtn").setVisible(true);
								}

							}

							that.cModel.refresh();
							break;
						}
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError.responseJSON.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		calcSummary: function(data) {
			var totAmt = 0,
				intAmt = 0,
				defAmt = data.defAmt;
			data.payDet.forEach(function(e) {
				totAmt += Number(e.amt);
			});

			var lnAmt = Number(data.lnAmt);

			if (data.lnRen) {
				lnAmt = lnAmt - Number(data.trPra || data.lnAmt);
			}

			intAmt = totAmt - Number(lnAmt);

			intAmt = intAmt > 0 ? intAmt : 0;

			this.byId("idTotPaid").setText("Total Amount Paid: " + totAmt);
			this.byId("idIntEarn").setText("Profit: " + intAmt);
			this.byId("idDefAmt").setText("Default Amount: " + defAmt);
		},

		calPayData: function() {

			var cModel = this.cModel.getData();

			/*	
				var roiArr = cModel.roiDet;
				var pwArr = cModel.pwDet;
				var data = cModel.payDet;
				data.sort((a, b) => {
					return new Date(a.payDate) - new Date(b.payDate);
				});

				var currRoi = Number(cModel.roi);
				var curDtObj = {};*/

			FabFinV3.currInst = 0;
			FabFinV3.currRow = "";
			FabFinV3.nxtRow = [];
			FabFinV3.hideRow = [];
			var that = this;

			var lnData = this.formatter.generateLoanData(cModel, true, this);

			cModel.instDet = lnData.arr;
			var currRoi = lnData.currRoi;
			var curDtObj = lnData.curDtObj;

			try {
				$.sap.delayedCall(100, this, function() {
					that.byId("idInstTab").rerender();
					that.byId("idInstTab").removeStyleClass("classColumnHide");
				});

				curDtObj.intTD = Math.round(curDtObj.prA * this.getNoOfDays(new Date(cModel.lnDt), new Date(new Date().toDateString())) *
					currRoi / 100 * 1 / 365);

				cModel.intTD = curDtObj;

			} catch (err) {}

		},

		onSelLC: function(oEvent, act) {
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

			act === "R" ? sap.ui.getCore().byId("idCB").setSelected(false) : sap.ui.getCore().byId("idCBR").setSelected(false);

			sap.ui.getCore().byId("idGAHB").setVisible(sap.ui.getCore().byId("idCB").getSelected());
			sap.ui.getCore().byId("idOthrAmtVB").setVisible(oEvent.getSource().getSelected());
			this.calAmtTD();

		},

		calAmtTD: function(flg) {
			if (flg === '1') {
				sap.ui.getCore().byId("idOthrAmtVB").setVisible(false);
				sap.ui.getCore().byId("idCB").setSelected(false);
				sap.ui.getCore().byId("idCBR").setSelected(false);
			}

			if (sap.ui.getCore().byId("idNtve").getSelected()) {
				sap.ui.getCore().byId("idCB").setSelected(false);
				sap.ui.getCore().byId("idCBR").setSelected(false);
				sap.ui.getCore().byId("idOthrAmtVB").setVisible(false);
			}

			var cData = this.cModel.getData();
			var othrAmt = sap.ui.getCore().byId("idOthrAmt").getValue();
			var payDate = sap.ui.getCore().byId("idPayDate").getValue() || new Date().toDateString();
			var amtToPay;
			var curDtObj;
			for (var i = cData.instDet.length - 1; i >= 0; i--) {
				if (new Date(payDate) <= new Date(cData.instDet[i].fnPayDt) && new Date(payDate) >= new Date(cData.instDet[i].instStDt)) {
					curDtObj = cData.instDet[i];
					break;
				}
			}
			if (sap.ui.getCore().byId("idCB").getSelected()) {

				cData.intTD = curDtObj;
				//	var intCurMnth = curDtObj.int - curDtObj.cfInt;

				var curIntdays = Math.ceil(Math.abs(new Date(payDate) - curDtObj.intFrm) / (1000 * 60 * 60 * 24)) + 1;
				var intTD = 0;
				if (curIntdays > 15) {
					intTD = curDtObj.int;
				} else {
					/*intTD = Math.round(curDtObj.prA * this.getNoOfDays(new Date(curDtObj.intFrm), new Date(payDate)) *
						curDtObj.roi / 100 * 1 / 365);*/

					intTD = Math.round(curDtObj.prA * 15 * curDtObj.roi / 100 * 1 / 365);

					intTD = intTD + curDtObj.cfInt;
				}

				amtToPay = (curDtObj.prA + Number(othrAmt) + intTD - curDtObj.amtPaid);
			} else {
				//	var lnEndDate = this.formatter.getLnEdDt(new Date(cData.lnDt),Number(cData.lnDur));
				if (!cData.instDet[Number(cData.lnDur) - 1]) {
					MessageBox.error("Loan renewal not possible");
					sap.ui.getCore().byId("idCBR").setSelected();
					sap.ui.getCore().byId("idOthrAmtVB").setVisible(false);

					return;
				}

				amtToPay = cData.instDet[Number(cData.lnDur) - 1].int - cData.instDet[Number(cData.lnDur) - 1].amtPaid;
				amtToPay = amtToPay < 0 ? 0 : amtToPay;
				amtToPay = amtToPay + Number(othrAmt);
			}

			sap.ui.getCore().byId("idTot").setText(amtToPay);

			this.calcIntDet(curDtObj);

		},

		calcIntDet: function(obj) {
			sap.ui.getCore().byId("idIntDetVB").setVisible(false);
			sap.ui.getCore().byId("idRB").setSelectedIndex(0);
			if (!sap.ui.getCore().byId("idCBR").getSelected() && !sap.ui.getCore().byId("idCB").getSelected() && !sap.ui.getCore().byId(
					"idNtve").getSelected()) {
				var pAmt = sap.ui.getCore().byId("idPayAmt").getValue();
				//	var balAmt = (Number(obj.amtPaid) + Number(pAmt)) - Number(obj.int);
				var balAmt = 0;
				var int = obj.int < 0 ? 0 : obj.int;
				if (Number(pAmt) > 0) {
					if (Number(obj.amtPaid) > Number(int)) {
						balAmt = Number(pAmt);
					} else {
						balAmt = (Number(obj.amtPaid) + Number(pAmt)) - Number(int);
					}

					if (balAmt > 0) {
						sap.ui.getCore().byId("idIntDetVB").setVisible(true);
						sap.ui.getCore().byId("idIntDetTxt").setText("Total interest to be collected for period from " + this.formatter.dateFormat(obj.intFrm) +
							" to " + this.formatter.dateFormat(obj.intTo) + " is " + int +
							".\n\nKindly choose from below option to handle the balance amount " + balAmt + ".");
					}
				}

			}
		},

		onAddInst: function(oEvent) {
			if (this._iDialog) {
				this._iDialog.destroy();
			}
			this._iDialog = sap.ui.xmlfragment("FabFinV3.f.AddInst", this);
			this.getView().addDependent(this._iDialog);

			var cModel = this.cModel.getData();

			var lnexp = this.formatter.setLnExpTxt(cModel.lnDt, cModel.lnDur, this);

			if (!lnexp) {
				sap.ui.getCore().byId("idLRVB").setVisible(false);
			}

			sap.ui.getCore().byId("idPayDate").setMinDate(new Date(cModel.lnDt));

			sap.ui.getCore().byId("idPayDate").setMaxDate(new Date());

			this._iDialog.open();
		},

		onSubmit: function(oEvent) {

			var payDate = sap.ui.getCore().byId("idPayDate").getValue() || new Date().toDateString();
			var payAmt = sap.ui.getCore().byId("idPayAmt").getValue();
			var lnClsr = sap.ui.getCore().byId("idCB").getSelected();
			var lnRen = sap.ui.getCore().byId("idCBR").getSelected();
			var othrAmt = Number(sap.ui.getCore().byId("idOthrAmt").getValue());

			var isNeg = sap.ui.getCore().byId("idNtve").getSelected();

			if (Number(payAmt) < 0) {
				MessageBox.error("Amount cannot be negative");
				return;
			}

			payAmt = isNeg ? -Number(payAmt) : payAmt;

			var cData = this.cModel.getData();

			var lnexp = this.formatter.setLnExpTxt(cData.lnDt, cData.lnDur, this, payDate);

			if (lnexp && lnexp.indexOf("expired") >= 0) {
				if (!lnClsr && !lnRen) {
					MessageBox.error("Loan duration expired. Kindly choose Loan closure or Loan renewal to proceed.");
					return;
				}
			}

			if (sap.ui.getCore().byId("idIntDetVB").getVisible() && !sap.ui.getCore().byId("idAIP").getSelected() && !sap.ui.getCore().byId(
					"idPR").getSelected()) {

				MessageBox.error("Kindly choose from above option to handle the balance amount.");
				return;
			}

			if (lnClsr || lnRen) {

				var amtToPay = Number(sap.ui.getCore().byId("idTot").getText());

				if (Math.abs(amtToPay - Number(payAmt)) > 100) {
					MessageBox.error("Pending Amount to be collected is " + (amtToPay));
					return;
				}

				cData.defAmt = (amtToPay - Number(payAmt)) > 0 ? (amtToPay - Number(payAmt)) : 0;
				cData.clsDt = Date.now().toString();
				cData.lnCls = lnClsr ? "X" : "";
				cData.lnRen = lnRen ? "X" : "";
				cData.othrAmt = othrAmt;
				cData.goldAuctn = sap.ui.getCore().byId("idGA").getSelected() ? "X" : "";
				cData.notice = 0;
				cData.notDat = "";

				if (othrAmt < 0) {
					cData.defAmt += (-othrAmt);
				}

			}

			var currInstObj, currInstCt;

			for (var i = 0; i < cData.instDet.length; i++) {
				if (new Date(payDate) <= new Date(cData.instDet[i].fnPayDt) && new Date(payDate) >= new Date(cData.instDet[i].instStDt)) {
					currInstObj = cData.instDet[i];
					currInstCt = i;
					break;
				}
			}

			if (!lnClsr) {

				if (Number(payAmt) < 0) {
					if ((-Number(payAmt)) > currInstObj.amtPaid) {
						MessageBox.error("Reversal amount greater than paid amount " + cData.instDet[i].amtPaid + ".");
						return;
					}
				}

			}

			if (sap.ui.getCore().byId("idIntDetVB").getVisible() && sap.ui.getCore().byId("idAIP").getSelected()) {

				var fInstAmt = 0;

				for (var k = cData.instDet.length - 1; k >= 0; k--) {
					if (cData.instDet[k].no == cData.lnDur) {
						fInstAmt = cData.instDet[k].int;
						break;
					}
				}

				if ((Number(payAmt) + currInstObj.amtPaid) > fInstAmt) {
					MessageBox.error("You cannot pay amount more than " + fInstAmt + " as interest payment.");
					return;
				}

			}

			if (lnRen) {
				var copyData = $.extend(true, {}, cData);
				delete copyData.instDet;
				delete copyData.intTD;

				copyData.lnRen = copyData.clsDt = "";
				cData.renKey = copyData.crtDt = copyData.key = copyData.modDt = Date.now().toString();
				copyData.preKey = cData.key;
				copyData.payDet = [];
				copyData.roiDet = [copyData.roiDet[copyData.roiDet.length - 1]];
				copyData.roiDet[0].month = 1;
				copyData.roiDet[0].modDt = Date.now().toString();
				copyData.lnDt = this.formatter.dateFormat(this.formatter.getLnEdDt(new Date(cData.lnDt), Number(cData.lnDur), 0));
				copyData.othrAmt = copyData.defAmt = 0;
				copyData.lnAmt = cData.trPra = cData.instDet[cData.instDet.length - 1].prA;
				copyData.goldRt = copyData.lnAmt / Number(copyData.goldGms);

			}

			if (payDate && payAmt) {
				cData.payDet.push({
					payDate: payDate,
					amt: payAmt,
					othrAmt: othrAmt,
					lnClsr: lnClsr ? "X" : "",
					lnRen: lnRen ? "X" : "",
					crtDt: Date.now().toString(),
					xAmtOp: !sap.ui.getCore().byId("idIntDetVB").getVisible() ? "" : sap.ui.getCore().byId("idAIP").getSelected() ? "1" : "2"
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

				if (lnRen) {
					oData.push(copyData);
				}

				this.updateFile(oData);
				this.onCl();

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

			this.updateFile(oData);

			this.onClose();

		},

		onDelIntMonth: function(oEvent) {

			this._itDialog.getModel("iDialogModel").getData().splice(oEvent.getSource().getBindingContext("iDialogModel").getPath().split(
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

		onUpdateNot: function(oEvent) {

			if (this._nDialog) {
				this._nDialog.destroy();
			}
			this._nDialog = sap.ui.xmlfragment("FabFinV3.f.Notice", this);
			this.getView().addDependent(this._nDialog);

			var dat = [],
				obj;

			var cModel = this.cModel.getData();

			var model = $.extend(true, [], cModel.notDet);

			if (!cModel.notice) {
				sap.ui.getCore().byId("idRecalBtn").setVisible(false);
			}

			if (!this.formatter.setStatus_f(cModel, cModel.instDet).notVis) {
				sap.ui.getCore().byId("idsendNotBtn").setVisible(false);
			}

			if (!sap.ui.getCore().byId("idsendNotBtn").getVisible() && !sap.ui.getCore().byId("idRecalBtn").getVisible()) {
				sap.ui.getCore().byId("idNotDate").setVisible(false);
			}

			for (var i in model) {
				obj = {};
				model[i].no = model[i].recall ? "X" : model[i].no;
				switch (String(model[i].no)) {
					case "1":
						obj.tit = "1st Notice Sent";
						obj.stat = "Low";
						obj.dat = model[i].date;
						break;
					case "2":
						obj.tit = "2nd Notice Sent";
						obj.stat = "Low";
						obj.dat = model[i].date;
						break;
					case "3":
						obj.tit = "3rd Notice Sent";
						obj.stat = "Low";
						obj.dat = model[i].date;
						break;
					case "X":
						obj.tit = "Recalled";
						obj.stat = "High";
						obj.dat = model[i].date;
						break;
					default:
						obj.tit = model[i].no + "th Notice Sent";
						obj.stat = "Low";
						obj.dat = model[i].date;
				}

				dat.push(obj);
			}

			this._nDialog.setModel(new JSONModel(dat), "nDialogModel");

			this._nDialog.open();
		},
		cUpdateNot: function(flag) {

			var notDate = sap.ui.getCore().byId("idNotDate").getValue() || new Date().toDateString();

			if (notDate) {
				var cData = this.cModel.getData();

				cData.notDet.push({
					no: cData.notice ? Number(cData.notice) + 1 : 1,
					date: notDate,
					recall: flag == "R" ? "X" : "",
					modDt: Date.now().toString()
				});

				cData.notice = cData.notice ? Number(cData.notice) + 1 : 1;
				cData.notDat = notDate;
				cData.notice = flag == "R" ? 0 : cData.notice;
				cData.notDat = flag == "R" ? "" : cData.notDat;

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

				this.updateFile(oData);
				this.onCl();

			}
		},

		onCl: function() {
			if (this._iDialog) {
				this._iDialog.destroy();
			}
			if (this._hDialog) {
				this._hDialog.destroy();
			}
			if (this._nDialog) {
				this._nDialog.destroy();
			}
		},
		onClose: function() {
			if (this._itDialog) {
				this._itDialog.destroy();
			}
			if (this._oDialog) {
				this._oDialog.destroy();
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

		onEditCust: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
			this._oDialog = sap.ui.xmlfragment("idcf", "FabFinV3.f.AddCust", this);
			this.getView().addDependent(this._oDialog);
			this._oDialog.setModel(new JSONModel($.extend(true, {}, this.cModel.getData())), "oDialogModel");
			sap.ui.getCore().byId("idcf--idLnDt").setMaxDate(new Date());
			sap.ui.getCore().byId("idcf--idAddBtn").setText("Update");
			sap.ui.getCore().byId("idcf--idInstDet").setVisible(false);
			sap.ui.getCore().byId("idcf--idelVB").setVisible(true);

			this._oDialog.open();
		},

		onAddGoldItems: function(oEvent) {

			var gArr = this.formatter.fillGArr();
			var cArr = this._oDialog.getModel("oDialogModel").getData().gDet;
			try {

				for (var i in gArr) {
					for (var j in cArr) {
						if (gArr[i].name == cArr[j].name) {
							gArr[i].value = cArr[j].value;
							break;
						}
					}
				}

			} catch (err) {}

			this._oDialog.getModel("oDialogModel").getData().gDet = gArr;

			if (this._gDialog) {
				this._gDialog.destroy();
			}
			this._gDialog = sap.ui.xmlfragment("FabFinV3.f.GoldDetail", this);
			this._oDialog.addDependent(this._gDialog);
			this._gDialog.openBy(oEvent.getSource());
		},

		showGoldDetails: function(oEvent) {
			if (this._gDialog) {
				this._gDialog.destroy();
			}
			this._gDialog = sap.ui.xmlfragment("FabFinV3.f.GoldDetail", this);

			var data = $.extend(true, {}, this.cModel.getData());
			data.gDet.forEach(function(e) {
				e.edit = true;
			});

			this._gDialog.setModel(new JSONModel(data), "oDialogModel");
			this._gDialog.openBy(oEvent.getSource());
		},

		cAddCust: function() {

			var nwData = this._oDialog.getModel("oDialogModel").getData();

			if (!nwData.name.trim() || !nwData.id.trim() || !nwData.mob.trim() || Number(nwData.goldGms) <= 0 || Number(nwData.lnAmt) <= 0) {
				MessageBox.error("Please fill all the required fields");
				return;
			}

			for (var i = nwData.gDet.length - 1; i >= 0; i--) {
				if (Number(nwData.gDet[i].value) == 0) {
					nwData.gDet.splice(i, 1);
				}
			}
			
			nwData.goldRt = Number(nwData.goldRt).toFixed(3);

			var cData = nwData;

			cData.modDt = Date.now().toString();

			delete cData.instDet;
			delete cData.intTD;

			var oData = this.oModel.getData();

			for (var j in oData) {
				if (oData[j].key === cData.key) {
					oData.splice(j, 1, cData);
					break;
				}
			}

			this.updateFile(oData);

			this.onClose();

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

			this._oDialog.getModel("oDialogModel").refresh();

		},

		onPressCustDel: function() {
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

				var cData = that.cModel.getData();

				var oData = that.oModel.getData();

				for (var j in oData) {
					if (oData[j].key === cData.key) {
						oData.splice(j, 1);
						break;
					}
				}

				that.updateFile(oData, 1);
				that.onClose();

			}
		},

		updateFile: function(oData, del) {
			var key = this.cModel.getData().key;
			var that = this;
			var data = JSON.stringify(oData);

			var body = {
				message: "Updating file",
				content: btoa(data),
				sha: window.custsha
			};
			var url = this.custurl;
			sap.ui.core.BusyIndicator.show(0);
			this.byId("idInstTab").addStyleClass("classColumnHide");
			$.ajax({
				type: 'PUT',
				url: url,
				headers: that.headers,
				data: JSON.stringify(body),
				dataType: 'text',
				success: function(odata) {
					window.custsha = JSON.parse(odata).content.sha;
					sap.ui.core.BusyIndicator.hide();
					if (del) {
						MessageToast.show("Deleted Successfully.")
						that.onNavBack();
					} else {

						that.loadCustData(key);
						MessageBox.success("Updated Successfully.")
					}

				},
				error: function(odata) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error("Failed.")
				}
			});
		},

		onTestRun: function(evt) {
			window.testRun = false;
			window.mainsha = null;
			window.custsha = null;
			this.onNavBack();
		},

		onNavBack: function() {
			this.getOwnerComponent().getRouter().navTo("home");
		},
		onNavLP: function(obj) {
			this.getOwnerComponent().getRouter().navTo("login");
		}

	});
});
