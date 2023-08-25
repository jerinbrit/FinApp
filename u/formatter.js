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
					return "Lone Closed";
				}

				if (odDat1 && odDat2 && odDat3) {
					if (currDate > new Date(odDat3)) {
						return "Payment Overdue for 3+ months";
					}

					if (currDate > new Date(odDat2)) {
						return "Payment Overdue for 2+ months";
					}

					if (currDate > new Date(odDat1)) {
						if (partPay) {
							return "Partial Payment Overdue for 1+ months";
						} else {
							return "Payment Overdue for 1+ months";
						}

					}
				}

				var pendPayDate = new Date(new Date(instDt).getTime() - (5 * 24 * 60 * 60 * 1000));

				if (currDate >= pendPayDate && currDate <= new Date(instDt)) {
					return "Payment pending";
				}

			}
		

	};

});
