
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
