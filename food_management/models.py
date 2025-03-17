from django.db import models
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from system_management.models import User, UserType
from Restaurant_Management.models import Restaurant

class FoodImage(models.Model):
    """
    Model for storing food images with S3 URLs.
    """
    file_url = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    uploaded_date = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.file_name


class CategoryImage(models.Model):
    """
    Model for storing category images with S3 URLs.
    """
    file_url = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    uploaded_date = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.file_name


class Category(models.Model):
    """Food categories for menu organization."""
    title = models.CharField(max_length=100)
    image = models.ForeignKey(CategoryImage, on_delete=models.SET_NULL, null=True, blank=True)
    featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='categories'
    )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.title} - {self.restaurant.name}"

    @property
    def image_url(self):
        """Return the URL of the image."""
        if self.image:
            return self.image.file_url
        return None


class Food(models.Model):
    """Model representing food items that can be added by restaurant managers or admins."""
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ForeignKey(FoodImage, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='food_items'
    )
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='food_items'
    )
    featured = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_food_items'
    )
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Food Item"
        verbose_name_plural = "Food Items"

    def __str__(self):
        return f"{self.title} - {self.restaurant.name}"

    @property
    def image_url(self):
        """Return the URL of the image."""
        if self.image:
            return self.image.file_url
        return None

    def save(self, *args, **kwargs):
        """
        Override save method to enforce permissions and restaurant associations.
        - Admin users can add food to any restaurant
        - Restaurant managers can only add food to their own restaurant
        """
        # If no created_by is provided, we can't enforce permissions
        if not self.created_by_id:
            super().save(*args, **kwargs)
            return
            
        try:
            # Check if user is an admin
            is_admin = self.created_by.user_type.name == "ADMIN"
            
            # Check if user is a restaurant manager
            is_restaurant_manager = self.created_by.user_type.name == "RESTAURANT_ADMIN"
            
            # Admin can add food to any restaurant
            if is_admin:
                pass  # No restrictions for admin
            # Restaurant manager can only add food to their restaurant
            elif is_restaurant_manager:
                # If restaurant is not set, set it to manager's restaurant
                if not self.restaurant_id:
                    try:
                        self.restaurant = self.created_by.managed_restaurant
                    except Restaurant.DoesNotExist:
                        raise PermissionDenied("Restaurant manager is not associated with any restaurant.")
                # If restaurant is set but doesn't match manager's restaurant
                elif hasattr(self.created_by, 'managed_restaurant') and self.restaurant.id != self.created_by.managed_restaurant.id:
                    raise PermissionDenied("You can only add food to your own restaurant.")
            # Other user types don't have permission
            else:
                raise PermissionDenied("You don't have permission to add food items.")
                
        except UserType.DoesNotExist:
            raise PermissionDenied("User type not defined.")
            
        super().save(*args, **kwargs)


class FoodManager:
    """
    Helper class to manage food items with proper permission handling.
    Can be used in views and API endpoints.
    """
    @staticmethod
    def can_modify_food(user, food_item):
        """Check if user can modify the food item."""
        # Admin can modify any food
        if user.user_type.name == "ADMIN":
            return True
        # Restaurant manager can only modify food in their restaurant
        elif user.user_type.name == "RESTAURANT_ADMIN":
            try:
                return user.managed_restaurant.id == food_item.restaurant.id
            except Restaurant.DoesNotExist:
                return False
        return False
    
    @staticmethod
    def get_accessible_food_items(user):
        """Get food items that the user can access."""
        # Admin can access all food items
        if user.user_type.name == "ADMIN":
            return Food.objects.all()
        # Restaurant manager can only access food in their restaurant
        elif user.user_type.name == "RESTAURANT_ADMIN":
            try:
                restaurant = user.managed_restaurant
                return Food.objects.filter(restaurant=restaurant)
            except Restaurant.DoesNotExist:
                return Food.objects.none()
        return Food.objects.none()