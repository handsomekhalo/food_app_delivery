from rest_framework import serializers

from Restaurant_Management.models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager']  # Include the fields you want to expose
