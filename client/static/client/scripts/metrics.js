$(document).ready(function() {
    /* Knockout bindings */
    var model = {
        companies: ko.observableArray([]),
        metrics: [],
        graph: {
            selectedCompanies: {
                'develop.io': ko.observable(true),
                'MooMarket': ko.observable(true),
                'Next Research': ko.observable(true),
                'Snap Assets': ko.observable(true),
                'BananaVR': ko.observable(true),
                'Magnifly': ko.observable(true),
                'Coincab': ko.observable(true),
                'HydraDB': ko.observable(true),
                'Elephant Systems': ko.observable(true),
                'FounderMeet': ko.observable(true)
            },
            charts: {
                'Revenue': null,
                'Cash Burn': null,
                'Headcount': null,
                'Revenue/Headcount': null,
                'Cash Burn/Headcount': null
            }
        },
        companyNameToId: function(companyName) {
          return companyName.replace(/ /g, '-');
        }
    }

    /* Metrics */

    /*
     * TODO:
     *
     * Prepares metric data (in model.metrics) for charting library consumption.
     * [{
     *     "company": "Company",
     *     "name": "Cash Burn",
     *     "start_date": "2014-09-20",
     *     "end_date": "2014-09-20",
     *     "value": -623834.0
     * },
     * ...
     * ]
     *
     * The data are then filtered by metric name and transformed into the
     * following format for each metric:
     * [["Date", "Company1", "Company2", ..., "Company10"],
     *  [Tue Jan 1 2013, 7474, -419371, ..., 4066074],
     *  [Wed Jan 2 2013, 7620, -458219, ..., 4331988],
     * ...]
     *
     * Finally, that's plotted in the plotMetric() function.
     *
     * Add additional graphs for Revenue/Headcount and Cash Burn/Headcount.
     * Feel free to modify this function in any way you see fit.
     */
    var plotMetrics = function() {

        var filterCompanyMetrics = function(companyName) {
            return model.metrics.filter(function(metric) {
                return metric.company === companyName;
            });
        }

        /*
         * Filters a @dataset for an input @metric and returns a list of dates
         * @param metric [String]: e.g. "Revenue"
         * @param dataset [Array]: See @dataset in getCompanyDataset()
         * @return [Array]: Array of dates: [Mar 31 2014, Jun 30 2014, ...]
         */
        var filterDates = function(metric, dataset) {
            return _.uniq(dataset.filter(function(d) { return d.name === metric })
                                 .map(function(d) { return d.end_date }))
                    .map(function(d) { return new Date(d) });
        }

        /*
         * Filters a @dataset for an input @metric and returns a list of values
         * TODO (Suggestion): You might want to modify the return value for
         *                    normalized (Rev/HC, Burn/HC) metrics.
         *
         * @param metric [String]: e.g. "Revenue"
         * @param dataset [Array]: e.g.: [{
         *   "company": "Company",
         *   "name": "Revenue",
         *   "start_date": "2014-09-20",
         *   "end_date": "2014-09-20",
         *   "value": -623834.0
         * }, ...]
         * @return [Array]: Array of values: [-623834.0, -135221.0, ...]
         */
        
          var getCompanyDataset = function(metric, dataset) {
            var headcount =  dataset.filter(function(d) { return d.name === "Headcount" })
                          .map(function(d) { return d.value });
            var result = [];
            if (metric === "Revenue/Headcount") {
                var revenues = dataset.filter(function(d) { return d.name === "Revenue" })
                          .map(function(d) { return d.value });

                revenues.forEach(function (revenue,index) {
                   result.push(revenue/headcount[index])
                });

                return result;
            } else if (metric === "Cash Burn/Headcount") {
                var cashBurns = dataset.filter(function(d) { return d.name === "Cash Burn" })
                          .map(function(d) { return d.value });
                cashBurns.forEach(function (cashBurn,index) {
                   result.push(cashBurn/headcount[index])
                });
                return result;
            }
            return dataset.filter(function(d) { return d.name === metric })
                          .map(function(d) { return d.value });
        };

        var plotMetric = function(metric, ele, chartData, chartColors) {
            var chartOptions = {
                colors: chartColors,
                legend: { position: 'in' },
                theme: 'maximized',
                hAxis: {
                    minValue: new Date('1/1/2013'),
                    maxValue: new Date('12/31/2014')
                },
                vAxis: { format: 'short' }
            }
            var formatter = new google.visualization.NumberFormat({
                fractionDigits: 0
            });
            var dataTable = google.visualization.arrayToDataTable(chartData);
            for (var i = 1; i < chartData[0].length; i++) {
                formatter.format(dataTable, i);
            }
            chart = new google.visualization.LineChart($(ele)[0]);
            chart.draw(dataTable, chartOptions);
        }

        // TODO: This is the entry point to the graphing process. You might
        //       want to start here.
        //       Be sure to get the correct dates when you call filterDates()!
        //       HINT: There is no metric called "Revenue/Headcount"
        // NOTE: METRICS and GRAPH_DOM_IDS are already defined in constants.js.
        //       You don't need to change this (but feel free to take a look)!
        METRICS.forEach(function(m) {
            var dataArray = [['Date']];
            var data = [];
            if (m === "Revenue/Headcount") {
                data = [filterDates("Revenue", model.metrics)];
            } else if (m === "Cash Burn/Headcount") {
                data = [filterDates("Cash Burn", model.metrics)];
            } else {
                data = [filterDates(m, model.metrics)];
            }
            var chartColors = [];
            model.companies().forEach(function(company) {
                // For each metric and company, get a date list and a metric
                // list and zip those two lists together. Plot the result.
                if (model.graph.selectedCompanies[company.name]()) {
                    chartColors.push(CHART_COLORS[company.name]);
                    dataArray[0].push(company.name); // dataArray[0] is the header row
                    var companyMetrics = filterCompanyMetrics(company.name);
                    data.push(getCompanyDataset(m, companyMetrics));
                }
            });
            plotMetric(m, GRAPH_DOM_IDS[m], dataArray.concat(_.zip.apply(this, data)),
                       chartColors);
        });
    }

    /* Periodically polls the server for new metrics up to a predefined limit */
    var updateGraphs = function() {
        if (model.metrics.length > 0)
            google.setOnLoadCallback(plotMetrics());
        // Poll for metrics
        if (model.metrics.length < DATA_LIMIT) {
            setTimeout(function(){
                model.metrics = [];
                getMetrics();
            }, 2000);
        }
    }

    /* DOM bindings */

    var bindCheckboxes = function() {
        model.companies().forEach(function(company) {
            $('#company-graph-checkbox-' + model.companyNameToId(company.name))
            .click(function(e) {
                updateGraphs();
            });
        });
    }

    /* On page load */

    var getMetrics = function() {
        $.get('/api/int/metrics', function(response) {
            response.forEach(function(metric) {
                model.metrics.push(metric);
            });
            updateGraphs();
        });
    }

    $.get('/api/int/companies', function(response) {
        response.forEach(function(company) {
            model.companies.push(company);
        });
        bindCheckboxes();
    });

    google.load('visualization', '1', {
        packages: ['corechart'],
        callback: getMetrics
    });

    ko.applyBindings(model);
});
