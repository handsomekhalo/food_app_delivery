from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist

class UserType(models.Model):
    """A model that represents a user type (e.g., Customer, Manager, Delivery Personnel)."""
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name = "User Type"
        verbose_name_plural = "User Types"

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password, first_name, last_name, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        try:
            admin_type = UserType.objects.get(name="ADMIN").id
        except UserType.DoesNotExist:
            raise ValueError(_('Admin UserType not found'))
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type_id', admin_type)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model."""
    username = None
    email = models.EmailField(max_length=255, unique=True)
    user_type = models.ForeignKey(UserType, on_delete=models.CASCADE)
    user_created_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='created_users')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class OneTimePin(models.Model):
    """A model for the one time pin used for two step verification."""
    pin = models.CharField(max_length=6)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        """Metaclass for one time pin class"""
        verbose_name = "One Time Pin"
        verbose_name_plural = "One Time Pins"

    def __str__(self):
        return f"{self.user}'s one time pin"
    

class Profile(models.Model):
    """Additional details for users."""
    phone_number = models.CharField(max_length=10)
    suburb = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=5, default="")
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"{self.user}'s profile"
