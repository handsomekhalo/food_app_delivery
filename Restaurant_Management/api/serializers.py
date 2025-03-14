from rest_framework import serializers

from Restaurant_Management.models import Restaurant
from system_management.models import User


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager']  # Include the fields you want to expose


class RestaurantSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager', 'manager_name']


# class GetAllRestaurantManaagerSerializer(serializers.ModelSerializer):
#     manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

#     class Meta:
#         model = Restaurant
#         fields = ['id', 'name', 'address', 'manager', 'manager_name']
class GetAllRestaurantManagerSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'user_type', 'date_joined', 'restaurant']

    def get_restaurant(self, obj):
        """Retrieve the restaurant managed by this user (if any)."""
        restaurant = Restaurant.objects.filter(manager=obj).first()
        return restaurant.name if restaurant else None