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

//Telco App Core Use Cases
Descriptions["Subscriber Services"] = "Expedient and trouble free activation of High Speed Internet, Mobile Data, and Prepaid Mobile all require insight across many systems. These examples demonstrate how to track Activation across BSS/OSS, or similar stacks, along with CDR records and analytics examples."
Descriptions["Telco Network Monitoring"] = "Telco's have a various networks : customer private networks, out of band, voice, core. This use case explores monitoring various components of these and how to understand business impact to outages."
Descriptions["Content Delivery"] = "Content Deliver Networks are now quite commong in the Telco Market. This use case explores various components within CDN."
Descriptions["Distributed Ledger Technology"] = "DLT is gaining moomentum in many markets. These examples show how to monitor transactions and the underlying systems in a Distributed Ledger Network."
//Descriptions["CDR"] = "Call Detail Records can provide insight into not only user activity, but also business analytics. These examples show how to derive insight from standard CDR logs."
Descriptions["Prepaid Mobile"] = "Prepaid / Top-up services are quite common throughout the world. This usecase explores examples around service activations, compliance, and fraud."
Descriptions["Physical Monitoring"] = "Examples around collecting Sensor/IOT data in Data Centers."

var Icons = new Object;
//Icons["Server Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Infrastructure Troubleshooting"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Container Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Cloud Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"

//Telco App Core use Cases
Icons["Subscriber Services"] =  "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Telco Network Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Content Delivery"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Distributed Ledger Technology"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/PaymentResponse.png"
Icons["CDR"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Prepaid Mobile"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FixOrder.png"
Icons["Physical Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"



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
