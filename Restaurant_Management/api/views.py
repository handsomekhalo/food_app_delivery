

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

from .serializers import RestaurantSerializer

@api_view(['GET'])
def get_all_restaurants_api(request):
    print('inside API ')
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
