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


    var plotMetrics = function() {

        var filterCompanyMetrics = function(companyName) {
            return model.metrics.filter(function(metric) {
                return metric.company === companyName;
            });
        }

    
        var filterDates = function(metric, dataset) {
            return _.uniq(dataset.filter(function(d) { return d.name === metric })
                                 .map(function(d) { return d.end_date }))
                    .map(function(d) { return new Date(d) });
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

  

    var bindCheckboxes = function() {
        model.companies().forEach(function(company) {
            $('#company-graph-checkbox-' + model.companyNameToId(company.name))
            .click(function(e) {
                updateGraphs();
            });
        });
    }

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
