import datetime
import json
import requests
from client.models import *

class FetchJob():


    def run(self):

        companies = requests.get('http://investmentiq.herokuapp.com/api/v1/companies/')
        companies = companies.json()

        for company in companies:
            Company.objects.get_or_create(name=company.get('name'), founded=company.get('founded'), description=company.get('description'), series=company.get('series'), valuation=company.get('valuation'))

        metrics = requests.get('http://investmentiq.herokuapp.com/api/v1/metrics/rand/')
        metrics = metrics.json()

        for metric in metrics:
            c = Company.objects.get(name=metric.get('company'))
            Metric.objects.create(company=c, name=metric.get('name'), start_date=metric.get('start_date'), end_date=metric.get('end_date'), value=metric.get('value'))

        return
