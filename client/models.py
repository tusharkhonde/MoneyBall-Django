from django.db import models


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
