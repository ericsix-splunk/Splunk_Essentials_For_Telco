"use strict";

/* This ultimately belongs in a separate file...*/
require(['jquery', 'splunkjs/mvc/simplexml/controller', 'components/controls/Modal'], function($, DashboardController, Modal) {

        var triggerModal = function(bodycontent) {
            var myModal = new Modal('MyModalID-irrelevant-unless-you-want-many', {
                title: 'Find Out More',
                destroyOnHide: true,
                type: 'wide'
            });

            $(myModal.$el).on("hide", function() {
                // Not taking any action on hide, but you can if you want to!
            })

            myModal.body.addClass('mlts-modal-form-inline')
                .append($(bodycontent));

            myModal.footer.append($('<button>').addClass('mlts-modal-submit').attr({
                type: 'button',
                'data-dismiss': 'modal'
            }).addClass('btn btn-primary mlts-modal-submit').text('Close').on('click', function() {
                // Not taking any action on Close... but I could!        
            }))
            myModal.show(); // Launch it!
        }
        window.triggerModal = triggerModal

    })
    /* END This ultimately belongs in a separate file...*/









var _templateObject = _taggedTemplateLiteral(["| loadjob $searchBarSearchJobIdToken$\n                                   | head 1\n                                   | transpose\n                                   | fields column\n                                   | search column != \"column\" AND column != \"_*\""], ["| loadjob $searchBarSearchJobIdToken$\n                                   | head 1\n                                   | transpose\n                                   | fields column\n                                   | search column != \"column\" AND column != \"_*\""]),
    _templateObject2 = _taggedTemplateLiteral(["| inputlookup ", "_lookup\n                                   | eval Actions=actions\n                                   | eval \"Search query\" = search_query,\n                                          \"Field to analyze\" = outlier_variable,\n                                          \"Threshold method\" = threshold_method,\n                                          \"Threshold multiplier\" = threshold_multiplier,\n                                          \"Sliding window\" = window_size,\n                                          \"Include current point\" = if(use_current_point == \"0\", \"false\", \"true\"),\n                                          \"# of outliers\" = outliers_count"], ["| inputlookup ", "_lookup\n                                   | eval Actions=actions\n                                   | eval \"Search query\" = search_query,\n                                          \"Field to analyze\" = outlier_variable,\n                                          \"Threshold method\" = threshold_method,\n                                          \"Threshold multiplier\" = threshold_multiplier,\n                                          \"Sliding window\" = window_size,\n                                          \"Include current point\" = if(use_current_point == \"0\", \"false\", \"true\"),\n                                          \"# of outliers\" = outliers_count"]);



function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

