from django.db import models
from system_management.models import User  # Import the User model from your `system_management` app

class Restaurant(models.Model):
    """Model representing a restaurant."""
    name = models.CharField(max_length=255)
    address = models.TextField()
    manager = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type__name': 'Restaurant_Manager'},
        related_name='managed_restaurant'
    )

    def __str__(self):
        return self.name
