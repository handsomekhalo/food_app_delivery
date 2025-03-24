"""Urls for the api views of system_management app"""
from django.urls import path
# import Restaurant_Management.api.views as views
import food_management.api.views as views
# from system_management.api.api_helpers import send_email_api



urlpatterns = [

   path('create_category_api/', views.create_category_api, name="create_category_api"),
   # path('get_all_categories_api/<int:restaurant_id>', views.get_all_categories_api, name="get_all_categories_api"),
   path('get_all_categories_api/', views.get_all_categories_api, name="get_all_categories_api"),
   path('update_category_api/', views.update_category_api, name="update_category_api"),
   path('delete_category_api/', views.delete_category_api, name="delete_category_api"),


]