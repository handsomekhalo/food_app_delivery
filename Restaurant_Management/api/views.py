

import json
from requests import Response

from Restaurant_Management.api.serializers import RestaurantSerializer
from Restaurant_Management.models import Restaurant
from django.http import JsonResponse
from django.urls import reverse, reverse_lazy
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)


from rest_framework import (
    status,
    permissions,
    authentication
)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

from system_management.models import User, UserType

from .serializers import  CreateRestaurantSerializer, GetAllRestaurantManagerSerializer, GetManagerEmailSerializer, ManagerUpdateSerializer, RestaurantSerializer

@api_view(['GET'])
def get_all_restaurants_api(request):

    """
    Get all restaurants in the database

    Args:
        request:
    Returns:
        Response:
            data:
                status:
                message:
                restaurants:
            status code:
    """
    if request.method == 'GET':
        restaurants = Restaurant.objects.all()
        serializer = RestaurantSerializer(restaurants, many=True)

        try:
            data = json.dumps({
                'status': "success",
                'restaurants': serializer.data
            })
            return Response(data, status=status.HTTP_200_OK)

        except KeyError:
            data = json.dumps({
                'status': "error",
                'message': "Error retrieving restaurants."
            })
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        data = json.dumps({
            'status': "error",
            'message': "Invalid request method."
        })
        return Response(data, status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # Uncomment when authentication is required
def get_all_restaurants_managers_api(request):
    """
    API endpoint to get all restaurant managers.
    
    Returns:
        Response:
            data:
                status:
                message:
                restaurant_managers:
            status code:
    """
    try:
        restaurant_admin_type = UserType.objects.get(name="RESTAURANT_ADMIN")
        managers = User.objects.filter(user_type=restaurant_admin_type)
        
        if managers.exists():
            serializer = GetAllRestaurantManagerSerializer(managers, many=True)
            data = json.dumps({
                'status': "success",
                'message': "Restaurant managers retrieved successfully",
                'restaurant_managers': serializer.data
            })
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(json.dumps({
                'status': "error",
                'message': "No restaurant managers found"
            }), status=status.HTTP_404_NOT_FOUND)

    except UserType.DoesNotExist:
        return Response(json.dumps({
            'status': "error",
            'message': "UserType RESTAURANT_ADMIN not found"
        }), status=status.HTTP_400_BAD_REQUEST)


# @api_view(['POST'])
# # @permission_classes([IsAuthenticated])
# def create_restaurant_api(request):
#     """
#     API endpoint to create a new restaurant.

#     Args:
#         request:
#     Returns:
#         Response:
#             data:
#                 status:
#                 message:
#                 restaurant:
#             status code:
#     """
#     if request.method == 'POST':
#         serializer = CreateRestaurantSerializer(data=request.data)

#         if serializer.is_valid():
#             serializer.save()
#             data = json.dumps({
#                 'status': "success",
#                 'message': "Restaurant created successfully",
#                 'restaurant': serializer.data
#             })
#             return Response(data, status=status.HTTP_201_CREATED)

#         data = json.dumps({
#             'status': "error",
#             'message': serializer.errors
#         })
#         return Response(data, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import CreateRestaurantSerializer
# from .models import Restaurant
from system_management.models import User
import json

# @api_view(['POST'])
# # @permission_classes([IsAuthenticated])
# def create_restaurant_api(request):
#     """
#     API endpoint to create a new restaurant.

#     Args:
#         request:
#     Returns:
#         Response:
#             data:
#                 status:
#                 message:
#                 restaurant:
#             status code:
#     """
#     if request.method == 'POST':
#         manager_id = request.data.get('manager')  # Get manager ID from the request data

#         if Restaurant.objects.filter(manager_id=manager_id).exists():
#             data = json.dumps({
#                 'status': "error",
#                 'message': "This manager is already assigned to a restaurant."
#             })
#             return Response(data, status=status.HTTP_400_BAD_REQUEST)

#         # Proceed to create the restaurant if no duplicate is found
#         serializer = CreateRestaurantSerializer(data=request.data)

#         if serializer.is_valid():
#             serializer.save()
#             data = json.dumps({
#                 'status': "success",
#                 'message': "Restaurant created successfully",
#                 'restaurant': serializer.data
#             })
#             return Response(data, status=status.HTTP_201_CREATED)

#         data = json.dumps({
#             'status': "error",
#             'message': serializer.errors
#         })
#         return Response(data, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_restaurant_api(request):
    """
    API endpoint to create a new restaurant.
    """
    if request.method == 'POST':
        manager_id = request.data.get('manager') 
        print('manager_id',manager_id)

        # Check if the manager is already assigned to another restaurant
        if Restaurant.objects.filter(manager_id=manager_id).exists():
            return Response({
                'status': "error",
                'message': "This manager is already assigned to another restaurant."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Proceed to create the restaurant if no duplicate is found
        serializer = CreateRestaurantSerializer(data=request.data)

        if serializer.is_valid():
            try:
                serializer.save()
                return Response(json.dumps({
                    'status': "success",
                    'message': "Restaurant created successfully",
                    'restaurant': serializer.data
                }), status=status.HTTP_201_CREATED)
            except Exception as e:
                # Log the exception for debugging
                print(f"Error saving restaurant: {e}")
                return Response(json.dumps({
                    'status': "error",
                    'message': "Manager already assigned to another restaurant."
                }), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(json.dumps({
            'status': "error",
            'message': serializer.errors
        }), status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST', 'PUT'])
def update_manager_api(request):
    if request.method in ['POST', 'PUT']:
        body = json.loads(request.body) if isinstance(request.body, bytes) else request.data

        serializer = ManagerUpdateSerializer(data=body)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            manager_id = validated_data.get('manager_id')

            try:
                manager = User.objects.get(id=manager_id, user_type__name='RESTAURANT_ADMIN')
            except User.DoesNotExist:
                return Response({
                    'status': "error",
                    'message': f"Manager with id {manager_id} does not exist or does not have the 'RESTAURANT_ADMIN' role."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Update manager data
            serializer.update(manager, validated_data)

            return Response({
                'status': "success",
                'message': "Manager updated successfully.",
                'manager_email': manager.email,
                'restaurant': manager.managed_restaurant.name
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'status': "error",
                'message': str(serializer.errors)
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "error",
            'message': "Invalid request method."
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
def get_manager_email_api(request):
    body = json.loads(request.body) if isinstance(request.body, bytes) else request.data

    serializer = GetManagerEmailSerializer(data=body)

    if serializer.is_valid():
            validated_data = serializer.validated_data
            manager_id = validated_data.get('manager_id')

    if not manager_id:
        return Response({
            'status': "error",
            'message': "Manager ID is required."
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        manager = User.objects.get(id=manager_id, user_type__name='RESTAURANT_ADMIN')
    except User.DoesNotExist:
        return Response({
            'status': "error",
            'message': f"Manager with id {manager_id} does not exist or does not have the 'RESTAURANT_ADMIN' role."
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': "success",
        'manager_email': manager.email
    }, status=status.HTTP_200_OK)