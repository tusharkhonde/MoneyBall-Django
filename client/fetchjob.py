import datetime
import json
import requests
from client.models import *

class FetchJob():
    """
    TODO:

    Grabs data from the server and puts it in the database. This class is
    instantiated/run periodically at an interval defined in fetchdata.py. Feel
    free to check out the fetchdata command (in client/management/commands).
    The API response formats are in the README. Be sure to handle both the
    creation of new companies/metrics and the updating of existing ones. Be
    mindful of foreign key dependencies.

    For simplicity, you can assume uniqueness on the company name field and
    join though it to get company metrics. Check the sample API response to
    make sure you're parsing the data correctly.

    You will be calling the following endpoints:
    http://investmentiq.herokuapp.com/api/v1/companies/
    http://investmentiq.herokuapp.com/api/v1/metrics/rand/

    You might find the following helpful:
    https://docs.djangoproject.com/en/1.7/ref/models/querysets/
    """

    def run(self):
        """
        TODO:

        Entry point for the FetchJob class. This should grab data from the
        InvestmentIQ API and put it into the database.
        """
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