require(["jquery",
        "underscore",
        "splunkjs/mvc",
        "splunkjs/mvc/chartview",
        "splunkjs/mvc/dropdownview",
        "splunkjs/mvc/textinputview",
        "splunkjs/mvc/singleview",
        "splunkjs/mvc/checkboxview",
        "splunkjs/mvc/tableview",
        "splunkjs/mvc/utils",
        'splunkjs/mvc/visualizationregistry',
        'Options',
        "components/splunk/AlertModal",
        "components/splunk/Forms",
        "components/splunk/KVStore",
        'components/splunk/SearchBarWrapper',
        "components/splunk/Searches",
        "components/data/parameters/ParseSearchParameters",
        "components/data/formatters/compactTemplateString",
        "components/data/serializers/ShowcaseHistorySerializer",
        "components/controls/AssistantControlsFooter",
        "components/controls/AssistantPanel/Master",
        "components/controls/QueryHistoryTable",
        "components/controls/SearchStringDisplay",
        "components/controls/DrilldownLinker",
        "components/controls/Messages",
        "components/controls/Modal",
        "components/controls/Spinners",
        "components/controls/Tabs",
        "components/controls/ProcessSummaryUI",
        "components/data/sampleSearches/SampleSearchLoader",
        "components/data/validators/NumberValidator",
        "splunkjs/mvc/searchmanager",
        'json!components/data/ShowcaseInfo.json',
        "bootstrap.tooltip",
        "bootstrap.popover"
    ],
    function($,
        _,
        mvc,
        ChartView,
        DropdownView,
        TextInputView,
        SingleView,
        CheckboxView,
        TableView,
        utils,
        VisualizationRegistry,
        Options,
        AlertModal,
        Forms,
        KVStore,
        SearchBarWrapper,
        Searches,
        ParseSearchParameters,
        compact,
        ShowcaseHistorySerializer,
        AssistantControlsFooter,
        AssistantPanel,
        QueryHistoryTable,
        SearchStringDisplay,
        DrilldownLinker,
        Messages,
        Modal,
        Spinners,
        Tabs,
        ProcessSummaryUI,
        SampleSearchLoader,
        NumberValidator,
        SearchManager,
        ShowcaseInfo
    ) {
        var showcaseName = 'showcase_first_seen_demo';
        console.log("Alright, let's start this party off right.")
        $(".hideable").each(function(index, value) {
            var id = "random_id_" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            $(value).attr("id", id);
            console.log("setting div to id", $(value), id);
            $(value).parent().prepend("<p><a href=\"#\" onclick='$(\"#" + id + "\").toggle(); return false;'>Toggle Help</a></p>");
            $(value).toggle();
        })
        var appName = Options.getOptionByName('appName');
        setTimeout(function() {
            console.log("DV-Starting search")
            Searches.startSearch("outlierPeerGroupSearch");
        }, 1000);
        var submitButtonText = 'Detect New Values';

        var baseSearchString = null;
        var baseTimerange = null;

        // stores the current sample search, if applicable
        var currentSampleSearch = null;

        var isRunning = false;

        // stores whether or not the last value entered into a given control is valid
        var controlValidity = function() {
            var controlValidityStore = {};

            return {
                set: function set(id, value) {
                    controlValidityStore[id] = value;
                },
                /**
                 * Checks whether all entries in controlValidityStore are true
                 * @returns {boolean}
                 */
                getAll: function getAll() {
                    return Object.keys(controlValidityStore).every(function(validity) {
                        return controlValidityStore[validity];
                    });
                }
            };
        }();

        var historyCollectionId = showcaseName + "_history";

        var historySerializer = new ShowcaseHistorySerializer(historyCollectionId, {
            _time: null,
            search_query: null,
            earliest_time: null,
            latest_time: null,
            outlierValueTracked1: null,
            outlierValueTracked2: null,
            outlierPeerGroup: null,
            outliers_count: null
        }, function() {
            Searches.startSearch('queryHistorySearch');
        });

        // the possible searches and their descriptions, one per analysis function
        var outlierResultsSearchSettings = {
            'findNewValues': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ | eval maxlatest=now() | where latest > relative_time(maxlatest, "-1d@d") '],
                description: ['Find where the most recent value is less than -1d@d from either now() or the value showing your most recent data point (depending on your particular search desire)s']
            },
            'findNewValues-Demo': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ | eventstats max(latest) as maxlatest | eval comment="<-- eventstats only necessary for demo data" '],
                description: ['Find where the most recent value is less than -1d@d from either now() or the value showing your most recent data point (depending on your particular search desires)']
            },
            'findNewValues-Lookup': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ ',
                    '| inputlookup append=t $lookupToken$ | stats min(earliest) as earliest max(latest) as latest by  $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| outputlookup $lookupToken$ ',
                    '| eval maxlatest=now()'
                ],
                description: ['When running over the last 24 hours, find the earliest and latest value per pair.',
                    'Append the results with our historical cache, and then recalculate the true earliest and latest per pair.',
                    'Output those results to our lookup so that we are able to use them next time.',
                    'Find where the earliest value is more recent than -1d@d from now()'
                ]
            },
            'findNewValues-Demo-Lookup': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ ',
                    '| inputlookup append=t $lookupToken$ | stats min(earliest) as earliest max(latest) as latest by  $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| outputlookup $lookupToken$ ',
                    '| eventstats max(latest) as maxlatest '
                ],
                description: ['When running over the last 24 hours, find the earliest and latest value per pair.',
                    'Append the results with our historical cache, and then recalculate the true earliest and latest per pair.',
                    'Output those results to our lookup so that we are able to use them next time.',
                    'Find where the earliest value is more recent than -1d@d from the most recent data point'
                ]
            },
            'findNewValuesPeer': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ | eval maxlatest=now()  ',
                    '| lookup $outlierPeerGroupControlToken$ $outlierValueTracked1Token$ OUTPUT peergroup | makemv peergroup delim="," ',
                    '| multireport [| stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$  ] [| stats values(eval(if(earliest>=relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peertoday values(eval(if(earliest<relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peerpast by peergroup $outlierValueTracked2Token$   ]',
                    '| eval user=coalesce(user, peergroup) | fields - peergroup | stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$',
                    '| where isnotnull(earliest)'
                ],
                description: ['Find where the most recent value is less than -1d@d from either now() or the value showing your most recent data point (depending on your particular search desires)',
                    'Enrich primary with peer group',
                    //'Pull out the \'Secondary Field\'s that a \'Primary Field\' has viewed, and the \'Secondary Field\' their peers have viewed',
                    'Here we are comparing the # of \'Secondary Field\'s viewed today and historically by the \'Primary Field\'. multireport is a search operator that allows you to leverage the power of stats, but multiple times.',
                    'Now we join the two | stats output together into one, so that we can analyze them together',
                    'Filtering out null earliest will handle corner cases to make a clean report.'
                ]
            },
            'findNewValuesPeer-Demo': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$ | eventstats max(latest) as maxlatest | eval comment="<-- eventstats only necessary for demo data" ',
                    '| lookup $outlierPeerGroupControlToken$ $outlierValueTracked1Token$ OUTPUT peergroup | makemv peergroup delim="," ',
                    '| multireport [| stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$  ] [| stats values(eval(if(earliest>=relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peertoday values(eval(if(earliest<relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peerpast by peergroup $outlierValueTracked2Token$   ]',
                    '| eval user=coalesce(user, peergroup) | fields - peergroup | stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$',
                    '| where isnotnull(earliest) '
                ],
                description: ['Find where the most recent value is less than -1d@d from either now() or the value showing your most recent data point (depending on your particular search desires)',
                    'Enrich primary with peer group',
                    //'Pull out the \'Secondary Field\'s that a \'Primary Field\' has viewed, and the \'Secondary Field\' their peers have viewed',
                    'Here we are comparing the # of \'Secondary Field\'s viewed today and historically by the \'Primary Field\'. multireport is a search operator that allows you to leverage the power of stats, but multiple times.',
                    'Now we join the two | stats output together into one, so that we can analyze them together',
                    'Filtering out null earliest will handle corner cases to make a clean report.'
                ]
            },
            'findNewValuesPeer-Lookup': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| inputlookup append=t $lookupToken$ | stats min(earliest) as earliest max(latest) as latest by  $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| outputlookup $lookupToken$ ',
                    '| eval maxlatest=now()',
                    '| lookup $outlierPeerGroupControlToken$ $outlierValueTracked1Token$ OUTPUT peergroup | makemv peergroup delim="," ',
                    '| multireport [| stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$  ] [| stats values(eval(if(earliest>=relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peertoday values(eval(if(earliest<relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peerpast by peergroup $outlierValueTracked2Token$   ]',
                    '| eval user=coalesce(user, peergroup) | fields - peergroup | stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$',
                    '| where isnotnull(earliest)'
                ],
                description: ['When running over the last 24 hours, find the earliest and latest value per pair.',
                    'Append the results with our historical cache, and then recalculate the true earliest and latest per pair.',
                    'Output those results to our lookup so that we are able to use them next time.',
                    'Find where the earliest value is more recent than -1d@d from now()',
                    'Enrich primary with peer group',
                    //'Pull out the \'Secondary Field\'s that a \'Primary Field\' has viewed, and the \'Secondary Field\' their peers have viewed',
                    'Here we are comparing the # of \'Secondary Field\'s viewed today and historically by the \'Primary Field\'. multireport is a search operator that allows you to leverage the power of stats, but multiple times.',
                    'Now we join the two | stats output together into one, so that we can analyze them together',
                    'Filtering out null earliest will handle corner cases to make a clean report.'
                ]
            },
            'findNewValuesPeer-Demo-Lookup': {
                search: ['| stats earliest(_time) as earliest latest(_time) as latest  by $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| inputlookup append=t $lookupToken$ | stats min(earliest) as earliest max(latest) as latest by  $outlierValueTracked1Token$, $outlierValueTracked2Token$  ',
                    '| outputlookup $lookupToken$ ',
                    '| eventstats max(latest) as maxlatest ',
                    '| lookup $outlierPeerGroupControlToken$ $outlierValueTracked1Token$ OUTPUT peergroup | makemv peergroup delim="," ',
                    '| multireport [| stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$  ] [| stats values(eval(if(earliest>=relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peertoday values(eval(if(earliest<relative_time(maxlatest,"-1d@d"),$outlierValueTracked2Token$ ,null))) as peerpast by peergroup $outlierValueTracked2Token$   ]',
                    '| eval user=coalesce(user, peergroup) | fields - peergroup | stats values(*) as * by $outlierValueTracked1Token$  $outlierValueTracked2Token$',
                    '| where isnotnull(earliest)'
                ],
                description: ['When running over the last 24 hours, find the earliest and latest value per pair.',
                    'Append the results with our historical cache, and then recalculate the true earliest and latest per pair.',
                    'Output those results to our lookup so that we are able to use them next time.',
                    'Find where the earliest value is more recent than -1d@d from the most recent data point',
                    'Enrich primary with peer group',
                    //'Pull out the \'Secondary Field\'s that a \'Primary Field\' has viewed, and the \'Secondary Field\' their peers have viewed',
                    'Here we are comparing the # of \'Secondary Field\'s viewed today and historically by the \'Primary Field\'. multireport is a search operator that allows you to leverage the power of stats, but multiple times.',
                    'Now we join the two | stats output together into one, so that we can analyze them together',
                    'Filtering out null earliest will handle corner cases to make a clean report.'
                ]
            }
        };

        var outlierFieldBaseSearchStrings = {
            both: "| eval isOutlier=if(earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 0)",
            above: "| eval isOutlier=if(earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 0)",
            below: "| eval isOutlier=if(earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 0)",
            split: "| eval isOutlierUpper=if(earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 0)"
        };
        var outlierFieldSearchStrings = {
            both: "| eval peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            above: "| eval peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            below: "| eval peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            split: "| eval peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
        };

        var outlierFieldSearchStringsPeers = {
            both: "| eval temp=\"temp\", peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            above: "| eval temp=\"temp\", peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            below: "| eval temp=\"temp\", peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
            split: "| eval temp=\"temp\", peergroup_name=\"$outlierPeerGroupControlToken$\", isOutlier=case(len(peergroup_name)>0 , if(isnotnull(earliest) AND earliest>=relative_time(maxlatest,\"-1d@d\") AND isnull(peerpast),1,0), earliest >= relative_time(maxlatest, \"-1d@d\"), 1, 1=1, 0)",
        };

        function returnSearchString(searchName) {
            console.log("Checking Peer Group", Forms.getToken("outlierPeerGroupControlToken"), " with search ", searchName, " from function", arguments.callee.caller)
                //return outlierFieldSearchStrings;
            if ((typeof searchName != "undefined" && searchName.indexOf("Peer")) || (typeof Forms.getToken("outlierPeerGroupControlToken") != "undefined" && Forms.getToken("outlierPeerGroupControlToken").length > 0 && Forms.getToken("outlierPeerGroupControlToken") != "None")) {
                console.log("Checking Peer Group - Returning Peer Search Strings")

                return outlierFieldSearchStringsPeers;
            } else {

                return outlierFieldBaseSearchStrings;
            }
        }


        function setupSearches() {
            (function setupSearchBarSearch() {
                Searches.setSearch('searchBarSearch', {
                    targetJobIdTokenName: 'searchBarSearchJobIdToken',
                    onStartCallback: function onStartCallback() {
                        hideErrorMessage();
                        hidePanels();
                    },
                    onDoneCallback: function onDoneCallback(searchManager) {
                        DrilldownLinker.setSearchDrilldown(datasetPreviewTable.$el.prev('h3'), searchManager.search);
                        Searches.startSearch('outlierVariableSearch');
                        Searches.startSearch('outlierVariableSubjectSearch');
                    },
                    onErrorCallback: function onErrorCallback(errorMessage) {
                        Forms.clearChoiceViewOptions(outlierValueTracked2Control);
                        Forms.clearChoiceViewOptions(outlierValueTracked2Control);
                        showErrorMessage(errorMessage);
                        hidePanels();
                    }
                });
            })();

            (function setupOutlierVariableSearch() {
                Searches.setSearch("outlierVariableSearch", {
                    searchString: compact(_templateObject),
                    onStartCallback: function onStartCallback() {
                        hideErrorMessage();
                    },
                    onErrorCallback: function onErrorCallback(errorMessage) {
                        showErrorMessage(errorMessage);
                        hidePanels();
                    }
                });
            })();

            (function setupOutlierVariableSubjectSearch() {
                Searches.setSearch("outlierVariableSubjectSearch", {
                    searchString: compact(_templateObject),
                    onStartCallback: function onStartCallback() {
                        hideErrorMessage();
                    },
                    onErrorCallback: function onErrorCallback(errorMessage) {
                        showErrorMessage(errorMessage);
                        hidePanels();
                    }
                });
            })();

            (function setupOutlierResultsSearches() {
                Object.keys(outlierResultsSearchSettings).forEach(function(searchName) {
                    Searches.setSearch(searchName, {
                        autostart: false,
                        searchString: ['| loadjob $searchBarSearchJobIdToken$'].concat(outlierResultsSearchSettings[searchName].search, [returnSearchString(searchName).both]),
                        targetJobIdTokenName: 'outlierResultsSearchToken',
                        onStartCallback: function onStartCallback() {
                            hideErrorMessage();
                            updateForm(true);
                        },
                        onDoneCallback: function onDoneCallback() {
                            showPanels();
                        },
                        onDataCallback: function onDataCallback(data) {
                            var collection = {
                                _time: parseInt(new Date().valueOf() / 1000, 10),
                                search_query: baseSearchString,
                                earliest_time: baseTimerange.earliest_time,
                                latest_time: baseTimerange.latest_time,
                                outlierValueTracked1: Forms.getToken('outlierValueTracked1Token'),
                                outlierValueTracked2: Forms.getToken('outlierValueTracked2Token')
                            };

                            historySerializer.persist(Searches.getSid(searchName), collection);

                            Searches.startSearch('outliersVizSearch')
                            Searches.startSearch('outliersVizSearchOutliersOnly');

                            var showOutliersOverTimeViz = false;

                            if (data != null && data.fields != null && data.rows != null && data.rows.length > 0) {
                                var timeIndex = data.fields.indexOf('_time');

                                // plotting the outliers count over time only makes sense on time-series data
                                if (timeIndex > -1 && data.rows[0][timeIndex] != null) {
                                    showOutliersOverTimeViz = true;
                                }
                            }

                            if (showOutliersOverTimeViz) {
                                Forms.setToken('showOutliersOverTimeToken', true);
                                Searches.startSearch('outliersOverTimeVizSearch');
                            } else {
                                Forms.unsetToken('showOutliersOverTimeToken');
                            }
                        },
                        onErrorCallback: function onErrorCallback(errorMessage) {
                            showErrorMessage(errorMessage);
                            hidePanels();
                        },
                        onFinallyCallback: function onFinallyCallback() {
                            updateForm(false);
                        }
                    });
                });
            })();

            (function setupResultsCountSearch() {
                var sharedSearchArray = ['| stats count'];

                var vizQueryArray = [];
                var vizQuerySearch = null;

                var vizOptions = DrilldownLinker.parseVizOptions({ category: 'singlevalue' });

                singleResultsPanel.openInSearchButton.on('click', function() {
                    //window.open(DrilldownLinker.getUrl('search', vizQuerySearch, vizOptions), '_blank');
                    window.open(DrilldownLinker.getUrl('search', vizQuerySearch), '_blank');
                });

                singleResultsPanel.showSPLButton.on('click', function() {
                    ModifiedLaunchQuerySPL('resultsCountSearchModal', 'Display the number of results', vizQueryArray, getFullSearchQueryComments().concat(['count the results']), baseTimerange, vizOptions);
                    //SearchStringDisplay.showSearchStringModal('resultsCountSearchModal', 'Display the number of results', vizQueryArray, getFullSearchQueryComments().concat(['count the results']), baseTimerange, vizOptions);
                });

                Searches.setSearch("resultsCountSearch", {
                    autostart: true,
                    targetJobIdTokenName: "resultsCountSearchToken",
                    searchString: ['| loadjob $outlierResultsSearchToken$'].concat(sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(singleResultsPanel.viz.$el);

                        vizQueryArray = getFullSearchQueryArray().concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(singleResultsPanel.title, vizQuerySearch, vizOptions);
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(singleResultsPanel.viz.$el);
                    }
                });
            })();

            (function setupEventCountCountSearch() {
                var sharedSearchArray = [' | eval totalcount = max(eventCount, resultCount, scanCount, \'performance.command.inputlookup.output_count\') | table totalcount '];

                var vizQueryArray = [];
                var vizQuerySearch = null;

                var vizOptions = DrilldownLinker.parseVizOptions({ category: 'singlevalue' });

                /*singleResultsPanel.openInSearchButton.on('click', function () {
                    window.open(DrilldownLinker.getUrl('search', vizQuerySearch, vizOptions), '_blank');
                });*/

                /*singleResultsPanel.showSPLButton.on('click', function () {
                    ModifiedLaunchQuerySPL('resultsCountSearchModal', 'Display the number of results', vizQueryArray, getFullSearchQueryComments().concat(['count the results']), baseTimerange, vizOptions);
                    //SearchStringDisplay.showSearchStringModal('resultsCountSearchModal', 'Display the number of results', vizQueryArray, getFullSearchQueryComments().concat(['count the results']), baseTimerange, vizOptions);
                });*/
                mysearch = Searches.getSearchManager("searchBarSearch");
                if (typeof mysearch != "undefined" && typeof mysearch.attributes.data != "undefined" && typeof mysearch.attributes.data.dispatchState != "undefined" && mysearch.attributes.data.dispatchState != "DONE") {

                    console.log("Hey DVeuve -- got my mysearch", mysearch, mysearch.attributes.data.eventCount, mysearch.attributes.data.resultCount)
                } else {
                    console.log("Hey DVeuve -- got my mysearch", mysearch)
                }
                Searches.setSearch("eventCountCountSearch", {
                    autostart: true,
                    targetJobIdTokenName: "resultsCountSearchToken",

                    searchString: ['| rest /services/search/jobs | search sid=$searchBarSearchJobIdToken$ '].concat(sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(singleResultsPanel.viz.$el);
                        vizQueryArray = getFullSearchQueryArray().concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(singleResultsPanel.title, vizQuerySearch, vizOptions);
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(singleResultsPanel.viz.$el);
                    }
                });
            })();

            (function setupOutliersCountSearch() {
                var sharedSearchArray = ['| where isOutlier=1', '| stats count'];

                var vizQueryArray = [];
                var vizQuerySearch = null;

                var vizOptions = DrilldownLinker.parseVizOptions({ category: 'singlevalue' });

                singleOutliersPanel.openInSearchButton.on('click', function() {
                    window.open(DrilldownLinker.getUrl('search', vizQuerySearch, vizOptions), '_blank');
                });

                singleOutliersPanel.showSPLButton.on('click', function() {
                    ModifiedLaunchQuerySPL('outliersCountSearchModal', 'Display the number of outliers', vizQueryArray, getFullSearchQueryComments().concat(['show only outliers', 'count the outliers']), baseTimerange, vizOptions);
                    //SearchStringDisplay.showSearchStringModal('outliersCountSearchModal', 'Display the number of outliers', vizQueryArray, getFullSearchQueryComments().concat(['show only outliers', 'count the outliers']), baseTimerange, vizOptions);
                });

                Searches.setSearch("outliersCountSearch", {
                    autostart: true,
                    targetJobIdTokenName: "outliersCountSearchToken",
                    searchString: ['| loadjob $outlierResultsSearchToken$'].concat(sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(singleOutliersPanel.viz.$el);

                        vizQueryArray = getFullSearchQueryArray().concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(singleOutliersPanel.title, vizQuerySearch, vizOptions);
                    },
                    onDataCallback: function onDataCallback(data) {
                        var countIndex = data.fields.indexOf('count');

                        if (data.rows.length > 0 && countIndex >= 0) {
                            var jobId = Searches.getSid(getCurrentSearchName());

                            var collection = {
                                outliers_count: data.rows[0][countIndex]
                            };

                            historySerializer.persist(jobId, collection);
                        }
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(singleOutliersPanel.viz.$el);
                    }
                });
            })();

            (function setupOutliersVizSearch() {
                var sharedSearchArray = ['| table $outlierValueTracked1Token|s$ $outlierValueTracked2Token|s$,  earliest, latest, maxlatest, isOutlier | convert ctime(earliest) ctime(latest) ctime(maxlatest)'];

                var vizQuerySearch = null;
                var vizQueryArray = [];

                var outliersVizAlertModal = null;

                var vizOptions = DrilldownLinker.parseVizOptions({
                    category: 'custom',
                    type: appName + ".OutliersViz"
                });

                function openInSearch() {
                    window.open(DrilldownLinker.getUrl('search', vizQuerySearch /*, vizOptions*/ ), '_blank');
                }

                function showSPL(e) {
                    // adjust the modal title depending on whether or not the modal is from the plot or not
                    var modalTitle = outliersVizPanel.showSPLButton.first().is($(e.target)) ? 'Plot the outliers' : 'Calculate the outliers';
                    ModifiedLaunchQuerySPL('outliersVizSearchModal', modalTitle, vizQueryArray, getFullSearchQueryComments(), baseTimerange, vizOptions)
                        //SearchStringDisplay.showSearchStringModal('outliersVizSearchModal', modalTitle, vizQueryArray, getFullSearchQueryComments(), baseTimerange, vizOptions);
                }
                setTimeout(function() {
                    $("#showSPLMenu").append($("<button>Show SPL (Splunk Search Language)</button>").click(function() { ModifiedLaunchQuerySPL('SearchModal', 'Show Search Query', vizQueryArray, getFullSearchQueryComments(), baseTimerange, vizOptions); }))
                }, 1500)

                function scheduleAlert() {

                    require(["components/data/sendTelemetry"], function(Telemetry) {
                        Telemetry.SendTelemetryToSplunk("PageStatus", { "status": "scheduleAlertStarted", "name": currentSampleSearch.label })
                    })
                    if (outliersVizAlertModal == null) {
                        (function() {
                            outliersVizAlertModal = new Modal('outliersVizAlertModal', {
                                title: 'Schedule an alert',
                                destroyOnHide: false,
                                type: 'wide'
                            });

                            var outlierSearchTypeControl = new DropdownView({
                                id: 'outliersVizAlertModalTypeControl',
                                el: $('<span>'),
                                labelField: 'label',
                                valueField: 'value',
                                showClearButton: false,
                                choices: [{ value: 'both', label: 'outside both thresholds' }, { value: 'above', label: 'above the upper threshold' }, { value: 'below', label: 'below the lower threshold' }]
                            }).render();

                            var outliersVizAlertModalValueControl = new TextInputView({
                                id: 'outliersVizAlertModalValueControl',
                                el: $('<span>')
                            }).render();

                            outliersVizAlertModal.body.addClass('mlts-modal-form-inline').append($('<p>').text('Alert me when the number of outliers is greater than '), outliersVizAlertModalValueControl.$el);

                            outliersVizAlertModal.footer.append($('<button>').addClass('mlts-modal-cancel').attr({
                                type: 'button',
                                'data-dismiss': 'modal'
                            }).addClass('btn btn-default mlts-modal-cancel').text('Cancel'), $('<button>').attr({
                                type: 'button'
                            }).on('click', function() {
                                outliersVizAlertModal.removeAlert();

                                var minOutliersCount = outliersVizAlertModalValueControl.val();

                                var isValid = NumberValidator.validate(minOutliersCount, { min: 0 });

                                Messages.setFormInputStatus(outliersVizAlertModalValueControl, isValid);

                                if (isValid) {
                                    var searchString = Forms.parseTemplate(getFullSearchQueryArray(outlierSearchTypeControl.val()).join('') + " | search isOutlier=1");

                                    outliersVizAlertModal.hide();

                                    var alertModal = new AlertModal({
                                        searchString: searchString
                                    });


                                    alertModal.model.alert.cron.set({
                                        "cronType": "custom",
                                        "cron_schedule": "37 1 * * *",
                                        "dayOfWeek": "*",
                                        "hour": "1",
                                        "minute": "37"
                                    });

                                    alertModal.model.alert.workingTimeRange.set("earliest", "-30d@d")
                                    alertModal.model.alert.workingTimeRange.set("latest", "@d")
                                    alertModal.model.alert.entry.content.set("name", currentSampleSearch.label.replace(" - Demo", "").replace(" - Live", "").replace(" - Accelerated", "").replace(/ /g, "_", "g").replace(/#/g, "Num"));
                                    alertModal.model.alert.entry.content.set("description", "Generated by the Splunk Security Essentials app at " + (new Date().toUTCString()));


                                    alertModal.model.alert.entry.content.set('ui.scheduled.resultsinput', minOutliersCount);


                                    console.log("About to set Params", window.actions)
                                    if (typeof window.actions.createUBA != "undefined") {
                                        console.log("ParamBeingSet", window.actions.createUBA);
                                        alertModal.model.alert.entry.content.set('action.send2uba', window.actions.createUBA);
                                    }
                                    if (typeof window.actions.UBASeverity != "undefined") {
                                        console.log("ParamBeingSet", window.actions.UBASeverity);
                                        alertModal.model.alert.entry.content.set('action.send2uba.param.severity', window.actions.UBASeverity);
                                    }
                                    if (typeof window.actions.createNotable != "undefined") {
                                        console.log("ParamBeingSet", window.actions.createNotable);
                                        alertModal.model.alert.entry.content.set('action.notable', window.actions.createNotable);
                                    }
                                    if (typeof window.actions.createRisk != "undefined") {
                                        console.log("ParamBeingSet", window.actions.createRisk);
                                        alertModal.model.alert.entry.content.set('action.risk', window.actions.createRisk);
                                    }
                                    if (typeof window.actions.riskObject != "undefined") {
                                        console.log("ParamBeingSet", window.actions.riskObject);
                                        alertModal.model.alert.entry.content.set('action.risk.param._risk_object', window.actions.riskObject);
                                    }
                                    if (typeof window.actions.riskObjectType != "undefined") {
                                        console.log("ParamBeingSet", window.actions.riskObjectType);
                                        alertModal.model.alert.entry.content.set('action.risk.param._risk_object_type', window.actions.riskObjectType);
                                    }
                                    if (typeof window.actions.riskObjectScore != "undefined") {
                                        console.log("ParamBeingSet", window.actions.riskObjectScore);
                                        alertModal.model.alert.entry.content.set('action.risk.param._risk_score', window.actions.riskObjectScore);
                                    }
                                    console.log("Here's my thing...", alertModal, window.actions);
                                    alertModal.render().appendTo($('body')).show();
                                    setTimeout(function() {
                                        $(".alert-save-as").find("a:contains(Save)").click(function() {
                                            require([
                                                "jquery", "components/data/sendTelemetry"
                                            ], function($, Telemetry) {
                                                Telemetry.SendTelemetryToSplunk("PageStatus", { "status": "scheduleAlertCompleted", "searchName": currentSampleSearch.label })
                                            })
                                        })
                                    }, 500)
                                } else {
                                    outliersVizAlertModal.setAlert('Alert count must be a positive number.');
                                }
                            }).addClass('btn btn-primary mlts-modal-submit').text('Next'));

                            outliersVizAlertModal.$el.on('show.bs.modal', function() {
                                outliersVizAlertModal.removeAlert();
                                Messages.setFormInputStatus(outliersVizAlertModalValueControl, true);

                                outlierSearchTypeControl.val('both');
                                outliersVizAlertModalValueControl.val(0);
                            });
                        })();
                    }

                    outliersVizAlertModal.show();
                }






                assistantControlsFooter.controls.openInSearchButton.on('click', openInSearch);
                assistantControlsFooter.controls.showSPLButton.on('click', showSPL);

                outliersVizPanel.openInSearchButton.on('click', openInSearch);
                outliersVizPanel.showSPLButton.on('click', showSPL);

                outliersTablePanel.openInSearchButton.on('click', openInSearch);
                outliersTablePanel.showSPLButton.on('click', showSPL);

                outliersVizPanel.scheduleAlertButton.on('click', scheduleAlert);

                singleOutliersPanel.scheduleAlertButton.on('click', scheduleAlert);

                Searches.setSearch('outliersVizSearch', {
                    autostart: false, // this doesn't autostart on purpose, to prevent the chart from flickering when the user changes the "Field to predict" but doesn't actually run the search
                    searchString: ['| loadjob $outlierResultsSearchToken$| search isOutlier=1'].concat(sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(outliersVizPanel.viz.$el);
                        Messages.removeAlert(outliersVizPanel.message, true);
                    },
                    onDoneCallback: function onDoneCallback() {
                        vizQueryArray = getFullSearchQueryArray().concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(outliersTablePanel.title, vizQuerySearch);
                        DrilldownLinker.setSearchDrilldown(outliersVizPanel.title, vizQuerySearch, vizOptions);
                    },
                    onDataCallback: function onDataCallback(data) {
                        if (data != null && data.fields != null && data.rows != null && data.rows.length > 0) {
                            (function() {
                                var tableFields = data.fields;
                                var timeIndex = tableFields.indexOf('_time');

                                var outlierVariableToken = Forms.getToken('outlierVariableToken');
                                var outlierVariableIndex = tableFields.indexOf(outlierVariableToken);

                                var nonNumeric = data.rows.every(function(row) {
                                    return isNaN(parseFloat(row[outlierVariableIndex]));
                                });

                                if (nonNumeric) {
                                    Messages.setAlert(outliersVizPanel.message, "All values in \"" + outlierVariableToken + "\" are non-numeric. You may be able to analyze this data in the \"Detect Categorical Outliers\" assistant.", 'error', 'alert-inline', true);
                                }

                                // if the data isn't time-series, remove the _time column from the table
                                if (timeIndex === -1 || data.rows[0][timeIndex] == null) tableFields.splice(timeIndex, 1);

                                outliersTablePanel.viz.settings.set('fields', tableFields);
                            })();
                        }
                    },
                    onErrorCallback: function onErrorCallback() {
                        Messages.removeAlert(outliersVizPanel.message, true);
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(outliersVizPanel.viz.$el);
                    }
                });



                Searches.setSearch('outliersVizSearchOutliersOnly', {
                    autostart: false, // this doesn't autostart on purpose, to prevent the chart from flickering when the user changes the "Field to predict" but doesn't actually run the search
                    searchString: ['| loadjob $outlierResultsSearchToken$ '].concat(sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(outliersVizPanel.viz.$el);
                        Messages.removeAlert(outliersVizPanel.message, true);
                    },
                    onDoneCallback: function onDoneCallback() {
                        vizQueryArray = getFullSearchQueryArray().concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(outliersTablePanel.title, vizQuerySearch);
                        DrilldownLinker.setSearchDrilldown(outliersVizPanel.title, vizQuerySearch, vizOptions);
                    },
                    onDataCallback: function onDataCallback(data) {
                        if (data != null && data.fields != null && data.rows != null && data.rows.length > 0) {
                            (function() {
                                var tableFields = data.fields;
                                var timeIndex = tableFields.indexOf('_time');

                                var outlierVariableToken = Forms.getToken('outlierVariableToken');
                                var outlierVariableIndex = tableFields.indexOf(outlierVariableToken);

                                var nonNumeric = data.rows.every(function(row) {
                                    return isNaN(parseFloat(row[outlierVariableIndex]));
                                });

                                if (nonNumeric) {
                                    Messages.setAlert(outliersVizPanel.message, "All values in \"" + outlierVariableToken + "\" are non-numeric. You may be able to analyze this data in the \"Detect Categorical Outliers\" assistant.", 'error', 'alert-inline', true);
                                }

                                // if the data isn't time-series, remove the _time column from the table
                                if (timeIndex === -1 || data.rows[0][timeIndex] == null) tableFields.splice(timeIndex, 1);

                                outliersTablePanel.viz.settings.set('fields', tableFields);
                            })();
                        }
                    },
                    onErrorCallback: function onErrorCallback() {
                        Messages.removeAlert(outliersVizPanel.message, true);
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(outliersVizPanel.viz.$el);
                    }
                });
            })();

            (function setupOutliersOverTimeVizSearch() {
                var sharedSearchArray = ['| timechart sum(isOutlierUpper), sum(isOutlierLower)'];

                var vizQueryArray = [];
                var vizQuerySearch = null;

                var vizOptions = DrilldownLinker.parseVizOptions({
                    category: 'charting',
                    type: 'column'
                });

                vizOptions['display.visualizations.charting.chart.stackMode'] = 'stacked';

                outliersOverTimeVizPanel.openInSearchButton.on('click', function() {
                    window.open(DrilldownLinker.getUrl('search', vizQueryArray, vizOptions), '_blank');
                });

                outliersOverTimeVizPanel.showSPLButton.on('click', function() {
                    ModifiedLaunchQuerySPL('outliersOverTimeVizSearchModal', 'Plot the outlier count over time', vizQueryArray, getFullSearchQueryComments().concat(['plot the outlier count over time']), baseTimerange, vizOptions);
                    //SearchStringDisplay.showSearchStringModal('outliersOverTimeVizSearchModal', 'Plot the outlier count over time', vizQueryArray, getFullSearchQueryComments().concat(['plot the outlier count over time']), baseTimerange, vizOptions);
                });

                Searches.setSearch('outliersOverTimeVizSearch', {
                    autostart: false,
                    searchString: ['| loadjob $outlierResultsSearchToken$'].concat([returnSearchString().split], sharedSearchArray),
                    onStartCallback: function onStartCallback() {
                        Spinners.showLoadingOverlay(outliersOverTimeVizPanel.viz.$el);

                        vizQueryArray = getFullSearchQueryArray('split').concat(sharedSearchArray);
                        vizQuerySearch = DrilldownLinker.createSearch(vizQueryArray, baseTimerange);

                        DrilldownLinker.setSearchDrilldown(outliersOverTimeVizPanel.title, vizQuerySearch, vizOptions);
                    },
                    onFinallyCallback: function onFinallyCallback() {
                        Spinners.hideLoadingOverlay(outliersOverTimeVizPanel.viz.$el);
                    }
                });
            })();
        }

        (function setupQueryHistorySearch() {
            Searches.setSearch('queryHistorySearch', {
                searchString: compact(_templateObject2, showcaseName)
            });
        })();

        function getCurrentSearchName() {
            console.log("HEY DAVID, I'm running getCurrentSearchName..", Forms.getToken("useCurrentPointToken"), Forms.getToken("outlierPeerGroupControlToken"))
            var AddLookup = ""
            if (typeof Forms.getToken("lookupToken") != "undefined" && Forms.getToken("lookupToken") != "None") {
                AddLookup = "-Lookup"
            }
            if (typeof Forms.getToken("outlierPeerGroupControlToken") == "undefined") {
                Forms.setToken("outlierPeerGroupControlToken", "None")
                console.log("And now after..., I'm running getCurrentSearchName..", Forms.getToken("useCurrentPointToken"), Forms.getToken("outlierPeerGroupControlToken"))
            }
            if (Forms.getToken("useCurrentPointToken") == true) {
                if (typeof Forms.getToken("outlierPeerGroupControlToken") != "undefined" && Forms.getToken("outlierPeerGroupControlToken").length > 0 && Forms.getToken("outlierPeerGroupControlToken") != "None") {
                    console.log("NewSearch: ", "findNewValuesPeer-Demo" + AddLookup)
                    return "findNewValuesPeer-Demo" + AddLookup;
                } else {
                    console.log("NewSearch: ", "findNewValues-Demo" + AddLookup)
                    return "findNewValues-Demo" + AddLookup;
                }
            } else {
                if (typeof Forms.getToken("outlierPeerGroupControlToken") != "undefined" && Forms.getToken("outlierPeerGroupControlToken").length > 0 && Forms.getToken("outlierPeerGroupControlToken") != "None") {

                    console.log("NewSearch: ", "findNewValuesPeer" + AddLookup)
                    return "findNewValuesPeer" + AddLookup;
                } else {
                    console.log("NewSearch: ", "findNewValues" + AddLookup)
                    return "findNewValues" + AddLookup;
                }
            }

        }

        function submitForm() {
            // the controlValidity.getAll() check is intentionally made here so that the user can try to submit the form even with empty fields
            // the submission will fail and they'll see the appropriate errors
            console.log("starting submitform function")
            if (!assistantControlsFooter.getDisabled() && controlValidity.getAll()) {
                //currentSampleSearch = null;

                if (typeof currentSampleSearch != "undefined" && currentSampleSearch != null && currentSampleSearch.outlierValueTracked1 == null && currentSampleSearch.outlierValueTracked2 == null) currentSampleSearch = null;

                Object.keys(outlierResultsSearchSettings).forEach(function() {
                    return Searches.cancelSearch;
                });
                console.log("Starting search... ", getCurrentSearchName())
                Searches.startSearch(getCurrentSearchName());
            }
        }

        /**
         * gets the current full search query as an array, where array[0] is the search bar search
         * @param {string} [outliersFilterType='both'] Whether to report points "above", "below", or "both" as outliers
         * @returns {Array}
         */
        function getFullSearchQueryArray() {
            var outliersFilterType = arguments.length <= 0 || arguments[0] === undefined ? 'both' : arguments[0];

            var fullSearchQueryArray = [];
            var outlierResultsSearchQuery = outlierResultsSearchSettings[getCurrentSearchName()];

            if (baseSearchString != null && outlierResultsSearchQuery != null) {
                fullSearchQueryArray[0] = baseSearchString;

                for (var i = 0; i < outlierResultsSearchQuery.search.length; i++) {
                    fullSearchQueryArray[i + 1] = outlierResultsSearchQuery.search[i];
                }

                fullSearchQueryArray.push(returnSearchString()[outliersFilterType]);
            }

            return fullSearchQueryArray;
        }

        function getFullSearchQueryComments() {
            console.log("Testing the getFullSearchQueryComments:", outlierResultsSearchSettings[getCurrentSearchName()].description, ['values outside the bounds are outliers'])
            console.log("Testing the getFullSearchQueryComments (2):", [null].concat(outlierResultsSearchSettings[getCurrentSearchName()].description, ['values outside the bounds are outliers']))

            return [null].concat(outlierResultsSearchSettings[getCurrentSearchName()].description, ['values outside the bounds are outliers']);
        }

        var updateForm = function updateForm(newIsRunningValue) {
            // optionally set a new value for isRunning
            console.log("Starting updateForm", isRunning, newIsRunningValue)
            if (newIsRunningValue != null) isRunning = newIsRunningValue;

            outlierValueTracked1Control.settings.set('disabled', isRunning);
            outlierValueTracked2Control.settings.set('disabled', isRunning);

            if (isRunning) {
                console.log("updateForm - checkpoint 1")
                assistantControlsFooter.setDisabled(true);
                assistantControlsFooter.controls.submitButton.text('Detecting Outliers...');
            } else {

                console.log("updateForm - checkpoint 2")
                var outlierValueTracked1 = Forms.getToken('outlierValueTracked1Token');
                var outlierValueTracked2 = Forms.getToken('outlierValueTracked2Token');
                var fieldsValid = outlierValueTracked1 != null && outlierValueTracked1.length > 0 && outlierValueTracked2 != null && outlierValueTracked2.length > 0;

                console.log("updateForm - checkpoint 3", fieldsValid)
                assistantControlsFooter.setDisabled(!fieldsValid);
                assistantControlsFooter.controls.submitButton.text(submitButtonText);
                $("button:contains(Show SPL)")[0].disabled = false
                $("button:contains(Show SPL)").first().unbind("click")
                $("button:contains(Show SPL)").first().click(function() { window.dvtestLaunchQuery() });

            }
        };

        function showErrorMessage(errorMessage) {
            var errorDisplay$El = $("#errorDisplay");
            Messages.setAlert(errorDisplay$El, errorMessage, undefined, undefined, true);
        }

        function hideErrorMessage() {
            var errorDisplay$El = $("#errorDisplay");
            Messages.removeAlert(errorDisplay$El, true);
        }

        function showPanels() {
            Forms.setToken('showResultPanelsToken', true);
        }

        function hidePanels() {
            Forms.unsetToken('showResultPanelsToken');
        }



        function runPreReqs(prereqs) {
            if (prereqs.length > 0) {
                window.datacheck = []
                console.log("Got " + prereqs.length + " prereqs!");
                $("<div id=\"row11\" class=\"dashboard-row dashboard-row1 splunk-view\">        <div id=\"panel11\" class=\"dashboard-cell last-visible splunk-view\" style=\"width: 100%;\">            <div class=\"dashboard-panel clearfix\" style=\"min-height: 0px;\"><h2 class=\"panel-title empty\"></h2><div id=\"view_22841\" class=\"fieldset splunk-view editable hide-label hidden empty\"></div>                                <div class=\"panel-element-row\">                    <div id=\"element11\" class=\"dashboard-element html splunk-view\" style=\"width: 100%;\">                        <div class=\"panel-body html\">                            <table class=\"table table-striped\" id=\"data_check_table\" >                            <tr><td>Data Check</td><td>Status</td><td>Open in Search</td><td>Resolution (if needed)</td></tr>                            </table>                        </div>                    </div>                </div>            </div>        </div>    </div>").insertBefore($(".fieldset").first())
                for (var i = 0; i < prereqs.length; i++) {
                    window.datacheck[i] = new Object
                        // create table entry including unique id for the status
                    $("#data_check_table tr:last").after("<tr><td>" + prereqs[i].name + "</td><td id=\"data_check_test" + i + "\"><img title=\"Checking...\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/loader.gif\"></td><td><a target=\"_blank\" href=\"/app/Splunk_Essentials_For_Telco/search?q=" + encodeURI(prereqs[i].test) + "\">Open in Search</a></td><td>" + prereqs[i].resolution + "</td></tr>")

                    // create search manager

                    window.datacheck[i].mainSearch = new SearchManager({
                        "id": "data_check_search" + i,
                        "cancelOnUnload": true,
                        "latest_time": "",
                        "status_buckets": 0,
                        "earliest_time": "0",
                        "search": prereqs[i].test,
                        "app": appName,
                        "auto_cancel": 90,
                        "preview": true,
                        "runWhenTimeIsUndefined": false
                    }, { tokens: true, tokenNamespace: "submitted" });


                    window.datacheck[i].myResults = window.datacheck[i].mainSearch.data('results', { output_mode: 'json', count: 0 });

                    window.datacheck[i].mainSearch.on('search:error', function(properties) {
                        var searchName = properties.content.request.label
                        var myCheckNum = searchName.substr(17, 20)
                        $("#row11").css("display", "block")
                        document.getElementById("data_check_test" + myCheckNum).innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                        console.log("Data Check Failure code 3", searchName, myCheckNum, prereqs[myCheckNum])

                    });
                    window.datacheck[i].mainSearch.on('search:fail', function(properties) {

                        var searchName = properties.content.request.label
                        var myCheckNum = searchName.substr(17, 20)
                        $("#row11").css("display", "block")
                        document.getElementById("data_check_test" + myCheckNum).innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                        console.log("Data Check Failure code 4", searchName, myCheckNum, prereqs[myCheckNum])

                    });
                    window.datacheck[i].mainSearch.on('search:done', function(properties) {
                        var searchName = properties.content.request.label
                        var myCheckNum = searchName.substr(17, 20)

                        console.log("Got Results from Data Check Search", searchName, myCheckNum, properties);

                        if (window.datacheck[myCheckNum].mainSearch.attributes.data.resultCount == 0) {
                            document.getElementById("data_check_test" + myCheckNum).innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                            console.log("Data Check Failure code 1", preqreqs[myCheckNum])
                            return;
                        }

                        window.datacheck[myCheckNum].myResults.on("data", function(properties) {

                            var searchName = properties.attributes.manager.id
                            var myCheckNum = searchName.substr(17, 20)
                            var data = window.datacheck[myCheckNum].myResults.data().results;

                            status = false;
                            if (typeof data[0][prereqs[myCheckNum].field] !== "undefined") {
                                status = true;
                                if (typeof prereqs[myCheckNum].greaterorequalto !== "undefined") {
                                    if (data[0][prereqs[myCheckNum].field] >= prereqs[myCheckNum].greaterorequalto) {
                                        status = true;
                                    } else {
                                        status = false;
                                    }
                                }
                            }

                            if (status == "true") {
                                document.getElementById("data_check_test" + myCheckNum).innerHTML = "<img title=\"Success\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/ok_ico.gif\">";
                                console.log("Data Check success", searchName, myCheckNum, prereqs[myCheckNum])
                            } else {
                                document.getElementById("data_check_test" + myCheckNum).innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                                $("#row11").css("display", "block")
                                console.log("Data Check Failure code 2", searchName, myCheckNum, prereqs[myCheckNum])
                            }

                        });
                    });

                }
            }
        }


        function setCurrentSampleSearch(sampleSearch) {
            console.log("Hello 6", sampleSearch)
            currentSampleSearch = _.extend({}, {
                // outlierSearchType: 'Avg',
                // scaleFactor: 2,
                useCurrentPoint: true
            }, sampleSearch);

            var isWindowed = 0; //currentSampleSearch.windowSize != null && currentSampleSearch.windowSize > 0;

            //outlierSearchTypeControl.val(currentSampleSearch.outlierSearchType);

            //scaleFactorControl.val(currentSampleSearch.scaleFactor);

            //windowedAnalysisCheckboxControl.val(isWindowed);

            //windowSizeControl.val(isWindowed ? currentSampleSearch.windowSize : 0);

            currentPointCheckboxControl.val(currentSampleSearch.useCurrentPoint);
            var earliest = currentSampleSearch.earliestTime
            var latest = currentSampleSearch.latestTime
            if (currentSampleSearch.value.match(/^\s*\|\s*inputlookup/)) {
                earliest = 0
                latest = "now"
            } else {
                earliest = "-30d@d"
                latest = "@d"
            }
            console.log("showcase Time Range Settings...", earliest, latest, currentSampleSearch.value, currentSampleSearch.value.match(/^\s*\|\s*inputlookup/))
            searchBarControl.setProperties(currentSampleSearch.value, earliest, latest);
            window.actions = new Object();
            for (var param in currentSampleSearch) {
                if (param.indexOf("actions_") != -1) {
                    newfield = param.substr(8, 100)
                    window.actions[newfield] = currentSampleSearch[param]
                    console.log("Found an Action config", param, param.indexOf("actions_"), newfield, param.substr(8, 100), window.actions[newfield])
                }
            }
            window.actions.createUBA = window.actions.createUBA || 1
            if (window.actions.createUBA == 1) {
                window.actions.UBASeverity = window.actions.UBASeverity || 5;
            }
            if (window.actions.createRisk == 1) {
                window.actions.riskObjectType = window.actions.riskObjectType || "system";
                window.actions.riskObject = window.actions.riskObject || currentSampleSearch.outlierVariableSubject;
                window.actions.riskObjectScore = window.actions.riskObjectScore || 10;


            }

            // outlierVariable is the only part of the sample search that has to be set asynchronously
            // if it's null, we can remove the sample search now

            if (typeof currentSampleSearch.prereqs !== 'undefined') {
                console.log("Running my prereqs..", currentSampleSearch.prereqs)
                    /*require(["components/data/parameters/HandlePreRequisites"], function(HandlePreRequisites, currentSampleSearch){
                        HandlePreRequisites.runPreReqs(currentSampleSearch.prereqs)    
                    })*/
                runPreReqs(currentSampleSearch.prereqs)

            }

            console.log("Hi, we're running")








            var DoCheck = function() {
                console.log("ShowcaseInfo: - Checking ShowcaseInfo", ShowcaseInfo, showcaseName)
                if (window.location.href.match(/app\/Splunk_Essentials_For_Telco\/showcase_standard_deviation\/?$/)) {
                    //    process_chosen_summary(ShowcaseInfo.summaries["showcase_standard_deviation_generic"], "generic")
                } else if (window.location.href.match(/app\/Splunk_Essentials_For_Telco\/showcase_first_seen_demo\/?$/)) {
                    //    process_chosen_summary(ShowcaseInfo.summaries["showcase_first_seen_generic"], "generic")
                } else if (window.location.href.match(/app\/Splunk_Essentials_For_Telco\/showcase_simple_search\/?$/)) {
                    //    process_chosen_summary(ShowcaseInfo.summaries["showcase_simple_search"], "generic")
                } else {
                    for (var summary in ShowcaseInfo.summaries) {
                        summary = ShowcaseInfo.summaries[summary]
                        dashboardname = summary.dashboard
                        if (dashboardname.indexOf("?") > 0) {
                            dashboardname = dashboardname.substr(0, dashboardname.indexOf("?"))
                        }
                        if (typeof summary.examples != "undefined" && dashboardname == showcaseName) {
                            for (var example in summary.examples) {
                                if (summary.examples[example].name == sampleSearch.label) {
                                    ProcessSummaryUI.process_chosen_summary(summary, sampleSearch, ShowcaseInfo, showcaseName)
                                }

                            }
                        }
                    }
                }
            }






            var Loop = function() {
                console.log("Hey, I'm in the ShowcaseInfo loop!", ShowcaseInfo)
                if (typeof ShowcaseInfo != "undefined" && typeof ShowcaseInfo.summaries != "undefined") {
                    DoCheck()
                } else {
                    setTimeout(function() { Loop() }, 200)
                }
            }

            Loop()

            if (currentSampleSearch.outlierValueTracked1 == null && currentSampleSearch.outlierValueTracked2 == null) currentSampleSearch = null;

        }

        var tabsControl = function() {
            return new Tabs($('#dashboard-form-tabs'), $('#dashboard-form-controls'));
        }();

        var searchBarControl = function() {
            return new SearchBarWrapper({
                "id": "searchBarControl",
                "managerid": "searchBarSearch",
                "el": $("#searchBarControl"),
                "autoOpenAssistant": false
            }, {
                "id": "searchControlsControl",
                "managerid": "searchBarSearch",
                "el": $("#searchControlsControl")
            }, function() {
                Forms.clearChoiceView(outlierValueTracked1Control, true);
                Forms.clearChoiceView(outlierValueTracked2Control, true);
                Forms.clearChoiceView(outlierPeerGroupControl, true);
                Forms.unsetToken('outlierValueTracked1Token');
                Forms.unsetToken('outlierValueTracked2Token');
                Forms.unsetToken('outlierPeerGroupControlToken');

                var searchBarSearch = Searches.getSearchManager("searchBarSearch");

                baseSearchString = this.searchBarView.val();
                baseTimerange = this.searchBarView.timerange.val();

                searchBarSearch.settings.unset("search");
                searchBarSearch.settings.set("search", baseSearchString);
                searchBarSearch.search.set(baseTimerange);

                window.dvtestLaunchQuery = function() {
                    ModifiedLaunchQuerySPL('outliersVizSearchModal', "View SPL", getFullSearchQueryArray(), getFullSearchQueryComments(), baseTimerange, {})

                }

                updateForm();
            });
        }();



        // ModifiedLaunchQuerySPL('outliersVizSearchModal', modalTitle, vizQueryArray, getFullSearchQueryComments(), baseTimerange, vizOptions)
        var ModifiedLaunchQuerySPL = function(modalName, modalTitle, vizQueryArray, vizQueryComments, baseTimerange, vizOptions) {
            vizQueryArray = getFullSearchQueryArray();
            vizQueryComments = getFullSearchQueryComments()
            console.log("Here's the query..", vizQueryArray, vizQueryComments, currentSampleSearch)
                //Time to break apart the base string, but only if we actually have a description.
            if (typeof currentSampleSearch.description != "undefined" && currentSampleSearch.description.length > 0) {
                lineOneComponents = vizQueryArray[0].split("\n")
                vizQueryArray.splice(0, 1)
                vizQueryComments.splice(0, 1)
                for (var i = lineOneComponents.length - 1; i >= 0; i--) {
                    if (currentSampleSearch.description.length > i) {
                        vizQueryArray.unshift(lineOneComponents[i])
                        vizQueryComments.unshift(currentSampleSearch.description[i])
                    } else {
                        vizQueryArray.unshift(lineOneComponents[i])
                        vizQueryComments.unshift("")
                    }
                }
            }
            SearchStringDisplay.showSearchStringModal(modalName, modalTitle, vizQueryArray, vizQueryComments, baseTimerange, vizOptions);

            var tableheight = $("#" + modalName).find("table").height()
            var modalheight = $("#" + modalName).height()
            var windowheight = $(window).height()
            if (tableheight != modalheight) {
                if (tableheight > modalheight && tableheight < windowheight - 100) {
                    $("#" + modalName).height(tableheight + 60)
                } else if (tableheight > modalheight) {
                    $("#" + modalName).height(windowheight - 100)
                    $("#" + modalName).css("overflow", "scroll")
                }

            }
            console.log("Logic around modal height..", "Tableheight: " + tableheight, "Modalheight: " + modalheight, "Window height: ", windowheight, "finalHeight (similar to modal): " + $("#" + modalName).height(windowheight - 100))
            require([
                "jquery", "components/data/sendTelemetry"
            ], function($, Telemetry) {
                console.log("Telemetry Loaded", Telemetry)
                Telemetry.SendTelemetryToSplunk("PageStatus", { "status": "SPLViewed", "name": currentSampleSearch.label })
            })
        }




        // target variable control
        var outlierValueTracked1Control = function() {
            var outlierValueTracked1Control = new DropdownView({
                "id": "outlierValueTracked1Control",
                "managerid": "outlierVariableSearch",
                "el": $("#outlierValueTracked1Control"),
                "labelField": "column",
                "valueField": "column",
                showClearButton: false
            });

            outlierValueTracked1Control.on('datachange', function() {
                if (currentSampleSearch != null) {
                    var choices = Forms.getChoiceViewChoices(outlierValueTracked1Control);
                    console.log("BTW -- from variablecontrol...", currentSampleSearch)
                    if (choices.indexOf(currentSampleSearch.outlierValueTracked1) >= 0) {
                        outlierValueTracked1Control.val(currentSampleSearch.outlierValueTracked1);
                    } else {
                        // if the outlier variable can't be selected, we can remove the sample search since it's no longer relevant
                        currentSampleSearch.outlierValueTracked1 = null;
                    }
                    if (currentSampleSearch.outlierValueTracked1 == null && currentSampleSearch.outlierValueTracked2 == null) {
                        currentSampleSearch = null;
                        updateForm(false);
                    }
                }
            });

            outlierValueTracked1Control.on('change', function(value) {
                Forms.setToken("outlierValueTracked1Token", value);

                updateForm();

                if (currentSampleSearch.autostart !== false) {
                    assistantControlsFooter.controls.submitButton.trigger('submit');
                } else {
                    // if the sample search isn't auto-running, we want to remove it since it's no longer relevant
                    //currentSampleSearch = null;
                }
            });

            outlierValueTracked1Control.render();

            return outlierValueTracked1Control;
        }();

        var outlierValueTracked2Control = function() {
            var outlierValueTracked2Control = new DropdownView({
                "id": "outlierValueTracked2Control",
                "managerid": "outlierVariableSearch",
                "el": $("#outlierValueTracked2Control"),
                "labelField": "column",
                "valueField": "column",
                showClearButton: false
            });

            outlierValueTracked2Control.on('datachange', function() {

                console.log("BTW -- from variablesubjectcontrol...", currentSampleSearch)
                if (currentSampleSearch != null) {

                    var choices = Forms.getChoiceViewChoices(outlierValueTracked2Control);

                    if (choices.indexOf(currentSampleSearch.outlierValueTracked2) >= 0) {
                        outlierValueTracked2Control.val(currentSampleSearch.outlierValueTracked2);
                    } else {
                        // if the outlier variable can't be selected, we can remove the sample search since it's no longer relevant
                        currentSampleSearch.outlierValueTracked2 = null;
                    }
                    if (currentSampleSearch.outlierValueTracked1 == null && currentSampleSearch.outlierValueTracked2 == null) {
                        currentSampleSearch = null;
                        updateForm(false);
                    }
                }
            });

            outlierValueTracked2Control.on('change', function(value) {
                Forms.setToken("outlierValueTracked2Token", value);

                updateForm();
                /*
                            if (currentSampleSearch.autostart !== false) {
                                assistantControlsFooter.controls.submitButton.trigger('submit');
                            } else {
                                // if the sample search isn't auto-running, we want to remove it since it's no longer relevant
                                currentSampleSearch = null;
                            }*/
            });

            outlierValueTracked2Control.render();

            return outlierValueTracked2Control;
        }();


        var outlierPeerGroupSearch = new SearchManager({
            "id": "outlierPeerGroupSearch",
            "sample_ratio": null,
            "latest_time": "now",
            "earliest_time": "@d",
            "cancelOnUnload": true,
            "status_buckets": 0,
            "search": "| REST /servicesNS/-/-/data/transforms/lookups | search fields_list=\"*user*\" fields_list=\"*peergroup*\" | table title filename | rename title as name",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false,
            "autostart": false
        }, { tokens: true });

        var outlierPeerGroupControl = function() {
            var outlierPeerGroupControl = new DropdownView({
                "id": "outlierPeerGroupControl",
                "managerid": "outlierPeerGroupSearch",
                "el": $("#outlierPeerGroupControl"),
                "labelField": "name",
                "valueField": "filename",
                "choices": [
                    { "label": "No Peer Group", "value": "None" }
                ],
                "selectFirstChoice": true,
                "default": "None",
                "showClearButton": true,
                "searchWhenChanged": true,
                "value": "$form.field1$",
                //"managerid": "search1",
                showClearButton: false
            });

            outlierPeerGroupControl.on('datachange', function() {

                console.log("BTW -- from peergroupcontrol...", currentSampleSearch)
                if (currentSampleSearch != null) {
                    var choices = Forms.getChoiceViewChoices(outlierPeerGroupControl);

                    console.log("Finally live...", currentSampleSearch, choices)
                    if (choices.indexOf(currentSampleSearch.outlierPeerGroup) >= 0) {
                        outlierPeerGroupControl.val(currentSampleSearch.outlierPeerGroup);
                    }
                    /*else {
                                      // if the outlier variable can't be selected, we can remove the sample search since it's no longer relevant
                                      currentSampleSearch.outlierPeerGroup = null;
                                  }*/
                }
            });

            outlierPeerGroupControl.on('change', function(value) {
                Forms.setToken("outlierPeerGroupControlToken", value);

                updateForm();
                /*
                            if (currentSampleSearch.autostart !== false) {
                                assistantControlsFooter.controls.submitButton.trigger('submit');
                            } else {
                                // if the sample search isn't auto-running, we want to remove it since it's no longer relevant
                                currentSampleSearch = null;
                            }*/
            });

            outlierPeerGroupControl.render();

            return outlierPeerGroupControl;
        }();




        var lookupCacheSearch = new SearchManager({
            "id": "lookupCacheSearch",
            "sample_ratio": null,
            "latest_time": "now",
            "earliest_time": "@d",
            "cancelOnUnload": true,
            "status_buckets": 0,
            "search": "| REST /servicesNS/-/-/data/transforms/lookups  | regex fields_list=\"[ ^,]earliest(\$| |,)\"| regex fields_list=\"[ ^,]latest(\$| |,)\" | table title fields_list filename | rename title as name| eval filename=coalesce(filename, name)",
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "runWhenTimeIsUndefined": false,
            "autostart": true
        }, { tokens: true });

        var lookupCacheControl = function() {
            var lookupCacheControl = new DropdownView({
                "id": "lookupCacheControl",
                "managerid": "lookupCacheSearch",
                "el": $("#lookupCacheControl"),
                "labelField": "name",
                "valueField": "filename",
                "choices": [
                    { "label": "No Lookup Cache", "value": "None" }
                ],
                "selectFirstChoice": true,
                "default": "None",
                "showClearButton": true,
                "searchWhenChanged": true,
                //"value": "$form.field2",
                showClearButton: false
            });

            lookupCacheControl.on('datachange', function() {


                if (currentSampleSearch != null) {
                    var choices = Forms.getChoiceViewChoices(lookupCacheControl);
                    if (choices.indexOf(currentSampleSearch.lookupCache) >= 0) {
                        lookupCacheControl.val(currentSampleSearch.lookupCache);
                    }
                }
            });

            lookupCacheControl.on('change', function(value) {
                if (value != "None") {

                    window.AllClearForLookupToken = false
                    confirmVizAlertModal = new Modal('outliersVizAlertModal', {
                        title: 'Schedule an alert',
                        destroyOnHide: false,
                        type: 'wide'
                    });


                    window.confirmVizAlertModal = confirmVizAlertModal

                    $(confirmVizAlertModal.$el).on("hide", function() {

                        if (window.AllClearForLookupToken != true) {
                            lookupCacheControl.val("None")
                        }

                    })

                    confirmVizAlertModal.body.addClass('mlts-modal-form-inline')
                        .append($('<p>You have selected a search that supports high scale datasets. Rather than running the search over the entire time window (30 days by default), it will run over one day at a time, and then store the results in a lookup file. Each day, it runs over the past day of data (-1d@d through @d) and then adds in the cached lookup data to get the true earliest and true latest. The result is that your search will run faster (potentially 30x faster or more), but you have to store a lookup on the local system which consumes disk space.<br/><br/>Usually, this isn\'t required. Most times running a search over the past 30 days, during the early hours of the morning, will not create a noticable load. But you can use this for scenarios where you need to improve performance significantly. The amount of disk space required will be dependent on the dataset you\'re recording, but is just a CSV with the earliest time, latest time, and then the two fields we are comparing. For most environments, you can assume something like 30-80 bytes per unique combination.<br /><br />One final note: by default, in a multi-system Splunk environment, all lookups are replicated from the Search Head to the Indexers. This normally works just fine, but if you are creating very large lookups, you can run into issues. More importantly, there\'s no value for this search. As a result, for any lookups in the Splunk Security Essentials app, we don\'t replicate to the indexers. If you move the lookup out of this app and into another though, you will need to make sure you disable the replication. You can check out distsearch.conf in this app for an example. If you just keep this in this app, don\'t worry, everything is already taken care of.<br/><br/><input type="checkbox" id="iagree" onclick="$(\'.mlts-modal-submit\').first()[0].disabled=false;" /><span onclick=\"document.getElementById(\'iagree\').click(); console.log(\'clicky clicky\');\"> I understand</span></p>'));

                    confirmVizAlertModal.footer.append($('<button>').addClass('mlts-modal-cancel').attr({
                            type: 'button',
                            'data-dismiss': 'modal'
                        }).addClass('btn btn-default mlts-modal-cancel').text('Cancel').on('click', function() {
                            lookupCacheControl.val("None")
                            confirmVizAlertModal.hide()
                            window.AllClearForLookupToken = false
                        })

                    )

                    confirmVizAlertModal.footer.append($('<button>').addClass('mlts-modal-submit').attr({
                            type: 'button',
                            'data-dismiss': 'modal'
                        }).addClass('btn btn-primary mlts-modal-submit').text('Submit').on('click', function() {

                            window.AllClearForLookupToken = true
                            Forms.setToken("lookupToken", value);

                            updateForm();
                        })

                    )

                    confirmVizAlertModal.show();
                    if (document.getElementById("iagree").checked != true) {
                        $(".mlts-modal-submit").first()[0].disabled = true
                    }
                    //
                }
            });

            lookupCacheControl.render();

            return lookupCacheControl;
        }();











        // analysis function control
        /*
            var outlierSearchTypeControl = function () {
                var outlierSearchTypeControl = new DropdownView({
                    id: 'outlierSearchTypeControl',
                    el: $('#outlierSearchTypeControl'),
                    labelField: 'label',
                    valueField: 'value',
                    showClearButton: false,
                    choices: [{ value: 'Avg', label: 'Standard Deviation' }]//, { value: 'MAD', label: 'Median Absolute Deviation' }, { value: 'IQR', label: 'Interquartile Range' }]
                });

                outlierSearchTypeControl.on("change", function (value) {
                    Forms.setToken("outlierSearchTypeToken", value);
                });

                outlierSearchTypeControl.render();

                return outlierSearchTypeControl;
            }();
        */
        // outlier scale factor control
        /*
            var scaleFactorControl = function () {
                var scaleFactorControl = new TextInputView({
                    id: 'scaleFactorControl',
                    el: $('#scaleFactorControl')
                });

                controlValidity.set(scaleFactorControl.id, false);

                scaleFactorControl.on('change', function (value) {
                    var numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue < 0) {
                        controlValidity.set(scaleFactorControl.id, false);
                        Messages.setTextInputMessage(this, 'Multiplier must be a number greater than zero.');
                    } else {
                        controlValidity.set(scaleFactorControl.id, true);
                        Messages.removeTextInputMessage(this);
                        Forms.setToken('scaleFactorToken', value);
                    }

                    updateForm();
                });

                scaleFactorControl.render();

                return scaleFactorControl;
            }();*/

        // window size control

        var windowSizeControl = function() {
            var windowSizeControl = new TextInputView({
                id: 'windowSizeControl',
                el: $('#windowSizeControl')
            });

            windowSizeControl.on('change', function(value) {
                Forms.setToken('windowSizeToken', parseInt(value, 10));
                updateWindowSizeControlValidity();
            });

            windowSizeControl.render();

            return windowSizeControl;
        }();

        // whether to use windowed analysis or not (streamstats vs eventstats)
        // this is defined after windowSizeControl on purpose
        /*
            var windowedAnalysisCheckboxControl = function () {
                var windowedAnalysisCheckboxControl = new CheckboxView({
                    id: 'windowedAnalysisCheckboxControl',
                    el: $('#windowedAnalysisCheckboxControl'),
                    value: true
                });

                windowedAnalysisCheckboxControl.on('change', function (isWindowed) {
                    updateWindowSizeControlValidity();

                    Forms.setToken('windowedAnalysisToken', isWindowed ? 'StreamStats' : 'EventStats');
                });

                windowedAnalysisCheckboxControl.render();

                return windowedAnalysisCheckboxControl;
            }();*/
        Forms.setToken('windowedAnalysisToken', 'LatestStats'); //DV


        var currentPointCheckboxControl = function() {
            var currentPointCheckboxControl = new CheckboxView({
                id: 'currentPointCheckboxControl',
                el: $('#currentPointCheckboxControl'),
                value: true
            });

            currentPointCheckboxControl.on('change', function(useCurrent) {
                //updateWindowSizeControlValidity(); #DV

                Forms.setToken('useCurrentPointToken', useCurrent);
            });

            currentPointCheckboxControl.render();

            return currentPointCheckboxControl;
        }();

        // after rendering, re-parent currentPointCheckboxControl to windowSizeControl so that it's on the same line (and above the potential error message)
        //windowSizeControl.$el.append(currentPointCheckboxControl.$el.parent()); DV

        /**
         * Update the validity of the windowSizeControl, which depends on the values of both itself and the windowedAnalysisCheckboxControl
         */
        /*function updateWindowSizeControlValidity() { DV
        if (windowSizeControl != null && windowedAnalysisCheckboxControl != null && currentPointCheckboxControl != null) {
            var windowSize = windowSizeControl.val();
            var isWindowed = windowedAnalysisCheckboxControl.val();

            if (isWindowed && (isNaN(windowSize) || windowSize <= 0)) {
                controlValidity.set(windowSizeControl.id, false);
                Messages.setTextInputMessage(windowSizeControl, 'Number of samples must be a positive integer.');
            } else {
                controlValidity.set(windowSizeControl.id, true);
                Messages.removeTextInputMessage(windowSizeControl);
            }

            windowSizeControl.settings.set("disabled", !isWindowed);
            currentPointCheckboxControl.settings.set("disabled", !isWindowed);

            updateForm();
        }
    }
*/
        var assistantControlsFooter = function() {
            var assistantControlsFooter = new AssistantControlsFooter($('#assistantControlsFooter'), submitButtonText);

            assistantControlsFooter.controls.submitButton.on('submit', function() {
                submitForm();
            });

            return assistantControlsFooter;
        }();

        var queryHistoryPanel = new QueryHistoryTable($('#queryHistoryPanel'), 'queryHistorySearch', historyCollectionId, ['Actions', '_time', 'Search query', 'Field to analyze', 'Threshold method', 'Threshold multiplier', 'Sliding window', 'Include current point', '# of outliers'], submitButtonText, function(params, autostart) {
            var sampleSearch = {
                value: params.data['row.search_query'],
                earliestTime: params.data['row.earliest_time'],
                latestTime: params.data['row.latest_time'],
                outlierValueTracked1: params.data['row.outlierValueTracked1'],
                outlierValueTracked2: params.data['row.outlierValueTracked2'],
                outlierPeerGroup: params.data['row.outlierPeerGroup'],

                //  outlierSearchType: params.data['row.threshold_method'],
                //  scaleFactor: params.data['row.threshold_multiplier'],
                windowSize: params.data['row.window_size'],
                // Splunk searches map boolean true to "1" and boolean false to "0"
                // defaulting to true instead of false here because this value didn't exist in early history entries
                useCurrentPoint: params.data['row.use_current_point'] !== "0",
                autostart: autostart
            };

            setCurrentSampleSearch(sampleSearch);
            tabsControl.activate('newOutliers');
        });

        var singleOutliersPanel = function() {
            return new AssistantPanel($('#singleOutliersPanel'), 'Outlier(s)', SingleView, {
                id: 'singleOutliersViz',
                managerid: 'outliersCountSearch',
                underLabel: 'Outlier(s)'
            }, { footerButtons: { scheduleAlertButton: true } });
        }();

        var singleResultsPanel = function() {
            return new AssistantPanel($('#singleResultsPanel'), 'Total Result(s)', SingleView, {
                id: 'singleResultsViz',
                managerid: 'resultsCountSearch',
                underLabel: 'Total Result(s)'
            });
        }();

        var singleEventCountPanel = function() {
            return new AssistantPanel($('#singleEventCountPanel'), 'Raw Event(s)', SingleView, {
                id: 'singleEventCountViz',
                managerid: 'eventCountCountSearch',
                underLabel: 'Raw Event(s)'
            }, { footerButtons: { scheduleAlertButton: false, openInSearchButton: false, showSPLButton: false } });
        }();

        var outliersVizPanel = function() {
            //var vizName = 'OutliersViz';
            //var OutliersViz = VisualizationRegistry.getVisualizer(appName, vizName);

            return new AssistantPanel($('#outliersPanel'), 'Outliers Only', TableView, {
                id: 'outliersViz',
                managerid: 'outliersVizSearch'
            }, { footerButtons: { scheduleAlertButton: true } });

        }();

        var outliersOverTimeVizPanel = function() {
            return new AssistantPanel($('#outliersOverTimePanel'), 'Outlier Count Over Time', ChartView, {
                id: 'outliersOverTimeViz',
                managerid: 'outliersOverTimeVizSearch',
                type: 'column',
                'charting.legend.placement': 'bottom',
                'charting.chart.stackMode': 'stacked'
            });
        }();

        var datasetPreviewTable = function() {
            return new TableView({
                id: 'datasetPreviewTable',
                el: $('#datasetPreviewPanel'),
                managerid: 'searchBarSearch'
            });
        }();

        var outliersTablePanel = function() {
            return new AssistantPanel($('#outliersTablePanel'), 'All Data', TableView, {
                id: 'outliersTable',
                managerid: 'outliersVizSearchOutliersOnly',
                sortKey: 'isOutlier',
                sortDirection: 'desc',
                fields: '*'
            });
        }();

        // update validity for the initial state of the window size controls
        //updateWindowSizeControlValidity(); DV

        // set up the searches
        setupSearches();

        // load canned searches from URL bar parameters
        (function setInputs() {
            var searchParams = ParseSearchParameters(showcaseName);
            console.log("Got a showcase.. for better or worse..", showcaseName, searchParams)
            if (searchParams.mlToolkitDataset != null) {
                SampleSearchLoader.getSampleSearchByLabel(searchParams.mlToolkitDataset).then(setCurrentSampleSearch);
            } else {
                setCurrentSampleSearch(searchParams);
            }
        })();



        function PromptForLookup() {
            PromptForLookupModal = new Modal('PromptForLookupModal', {
                title: 'Create Lookup',
                destroyOnHide: true,
                type: 'wide'
            });


            $(PromptForLookupModal.$el).on("hide", function() {
                // Nothing at the moment

            })

            PromptForLookupModal.body.addClass('mlts-modal-form-inline')
                .append($('<p>There are two approaches to creating the lookups needed to serve as a cache for these searches. If you want to create one yourself, simply create a new lookup file with the columns earliest,latest,[field1],[field2] and at least one row (I recommend 1000000,100000,dummy,row). Create an entry in transforms.conf (or a Lookup Definition through the UI) and you should be set.<br /><br />The second option? Just fill in the lookup name on the next page and click "create" and we\'ll take care of it for you.</p>'));

            PromptForLookupModal.footer.append($('<button>').addClass('mlts-modal-cancel').attr({
                    type: 'button',
                    'data-dismiss': 'modal'
                }).addClass('btn btn-default mlts-modal-cancel').text('Cancel').on('click', function() {

                    PromptForLookupModal.hide()

                })

            )

            PromptForLookupModal.footer.append($('<button>').addClass('mlts-modal-submit').attr({
                    type: 'button',
                    'data-dismiss': 'modal'
                }).addClass('btn btn-primary mlts-modal-submit').text('Next').on('click', function() {



                    GetTheLookupNameModal = new Modal('GetTheLookupNameModal', {
                        title: 'Create Lookup',
                        destroyOnHide: true,
                        type: 'wide'
                    });


                    $(GetTheLookupNameModal.$el).on("hide", function() {
                        // Nothing at the moment

                    })

                    GetTheLookupNameModal.body.addClass('mlts-modal-form-inline')
                        .append($('<p>Please provide lookup name (alphanumeric + dashes and underscores, without a .csv): <span id="LookupNameControl"></span><br/><br/>Lookup Stanza Name: <span id="resultant_stanza"></span><br/>Lookup Filename: <span id="resultant_filename"></span><br/>Not In Use? <span id="resultant_available"></span><br /><br /><span id="resultant_text"></span></p>'));

                    GetTheLookupNameModal.footer.append($('<button>').addClass('mlts-modal-cancel').attr({
                            type: 'button',
                            'data-dismiss': 'modal'
                        }).addClass('btn btn-default mlts-modal-cancel').text('Cancel').on('click', function() {

                            GetTheLookupNameModal.hide()

                        })

                    )

                    GetTheLookupNameModal.footer.append($('<button>').addClass('mlts-modal-submit').attr({
                            type: 'button',
                            'data-dismiss': 'modal'
                        }).addClass('btn btn-primary mlts-modal-submit').text('Create').on('click', function() {

                            CreateTheLookupModal = new Modal('CreateTheLookupModal', {
                                title: 'Create Lookup',
                                destroyOnHide: true,
                                type: 'wide'
                            });


                            $(CreateTheLookupModal.$el).on("hide", function() {
                                // Nothing at the moment

                            })

                            CreateTheLookupModal.body.addClass('mlts-modal-form-inline')
                                .append($('<p>Creating lookup....<br/><br/><div id="StatusMessages" style="margin-left:0px;display:block;"></div><div style="margin-left:0px;display:block;" id="CreateLookupStatus"><center><img src="/static/app/Splunk_Essentials_For_Telco/images/general_images/loader.gif"></center></div></p>'));

                            CreateTheLookupModal.footer.append($('<button>').addClass('mlts-modal-cancel').attr({
                                    type: 'button',
                                    'data-dismiss': 'modal'
                                }).addClass('btn btn-default mlts-modal-cancel').text('Cancel').on('click', function() {

                                    CreateTheLookupModal.hide()

                                })

                            )

                            CreateTheLookupModal.footer.append($('<button>').addClass('mlts-modal-submit').attr({
                                    type: 'button',
                                    'data-dismiss': 'modal'
                                }).addClass('btn btn-primary mlts-modal-submit').text('Done').on('click', function() {

                                    CreateTheLookupModal.hide()
                                    GetTheLookupNameModal.hide()
                                    PromptForLookupModal.hide()
                                    var dropdown_search = mvc.Components.getInstance("lookupCacheSearch")
                                    dropdown_search.startSearch()

                                    dropdown_search.on("search:done", function() {
                                        mvc.Components.getInstance("lookupCacheControl").val(window.resultant_stanza)
                                    })

                                })

                            )

                            CreateTheLookupModal.show();
                            $(".mlts-modal-submit:contains(Done)").first()[0].disabled = true

                            CreateLookup(window.resultant_stanza, function() {
                                //Success
                                $(".mlts-modal-submit:contains(Done)").first()[0].disabled = false
                                document.getElementById("CreateLookupStatus").innerHTML = "<img src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/ok_ico.gif\">";
                                document.getElementById("StatusMessages").innerHTML = "Success!<br/>"

                                //CreateLookupStatus
                            }, function() {
                                //Failure
                                $(".mlts-modal-submit:contains(Done)").first()[0].disabled = true
                                document.getElementById("CreateLookupStatus").innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\"><br />Error -- not aware of any reason why this would fail, so probably you should just manually create the lookup (and tell us so that we can figure out what's going on). Apologies!";
                            })

                        })

                    )

                    GetTheLookupNameModal.show();
                    $(".mlts-modal-submit:contains(Create)").first()[0].disabled = true

                    CheckForAvailable = new SearchManager({
                        "id": "CheckForAvailable",
                        "cancelOnUnload": true,
                        "latest_time": "",
                        "status_buckets": 0,
                        "earliest_time": "0",
                        "app": utils.getCurrentApp(),
                        "auto_cancel": 90,
                        "preview": true,
                        "runWhenTimeIsUndefined": false,
                        "autostart": false
                    }, { tokens: true, tokenNamespace: "submitted" });


                    CheckForAvailableResults = CheckForAvailable.data('results', { output_mode: 'json', count: 0 });

                    CheckForAvailable.on('search:error', function(properties) {
                        document.getElementById("resultant_available").innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                        $(".mlts-modal-submit:contains(Create)").first()[0].disabled = true
                        document.getElementById("resultant_text").innerHTML = 'Error running search for lookup. <a href="#" onclick="$(\'#myViewSearch\').toggle()">Toggle Search</a> <div id="myViewSearch" style="display: none;"><pre>' + CheckForAvailable.get("search") + '</pre></div>';
                    });
                    CheckForAvailable.on('search:fail', function(properties) {
                        document.getElementById("resultant_available").innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                        $(".mlts-modal-submit:contains(Create)").first()[0].disabled = true
                        document.getElementById("resultant_text").innerHTML = 'Error running search for lookup. <a href="#" onclick="$(\'#myViewSearch\').toggle()">Toggle Search</a> <div id="myViewSearch" style="display: none;"><pre>' + CheckForAvailable.get("search") + '</pre></div>';
                    });
                    CheckForAvailable.on('search:done', function(properties) {

                        if (CheckForAvailable.attributes.data.resultCount == 0) {
                            document.getElementById("resultant_available").innerHTML = "<img src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/ok_ico.gif\">";
                            $(".mlts-modal-submit:contains(Create)").first()[0].disabled = false
                            document.getElementById("resultant_text").innerHTML = "Click Next to create this lookup.";
                            return;
                        }

                        CheckForAvailableResults.on("data", function(properties) {
                            var data = CheckForAvailableResults.data().results;
                            console.log("Got my results", data)
                            if (data[0].count == 0) {
                                document.getElementById("resultant_available").innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/ok_ico.gif\">";
                                document.getElementById("resultant_text").innerHTML = "Click Next to create this lookup.";

                                $(".mlts-modal-submit:contains(Create)").first()[0].disabled = false
                            } else {
                                document.getElementById("resultant_available").innerHTML = "<img title=\"Error\" src=\"/static//app/Splunk_Essentials_For_Telco/images/general_images/err_ico.gif\">";
                                $(".mlts-modal-submit:contains(Create)").first()[0].disabled = true
                                document.getElementById("resultant_text").innerHTML = "Lookup already exists.";

                            }
                        });
                    });

                    var LookupNameControl = function() {
                        var LookupNameControl = new TextInputView({
                            id: 'LookupNameControl',
                            el: $('#LookupNameControl')
                        });

                        LookupNameControl.on('change', function(value) {
                            document.getElementById("resultant_available").innerHTML = '<img src="/static/app/Splunk_Essentials_For_Telco/images/general_images/loader.gif" />';
                            $(".mlts-modal-submit:contains(Create)").first()[0].disabled = true
                            if (value.indexOf(".") > 0) {
                                value = value.substr(0, value.indexOf("."))
                            }
                            if (value.indexOf(" ") > 0) {
                                value = value.substr(0, value.indexOf(" "))
                            }
                            document.getElementById("resultant_stanza").innerHTML = value;
                            document.getElementById("resultant_filename").innerHTML = value + ".csv";
                            window.resultant_stanza = value
                            var templateSearch = "| REST /servicesNS/-/-/data/transforms/lookups | table title filename | search title=STANZANAME OR filename=FILENAME  | append [| rest  /servicesNS/-/-/data/lookup-table-files | search title=FILENAME] | stats count "
                            var theSearch = mvc.Components.getInstance("CheckForAvailable")

                            theSearch.set("search", templateSearch.replace(/FILENAME/g, value + ".csv").replace("STANZANAME", value))
                            theSearch.startSearch()
                        });

                        LookupNameControl.render();

                        return LookupNameControl;
                    }();


                })

            )

            PromptForLookupModal.show();

        }


        function CreateLookup(lookupName, successCallback, failureCallback) {
            var CreateLookupItself = new SearchManager({
                "id": "CreateLookupItself",
                "sample_ratio": null,
                "latest_time": "now",
                "earliest_time": "@d",
                "cancelOnUnload": true,
                "status_buckets": 0,
                "search": "| makeresults | eval earliest=1000000, latest=100000, dest=\"dummy\", user=\"data\" | fields - _time | outputlookup " + lookupName + ".csv",
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": true,
                "runWhenTimeIsUndefined": false,
                "autostart": true
            }, { tokens: true });


            CreateLookupItself.on("search:done", function() {
                document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup CSV Created with Dummy Data...<br/>"
                CreateLookupConfig(lookupName, successCallback, failureCallback);
            })

        }

        function CreateLookupConfig(lookupName, successCallback, failureCallback) {


            var appscope = {}
            appscope['owner'] = Splunk.util.getConfigValue("USERNAME");
            appscope['app'] = utils.getCurrentApp()
            appscope['sharing'] = "app"
            var mystanza = []
            mystanza['filename'] = lookupName + ".csv"
            var svc = mvc.createService();
            var files = svc.configurations(appscope);
            var fileDeferred = $.Deferred();
            var fileDeferred = $.Deferred();
            files.fetch({ 'search': 'name=transforms"' }, function(err, files) {
                var transformsFile = files.item("transforms");
                if (!transformsFile) {
                    //  Create the file here
                    transformsFile = files.create('transforms', function(err, transformsFile) {
                        if (err) {
                            // Error case, throw an exception dialog to user here.
                            console.log("Caught an error in transforms", err, transformsFile)
                            failureCallback()
                            return false;
                        }
                        fileDeferred.resolve(transformsFile);
                    });
                } else {
                    fileDeferred.resolve(transformsFile)
                }
            });
            fileDeferred.done(function(transformsFile) {
                transformsFile.create(lookupName, mystanza, function(err, stanza) {
                    if (err) {
                        console.log("Caught an error in stanza", err, stanza)
                        failureCallback()
                        return false;
                    } else {
                        console.log("Caught a success", err)
                        document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Lookup Entry w/ Transforms Created...<br/>"
                        document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML + "Waiting on Splunk to Recognize the Lookup. This can take a long time...<br/>Try <span id=\"StatusCounter\">0</span>...<br/>"
                        var myDeferred = $.Deferred()
                        console.log("CreateLookupConfig - Kicking off CheckData")
                        CheckData(myDeferred, lookupName)

                        myDeferred.done(function(result) {
                            if (result = "Success") {
                                successCallback();
                            } else {
                                failureCallback();
                            }
                        })



                        return true;
                    }
                })
            });


        }


        function CheckData(myDeferred, lookupName) {
            var myNum = Math.round(Math.random() * 10000000) + 1
            console.log("CheckData - Init")
            document.getElementById("StatusCounter").innerHTML = parseInt(document.getElementById("StatusCounter").innerHTML) + 1
            if (parseInt(document.getElementById("StatusCounter").innerHTML) == 20) {
                document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML.replace(/Try .*/, "I know, sometimes this takes 50 or 70 tries. It usually works immediately after you click that link though...<br />Try <span id=\"StatusCounter\">20</span>...<br/>")
            }
            if (parseInt(document.getElementById("StatusCounter").innerHTML) == 2) {
                document.getElementById("StatusMessages").innerHTML = document.getElementById("StatusMessages").innerHTML.replace(/Try .*/, "<br/>Usually the fastest thing to get Splunk to recognize the lookup is for you to <a target=\"_blank\" href=\"/app/Splunk_Essentials_For_Telco/search?q=%7C%20inputlookup%20" + lookupName + "%20%7C%20inputlookup%20append%3Dt%20" + lookupName + ".csv&earliest=%40d&latest=now\"><b>click this link</b></a>.<br /><br />Try <span id=\"StatusCounter\">2</span>...<br/>")
            }


            var PullLookupConfig = new SearchManager({
                "id": "PullLookupConfig" + myNum,
                "sample_ratio": null,
                "latest_time": "now",
                "earliest_time": "@d",
                "cancelOnUnload": true,
                "status_buckets": 0,
                "search": "| inputlookup " + lookupName + ".csv | inputlookup append=t " + lookupName,
                "app": utils.getCurrentApp(),
                "auto_cancel": 90,
                "preview": true,
                "delay": 15,
                "runWhenTimeIsUndefined": false,
                "autostart": true
            }, { tokens: true });
            var LocalScope = $.Deferred()
            PullLookupConfig.on("search:done", function() {
                LocalScope.resolve()
            })


            LocalScope.done(function() {
                var lookupCacheSearch = new SearchManager({
                    "id": "lookupCacheSearch" + myNum,
                    "sample_ratio": null,
                    "latest_time": "now",
                    "earliest_time": "@d",
                    "cancelOnUnload": true,
                    "status_buckets": 0,
                    "search": "| REST /servicesNS/-/-/data/transforms/lookups | search title=" + lookupName + " | stats sum(eval(len(fields_list))) as length",
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "preview": true,
                    "runWhenTimeIsUndefined": false,
                    "autostart": true
                }, { tokens: true });

                lookupCacheSearchResults = lookupCacheSearch.data('results', { output_mode: 'json', count: 0 });

                lookupCacheSearch.on("search:done", function() {
                    if (lookupCacheSearch.attributes.data.resultCount == 0) {
                        // uh oh, major error.
                        myDeferred.resolve("ERROR")
                    }
                    lookupCacheSearchResults.on("data", function(properties) {
                        var data = lookupCacheSearchResults.data().results;
                        console.log("Got my results", data)
                        if (data[0].length == 0) {
                            console.log("CheckData - lookupCacheSearch Results - length 0")
                            setTimeout(function() { CheckData(myDeferred, lookupName) }, 5000)
                        } else {
                            console.log("CheckData - lookupCacheSearch Results - length not 0")
                            myDeferred.resolve("Success")
                        }
                    });

                })

            })
        }





        $("#createLookupControl").html("<button class=\"btn btn-default mlts-show-spl\" id=\"createLookupBtn\">Create Lookup</button>")
        $("#createLookupBtn").click(function() { PromptForLookup(); return false; })

        if ($(".dvTooltip").length > 0) { $(".dvTooltip").tooltip() }
        if ($(".dvPopover").length > 0) { $(".dvPopover").popover() }
        $("#ReminderToSubmit").html("(Click <i>" + $("#submitControl").html() + "</i> above to find outliers.)")
            // disable the form on initial load
        setTimeout(updateForm, 0);

        function startSearchASAP() {
            console.log("Starting searches..")
            if (typeof splunkjs.mvc.Components.getInstance(getCurrentSearchName()).attributes.data == "undefined") {
                mvc.Components.getInstance(getCurrentSearchName()).startSearch()
                setTimeout(function() {
                    startSearchASAP()
                }, 500)
            }

        }
        startSearchASAP()
    });
