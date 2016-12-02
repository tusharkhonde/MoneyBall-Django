from django.shortcuts import render
from django.shortcuts import render_to_response
from django.http import JsonResponse
from django.core import serializers

from client.models import Company, Metric

class ClientViews:

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

    @classmethod
    def _serialize(cls, objects):
        def create_company_map():
            return {c.id: c.name for c in Company.objects.all()}

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

        companies_list = cls._serialize(Company.objects.all())

        return JsonResponse(companies_list, safe=False)

    @classmethod
    def get_company(cls, request, company_name):

        company = cls._serialize(Company.objects.filter(name=company_name))
        return JsonResponse(company, safe=False)

    @classmethod
    def get_metrics(cls, request):

        metrics_list = cls._serialize(Metric.objects.all())
        return JsonResponse(metrics_list, safe=False)

    @classmethod
    def get_metrics_by_company(cls, request, company_name):

        company = Company.objects.filter(name=company_name)
        metric = cls._serialize(Metric.objects.filter(company=company))
        return JsonResponse(metric, safe=False)
