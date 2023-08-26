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
					return "Lone Closed";
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

			}
		

	};

});
