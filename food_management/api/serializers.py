from rest_framework import serializers

from Restaurant_Management.models import Restaurant
from food_management.models import Category , CategoryImage
# .models import Restaurant


from rest_framework import serializers
# from .models import Category, CategoryImage, Restaurant

class CreateCategorySerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    restaurant_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Category
        fields = ['title', 'image_id', 'featured', 'active', 'restaurant_id']

    def validate_image_id(self, value):
        """
        Validate that the provided image_id corresponds to an existing CategoryImage.
        If the image_id is invalid, return None instead of raising an error.
        """
        if value is not None:
            if not CategoryImage.objects.filter(id=value).exists():
                return None  # Instead of raising an error, allow None
        return value

    def validate_restaurant_id(self, value):
        """
        Validate that the provided restaurant_id corresponds to an existing Restaurant.
        """
        if not Restaurant.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid restaurant ID.")
        return value

    def create(self, validated_data):
        """
        Create a new category, linking it to an optional image and restaurant.
        """
        image_id = validated_data.pop('image_id', None)
        restaurant_id = validated_data.pop('restaurant_id')  # Get the restaurant_id

        # Get the restaurant instance
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Create the category and associate it with the restaurant
        category = Category.objects.create(restaurant=restaurant, **validated_data)

        # Only assign an image if a valid image_id was provided
        if image_id:
            try:
                category.image = CategoryImage.objects.get(id=image_id)
                category.save()
            except CategoryImage.DoesNotExist:
                pass  # Silently ignore the invalid image_id

        return category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'featured', 'active', 'restaurant', 'image']


class UpdateCategorySerializer(serializers.ModelSerializer):
    image_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Category
        fields = ['title', 'image_id', 'featured', 'active', 'restaurant']

    def validate_image_id(self, value):
        """
        Validate that the provided image_id corresponds to an existing CategoryImage.
        """
        if not CategoryImage.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid image ID.")
        return value

    def update(self, instance, validated_data):
        """
        Update the category and link it to an image if provided.
        """
        image_id = validated_data.pop('image_id', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image_id:
            instance.image = CategoryImage.objects.get(id=image_id)

        instance.save()
        return instance


class DeleteCategorySerializer(serializers.Serializer):
    category_id = serializers.IntegerField()