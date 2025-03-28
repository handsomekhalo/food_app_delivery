"""Urls for the api views of system_management app"""
from django.urls import path
import Restaurant_Management.api.views as views
# from system_management.api.api_helpers import send_email_api



urlpatterns = [

   path('get_all_restaurants_api/', views.get_all_restaurants_api, name="get_all_restaurants_api"),
   path('create_restaurant_api/', views.create_restaurant_api, name="create_restaurant_api"),
   path('get_all_restaurants_managers_api/', views.get_all_restaurants_managers_api, name="get_all_restaurants_managers_api"),
   path('update_manager_api/', views.update_manager_api, name="update_manager_api"),
   path('get_manager_email_api/', views.get_manager_email_api, name="get_manager_email_api"),
   
   
   


]