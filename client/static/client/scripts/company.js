var loadPage = function(companyName) {
    var model = {
        companies: ko.observableArray([]),
        company: {
            'name': ko.observable(''),
            'description': ko.observable(''),
            'founded': ko.observable(''),
            'series': ko.observable(''),
            'valuation': ko.observable('')
        },
        metrics: [],
        images: {
            'develop.io': ASSETS_URL + 'developio.svg',
            'MooMarket': ASSETS_URL + 'moomarket.svg',
            'Next Research': ASSETS_URL + 'nextresearch.svg',
            'Snap Assets': ASSETS_URL + 'snapassets.svg',
            'BananaVR': ASSETS_URL + 'bananavr.svg',
            'Magnifly': ASSETS_URL + 'magnifly.svg',
            'Coincab': ASSETS_URL + 'coincab.svg',
            'HydraDB': ASSETS_URL + 'hydradb.svg',
            'Elephant Systems': ASSETS_URL + 'elephantsystems.svg',
            'FounderMeet': ASSETS_URL + 'foundermeet.svg'
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
            var parseDate = function(dateStr) { return new Date(dateStr); }

            return dataset.filter(function(d) { return d.name === metric })
                          .map(function(d) { return parseDate(d.end_date) });
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

        var plotMetric = function(metric, ele, chartData) {
            var chartOptions = {
                colors: [CHART_COLORS[model.company.name()]],
                legend: { position: 'none' },
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
            formatter.format(dataTable, 1);
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
            var dataArray = [['Date', model.company.name()]];
            // For each metric, get a date list and a metric list and zip those
            // two lists together. Plot the result.
            var data = [];
            if (m === "Revenue/Headcount") {
                data = [_.uniq(filterDates("Revenue", model.metrics))];
            } else if (m === "Cash Burn/Headcount") {
                data = [_.uniq(filterDates("Cash Burn", model.metrics))];
            } else {
                data = [_.uniq(filterDates(m, model.metrics))];
            }
            var companyMetrics = filterCompanyMetrics(model.company.name());
            data.push(getCompanyDataset(m, companyMetrics));
            plotMetric(m, GRAPH_DOM_IDS[m], dataArray.concat(_.zip(data[0], data[1])));
        });
    }

    /* On page load */

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

    var getMetrics = function() {
        // Metrics should come sorted by (end_date, start_date)
        $.get('/api/int/metrics/' + companyName, function(response) {
            response.forEach(function(metric) {
                model.metrics.push(metric);
            });
            updateGraphs();
        });
    }

    $.get('/api/int/companies', function(response) {
        response.forEach(function(company) {
            model.companies.push(company);
            if (company.name === companyName) {
                model.company.name(company.name);
                model.company.description(company.description);
                model.company.founded(company.founded);
                model.company.series(company.series);
                model.company.valuation(company.valuation);
            }
        });
    });

    google.load('visualization', '1', {
        packages: ['corechart'],
        callback: getMetrics
    });

    ko.applyBindings(model);
}
