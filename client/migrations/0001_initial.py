# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=30)),
                ('founded', models.DateField(null=True, blank=True)),
                ('description', models.TextField(null=True, blank=True)),
                ('series', models.CharField(max_length=20, null=True, blank=True)),
                ('valuation', models.DecimalField(null=True, max_digits=20, decimal_places=5, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Metric',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=30)),
                ('start_date', models.DateField(null=True, blank=True)),
                ('end_date', models.DateField(null=True, blank=True)),
                ('value', models.IntegerField(null=True, blank=True)),
                ('company', models.ForeignKey(to='client.Company')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
