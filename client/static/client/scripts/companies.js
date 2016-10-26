$(document).ready(function() {
    var model = {
        companies: ko.observableArray([]),
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

    /* DOM bindings */

    var bindPanels = function() {
        model.companies().forEach(function(company) {
            // Use this instead of the jQuery selector the jQuery selector
            // requires escaping
            var eId = document.getElementById('company-panel-' + company.name);
            $(eId).click(function(e) {
                window.location.href = '/company/' + company.name;
            });
        });
    }

    /* On page load */

    $.get('/api/int/companies', function(response) {
        response.forEach(function(company) {
            model.companies.push(company);
        });
        bindPanels();
    });

    ko.applyBindings(model);
});
