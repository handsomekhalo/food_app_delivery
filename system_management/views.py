import secrets
import string
import threading
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
from django.middleware.csrf import get_token
from system_management import constants
from system_management.api.serializers import UserTypeModelSerializer
from system_management.decorators import check_token_in_session, session_timeout
from system_management.general_func_classes import _send_email_thread, api_connection, host_url
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


def generate_password(length=12, include_digits=True, include_special_chars=True):
    letters = string.ascii_letters
    digits = string.digits if include_digits else ''
    special_chars = string.punctuation if include_special_chars else ''

    characters = letters + digits + special_chars

    length = max(length, 8)

    password = ''.join(secrets.choice(characters) for _ in range(length))

    return password



def set_csrf_token(request):
     response = JsonResponse({'detail': 'CSRF cookie set'})
     response.set_cookie('csrftoken', get_token(request)) 
     return response

@ensure_csrf_cookie     
def login_view(request):
    """User login function with API."""

    if request.method == "GET":
    
        # Update this path to point to your React app's index.html
        return render(request, 'index.html')  # Adj
    



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


@session_timeout
@check_token_in_session
def get_all_users(request):
    
    if request.method == "GET":
        """Returns all user information for user management template."""
        try:
            # user =request.data

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

            # API call to fetch users
            url = f"{host_url(request)}{reverse('get_users_api')}"

            payload = json.dumps({
                'token': token  # Adding token to payload
            })

            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            users = []
            if response_data.get('status') == 'success':
                users = response_data.get('users', [])
                print('users',users)

            # API call to fetch user types
            url = f"{host_url(request)}{reverse('get_user_types_api')}"
            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            roles = []
            if response_data.get('status') == 'success':
                roles = response_data.get('user_types', [])
                print('roles',roles)

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


@session_timeout
@check_token_in_session
def create_user(request):
    """User registration function for the creation of new users by admin"""
    if request.method == 'POST':
        user_type_id = request.POST.get('user_type')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('user_email')
        user_created_by_id = request.session.get('user_id')
        password = generate_password()

        url = f"{host_url(request)}{reverse('create_user_api')}"
        payload = json.dumps({
            "user_type_id": user_type_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password,
        })

        headers = {
            'Authorization': f'Token {request.session.get("token")}',
            'Content-Type': constants.JSON_APPLICATION
        }
        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)
        status = response_data.get('status')

        if status == 'success':
            # Determine the email template based on user type
            if user_type_id == '1':
                html_tpl_path = "email_temps/admin_credentials.html"
            elif user_type_id == '3':
                html_tpl_path = "email_temps/cao_credentials.html"
            elif user_type_id == '2':
                html_tpl_path = "email_temps/attorney_credentials.html"
            else:
                html_tpl_path = "email_temps/user_credentials.html"
            subject = "New User Registration"
            login_url = f"{host_url(request)}{reverse('login_view')}"
            receiver_email = email
            context_data = {
                "login_url": login_url,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "password": password
            }

            url = f"{host_url(request)}{reverse('send_email_api')}"
            payload = json.dumps({
                "html_tpl_path": html_tpl_path,
                "receiver_email": receiver_email,
                "context_data": context_data,
                "subject": subject,
            })

            thread = threading.Thread(target=_send_email_thread, args=(url, headers, payload))
            thread.start()

        return JsonResponse(data=response_data, safe=False)