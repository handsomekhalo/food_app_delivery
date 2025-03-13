"""Urls for the api views of system_management app"""
from django.urls import path
import Restaurant_Management.api.views as views
# from system_management.api.api_helpers import send_email_api



urlpatterns = [

   path('get_all_restaurants_api/', views.get_all_restaurants_api, name="get_all_restaurants_api"),


]