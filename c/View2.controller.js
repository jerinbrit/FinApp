sap.ui.define(["FabFinV3/c/BaseController","sap/ui/model/json/JSONModel","FabFinV3/u/formatter","sap/m/MessageBox","sap/m/MessageToast","sap/m/library"],function(t,s,e,m,n,i){"use strict";return FabFinV3.URLHelper=i.URLHelper,t.extend("FabFinV3.c.View2",{formatter:e,onInit:function(){window.custsha,this.rCount=0,this.getView().setModel(new s({}),"refreshModel"),this.getOwnerComponent().getRouter().getRoute("customer").attachPatternMatched(this._onObjectMatched,this),this.byId("idInstTab").addEventDelegate({onAfterRendering:function(){this.highlightRow()}},this)},_onObjectMatched:function(t){if(window.testRun?(this.custurl="https://api.github.com/repos/britmanjerin/tst/contents/cust.json",this.byId("idStopTR").setVisible(!0)):(this.custurl="https://api.github.com/repos/britmanjerin/tst/contents/cust_p.json",this.byId("idStopTR").setVisible(!1)),this.byId("idInstTab").addStyleClass("classColumnHide"),!this.headers){var e=this.validateCookie("aKey");if(!e)return void this.onNavLP();this.headers={Authorization:"Bearer "+e,Accept:"application/vnd.github.v3+json","Content-Type":"application/json"}}this.uModel=new s,this.getView().setModel(this.uModel,"uModel"),this.setUModel(),this.custId=t.getParameter("arguments").custId,this.loadCustData(t.getParameter("arguments").custId),this.oModel=new s,this.getView().setModel(this.oModel,"oModel"),this.cModel=new s,this.getView().setModel(this.cModel,"cModel"),this.getView().getModel("refreshModel").getData().r=!1},clickPhone:function(t){var o=this.byId("idObjStatus").getState(),n=t.getSource().getText(),s=this,e=!(!this.uModel.getData().adm&&!this.getView().getModel("config").getData().sms);function i(){FabFinV3.URLHelper.triggerTel(n)}"Error"!=o&&"Warning"!=o||!e?i():new sap.m.Popover({showHeader:!1,placement:"Bottom",content:[new sap.m.CustomListItem({type:"Active",content:[new sap.m.Button({type:"Accept",icon:"sap-icon://call",text:"Call",press:i}).addStyleClass("sapUiTinyMarginTopBottom").addStyleClass("sapUiSmallMarginBeginEnd")]}),new sap.m.CustomListItem({type:"Active",content:[new sap.m.Button({type:"Ghost",icon:"sap-icon://message-popup",text:"SMS",press:function(){var t=s.byId("idObjInstDate").getText().split(": ")[1],e=s.byId("idAmtDue").getText().split(": ")[1],i="iOS"==sap.ui.Device.os.name?"&":"?";{var a;t&&e&&(a=s.getView().getModel("config").getData().iaSMS,e=a?" of Rs."+e:"",a="Dear "+s.cModel.getData().name+",\n\n",a+="Error"==o?"Your minimum due payment"+e+" was not received on "+t+". As previously stated, starting from the following month, the interest rate will increase for each subsequent month.\n\nThanks,\nJJB Finance":"You have a minimum payment"+e+" due on "+t+". Please ensure that you make the payment before the due date to avoid incurring additional charges.\n\nThanks,\nJJB Finance",a="sms:"+n+i+"body="+encodeURIComponent(a),window.location.href=a)}}}).addStyleClass("sapUiTinyMarginTopBottom").addStyleClass("sapUiSmallMarginBeginEnd")]})]}).openBy(t.getSource())},clickEmail:function(t){FabFinV3.URLHelper.triggerEmail(t.getSource().getText(),"Info Request",!1,!1,!1,!0)},setUModel:function(){var t="A"===this.validateCookie("user").substr(0,1);this.uModel.setData({adm:t})},handleRefresh:function(){this.byId("idInstTab").addStyleClass("classColumnHide"),setTimeout(function(){this.byId("pullToRefresh").hide(),this.loadCustData(this.custId)}.bind(this),10)},highlightRow:function(){FabFinV3.currRow&&this.byId("idInstTab").getItems().forEach(function(e){if(e.removeStyleClass("classHighlightGreen"),e.removeStyleClass("classOpacity"),e.removeStyleClass("classHideRow"),FabFinV3.currRow==e.getId()){e.addStyleClass("classHighlightGreen");try{$("#"+e.getId()+"-sub").attr("style","background: rgb(171 226 171 / 40%)!important")}catch(t){}}0<FabFinV3.nxtRow.length&&FabFinV3.nxtRow.forEach(function(t){if(t==e.getId()){e.addStyleClass("classOpacity");try{$("#"+e.getId()+"-sub").css("opacity","0.3")}catch(t){}}}),0<FabFinV3.hideRow.length&&FabFinV3.hideRow.forEach(function(t){if(t==e.getId()){e.addStyleClass("classHideRow");try{$("#"+e.getId()+"-sub").css("display","none")}catch(t){}}})})},loadCustData:function(o){var t={};if(this.uModel.getData().adm)sap.ui.getCore().getModel("config")&&(t=sap.ui.getCore().getModel("config").getData());else{if(!sap.ui.getCore().getModel("config"))return void this.onNavBack();t=sap.ui.getCore().getModel("config").getData()}this.getView().setModel(new s(t),"config");var n=this;sap.ui.core.BusyIndicator.show(0),$.ajax({type:"GET",headers:this.headers,url:this.custurl,cache:!1,success:function(t){if(window.custsha){if(window.custsha!=t.sha)return void(2<n.rCount?window.location.reload():(n.rCount++,$.sap.delayedCall(3e3,this,function(){n.loadCustData(o)})));n.rCount=0}else window.custsha=t.sha;var e=(e=atob(t.content)).trim()?JSON.parse(e):[];n.oModel.setData(e),n.oModel.refresh();var i,a;for(i in e)if(e[i].key===o){if(n.byId("idNotBtn").setVisible(!1),(e[i].lnCls||e[i].lnRen)&&(n.uModel.getData().adm||n.getView().getModel("config").getData().ls)&&n.calcSummary(e[i]),n.cModel.setData(e[i]),n.calPayData(),n.uModel.getData().adm||n.getView().getModel("config").getData().not){try{0<e[i].notDet.length&&(a=!0)}catch(t){}(a=a||n.formatter.setStatus_f(e[i],e[i].instDet).notVis)&&(e[i].notDet||(e[i].notDet=[]),n.byId("idNotBtn").setVisible(!0))}n.cModel.refresh();break}sap.ui.core.BusyIndicator.hide()},error:function(t){m.error(t.responseJSON.message),sap.ui.core.BusyIndicator.hide()}})},calcSummary:function(t){var e=0,i=0,a=t.defAmt;t.payDet.forEach(function(t){e+=Number(t.amt)});var o=Number(t.lnAmt);t.lnRen&&(o-=Number(t.trPra||t.lnAmt)),i=0<(i=e-Number(o))?i:0,this.byId("idTotPaid").setText("Total Amount Paid: "+e),this.byId("idIntEarn").setText("Profit: "+i),this.byId("idDefAmt").setText("Default Amount: "+a)},calPayData:function(){var t=this.cModel.getData();FabFinV3.currInst=0,FabFinV3.currRow="",FabFinV3.nxtRow=[],FabFinV3.hideRow=[];var e=this,i=this.formatter.generateLoanData(t,!0,this);t.instDet=i.arr;var a=i.currRoi,o=i.curDtObj;try{$.sap.delayedCall(100,this,function(){e.byId("idInstTab").rerender(),e.byId("idInstTab").removeStyleClass("classColumnHide")}),o.intTD=Math.round(o.prA*this.getNoOfDays(new Date(t.lnDt),new Date((new Date).toDateString()))*a/100*1/365),t.intTD=o}catch(t){}},onSelLC:function(t,e){for(var i,a=this.cModel.getData(),o=sap.ui.getCore().byId("idPayDate").getValue()||(new Date).toDateString(),n=a.instDet.length-1;0<=n;n--)if(a.instDet[n].payDate){i=a.instDet[n].payDate;break}if(i>new Date(o))return m.error("There is already a future date payment made on "+i+"."),void t.getSource().setSelected(!1);("R"===e?sap.ui.getCore().byId("idCB"):sap.ui.getCore().byId("idCBR")).setSelected(!1),sap.ui.getCore().byId("idGAHB").setVisible(sap.ui.getCore().byId("idCB").getSelected()),sap.ui.getCore().byId("idOthrAmtVB").setVisible(t.getSource().getSelected()),this.calAmtTD()},calAmtTD:function(t){"1"===t&&(sap.ui.getCore().byId("idOthrAmtVB").setVisible(!1),sap.ui.getCore().byId("idCB").setSelected(!1),sap.ui.getCore().byId("idCBR").setSelected(!1)),sap.ui.getCore().byId("idNtve").getSelected()&&(sap.ui.getCore().byId("idCB").setSelected(!1),sap.ui.getCore().byId("idCBR").setSelected(!1),sap.ui.getCore().byId("idOthrAmtVB").setVisible(!1));for(var e,i=this.cModel.getData(),t=sap.ui.getCore().byId("idOthrAmt").getValue(),a=sap.ui.getCore().byId("idPayDate").getValue()||(new Date).toDateString(),o=i.instDet.length-1;0<=o;o--)if(new Date(a)<=new Date(i.instDet[o].fnPayDt)&&new Date(a)>=new Date(i.instDet[o].instStDt)){e=i.instDet[o];break}if(sap.ui.getCore().byId("idCB").getSelected()){i.intTD=e;var n=0;15<Math.ceil(Math.abs(new Date(a)-e.intFrm)/864e5)+1?n=e.int:(n=(e.int-e.cfInt)/2,n+=e.cfInt),n=e.prA+Number(t)+n-e.amtPaid}else{if(!i.instDet[Number(i.lnDur)-1])return m.error("Loan renewal not possible"),sap.ui.getCore().byId("idCBR").setSelected(),void sap.ui.getCore().byId("idOthrAmtVB").setVisible(!1);n=(n=i.instDet[Number(i.lnDur)-1].int-i.instDet[Number(i.lnDur)-1].amtPaid)<0?0:n,n+=Number(t)}sap.ui.getCore().byId("idTot").setText(n),this.calcIntDet(e)},calcIntDet:function(t){var e,i,a;sap.ui.getCore().byId("idIntDetVB").setVisible(!1),sap.ui.getCore().byId("idRB").setSelectedIndex(0),sap.ui.getCore().byId("idCBR").getSelected()||sap.ui.getCore().byId("idCB").getSelected()||sap.ui.getCore().byId("idNtve").getSelected()||(e=sap.ui.getCore().byId("idPayAmt").getValue(),i=0,a=t.int<0?0:t.int,0<Number(e)&&0<(i=Number(t.amtPaid)>Number(a)?Number(e):Number(t.amtPaid)+Number(e)-Number(a))&&(sap.ui.getCore().byId("idIntDetVB").setVisible(!0),sap.ui.getCore().byId("idIntDetTxt").setText("Total interest to be collected for period from "+this.formatter.dateFormat(t.intFrm)+" to "+this.formatter.dateFormat(t.intTo)+" is "+a+".\n\nKindly choose from below option to handle the balance amount "+i+".")))},onAddInst:function(t){this._iDialog&&this._iDialog.destroy(),this._iDialog=sap.ui.xmlfragment("FabFinV3.f.AddInst",this),this.getView().addDependent(this._iDialog);var e=this.cModel.getData();this.formatter.setLnExpTxt(e.lnDt,e.lnDur,this)||sap.ui.getCore().byId("idLRVB").setVisible(!1),sap.ui.getCore().byId("idPayDate").setMinDate(new Date(e.lnDt)),sap.ui.getCore().byId("idPayDate").setMaxDate(new Date),this._iDialog.open()},onSubmit:function(t){var e=sap.ui.getCore().byId("idPayDate").getValue()||(new Date).toDateString(),i=sap.ui.getCore().byId("idPayAmt").getValue(),a=sap.ui.getCore().byId("idCB").getSelected(),o=sap.ui.getCore().byId("idCBR").getSelected(),n=Number(sap.ui.getCore().byId("idOthrAmt").getValue()),s=sap.ui.getCore().byId("idNtve").getSelected();if(Number(i)<0)m.error("Amount cannot be negative");else{i=s?-Number(i):i;var r=this.cModel.getData(),s=this.formatter.setLnExpTxt(r.lnDt,r.lnDur,this,e);if(s&&0<=s.indexOf("expired")&&!a&&!o)m.error("Loan duration expired. Kindly choose Loan closure or Loan renewal to proceed.");else if(!sap.ui.getCore().byId("idIntDetVB").getVisible()||sap.ui.getCore().byId("idAIP").getSelected()||sap.ui.getCore().byId("idPR").getSelected()){if(a||o){s=Number(sap.ui.getCore().byId("idTot").getText());if(100<Math.abs(s-Number(i)))return void m.error("Pending Amount to be collected is "+s);r.defAmt=0<s-Number(i)?s-Number(i):0,r.clsDt=Date.now().toString(),r.lnCls=a?"X":"",r.lnRen=o?"X":"",r.othrAmt=n,r.goldAuctn=sap.ui.getCore().byId("idGA").getSelected()?"X":"",r.notice=0,r.notDat="",n<0&&(r.defAmt+=-n)}for(var d,l,g=0;g<r.instDet.length;g++)if(new Date(e)<=new Date(r.instDet[g].fnPayDt)&&new Date(e)>=new Date(r.instDet[g].instStDt)){d=r.instDet[g],0;break}if(!a&&Number(i)<0&&-Number(i)>d.amtPaid)m.error("Reversal amount greater than paid amount "+r.instDet[g].amtPaid+".");else{if(sap.ui.getCore().byId("idIntDetVB").getVisible()&&sap.ui.getCore().byId("idAIP").getSelected()){for(var u=0,h=r.instDet.length-1;0<=h;h--)if(r.instDet[h].no==r.lnDur){u=r.instDet[h].int;break}if(Number(i)+d.amtPaid>u)return void m.error("You cannot pay amount more than "+u+" as interest payment.")}if(o&&(delete(l=$.extend(!0,{},r)).instDet,delete l.intTD,l.lnRen=l.clsDt="",r.renKey=l.crtDt=l.key=l.modDt=Date.now().toString(),l.preKey=r.key,l.payDet=[],l.roiDet=[l.roiDet[l.roiDet.length-1]],l.roiDet[0].month=1,l.roiDet[0].modDt=Date.now().toString(),l.lnDt=this.formatter.dateFormat(this.formatter.getLnEdDt(new Date(r.lnDt),Number(r.lnDur),0)),l.othrAmt=l.defAmt=0,l.lnAmt=r.trPra=r.instDet[r.instDet.length-1].prA,l.goldRt=l.lnAmt/Number(l.goldGms)),e&&i){r.payDet.push({payDate:e,amt:i,othrAmt:n,lnClsr:a?"X":"",lnRen:o?"X":"",crtDt:Date.now().toString(),xAmtOp:sap.ui.getCore().byId("idIntDetVB").getVisible()?sap.ui.getCore().byId("idAIP").getSelected()?"1":"2":""}),r.modDt=Date.now().toString(),delete r.instDet,delete r.intTD;var c,D=this.oModel.getData();for(c in D)if(D[c].key===r.key){D.splice(c,1,r);break}o&&D.push(l),this.updateFile(D),this.onCl()}}}else m.error("Kindly choose from above option to handle the balance amount.")}},onUpdateInt:function(){this._itDialog&&this._itDialog.destroy(),this._itDialog=sap.ui.xmlfragment("FabFinV3.f.intRate",this),this.getView().addDependent(this._itDialog),this._itDialog.setModel(new s($.extend(!0,[],this.cModel.getData().roiDet)),"iDialogModel"),this._itDialog.open()},onAddROI:function(){var t=Math.round(sap.ui.getCore().byId("idMnInp").getValue()),e=sap.ui.getCore().byId("idRoiInp").getValue();if(t&&e){for(var i=this._itDialog.getModel("iDialogModel").getData(),a={month:t,roi:e,modDt:Date.now().toString()},o=0;o<i.length;o++)if(i[o].month==t){i.splice(o,1,a);break}o==i.length&&i.push(a),i.sort((t,e)=>t.month-e.month),this._itDialog.getModel("iDialogModel").refresh()}},cUpdateInt:function(){var t=this.cModel.getData();t.roiDet=this._itDialog.getModel("iDialogModel").getData(),t.modDt=Date.now().toString(),delete t.instDet,delete t.intTD;var e,i=this.oModel.getData();for(e in i)if(i[e].key===t.key){i.splice(e,1,t);break}this.updateFile(i),this.onClose()},onDelIntMonth:function(t){this._itDialog.getModel("iDialogModel").getData().splice(t.getSource().getBindingContext("iDialogModel").getPath().split("/")[1],1),this._itDialog.getModel("iDialogModel").refresh()},onShowHistory:function(t){this._hDialog&&this._hDialog.destroy(),this._hDialog=sap.ui.xmlfragment("FabFinV3.f.payHistory",this),this.getView().addDependent(this._hDialog),this._hDialog.bindElement("cModel>"+t.getSource().getBindingContext("cModel").getPath()),this._hDialog.open()},onUpdateNot:function(t){this._nDialog&&this._nDialog.destroy(),this._nDialog=sap.ui.xmlfragment("FabFinV3.f.Notice",this),this.getView().addDependent(this._nDialog);var e,i,a=[],o=this.cModel.getData(),n=$.extend(!0,[],o.notDet);for(i in o.notice||sap.ui.getCore().byId("idRecalBtn").setVisible(!1),this.formatter.setStatus_f(o,o.instDet).notVis||sap.ui.getCore().byId("idsendNotBtn").setVisible(!1),sap.ui.getCore().byId("idsendNotBtn").getVisible()||sap.ui.getCore().byId("idRecalBtn").getVisible()||sap.ui.getCore().byId("idNotDate").setVisible(!1),n){switch(e={},n[i].no=n[i].recall?"X":n[i].no,String(n[i].no)){case"1":e.tit="1st Notice Sent",e.stat="Low",e.dat=n[i].date;break;case"2":e.tit="2nd Notice Sent",e.stat="Low",e.dat=n[i].date;break;case"3":e.tit="3rd Notice Sent",e.stat="Low",e.dat=n[i].date;break;case"X":e.tit="Recalled",e.stat="High",e.dat=n[i].date;break;default:e.tit=n[i].no+"th Notice Sent",e.stat="Low",e.dat=n[i].date}a.push(e)}this._nDialog.setModel(new s(a),"nDialogModel"),this._nDialog.open()},cUpdateNot:function(t){var e=sap.ui.getCore().byId("idNotDate").getValue()||(new Date).toDateString();if(e){var i=this.cModel.getData();i.notDet.push({no:i.notice?Number(i.notice)+1:1,date:e,recall:"R"==t?"X":"",modDt:Date.now().toString()}),i.notice=i.notice?Number(i.notice)+1:1,i.notDat=e,i.notice="R"==t?0:i.notice,i.notDat="R"==t?"":i.notDat,i.modDt=Date.now().toString(),delete i.instDet,delete i.intTD;var a,o=this.oModel.getData();for(a in o)if(o[a].key===i.key){o.splice(a,1,i);break}this.updateFile(o),this.onCl()}},onCl:function(){this._iDialog&&this._iDialog.destroy(),this._hDialog&&this._hDialog.destroy(),this._nDialog&&this._nDialog.destroy()},onClose:function(){this._itDialog&&this._itDialog.destroy(),this._oDialog&&this._oDialog.destroy()},getNoOfDays:function(t,e){return Math.ceil(Math.abs(e-t)/864e5)+1},getMonthRange:function(t){for(var e,i=(t=new Date("Dec 31,2023")).getDate(),a=t.getFullYear(),o=t.getMonth()+1,n=[],s=0;s<24;s++)a=(o%=12)?a:a+1,o!=(e={sDt:t,eDt:new Date(a,o,i)}).eDt.getMonth()&&(e.eDt=new Date(a,e.eDt.getMonth(),0)),t=e.eDt,e.eDt=new Date(e.eDt.getTime()-864e5),n.push(e),t=new Date(e.eDt.getTime()+864e5),o+=1;return n},onEditCust:function(){this._oDialog&&this._oDialog.destroy(),this._oDialog=sap.ui.xmlfragment("idcf","FabFinV3.f.AddCust",this),this.getView().addDependent(this._oDialog),this._oDialog.setModel(new s($.extend(!0,{},this.cModel.getData())),"oDialogModel"),sap.ui.getCore().byId("idcf--idLnDt").setMaxDate(new Date),sap.ui.getCore().byId("idcf--idAddBtn").setText("Update"),sap.ui.getCore().byId("idcf--idInstDet").setVisible(!1),sap.ui.getCore().byId("idcf--idelVB").setVisible(!0),this._oDialog.open()},onAddGoldItems:function(t){var e=this.formatter.fillGArr(),i=this._oDialog.getModel("oDialogModel").getData().gDet;try{for(var a in e)for(var o in i)if(e[a].name==i[o].name){e[a].value=i[o].value;break}}catch(t){}this._oDialog.getModel("oDialogModel").getData().gDet=e,this._gDialog&&this._gDialog.destroy(),this._gDialog=sap.ui.xmlfragment("FabFinV3.f.GoldDetail",this),this._oDialog.addDependent(this._gDialog),this._gDialog.openBy(t.getSource())},showGoldDetails:function(t){this._gDialog&&this._gDialog.destroy(),this._gDialog=sap.ui.xmlfragment("FabFinV3.f.GoldDetail",this);var e=$.extend(!0,{},this.cModel.getData());e.gDet.forEach(function(t){t.edit=!0}),this._gDialog.setModel(new s(e),"oDialogModel"),this._gDialog.openBy(t.getSource())},cAddCust:function(){var t=this._oDialog.getModel("oDialogModel").getData();if(!t.name.trim()||!t.id.trim()||!t.mob.trim()||Number(t.goldGms)<=0||Number(t.lnAmt)<=0)m.error("Please fill all the required fields");else{for(var e=t.gDet.length-1;0<=e;e--)0==Number(t.gDet[e].value)&&t.gDet.splice(e,1);t.goldRt=Number(t.goldRt).toFixed(3);var i=t;i.modDt=Date.now().toString(),delete i.instDet,delete i.intTD;var a,o=this.oModel.getData();for(a in o)if(o[a].key===i.key){o.splice(a,1,i);break}this.updateFile(o),this.onClose()}},calculateEMI:function(t){var e=this._oDialog.getModel("oDialogModel").getData();"G"===t?0<Number(e.goldRt)&&0<Number(e.goldGms)&&(e.lnAmt=Number(e.goldRt)*Number(e.goldGms)):"A"===t&&0<Number(e.lnAmt)&&0<Number(e.goldGms)&&(e.goldRt=Number(e.lnAmt)/Number(e.goldGms)),this._oDialog.getModel("oDialogModel").refresh()},onPressCustDel:function(){sap.m.MessageBox.confirm("Are you sure want to delete?",{actions:["Cancel","Confirm"],onClose:function(t){"Confirm"===t&&function(){var t,e=a.cModel.getData(),i=a.oModel.getData();for(t in i)if(i[t].key===e.key){i.splice(t,1);break}a.updateFile(i,1),a.onClose()}()}});var a=this},updateFile:function(t,e){var i=this.cModel.getData().key,a=this,o=JSON.stringify(t),t={message:"Updating file",content:btoa(o),sha:window.custsha},o=this.custurl;sap.ui.core.BusyIndicator.show(0),this.byId("idInstTab").addStyleClass("classColumnHide"),$.ajax({type:"PUT",url:o,headers:a.headers,data:JSON.stringify(t),dataType:"text",success:function(t){window.custsha=JSON.parse(t).content.sha,sap.ui.core.BusyIndicator.hide(),e?(n.show("Deleted Successfully."),a.onNavBack()):(a.loadCustData(i),m.success("Updated Successfully."))},error:function(t){sap.ui.core.BusyIndicator.hide(),m.error("Failed.")}})},onTestRun:function(t){window.testRun=!1,window.mainsha=null,window.custsha=null,this.onNavBack()},onNavBack:function(){this.getOwnerComponent().getRouter().navTo("home")},onNavLP:function(t){this.getOwnerComponent().getRouter().navTo("login")}})});
