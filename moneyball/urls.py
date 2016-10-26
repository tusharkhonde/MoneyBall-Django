"""moneyball URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.7/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from client.views import ClientViews, ClientAPI

urlpatterns = [
    url(r'^$', ClientViews.companies),
    url(r'^company/([^/]+)/$', ClientViews.company),
    url(r'^metrics/$', ClientViews.metrics),
    url(r'^api/int/companies/$', ClientAPI.get_companies),
    url(r'^api/int/companies/([^/]+)/$', ClientAPI.get_company),
    url(r'^api/int/metrics/$', ClientAPI.get_metrics),
    url(r'^api/int/metrics/([^/]+)/$', ClientAPI.get_metrics_by_company),
    url(r'^admin/', include(admin.site.urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
