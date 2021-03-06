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
Descriptions["Subscriber Services"] = "CSPs and Telcos host a large variety of services. These examples look in depth at services such as Voice and VoIP services and traditional BSS/OSS solutions."
Descriptions["Service Availability"] = "CSPs and Telcos have a variety of networks : data networks, private networks, voice, transit , etc. These examples show the monitor of various components of these networks and how to understand the business impact from outages."
Descriptions["Content Delivery"] = "Content Delivery Networks (CDNs) are now quite common as a service offering by CSPs and Telcos. These examples explore various components and analytics within CDNs."
Descriptions["Distributed Ledger Technology"] = "DLT is gaining momentum in many markets. These examples show how to monitor transactions and the underlying systems in a Distributed Ledger Network."
Descriptions["Prepaid Mobile"] = "Prepaid, MVNO, and Top-up Voice/Data services are commonplace. These examples explore common metrics and analytics around service activations, compliance, and fraud."
Descriptions["Physical Monitoring"] = "CSPs and Telcos typically own and manage a large variety of locations. These examples explore collecting sensor and IoT data in Data Centers and how these can be used for compliance, reporting, and monitoring."

var Icons = new Object;
//Icons["Server Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Infrastructure Troubleshooting"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Container Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"
//Icons["Cloud Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/FSIAppModerization.png"

//Telco App Core use Cases
Icons["Subscriber Services"] =  "/static/app/Splunk_Essentials_For_Telco/images/general_images/subscriber_services.png"
Icons["Service Availability"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/service_availability.png"
Icons["Content Delivery"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/cdn.png"
Icons["Distributed Ledger Technology"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/dlt_blockchain.png"
Icons["Prepaid Mobile"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/prepaid_mobile.png"
Icons["Physical Monitoring"] = "/static/app/Splunk_Essentials_For_Telco/images/general_images/physical_monitoring.png"



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
