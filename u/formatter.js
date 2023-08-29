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

		setStatus: function(lnCls, instDt, odDat1, odDat2, odDat3, odAmt1, odAmt2, odAmt3, partPay) {

			var currDate = new Date(new Date().toDateString());
			if (lnCls) {
				this.setState("Success");
				return "Loan Closed";
			}

			if (odDat1 && odDat2 && odDat3) {
				if (currDate > new Date(odDat3)) {
					this.setState("Error");
					return "Overdue for 3+ months";
				}

				if (currDate > new Date(odDat2)) {
					this.setState("Error");
					return "Overdue for 2+ months";
				}

				if (currDate > new Date(odDat1)) {
					this.setState("Error");
					if (partPay) {
						return "Partially Overdue for 1+ months";
					} else {
						return "Overdue for 1+ months";
					}

				}
			}

			var pendPayDate = new Date(new Date(instDt).getTime() - (5 * 24 * 60 * 60 * 1000));

			if (currDate >= pendPayDate && currDate <= new Date(instDt)) {
				this.setState("Warning");
				return "Payment pending";
			}

		},

		highlightRow: function(inst,r) {
			if (inst) {
				if (FabFinV3.currInst) {
					if (FabFinV3.currInst == inst) {

						FabFinV3.currRow = this.getParent().getId();

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
		}

	};

});
