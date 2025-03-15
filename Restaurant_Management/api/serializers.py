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



class ManagerUpdateSerializer(serializers.Serializer):
    manager_id = serializers.IntegerField()
    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)
    email = serializers.EmailField(required=True)
    restaurant_id = serializers.IntegerField()

    def validate_restaurant_id(self, value):
        """Validate that the restaurant exists."""
        try:
            restaurant = Restaurant.objects.get(id=value)
        except Restaurant.DoesNotExist:
            raise serializers.ValidationError(f"Restaurant with id {value} does not exist.")
        return value

    def validate_manager_id(self, value):
        """Validate that the manager exists and is of type 'RESTAURANT_ADMIN'."""
        try:
            manager = User.objects.get(id=value, user_type__name='RESTAURANT_ADMIN')
        except User.DoesNotExist:
            raise serializers.ValidationError(f"Manager with id {value} does not exist or does not have the 'RESTAURANT_ADMIN' role.")
        return value

    def validate_email(self, value):
        """Validate that the email is unique among managers."""
        manager_id = self.initial_data.get('manager_id')
        if User.objects.exclude(id=manager_id).filter(email=value).exists():
            raise serializers.ValidationError(f"Manager with email {value} already exists.")
        return value

    def update(self, instance, validated_data):
        """Update the manager's details."""
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        
        # Update the restaurant if necessary
        restaurant_id = validated_data.get('restaurant_id', None)
        if restaurant_id:
            restaurant = Restaurant.objects.get(id=restaurant_id)
            instance.managed_restaurant = restaurant
        
        instance.save()
        return instance
    


# class GeManagerEmailSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Restaurant
#         fields = ['manager_id',]
class GetManagerEmailSerializer(serializers.Serializer):
    manager_id = serializers.IntegerField(required=True)