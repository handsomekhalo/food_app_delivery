
"""
System management api serializers for cleaning incoming and outgoing data
"""
from rest_framework import serializers
from system_management.general_func_classes import BaseFormSerializer
from system_management.models import User, UserType, Profile

class UserModelSerializer(serializers.ModelSerializer):
    """User model serializer for cleaning user values"""
    user_type__name = serializers.SerializerMethodField()
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    profile = serializers.SerializerMethodField()

    @staticmethod
    def get_user_type__name(obj):
        """
        Get user type name
        
        :param obj:
            object type instance
        :return:
            user type name
        """
        return obj.user_type.name

    @staticmethod
    def get_profile(obj):
        """
        Get user profile
        
        :param obj:
            object type instance
        :return:
            user profile
        """
        try:
            profile = Profile.objects.get(user_id=obj.id)
            profile = ProfileModelSerializer(profile).data
        except Profile.DoesNotExist:
            profile = ''
        return profile

    class Meta:
        """Metaclass for user model serializer."""
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'last_login',
            'date_joined',
            'user_type_id',
            'user_type__name',
            'profile'
        )


class ProfileModelSerializer(serializers.ModelSerializer):
    # lockout_start_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    class Meta:
        """Metaclass for profile model serializer."""
        model = Profile
        fields = (
            'phone_number',
            'city',
            'suburb',
            'province',
            # 'first_login',
            # 'lockout_start_time',
            # 'remaining_attempts'
        )

class UserTypeModelSerializer(serializers.ModelSerializer):
    """User type model serializer for cleaning user type values"""

    class Meta:
        """Metaclass for user type model serializer."""
        model = UserType
        fields = (
            'id',
            'name'
        )


class CreateUserSerializer(serializers.ModelSerializer):
    user_type_id = serializers.IntegerField()
    user_created_by_id = serializers.IntegerField(required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'user_type_id', 'user_created_by_id']

    def create(self, validated_data):
        user_type_id = validated_data.pop('user_type_id')
        user_created_by_id = validated_data.pop('user_created_by_id', None)
        user_type = UserType.objects.get(id=user_type_id)
        user = User.objects.create_user(user_type=user_type, user_created_by_id=user_created_by_id, **validated_data)
        return user



class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_number', 'suburb', 'city', 'province', 'postal_code']



class UserResetPasswordSerializer(BaseFormSerializer):
    new_password = serializers.CharField(
        max_length=250,
        required=True,
        error_messages={
            'required': 'The new password field is required.',
            'max_length': 'The new password field must be less than 250 characters.'
        }
    )
    confirm_password = serializers.CharField(
        max_length=250,
        required=True,
        error_messages={
            'required': 'The confirm password field is required.',
            'max_length': 'The confirm password field must be less than 250 characters.'
        }
    )
    user_id = serializers.IntegerField(
        required=True,
        read_only=False,
        write_only=False,
        error_messages={
            'required': 'The user id field is required.',
        }
    )
