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


    var plotMetrics = function() {

        var filterCompanyMetrics = function(companyName) {
            return model.metrics.filter(function(metric) {
                return metric.company === companyName;
            });
        }

       
        var filterDates = function(metric, dataset) {
            var parseDate = function(dateStr) { return new Date(dateStr); }

            return dataset.filter(function(d) { return d.name === metric })
                          .map(function(d) { return parseDate(d.end_date) });
        }

       
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

      METRICS.forEach(function(m) {
            var dataArray = [['Date', model.company.name()]];
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

    var updateGraphs = function() {
        if (model.metrics.length > 0)
            google.setOnLoadCallback(plotMetrics());
      
        if (model.metrics.length < DATA_LIMIT) {
            setTimeout(function(){
                model.metrics = [];
                getMetrics();
            }, 2000);
        }
    }

    var getMetrics = function() {
       
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
