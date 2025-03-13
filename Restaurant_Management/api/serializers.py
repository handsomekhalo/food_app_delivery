from rest_framework import serializers

from Restaurant_Management.models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager']  # Include the fields you want to expose


class RestaurantSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager', 'manager_name']