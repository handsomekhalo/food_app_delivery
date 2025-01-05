from django.urls import path, re_path
from system_management import views
from django.views.generic import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [


    path('login_view/', views.login_view, name='login_view'),
    path('login/', views.login, name='login'),
    path('get_all_users/', views.get_all_users, name='get_all_users'),
    path('create_user/', views.create_user, name='create_user'),
    path('get_roles/', views.get_roles, name='get_roles'),
    # path('update_user/', views.update_user, name='update_user'),
    path('update_user/<int:user_id>/', views.update_user, name='update_user'),

    path('srf/', views.csrf, name='csrf'),

    re_path(r'^.*$', views.serve_react),  # Catch-all route for React

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)



