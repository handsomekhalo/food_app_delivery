from django.urls import path, re_path
from system_management import views
from django.views.generic import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    # Your custom login view
      # Handle manifest.json
    # path('manifest.json',
    #      RedirectView.as_view(url=staticfiles_storage.url('manifest.json')),
    #      name='manifest.json'),

    path('login_view/', views.login_view, name='login_view'),
    # path('login/', views.login, name='login'),

#   re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
