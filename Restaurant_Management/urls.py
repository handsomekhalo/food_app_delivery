from django.urls import path, re_path
from Restaurant_Management import views
from django.views.generic import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [


    path('get_all_restaurants/', views.get_all_restaurants, name='get_all_restaurants'),

] 



