'use strict';

function sendTelemetryForIntro(uc) {
    require(["components/data/sendTelemetry"], function(Telemetry) {
        Telemetry.SendTelemetryToSplunk("PageStatus", { "status": "selectedIntroUseCase", "useCase": uc })
    })
}

var Descriptions = new Object;
//Descriptions["Server Monitoring"] = "Using Splunk to monitor your servers can be easy with Splunk Essentials for IT Troubleshooting and Monitoring, with many examples from new stack and legacy use cases."
//Descriptions["Infrastructure Troubleshooting"] = "Monitor your Infrastructure with these helpful use cases that help you understand what you need to look at when deploying Splunk."
//Descriptions["Container Monitoring"] = "By using Splunk to monitoring your Docker, Openshift, and Kubernetes environements get better insight into how your application and deployment platforms can work together."
//Descriptions["Cloud Monitoring"] = "Regardless of what Cloud provider you use today, you should take these use cases for AWS, Azure, and GCP and expand your visibility into your next generation stacks."

Descriptions["Test"] = "Testing"
Descriptions["Splunk"] = "Splunk Test Searches."
Descriptions["Payment Response"] = "Processing payments is a core function that banks provide to customers. It is very important to be able to identify the status and response time of each payment and determine if service level agreements are being achieved."
Descriptions["ATM Fraud"] = "Evaluate potential risk of ATM fraud by performing various analysies that help to indicate outliers and anomalies of fraudulent behaviors or transactions. Ths includes calculating risk scores and monitoring suspicious withdrawal and transaction activities."
Descriptions["Wire Transfer Fraud"] = "Wire transfer fraud is an intentional act to defraud another individual or entity of his money or property using wire or electronic communications. Use Splunk Enterprise to detect fraudulent wire, requests, transfers, events and behavioral anomalies. These examples in this use case contain scenarios that should be investigated immediately for potential fraudulent activity."
Descriptions["ATM Statistics"] = "View a wide variety of statistics that reveal insights into ATM usage. Examples of statistics include amounts of deposits/withdrawals for a given time period, locations of major ATM activity, and time series views of duration of each transaction."
Descriptions["Credit Card Statistics"] = "Banks want real-time details regarding their credit cards to optimize operations. These examples provide insight into attempts that are authorized, cancelled, or denied mapped to with customer experience with regards to response time."
Descriptions["Transaction Statistics"] = "This use case provides a wide variety of measurements for a hypothetical 4 step banking transaction. Just a few of these statistics include the average duration or a transaction, the number of steps in a transaction and the highest number of transactions completed by customer."
Descriptions["MFID"] = "MFID/MFID2 are regulations for electronic trading in EMEA. One standard requires firms to show that servers all have time settings that vary no more than one MS from UTC. Another standard requires firms to execute trades at the best possible price among exchanges."
Descriptions["Trade - Where is it"] = "Brokerages want to know the status of their trades within their process and their flow. Splunk enables this by storing all of the process events in one location to be searched with common IDs. With the trade logs, statistics for the trades can also be presented for insight."
Descriptions["FIX Order"] = "The Financial Information eXchange, FIX, messaging protocol has become the language of the financial markets. One can obtain information such as creating human readable words from logs, and develop statistical reports using Splunk."
Descriptions["Bitcoin"] = "The most well-known version of digital currency is bitcoin. The bitcoin blockchain serves as the public general ledger for all bitcoin transactions. Splunk can access the blockchain to gain insights into the inner workings of the bitcoin Network. Examples are provided."
Descriptions["New User Login"] = "A key measurement for improving bank customer experience is new user logins. This can help banks know what kind of experience new users are having, as well as any forced conscience denial to let the customer login. Analytics can improve customer experience."
Descriptions["Wire Transfer Fraud"] = "Wire transfer fraud is when criminals concoct a scheme to obtain money based on false representation. This criminal act is done using electronic communications. The examples in this use case contain scenarios that should be investigated immediately for potential fraud."
Descriptions["Wire Transfer Statistics"] = "Wire transfer statistics can help analytics teams gain a deeper insight into their flow of funds. Source and destinations can be mapped to see where the majority of funds are flowing. Statistics such as customers with the largest amounts of transfers can also be computed."
Descriptions["Bank Account Compliance"] = "Splunk reports can show unusual activity to customers. Examples include having multiple accounts, some of which have zero balances, negative balances, or are dormant. These reports can be shown instantly with transaction logs referencing other accounts in a database."
Descriptions["Credit Limit Increase"] = "Credit limit increase requests can be approved or denied quickly. For example, customers not in good standing would be denied. Limit approvals or denials can be mapped over time to see trends. Splunk can participate in granting approvals based on reference data and rules."
Descriptions["Credit Card Fraud"] = "This fraud occurs when a lost or stolen credit card is used to make fraudulent purchases. The problem is that the purchases get authorized, but they seem suspicious. Splunk can analyze these transactions as they occur, discovering possible fraudulent activity."


