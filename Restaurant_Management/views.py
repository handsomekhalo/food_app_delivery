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


@csrf_exempt
def get_all_restaurant_managers(request):
    """
    Returns all restaurant managers with their assigned restaurants.
    """
    if request.method == "GET":
        try:
            # Retrieve authentication token from session or headers
            token = request.session.get("token") or request.headers.get("Authorization", "").split("Token ")[-1]

            if token:
                request.session["token"] = token
                request.session.modified = True

            if not token:
                return JsonResponse({
                    "status": "error",
                    "message": "Token not found in session or headers"
                })

            # API call to fetch all users with RESTAURANT_ADMIN type
            url = f"{host_url(request)}{reverse('get_all_restaurants_managers_api')}"
            payload = json.dumps({'token': token})
            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            managers = []
            if response_data.get('status') == 'success':
                managers = response_data.get('restaurant_managers', [])

            return JsonResponse({
                'status': 'success',
                'restaurant_managers': managers
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


@csrf_exempt  # Bypass CSRF check for this view if needed
def create_restaurant(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        token = request.session.get("token") or request.headers.get("Authorization", "").split("Token ")[-1]

        if token:
            request.session["token"] = token
            request.session.modified = True

            if not token:
                return JsonResponse({
                    "status": "error",
                    "message": "Token not found in session or headers"
                })

        # Parse incoming request data (data from frontend)
        data = json.loads(request.body)
        restaurant_name = data.get('name')
        restaurant_address = data.get('address')
        restaurant_phone_number = data.get('phone_number')
        user_type = data.get('user_type')  # The manager (user) selected by the frontend

        # Validate the required fields
        if not all([restaurant_name, restaurant_address, restaurant_phone_number, user_type]):
            return JsonResponse({
                "status": "error",
                "message": "Restaurant name, address, phone number, and manager are required."
            }, status=400)

        # Prepare data for the API call to create the restaurant
        url = f"{host_url(request)}{reverse('create_restaurant_api')}"
        payload = json.dumps({
            "name": restaurant_name,
            "address": restaurant_address,
            "phone_number": restaurant_phone_number,
            "manager_id": user_type  # Sending manager (user_type) selected in frontend
        })

        # Prepare the headers with Authorization and CSRF token (assuming you're using token authentication)
        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json',
            # 'X-CSRFToken': csrf_token_from_cookie
        }

        # Send POST request to the API endpoint to create the restaurant
        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)

        # Check if the response is successful (status code 201)
        if response_data.get('status_code') == 201:
            return JsonResponse({
                "status": "success",
                "message": "Restaurant created successfully",
                "restaurant": response_data.get('restaurant')
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('message', 'Failed to create restaurant')
            }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "Manager Already Assigned to another resaturant"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
