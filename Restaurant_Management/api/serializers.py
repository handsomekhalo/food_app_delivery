from rest_framework import serializers

from Restaurant_Management.models import Restaurant
from system_management.models import User





class RestaurantSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'address', 'manager', 'manager_name']



class GetAllRestaurantManagerSerializer(serializers.ModelSerializer):
    restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'user_type', 'date_joined', 'restaurant']

    def get_restaurant(self, obj):
        """Retrieve the restaurant managed by this user (if any)."""
        restaurant = Restaurant.objects.filter(manager=obj).first()
        return restaurant.name if restaurant else None


class CreateRestaurantSerializer(serializers.ModelSerializer):
    """Serializer for creating a new restaurant."""
    
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type__name='RESTAURANT_ADMIN'),
        required=True,
        source='manager'  # This maps 'manager_id' to the 'manager' field in the Restaurant model
    )

    class Meta:
        model = Restaurant
        fields = ['name', 'address' , 'manager_id']

    def validate_manager(self, value):
        """Ensure that the manager has 'RESTAURANT_ADMIN' as user_type."""
        if value.user_type.name != 'RESTAURANT_ADMIN':
            raise serializers.ValidationError("Manager must have 'RESTAURANT_ADMIN' user type.")
        return value