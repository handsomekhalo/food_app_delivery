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
from rest_framework.response import Response
import random

from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate
from rest_framework import (
    status,
    permissions,
    authentication
)
from datetime import datetime, timedelta

from rest_framework.authtoken.models import Token

from system_management.api.serializers import (
    UserModelSerializer,
    UserTypeModelSerializer,
)
from system_management.models import (
    # OneTimePin,
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
        # Get the user type for CAO
        # cao_user_type = UserType.objects.get(name=constants.COMMUNITY_ADVISORY_OFFICER)
        # attorney_user_type = UserType.objects.get(name=constants.ATTORNEY)
        # admin_user_type = UserType.objects.get(name=constants.ADMIN)
    
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
