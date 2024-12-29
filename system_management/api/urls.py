"""Urls for the api views of system_management app"""
from django.urls import path
import system_management.api.views as views
# from system_management.api.api_helpers import send_email_api



urlpatterns = [

   path('login_api/', views.login_api, name="login_api"),
   path('get_user_types_api/', views.get_user_types_api, name="get_user_types_api"),
   path('get_users_api/', views.get_users_api, name="get_users_api"),
   path('create_user_api/', views.create_user_api, name="create_user_api"),
]