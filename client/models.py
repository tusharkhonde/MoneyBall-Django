from django.db import models

"""
TODO:
Create models for companies and metrics. Be sure to include all required fields
(company name, company founded date, company description, company series,
company valuation, metric name, metric start and end date, and metric value).
Be mindful of the field types you use as well as the relationships you create.
Also, consider which constraints you'd want to impose. Fields for founded date,
description, series, and valuation should be able to accept NULL values. Since
it will only store currency values, the company valuation field should be a
Decimal field, whereas the metric value field need not be. Finally, to make
sure all the test cases pass, be sure to name non-referential fields exactly as
they come through the API (e.g. 'name' instead of 'company_name'). You may
consider adding a __unicode__() function to each model to help with debugging.
Most of all, this should be very straightforward - don't overthink it!

You can read more about Django models here:
https://docs.djangoproject.com/en/1.8/topics/db/models/
"""


class Company(models.Model):
    name = models.CharField(max_length=30)
    founded = models.DateField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    series = models.CharField(max_length=20, null=True, blank=True)
    valuation = models.DecimalField(decimal_places=5, max_digits=20, blank=True, null=True)


class Metric(models.Model):
    company = models.ForeignKey(Company)
    name = models.CharField(max_length=30)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    value = models.IntegerField(null=True, blank=True)
