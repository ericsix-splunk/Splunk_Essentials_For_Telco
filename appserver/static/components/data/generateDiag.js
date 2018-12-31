window.diagObject = []
var console = window.console

function intercept(method) {
    var original = console[method]
    console[method] = function() {
        window.diagObject.push(arguments);
        if (original.apply) {
            // Do this for normal browsers
            original.apply(console, arguments);
        } else {
            // Do this for IE
            var message = Array.prototype.slice.apply(arguments).join(' ');
            original(message);
        }
    }
}
var methods = ['log', 'warn', 'error'];
for (var i = 0; i < methods.length; i++) {
    intercept(methods[i]);
}



function collectDiag() {

    require([
        "jquery", "/static/app/Splunk_Essentials_For_Telco/vendor/jszip/jszip.js", "/static/app/Splunk_Essentials_For_Telco/vendor/FileSaver/FileSaver.js"
    ], function($, JSZip) {
        console.log("JSZip Loaded", JSZip)
        var zip = new JSZip();

        var browserInfo = new Object()
        browserInfo.ua = navigator.userAgent;
        browserInfo.url = window.location.href;
        browserInfo.cookies = document.cookie;
        browserInfo.lang = navigator.language

        var searchManagers = new Object()
        for (var attribute in splunkjs.mvc.Components.attributes) {
            var sm = splunkjs.mvc.Components.getInstance(attribute)
            if (typeof sm != "undefined" && sm != null) {
                if (typeof sm.search != "undefined") {
                    searchManagers[attribute] = new Object()
                    searchManagers[attribute]['name'] = attribute
                    searchManagers[attribute]['lastError'] = sm.lastError
                    searchManagers[attribute]['attributes'] = sm.search.attributes
                }
            }
        }

        var local_configuration = window.$C

        var folder1 = zip.folder("diag-output-from-Splunk-Essentials");
        folder1.file("console_log.json", JSON.stringify(window.diagObject, null, 4));
        folder1.file("browser_info.json", JSON.stringify(browserInfo, null, 4));
        folder1.file("search_managers.json", JSON.stringify(searchManagers, null, 4));
        folder1.file("localStorage.json", JSON.stringify(localStorage, null, 4));
        folder1.file("configuration.json", JSON.stringify(local_configuration, null, 4));
        folder1.file("tokens.json", JSON.stringify(splunkjs.mvc.Components.getInstance("submitted").attributes, null, 4));

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, "diag-output-from-Splunk-Essentials.zip");

            });
    })
}

var mylink = $("<a href=\"#\">Generate Essentials-only Diag</a>").click(function() {
    collectDiag()
    return false;
})
$('div[data-view="views/shared/splunkbar/help/Master"]').find("ul").append($("<li></li>").append(mylink))
