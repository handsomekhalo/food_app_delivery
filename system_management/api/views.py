"""
System management api views containing all the api functions
The following api is stored here:
    *`login_api`
    *`logout_api`
    *`get_users_api`
    *`register_users_api`
    *`get_user_types_api`
    *`change_user_status`
    """


import json
from venv import logger
from django.forms import ValidationError
from rest_framework.response import Response
import random

from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.db import transaction 


from django.contrib.auth import authenticate
from rest_framework import (
    status,
    permissions,
    authentication
)
from datetime import datetime, timedelta

from rest_framework.authtoken.models import Token

from system_management.api.serializers import (
    CreateUserSerializer,
    ProfileSerializer,
    UserModelSerializer,
    UserResetPasswordSerializer,
    UserTypeModelSerializer,
    UserUpdateSerializer,
)
from system_management.models import (
    # OneTimePin,
    OneTimePin,
    User,
    UserType,
    Profile,
)

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)

import system_management.constants as constants



@api_view(["POST"])
@permission_classes((AllowAny,))
def login_api(request):
    """
    Login api for user authentication
    Args:
        request:
    Returns:    
        Response:
        data:
            - status
            - message
        status code:
    """
    if request.method == "POST":
    
        body = json.loads(request.body)
        email = body["email"]
        password = body["password"]

        if email is None or password is None:
            data = json.dumps({
                "status": "error",
                "message": 'Please provide both username and password'
            })
            return Response(data,
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=email, password=password)

        if not user:
            data = json.dumps({
                "status": "error",
                "message": 'Invalid Credentials'
            })
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            data = json.dumps({
                "status": "error",
                "message": 'User is inactive, please contact admin'
            })

            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)

        try:
            profile = Profile.objects.get(user_id=user.id)
            first_login = profile.first_login
            user_number = profile.phone_number

        except Profile.DoesNotExist:
            first_login = True
            user_number = ''


        otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])

        # OneTimePin.objects.update_or_create(
        #     user_id=user.id,
        #     defaults={
        #         'pin': otp
        #     }
        # )

        user.last_login = datetime.now()
        user.save()

        user_serlializer = UserModelSerializer(user)

        response_data = json.dumps({
            "status": "success",
            "token": token.key,
            "first_login": first_login,
            "user_number": user_number,
            "new_pin": otp,
            "user": user_serlializer.data
        })

        return Response(response_data, status=status.HTTP_200_OK)

    else:
        data = json.dumps({
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def get_user_types_api(request):
    """
    Get all user types in the database

    Args:
        request:
    Returns:
        Response:
            data:
                status:
                message:
                data:
            status code:
    """
    if request.method == 'GET':
        user_types = UserType.objects.all()
        serializer = UserTypeModelSerializer(user_types, many=True)

        try:
            data = json.dumps({
                'status': "success",
                'user_types': serializer.data
            })
            return Response(data, status=status.HTTP_200_OK)

        except KeyError:
            data = json.dumps({
                'status': "error",
                'message': "Error during getting user types."
            })
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        data = json.dumps({
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def get_users_api(request):
    """
    Get all users api

    Args:
        request:
    Returns:
        Response:
            data:
                - status
                - message
                - data
            status code:
    """
    if request.method == "GET":
        users = User.objects.all()

        serializer = UserModelSerializer(users, many=True).data

        try:
            data = json.dumps({
                'status': "success",
                'users': serializer
            })
            return Response(data, status=status.HTTP_200_OK)

        except KeyError:
            data = json.dumps({
                'status': "error",
                'message': "Error during getting users."
            })
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        data = ({
            'status': "error",
            'message': "Invalid request method."
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)


# @api_view(["POST"])
# def create_user_api(request):

#     bodys= json.loads(request.body)
#     print('bodys', bodys)

#     """
#     Create user API
    
#     Args:
#         request: HTTP request with user data
#     Returns:
#         Response:
#             data:
#                 - status
#                 - message
#             status code
#     """
#     try:
#         if request.method != "POST":
#             data = json.dumps({
#                 'status': "error",
#                 'message': "Method not allowed"
#             })
#             return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)

#         # Validate request body
#         try:
#             body = json.loads(request.body)
#             print('body is', body)
        

#         except json.JSONDecodeError:
#             data = json.dumps({
#                 'status': "error",
#                 'message': "Invalid JSON in request body"
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         # Validate serializer data
#         serializer = CreateUserSerializer(data=body)
#         if not serializer.is_valid():
#             print('serializer is not valid')
#             data = json.dumps({
#                 'status': "error",
#                 'message': "Validation error",
#                 'errors': serializer.errors
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         print('proceed')
#         # Extract validated data with null checks
#         validated_data = serializer.validated_data
        
#         user_type_id = validated_data.get('user_type_id')
#         if not user_type_id:
#             data = json.dumps({
#                 'status': "error",
#                 'message': "user_type_id is required"
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         first_name = validated_data.get('first_name')
#         last_name = validated_data.get('last_name')

#         email = validated_data.get('email')
#         if not email:
#             data = json.dumps({
#                 'status': "error",
#                 'message': "email is required"
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         user_created_by_id = validated_data.get('user_created_by_id')
#         password = validated_data.get('password')
#         if not password:
#             data = json.dumps({
#                 'status': "error",
#                 'message': "password is required"
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         # Check if email exists
#         if User.objects.filter(email=email).exists():
#             data = json.dumps({
#                 'status': "error",
#                 'message': f"User with email {email} already exists."
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         # Get user type with error handling
#         try:
#             user_type = UserType.objects.get(id=user_type_id)
#         except ObjectDoesNotExist:
#             data = json.dumps({
#                 'status': "error",
#                 'message': f"UserType with id {user_type_id} does not exist."
#             })
#             return Response(data, status.HTTP_400_BAD_REQUEST)

#         # Create user with transaction
#         with transaction.atomic():
#             # Create user
#             user = User.objects.create_user(
#                 email=email,
#                 first_name=first_name,
#                 last_name=last_name,
#                 user_type=user_type,
#                 password=password,
#                 user_created_by_id=user_created_by_id
#             )

#             # Create profile
#             Profile.objects.create(
#                 suburb=constants.EMPTY,
#                 city=constants.EMPTY,
#                 province=constants.EMPTY,
#                 postal_code=constants.EMPTY,
#                 user=user
#             )

#             data = json.dumps({
#                 'status': "success",
#                 'message': "User created successfully.",
#                 'user_type': str(user_type.name).lower()
#             })
#             return Response(data, status.HTTP_201_CREATED)

#     except ValidationError as e:
#         data = json.dumps({
#             'status': "error",
#             'message': str(e)
#         })
#         return Response(data, status.HTTP_400_BAD_REQUEST)

#     except Exception as e:
#         data = json.dumps({
#             'status': "error",
#             'message': f"An unexpected error occurred: {str(e)}"
#         })
#         return Response(data, status.HTTP_500_INTERNAL_SERVER_ERROR)


import logging

logger = logging.getLogger(__name__)

@api_view(["POST"])
def create_user_api(request):
    try:
        body = json.loads(request.body)
        logger.debug(f"Original body: {body}")
        
        # Manually handle conversion here for testing
        if isinstance(body.get('user_type_id'), str):
            body['user_type_id'] = int(body['user_type_id'])
        
        logger.debug(f"Processed body: {body}")
        
        # Validate serializer data
        serializer = CreateUserSerializer(data=body)

        print('serializer is here', serializer)
        
        # Check if the serializer data is valid before accessing validated_data
        if not serializer.is_valid():
            logger.error(f"Validation failed: {serializer.errors}")
            data = json.dumps({
                "status": "error",
                "message": "Validation failed",
                "errors": serializer.errors
            })
            return Response(data, status.HTTP_400_BAD_REQUEST)

        # Proceed with user creation if data is valid
        user = serializer.save()

        # Prepare the response data
        response_data = {
            "status": "success",
            "message": "User created successfully.",
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "user_type": str(user.user_type.name).lower(),
                "user_created_by_id": user.user_created_by_id
            }
        }

        # Return the response as JSON
        data = json.dumps(response_data)
        return Response(data, status.HTTP_201_CREATED, content_type='application/json')

    except json.JSONDecodeError:
        logger.error("Invalid JSON data")
        data = json.dumps({
            "status": "error",
            "message": "Invalid JSON in request body"
        })
        return Response(data, status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        data = json.dumps({
            "status": "error",
            "message": "An unexpected error occurred."
        })
        return Response(data, status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(["POST"])
def first_time_login_reset_api(request):
    """
    first time login api for user change password
    Args:
        request:
    Returns:
        Response:
        data:
            - status
            - message
        status code:
    """
    if request.method == "POST":

        body = json.loads(request.body)

        serializer = UserResetPasswordSerializer(data=body)

        if not serializer.is_valid():
            response_data = json.dumps({
                'status': 'error',
                'message': f'Invalid request',
                'data': str(serializer.errors)
            })
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        
        new_password = validated_data["new_password"]
        confirm_password = validated_data["confirm_password"]
        user_id = validated_data["user_id"]

        if new_password != confirm_password:
            response_data = json.dumps({
                'status': 'error',
                'message': f'password and confirm password do not match!'
            })
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        try:
            user = User.objects.get(pk=user_id)

        except User.DoesNotExist:
            response_data = json.dumps({
                'status': 'error',
                'message': f'User not found for id: {user_id}'
            })
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        try:
            profile = Profile.objects.get(user=user)

        except Profile.DoesNotExist:
            response_data = json.dumps({
                'status': 'error',
                'message': f'Profile not found for id: {user_id}'
            })
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)

        if not profile.first_login:
            profile.first_login = True
            profile.save()
        
        user_number = profile.phone_number
        
        otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])

        OneTimePin.objects.update_or_create(
            user_id=user.id,
            defaults={
                'pin': otp
            }
        )
        data = {
            'user': UserModelSerializer(user).data,
            'user_number': user_number,
            'new_pin': otp
        }
        response_data = json.dumps({
            "status": "success",
            'data': data,
            'message': 'Password changed successfully.'
        })

        return Response(response_data, status=status.HTTP_200_OK)

    else:
        data = json.dumps({
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def update_user_api(request):
    """
    Update function api for user edit

    Args:
        request:
    Returns:
        Response:
            data:
                - status
                - message
            status code:
    """
    if request.method == 'POST':
        body = json.loads(request.body)

        print('body', body)
        serializer = UserUpdateSerializer(data=body)

        if serializer.is_valid():
            print('its valid')
            validated_data = serializer.validated_data
            user_id = validated_data.get('user_id')
            email = validated_data.get('email')
        
            if User.objects.exclude(id=user_id).filter(email=email).exists():
                data = json.dumps({
                    'status': "error",
                    'message': f"User with email {email} already exists."
                })
                return Response(data, status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(id=user_id)

                print('user',user)

            except User.DoesNotExist:

                data = json.dumps({
                    'status': "error",
                    'message': f"User with id {user_id} does not exist."
                })
                return Response(data, status.HTTP_400_BAD_REQUEST)

            user_type_id = validated_data.get('user_type_id')

            print('user_type_id',user_type_id)

            try:
                user_type = UserType.objects.get(id=user_type_id)
                print('user_type',user_type)

            except UserType.DoesNotExist:
                data = json.dumps({
                    'status': "error",
                    'message': f"User type with id {user_type_id} does not exist."
                })
                return Response(data, status.HTTP_400_BAD_REQUEST)

            email_change = False

            if not user.email == validated_data.get('email'):
                email_change = True

            user.first_name = validated_data.get('first_name')
            user.last_name = validated_data.get('last_name')
            user.email = validated_data.get('email')
            user.user_type_id = user_type.id
            user.save()

            # Profile.objects.filter(user_id=user_id).update(
            #     email=validated_data.get('phone_number')
            # )

            data = json.dumps({
                'status': "success",
                'message': "User updated successfully.",
                'user_type': str(user_type.name).lower(),
                "email_change": email_change
            })
            return Response(data, status=status.HTTP_200_OK)

        else:
            print('invalid')
            data = json.dumps({
                'status': "error",
                'message': str(serializer.errors)
            })
            return Response(data, status.HTTP_400_BAD_REQUEST)

    else:

        data = json.dumps({
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def check_email_api(request):
    """
    Check if email is available or not

    Args:
        request:
    Returns:
        Response:
            data:
                - status
                - message
                - is_taken
            status code:
    """
    if request.method == 'POST':
        body = json.loads(request.body)

        email = body.get('email')

        if email is None:
            data = json.dumps({
                'status': "error",
                'message': "Invalid request: email is missing."
            })
            return Response(data, status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            data = json.dumps({
                'status': "success",
                'message': f"User with email {email} already exists.",
                'is_taken': "True"
            })
            return Response(data, status.HTTP_400_BAD_REQUEST)

        data = json.dumps({
            'status': "success",
            'message': "Email is available.",
            'is_taken': "False"
        })
        return Response(data, status=status.HTTP_200_OK)

    else:
        data = json.dumps({
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        })
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)
