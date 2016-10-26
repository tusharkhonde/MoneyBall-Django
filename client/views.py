from django.shortcuts import render
from django.shortcuts import render_to_response
from django.http import JsonResponse
from django.core import serializers

from client.models import Company, Metric

class ClientViews:
    """
    Provides view-based endpoints that serve static files. The data are loaded
    asynchronously by the client (see the JS files in the scripts directory)
    instead of preloaded into the DOM via Python's templating engine.
    See urls.py for the URL mappings.

    No need to change any of this code.
    """

    @classmethod
    def companies(cls, request):
        return render_to_response('views/companies.html')

    @classmethod
    def company(cls, request, company_name):
        return render_to_response('views/company.html', {'cname': company_name})

    @classmethod
    def metrics(cls, request):
        return render_to_response('views/metrics.html')

class ClientAPI:
    """
    TODO:

    Implements internal API endpoints, which expose data to the client. In
    order to properly connect with the provided client code, the JsonResponse
    objects you return should *exactly* follow the format in the method
    docstrings. Conveniently, it turns out that this format is also the same as
    the responses you got from the server in fetchjob.py (though this is often
    not the case).
    Ideally, we'd have an authentication layer to verify that the user has
    access to the data requested. Feel free to use the _serialize() class
    method defined below (this is recommended so that you don't have to worry
    about serializing your models objects). If you use this class method, you
    shouldn't end up writing much code in this section.
    See urls.py for the URL mappings.
    """

    @classmethod
    def _serialize(cls, objects):
        def create_company_map():
            return {c.id: c.name for c in Company.objects.all()}

        # Replace company ids with company names
        def map_company(obj, company_map):
            if 'company' in obj:
                obj['company'] = company_map[obj['company']]
            return obj

        company_map = create_company_map()
        raw = serializers.serialize('python', objects)
        res = [dict(map_company(obj['fields'], company_map)) for obj in raw]
        return res

    @classmethod
    def get_companies(cls, request):
        """
        TODO:

        Returns a serialized JsonResponse object of all company data (one
        dictionary hash per company for each company in the database).

        @return [JsonReponse]: [{
            "founded": "2000-01-01",
            "name": "MyCo1",
            "series": "Series A",
            "valuation": "123456789.00",
            "description": "MyCo1 is making the world a better place..."
        }, {
            "founded": "2001-01-01",
            "name": "MyCo2",
            "series": "Series B",
            "valuation": "987654321.00",
            "description": "MyCo2 is making the world a better place..."
        },
        ...
        ]
        """

        companies_list = cls._serialize(Company.objects.all())

        return JsonResponse(companies_list, safe=False)

    @classmethod
    def get_company(cls, request, company_name):
        """
        TODO:

        Returns a serialized JsonResponse object of company data for a company
        with name @company_name (a list of one element - a single dictionary hash
        for the queried company, or an empty list if no companies are found).
        NOTE: This returns a JSON-encoded list, not a JSON-encoded dict.

        @return [JsonReponse]: [{
            "name": "MyCo1",
            "founded": "2000-01-01",
            "series": "Series A",
            "valuation": "123456789.00",
            "description": "MyCo1 is making the world a better place..."
        }]
        """

        company = cls._serialize(Company.objects.filter(name=company_name))
        return JsonResponse(company, safe=False)

    @classmethod
    def get_metrics(cls, request):
        """
        TODO:

        Returns a serialized JsonResponse object of all metric data (one
        dictionary hash for each metric in the database).
        NOTE: Be sure to order metrics by date in your response!

        @return [JsonReponse]: [{
            "company": "MyCo1",
            "name": "Cash Burn",
            "start_date": "2000-01-01",
            "end_date": "2000-03-31",
            "value": -10000.0,
        }, {
            "company": "MyCo2",
            "name": "Cash Burn",
            "start_date": "2000-01-01",
            "end_date": "2000-03-31",
            "value": -20000.0},
        },
        ...
        ]
        """

        metrics_list = cls._serialize(Metric.objects.all())
        return JsonResponse(metrics_list, safe=False)

    @classmethod
    def get_metrics_by_company(cls, request, company_name):
        """
        TODO:

        Returns a serialized JsonResponse object of all metric data for a
        single company with name @company_name (one dictionary hash for each metric
        in the database relating to that company - company 1 in the example
        below).
        NOTE: Be sure to order metrics by date in your response!

        @return [JsonReponse]: [{
            "company": "MyCo1",
            "name": "Cash Burn",
            "start_date": "2000-01-01",
            "end_date": "2000-03-31",
            "value": -10000.0,
        }, {
            "company": "MyCo2",
            "name": "Headcount",
            "start_date": "2000-01-01",
            "end_date": "2000-03-31",
            "value": 100.0},
        },
        ...
        ]
        """
        company = Company.objects.filter(name=company_name)
        metric = cls._serialize(Metric.objects.filter(company=company))
        return JsonResponse(metric, safe=False)
