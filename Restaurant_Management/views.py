from django.shortcuts import render

# Create your views here.


import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
# from .utils import api_connection, host_url
from system_management import constants
from system_management.general_func_classes import api_connection, host_url


@csrf_exempt
def get_all_restaurants(request):
    print('inside logic')
    """
    Fetch all restaurants from the API layer and return them in JSON format.
    """
    if request.method == "GET":
        try:
            # Extract token from session or headers
            token = request.session.get("token")
            token = request.headers.get("Authorization", "").split("Token ")[-1]

            if token:
                request.session["token"] = token
                request.session.modified = True

            if not token:
                return JsonResponse({
                    "status": "error",
                    "message": "Token not found in session or headers"
                })
            
            payload = json.dumps({
                'token': token  # Adding token to payload
            })

            # API call to fetch restaurants
            url = f"{host_url(request)}{reverse('get_all_restaurants_api')}"  

            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            restaurants = []
            if response_data.get('status') == 'success':
                restaurants = response_data.get('restaurants', [])

            return JsonResponse({
                'status': 'success',
                'restaurants': restaurants
            })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    })
