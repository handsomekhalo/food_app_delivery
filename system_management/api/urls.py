"""Urls for the api views of system_management app"""
from django.urls import path
import system_management.api.views as views
from system_management.api.api_helpers import send_email_api



urlpatterns = [

   path('login_api/', views.login_api, name="login_api"),
   path('get_user_types_api/', views.get_user_types_api, name="get_user_types_api"),
   path('get_users_api/', views.get_users_api, name="get_users_api"),
   path('create_user_api/', views.create_user_api, name="create_user_api"),
   path('first_time_login_reset_api/', views.first_time_login_reset_api, name="first_time_login_reset_api"),
   path('update_user_api/', views.update_user_api, name='update_user_api'),
   path('check_email_api/', views.check_email_api, name='check_email_api'),
   path('send_email_api/', send_email_api, name='send_email_api'),

]