from turtle import pd
from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse, reverse_lazy
import os
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
import json
import requests
from rest_framework.response import Response

from system_management import constants
from system_management.api.serializers import UserTypeModelSerializer
from system_management.decorators import check_token_in_session, session_timeout
from system_management.general_func_classes import api_connection, host_url
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

from system_management.models import UserType


def get_data_on_success(response_data):
    status = response_data.get('status')
    if status == 'success':
        data = response_data.get('data')
    else:
        data = []
    return data


def login_view(request):
    """User login function with API."""

    if request.method == "GET":
    
        # Update this path to point to your React app's index.html
        return render(request, 'index.html')  # Adj
    



@ensure_csrf_cookie  # This ensures the CSRF cookie is set
def login(request):
    """User login function with API."""
    if request.method != "POST":
        return JsonResponse({
            'status': 'error', 
            'message': 'Only POST requests are allowed'
        }, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        # remember_me = data.get('rememberMe', False)

        if not email or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Email and password are required'
            }, status=400)

        # Get the existing token if any
        token = request.session.get('token')
        
        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}" if token else ""
        }

        payload = json.dumps({
            'email': email,
            'password': password,
            # 'remember_me': remember_me
        })

        url = f"{host_url(request)}{reverse_lazy('login_api')}"
        
        try:
            response_data = requests.post(
                url, 
                headers=headers, 
                data=payload, 
                timeout=10
            )
            
            if response_data.status_code == 200:
                response_json = response_data.json()

                print('response_json',response_json)
                
                # Store token in session if remember_me is True
                # if remember_me and 'token' in response_json:
                #     request.session['token'] = response_json['token']
                
                return JsonResponse({
                    'status': 'success', 
                    'data': response_json
                })
            
            
            return JsonResponse({
                'status': 'error',
                'message': response_data.json().get('message', 'Login failed'),
            }, status=response_data.status_code)

        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'status': 'error',
                'message': f'API request failed: {str(e)}'
            }, status=500)

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error', 
            'message': 'Invalid JSON data'
        }, status=400)


def serve_react(request):
    # Path to your React build directory
    react_build_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'food_app_frontend',  # React frontend directory
        'build'  # React build directory
    )
    
    index_file = os.path.join(react_build_dir, 'index.html')

    if os.path.exists(index_file):
        with open(index_file, 'r') as file:
            return HttpResponse(file.read())
    else:
        return HttpResponse(
            "React build directory not found. Run `npm run build` in the React project.",
            status=404
        )


     
# @session_timeout
# @check_token_in_session
@ensure_csrf_cookie 
# @csrf_exempt

def get_all_users(request):
    print('Executing get_all_users view...')

    # Log headers, body, and other metadata from the request
    print('Request method:', request.method)
    print('Request headers:', dict(request.headers))  # Log headers
    print('Session token:', request.session.get("token"))  # Log session token
    print('Request body:', request.body.decode('utf-8'))  # Log raw request body

    if request.method == "GET":
        """Returns all user information for user management template."""
        try:
            # API call to fetch users
            url = f"{host_url(request)}{reverse('get_users_api')}"
            print(f'Calling API: {url}')

            payload = json.dumps({})
            headers = {
                'Authorization': f'Token {request.session.get("token")}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)
            print('First API response:', response_data)

            users = []
            if response_data.get('status') == 'success':
                users = response_data.get('users', [])

            # API call to fetch user types
            url = f"{host_url(request)}{reverse('get_user_types_api')}"
            print(f'Calling API: {url}')
            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)
            print('Second API response:', response_data)

            roles = []
            if response_data.get('status') == 'success':
                roles = response_data.get('user_types', [])

            return JsonResponse({
                'status': 'success',
                'users': users,
                'user_types': roles
            })

        except Exception as e:
            print('Error in get_all_users:', str(e))
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    })