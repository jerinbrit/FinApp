sap.ui.define([], function() {
	"use strict";

	return {

		getExpInstDate: function(date) {
			return new Date(new Date(date).getTime() /*+ (1 * 24 * 60 * 60 * 1000)*/ ).toDateString();
		},

		dateFormat: function(date) {
			var date = date.toDateString().split(" ");
			return date[1] + " " + date[2] + "," + date[3];
		},

		setStatus_h: function(instDet) {
			if (instDet) {

				var lnCls = instDet;

				var ctrl = sap.ui.getCore().byId(this._sOwnerId + "---home").getController().formatter;

				instDet = ctrl.generateLoanData(instDet, false, this).arr;
				var obj = ctrl.setStatus_f(lnCls, instDet);
				this.getParent().getSecondStatus().setState(obj.status);
				this.getParent().getAttributes()[1].setText(obj.instDateText);

				return obj.statusText;

			}

		},
		setStatus_f: function(lnClsd, instDet) {

			/*	var that = this;
				["idObjInstDate", "idObjStatus", "idAmtDue"].forEach(function(e) {
					that.byId(e).setState("None");
					that.byId(e).setText("");
				});*/

			var retObj = {}

			var currDate = new Date(new Date().toDateString());
			if (lnClsd.lnCls || lnClsd.lnRen) {

				/*this.byId("idObjStatus").setState("Success");
				return "Loan Closed";*/

				retObj.status = lnClsd.lnRen ? "Information" : "Success";
				retObj.statusText = lnClsd.lnRen ? "Loan Renewed" : "Loan Closed";

			} else {
				if (instDet) {
					var ci = 0,
						ciObj,
						dc = 0,
						amtPaid_1 = 0,
						cAmtObj,
						expFlg;

					for (var i = instDet.length - 1; i >= 0; i--) {

						if (new Date(currDate) <= new Date(instDet[i].fnPayDt) && new Date(currDate) >= new Date(instDet[i].instStDt)) {
							dc = i;
							cAmtObj = instDet[i];

						}
						amtPaid_1 += instDet[i].amtPaid;

						if ((instDet[i].int - amtPaid_1) <= 0) {
							//	var amtDue = instDet[i + 1].int;
							var amtPaid = 0;
							for (var j = i + 1; j < instDet.length; j++) {
								amtPaid += instDet[j].amtPaid;
							}

							for (var j = i + 1; j < instDet.length; j++) {
								if (amtPaid < instDet[j].int) {
									ci = j;
									break;
								}
							}

							break;
						}
					}
					ciObj = instDet[ci];

					var totTxt = "Total Amount Due: 0",
						totAmtDue = 0;
					if (cAmtObj) {

						if (cAmtObj.no > lnClsd.lnDur) {
								totAmtDue = instDet[Number(lnClsd.lnDur)-1].bPrA ;
								totTxt = "Total Amount Due: " + (totAmtDue) + "+";
								expFlg =true;
						} else {
							totAmtDue = (cAmtObj.int - cAmtObj.amtPaid) > 0 ? (cAmtObj.int - cAmtObj.amtPaid) : 0;
							totTxt = "Total Amount Due: " + (totAmtDue);
						}

					}

					//	this.byId("idAmtDue").setText(totTxt);

					retObj.amtDue = totTxt;

					if (totAmtDue > 0) {
						if (new Date(cAmtObj.instDt) <= currDate) {
							//	this.byId("idObjInstDate").setState("Error");

							retObj.instDateState = "Error";

						}

					}

					var pendPyObj = ciObj,
						pendPayDate;
					if (currDate >= ciObj.instDt) {

						var pi = dc - ci;

						if ((pi) >= 1) {

							var odDays = Math.ceil(Math.abs(new Date(ciObj.instDt) - currDate) / (1000 * 60 * 60 * 24))

							retObj.status = "Error";
							//	this.byId("idObjStatus").setState("Error");

							if (new Date(ciObj.instDt) <= currDate) {

								//	this.byId("idObjInstDate").setState("Error");

								retObj.instDateState = "Error";
							}

							//		this.byId("idObjInstDate").setText("Due on: " + this.formatter.dateFormat(ciObj.instDt));

							var instDateText="";
							if(!expFlg||ciObj.instDt<currDate)
								{
									instDateText = "Due on: " + this.dateFormat(ciObj.instDt);
								}
							else
								{
									
									instDateText = "Due on: " + this.dateFormat(instDet[Number(lnClsd.lnDur)-1].instDt);
									
								}
							
							retObj.instDateText = instDateText;

							if ((pi) == 1) {
								if (ciObj.amtPaid > 0 && ((ciObj.int - ciObj.amtPaid) < (ciObj.int - ciObj.cfInt))) {
									//	return "Partially Overdue for " + (pi) + "+ months";
									retObj.statusText = "Partially Overdue for " + (odDays) + " days";
								}
							}

							if (pi > 1) {
								retObj.notVis = true;
							}

							retObj.statusText = !retObj.statusText ? "Overdue for " + (odDays) + " days" : retObj.statusText;

							//		return "Overdue for " + (pi) + "+ months";

						} else {
							pendPyObj = instDet[pi];
						}

					}

					if (totAmtDue > 0) {

						if (new Date(pendPyObj.instDt) <= currDate) {
							//	this.byId("idObjInstDate").setState("Error");
							retObj.instDateState = "Error";
						}

						//	this.byId("idObjInstDate").setText("Due on: " + this.formatter.dateFormat(pendPyObj.instDt));
						var instDateText="";
							if(!expFlg||pendPyObj.instDt<currDate)
								{
									instDateText = "Due on: " + this.dateFormat(pendPyObj.instDt);
								}
							else
								{
									
									instDateText = "Due on: " + this.dateFormat(instDet[Number(lnClsd.lnDur)-1].instDt);
									retObj.instDateState = "Error";
								}
							
							retObj.instDateText = instDateText;
					//	retObj.instDateText = "Due on: " + this.dateFormat(pendPyObj.instDt);

						pendPayDate = new Date(new Date(pendPyObj.instDt).getTime() - (5 * 24 * 60 * 60 * 1000));

						if (currDate >= pendPayDate && currDate <= new Date(pendPyObj.instDt)) {
							var pDays = Math.ceil(Math.abs(new Date(pendPyObj.instDt) - currDate) / (1000 * 60 * 60 * 24));

							//	this.byId("idObjStatus").setState("Warning");

							retObj.status = "Warning";
							retObj.statusText = pDays == 0 ? "Payment pending today" : "Payment pending in " + (pDays) + " days";

							//		return pDays == 0 ? "Payment pending today" : "Payment pending in " + (pDays) + " days";
						}
					}

				}

			}

			return retObj;
		},

		setStatus_c: function(lnCls, instDet) {
			var that = this;
			["idObjInstDate", "idObjStatus", "idAmtDue"].forEach(function(e) {
				that.byId(e).setState("None");
				that.byId(e).setText("");
			});

			if (instDet) {
				var obj = this.formatter.setStatus_f(lnCls, instDet);

				this.byId("idObjStatus").setState(obj.status);
				this.byId("idAmtDue").setText(obj.amtDue);
				this.byId("idObjInstDate").setState(obj.instDateState);
				this.byId("idObjInstDate").setText(obj.instDateText);

				return obj.statusText;
			}

		},

		setStatus: function(lnCls, instDt, odDat1, odDat2, odDat3, odAmt1, odAmt2, odAmt3, partPay, ctrl) {

			var currDate = new Date(new Date().toDateString());
			if (lnCls) {
				if (!ctrl) {
					this.setState("Success");
					return "Loan Closed";
				}

			}

			if (odDat1 && odDat2 && odDat3) {
				if (currDate > new Date(odDat3)) {
					if (!ctrl) {
						this.setState("Error");
						return "Overdue for 3+ months";
					} else {
						return true;
					}

				}

				if (currDate > new Date(odDat2)) {
					if (!ctrl) {
						this.setState("Error");
						return "Overdue for 2+ months";
					} else {
						return true;
					}

				}

				if (currDate > new Date(odDat1)) {
					if (!ctrl) {
						this.setState("Error");
						if (partPay) {
							return "Partially Overdue for 1+ months";
						} else {
							return "Overdue for 1+ months";
						}
					}

				}
			}

			var pendPayDate = new Date(new Date(instDt).getTime() - (5 * 24 * 60 * 60 * 1000));

			if (currDate >= pendPayDate && currDate <= new Date(instDt)) {
				if (!ctrl) {
					this.setState("Warning");
					return "Payment pending";
				}

			}

		},

		setNotStatus: function(not, dat) {
			if (not && dat) {
				switch (String(not)) {
					case "1":
						return "1st Notice Sent " + "on " + dat;

					case "2":
						return "2nd Notice Sent " + "on " + dat;
					case "3":
						return "3rd Notice Sent " + "on " + dat;

					default:
						return String(not) + "th Notice Sent " + "on " + dat;

				}
			}
		},

		highlightRow: function(inst, lnDur, r) {
			if (inst) {
				if (FabFinV3.currInst) {
					if (FabFinV3.currInst == inst) {

						FabFinV3.currRow = this.getParent().getId();

					} else if (inst > FabFinV3.currInst) {
						FabFinV3.nxtRow.push(this.getParent().getId());
					}

					if (inst > lnDur) {
						FabFinV3.hideRow.push(this.getParent().getId());
					}
				}
				return inst;
			}
		},

		setNxtInstDate: function(date) {
			if (date) {
				this.setState("None");
				if (new Date(date) <= new Date(new Date().toDateString())) {
					this.setState("Error");
				}

			}
			return "Due on: " + date;
		},

		setAmtDue: function(data, nxtDt) {
			var flg;
			if (data && nxtDt) {
				if (new Date(nxtDt) <= new Date(new Date().toDateString())) {
					flg = 1;
				}

				try {
					for (var i in data) {

						if (flg) {
							if (data[i].instDt >= new Date(new Date().toDateString())) {
								if ((data[i].int - data[i].amtPaid) > 0) {
									return "Total Amount Due: " + (data[i].int - data[i].amtPaid);
								}
							}
						} else {
							if (new Date(nxtDt).toDateString() == data[i].instDt.toDateString()) {
								if ((data[i].int - data[i].amtPaid) > 0) {
									return "Total Amount Due: " + (data[i].int - data[i].amtPaid);
								}

							}
						}

					}
				} catch (err) {}

			}
		},
		generateLoanData: function(cModel, initflg, ctrl) {

			var roiArr = cModel.roiDet;
			var pwArr = cModel.pwDet;
			var data = cModel.payDet;
			var dat = cModel.lnDt;

			data.sort((a, b) => {
				return new Date(a.payDate) - new Date(b.payDate);
			});

			var currRoi = Number(cModel.roi);
			var curDtObj = {};

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
			var isLnClsd, isLnRnwd;

			if (new Date(cDate) < new Date(dat)) {
				iEnd = cModel.lnDur;
			}

			var fInstDat,
				fInstMnth = (date.getMonth() + 1) % 12,
				fInstYr = !((date.getMonth() + 1) % 12) ? date.getFullYear() + 1 : date.getFullYear(),
				fInstDay = 5,
				mc = 1;
			for (var i in pwArr) {
				if (date.getDate() >= pwArr[i].frm && date.getDate() <= pwArr[i].to) {
					fInstMnth = (date.getMonth() + pwArr[i].mc) % 12;
					fInstDay = pwArr[i].dt;
					mc = pwArr[i].mc;
					break;
				}
			}
			fInstDat = new Date(fInstYr, fInstMnth, fInstDay);
			if ((date.getMonth() + mc) % 12 != fInstDat.getMonth()) {
				fInstDat = new Date((!((date.getMonth() + mc) % 12) ? date.getFullYear() + 1 : date.getFullYear()), fInstDat.getMonth(), 0);
			}

			for (var i = 1; i <= iEnd; i++) {

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
				var prAmt = 0,
					aiAmt = 0,
					intExc = false,
					balPdAmt = 0;
				for (var j in data) {

					if (new Date(data[j].payDate) <= new Date(pObj.fnPayDt) && new Date(data[j].payDate) >= new Date(pObj.instStDt)) {
						pObj.amtPaid += Number(data[j].amt);
						pObj.payDate = Number(data[j].amt) > 0 ? data[j].payDate : pObj.payDate;
						pObj.hist.push(data[j]);
						isLnClsd = (data[j].lnClsr || data[j].lnRen) ? true : false;
						isLnRnwd = (data[j].lnRen) ? true : false;

						if (pObj.amtPaid > pObj.int) {

							if (!intExc) {
								intExc = true;
								balPdAmt = pObj.amtPaid - (pObj.int < 0 ? 0 : pObj.int);
							} else {
								balPdAmt = Number(data[j].amt);
							}

							if (data[j].xAmtOp == "2") {
								prAmt += balPdAmt;

							} else {
								aiAmt += balPdAmt;
							}

						} else {
							aiAmt = 0;
							prAmt = 0;
							intExc = false;
						}

					}
				}

				instStDt = new Date(new Date(pObj.fnPayDt).getTime() + (1 * 24 * 60 * 60 * 1000));

				/*	if (pObj.amtPaid > pObj.int) {
						bPrA -= (pObj.amtPaid - pObj.int);
					}*/
				bPrA -= prAmt;

				cfInt = 0;
				if (pObj.amtPaid < pObj.int) {
					cfInt = (pObj.int - pObj.amtPaid);
				} else if (aiAmt > 0) {
					cfInt = -aiAmt;
				}

				if (pObj.int < 0) {
					cfInt += pObj.int;
				}

				pObj.bPrA = bPrA;

				//	tmpDate = new Date(new Date(pObj.intTo).getTime() + (1 * 24 * 60 * 60 * 1000)).toDateString();

				if (new Date(cDate) <= new Date(pObj.intTo) && new Date(cDate) >= new Date(pObj.intFrm)) {
					iEnd = i + 12;
					currRoi = tRoi;
					curDtObj = pObj;

					if (initflg) {
						FabFinV3.currInst = pObj.no;
					}

					//	that.byId("idAmtDue").setText ("Total Amount Due: "+pObj.int);

				}

				pObj.intFrm = new Date(pObj.intFrm);
				pObj.intTo = new Date(pObj.intTo);
				pObj.payDate = pObj.payDate ? new Date(pObj.payDate) : "";
				pObj.fnPayDt = new Date(pObj.fnPayDt);
				pObj.instStDt = new Date(pObj.instStDt);

				if (isLnClsd) {
					var intLnAmt = Number(cModel.lnAmt);
					if (isLnRnwd) {
						intLnAmt = intLnAmt - Number(cModel.trPra || cModel.lnAmt);
					}

					pObj.int = Number(pObj.amtPaid) - Number(intLnAmt);
					pObj.int = pObj.int > 0 ? pObj.int : 0;
					pObj.bPrA = 0;
					pObj.cfInt = 0;
					if (initflg) {
						FabFinV3.currInst = 0;
					}

				}

				if (initflg) {
					ctrl.getView().getModel("refreshModel").getData().r = pObj.no;
					ctrl.getView().getModel("refreshModel").refresh();
				}

				pArr.push(pObj);

				if (isLnClsd) {
					break;
				}

			}

			var retObj = {
				arr: pArr,
				currRoi: currRoi,
				curDtObj: curDtObj
			}

			return retObj;

		},

		setLnExpTxt: function(lnDt, lnDur, flg, payDate) {

			if (!flg) {
				this.removeStyleClass("classLnExpAttr");
				this.removeStyleClass("classLnExpPdAttr");
			}

			if (lnDt && lnDur) {
				var ctrl = flg ? flg.formatter : (sap.ui.getCore().byId(this._sOwnerId + "---home") ? sap.ui.getCore().byId(this._sOwnerId +
						"---home").getController().formatter :
					sap.ui.getCore().byId(
						this._sOwnerId + "---cust").getController().formatter);
				var ed = ctrl.getLnEdDt(new Date(lnDt), Number(lnDur), 1);
				var currDate = payDate ? new Date(payDate) : new Date(new Date().toDateString());
				var odDays;
				odDays = Math.ceil(Math.abs(currDate - ed) / (1000 * 60 * 60 * 24));
				if (currDate > ed) {
					if (!flg) {
						this.addStyleClass("classLnExpAttr");
					}

					return "Loan duration expired on " + ctrl.dateFormat(ed);
				} else {
					if (odDays <= 30) {
						if (!flg) {
							this.addStyleClass("classLnExpPdAttr");
						}

						return odDays === 0 ? "Loan duration expires today" : "Loan duration expires in " + odDays + " days";
					}
				}

			}
		},

		getLnEdDt: function(dt, ld, ct) {
			ld = ld ? ld : 12;
			var ed = new Date(dt.valueOf());
			ed.setMonth(ed.getMonth() + ld);
			if ((ed.getDate()) != dt.getDate()) {
				ed = new Date(ed.getFullYear(), ed.getMonth(), 0);
			}
			ed.setDate(ed.getDate() - ct);

			return ed;
		}


	};

});