var Icons = new Object;
//Icons["Server Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Infrastructure Troubleshooting"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Container Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Cloud Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"

Icons["Test"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
Icons["Splunk"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/ATMFraud.png"
Icons["ATM Fraud"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/ATMFraud.png"
Icons["Payment Response"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/PaymentResponse.png"
Icons["ATM Statistics"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/ATMStatistics.png"
Icons["Credit Card Statistics"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/CreditCardStatistics.png"
Icons["Transaction Statistics"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/TransactionFlow.png"
Icons["MFID"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/MFID.png"
Icons["Trade - Where is it"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/Trade.png"
Icons["FIX Order"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Bitcoin"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/bitcoin.png"
Icons["New User Login"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/NewUserLogin.png"
Icons["Wire Transfer Fraud"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/WireTransferFraud.png"
Icons["Wire Transfer Statistics"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/WireTransfer.png"
Icons["Bank Account Compliance"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
Icons["Credit Limit Increase"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/CreditLimit.png"
Icons["Credit Card Fraud"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/CreditCardFraud.png"



function setLocalStorage(UseCase) {
    localStorage["seffsi-usecase-Multiple"] = "[\"" + UseCase.replace(/ /g, "_") + "\"]";
    localStorage["seffsi-usecase"] = UseCase.replace(/ /g, "_");
    if (typeof localStorage["seffsi-enabledFilters"] == "undefined") {
        localStorage["seffsi-enabledFilters"] = JSON.stringify(["journey", "usecase", "category", "datasource"])
    }
    if (localStorage["seffsi-enabledFilters"].indexOf("usecase") == -1) {
        var temp = JSON.parse(localStorage["seffsi-enabledFilters"])
        temp.unshift("usecase")
        localStorage["seffsi-enabledFilters"] = JSON.stringify(temp)
    }
    if (localStorage["seffsi-enabledFilters"].indexOf("journey") == -1) {
        var temp = JSON.parse(localStorage["seffsi-enabledFilters"])
        temp.push("journey")
        localStorage["seffsi-enabledFilters"] = JSON.stringify(temp)
    }

    window.location.href = "contents"
}

//console.log("Starting it")
require(['jquery', 'splunkjs/mvc/simplexml/controller', 'splunkjs/mvc/dropdownview', 'splunk.util', 'components/data/parameters/RoleStorage', 'Options', 'app/Splunk_Essentials_For_Telco/components/controls/Modal', 'json!components/data/ShowcaseInfo.json', 'bootstrap.popover'], function($, DashboardController, DropdownView, SplunkUtil, RoleStorage, Options, Modal, ShowcaseInfo) {

    console.log("Hey, I have a showcase...", ShowcaseInfo)
    window.ShowcaseInfo = ShowcaseInfo
    var CountByUseCase = new Object;
    var TotalUseCaseCount = 0
    Object.keys(window.ShowcaseInfo.summaries).forEach(function(ShowcaseName) {
        var ShowcaseSettings = ShowcaseInfo['summaries'][ShowcaseName]
        var UseCases = ShowcaseSettings['usecase'].split("|")
        TotalUseCaseCount++
        UseCases.forEach(function(UseCase) {
            if (typeof CountByUseCase[UseCase] == "undefined")
                CountByUseCase[UseCase] = 0
            CountByUseCase[UseCase]++

        })

       })
    $("#analyticCount").text(TotalUseCaseCount)
    var myContent = ""
    Object.keys(CountByUseCase).forEach(function(UseCase) {
        myContent += "<div class=\"UseCase\"><div class=\"UseCaseImg\"><img src=\"" + Icons[UseCase] + "\" /></div><div class=\"UseCaseDescription\"><h2><a href=\"#\" onclick='sendTelemetryForIntro(\"" + UseCase + "\"); setLocalStorage(\"" + UseCase + "\");'> " + UseCase + "</a></h2><h4>Featuring " + CountByUseCase[UseCase] + " Examples!</h4><p>" + Descriptions[UseCase] + "</p></div></div>\n"
    })
    console.log("Rendereding", myContent)
    $("#ListOfUseCases").html(myContent)


})
