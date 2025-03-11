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
from django.contrib.auth.hashers import make_password

import requests
from rest_framework.response import Response
from django.middleware.csrf import get_token
from system_management.api.views import update_user_api
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

from system_management.models import User, UserType
from system_management.general_func_classes import host_url, api_connection,_send_email_thread



@ensure_csrf_cookie
def csrf(request):
    """
    Sets the CSRF cookie and returns the token
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

# def csrf(request):
#     print('executing')
#     return JsonResponse({'csrfToken': get_token(request)})

# def csrf(request):
#     return JsonResponse({'csrfToken': get_token(request)})

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
    



@ensure_csrf_cookie  # This ensures the CSRF cookie is set
def login(request):
    print('executing')
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


@check_token_in_session
def first_time_login_view(request):
    """first time User login function with api."""

    if request.method == "GET":
        return render(request, 'registration/first_time_login_reset.html')

    if request.method == "POST":
        token = request.session.get('token')
        user_id = request.session.get('user_id')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if new_password != confirm_password:
            return JsonResponse(
                {'success': False, 'error': 'New and confirm passwords do not match'})

        url = f"{host_url(request)}{reverse('first_time_login_reset_api')}"

        payload = json.dumps({
            "new_password": new_password,
            "confirm_password": confirm_password,
            "user_id": user_id
        })

        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': constants.JSON_APPLICATION,
        }

        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)
        response_status = response_data.get('status')

        if response_status == 'success':
            data = response_data.get('data')
            # user_number = data.get('user_number')
            new_pin = data.get('new_pin')
            user = data.get('user')

            url = f"{host_url(request)}{reverse('send_email_api')}"
            html_tpl_path = "email_temps/otp_email.html"
            subject = "User Authentication"

            receiver_email = user['email']
            current_first_name = user['first_name']
            current_last_name = user['last_name']
            context_data = {
                "first_name": current_first_name,
                "last_name": current_last_name,
                "otp": new_pin,
            }

            payload = json.dumps({
                "html_tpl_path": html_tpl_path,
                "receiver_email": receiver_email,
                "context_data": context_data,
                "subject": subject,
            })

            # thread = threading.Thread(target=_send_email_thread, args=(url, headers, payload))
            # thread.start()

            # if test_number(user_number):
            #     phone_number = format_phone_number(user_number)
            #     thread = threading.Thread(target=send_otp, args=(new_pin, phone_number))
            #     thread.start()

        return JsonResponse(data=response_data, safe=False)
    


# @session_timeout
# @check_token_in_session
@csrf_exempt
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

            # API call to fetch user types
            url = f"{host_url(request)}{reverse('get_user_types_api')}"
            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            roles = []
            if response_data.get('status') == 'success':
                roles = response_data.get('user_types', [])

            return JsonResponse({
                'status': 'success',
                'users': users,
                'user_types': roles
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


# @session_timeout
# @check_token_in_session
@ensure_csrf_cookie     
def create_user(request):
    """User registration function for the creation of new users by admin"""
    if request.method == 'POST':
        try:
            # Get the token from the request headers
            token = request.headers.get("Authorization", "").split("Token ")[-1]

            
            # Validate if token exists
            if not token:
                return JsonResponse({'message': 'Token is missing or invalid'}, status=400)

            # Use the token to fetch the logged-in user from the database
            user = User.objects.filter(auth_token=token).first()  # Assuming auth_token is used for token validation
            
            if not user:
                return JsonResponse({'message': 'Invalid token or user not found'}, status=400)

            # Extract user details from the JSON body
            data = json.loads(request.body)
            user_type_id = data.get('user_type')  # Getting from JSON payload
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            email = data.get('user_email')
            user_created_by_id = user.id  # Using logged-in user as the creator
            password = generate_password()

            url = f"{host_url(request)}{reverse_lazy('create_user_api')}"

            payload = json.dumps({
                "user_type_id": user_type_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "user_created_by_id": user_created_by_id,
                "password": password,
            })

            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            # Call the API to create the new user
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
                login_url = f"{host_url(request)}{reverse_lazy('login_view')}"
                receiver_email = email

                context_data = {
                    "login_url": login_url,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "password": password
                }

                # Send the email notification
                # url = f"{host_url(request)}{reverse_lazy('send_email_api')}"
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

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)


@session_timeout
def get_roles(request):
    """
    View function to get all roles/user types.
    Handles both session and header-based token authentication.
    """
    if request.method != "GET":
        return JsonResponse({
            'status': 'error',
            'message': 'Only GET requests are allowed'
        }, status=405)

    try:
        # Get token from session or Authorization header
        token = request.session.get("token")
        header_token = request.headers.get("Authorization", "").split("Token ")[-1]

        # Update session token if provided in header
        if header_token:
            token = header_token
            request.session["token"] = token
            request.session.modified = True

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Token not found in session or headers"
            }, status=401)

        url = f"{host_url(request)}{reverse('get_user_types_api')}"

        payload = json.dumps({
            'token': token
        })

        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': constants.JSON_APPLICATION
        }

        response_data = api_connection(
            method="GET",
            url=url,
            headers=headers,
            data=payload
        )

        if response_data.get('status') == 'success':
            return JsonResponse({
                'status': 'success',
                'roles': response_data.get('user_types', [])
            })
        
        return JsonResponse({
            'status': 'error',
            'message': response_data.get('message', 'Failed to fetch roles')
        }, status=400)

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)



# @check_token_in_session
# @session_timeout
# @ensure_csrf_cookie
# def update_user(request):
   
#     try:
#         data = json.loads(request.body)
#         # Extract data from the request
#         user_id = data.get('user_id')
#         print('user_id',user_id)
#         user_type_id = data.get('user_type_id')
#         print('user_type_id',user_type_id)
#         first_name = data.get('first_name')
#         print('first_name',first_name)
#         last_name = data.get('last_name')
#         print('last_name',last_name)
#         email = data.get('email')
#         print('email',email)
#         # password = generate_password()

#         # Fetch the user
#         try:
#             user = User.objects.get(id=user_id)
#             original_email = user.email
#         except User.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "User not found."
#             }, status=404)

#         # url = f"{host_url(request)}{reverse('update_user_api')}"
#         # url = f"{host_url(request)}{reverse('update_user_api')}"
#         url = f"{host_url(request)}{reverse_lazy('update_user_api')}"

#         # hashed_password = make_password(password)
#         payload = json.dumps({
#             "user_type_id": user_type_id,
#             "user_id": user_id,
#             "first_name": first_name,
#             "last_name": last_name,
#             "email": email,
#             # "password": hashed_password,
#         })


#         headers = {
#             'Authorization': f'Token {request.session.get("token")}',
#             'Content-Type': constants.JSON_APPLICATION
#         }

#         response_data = api_connection(method="POST", url=url, headers=headers, data=payload)

#         # Check response and return appropriate message
#         if response_data.get('status') == 'success':
#             print('success')
#             return JsonResponse({
#                 "status": "success",
#                 "message": "User updated successfully"
#             })
        
#         else:
#             print('failed')
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('message', 'Update failed')
#             }, status=400)

#     except json.JSONDecodeError:
#         print('excepjson error')
#         return JsonResponse({
#             "status": "error",
#             "message": "Invalid JSON data"
#         }, status=400)
#     except Exception as e:
#         print('exception')
#         print(f"Error updating user: {str(e)}")
#         print('exception')
#         return JsonResponse({
#             "status": "error",
#             "message": "Server error occurred"
#         }, status=500)


# @check_token_in_session
# @session_timeout
# @ensure_csrf_cookie
# def update_user(request, user_id):
#     if request.method != 'POST':
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed"
#         }, status=405)
    

#     if request.method not in ['POST']:
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed"
#         }, status=405)
        
#     try:
#         data = json.loads(request.body)
#         user_type_id = data.get('user_type_id')
#         first_name = data.get('first_name')
#         last_name = data.get('last_name')
#         email = data.get('email')

#         # Validate required fields
#         if not all([user_type_id, first_name, last_name, email]):
#             return JsonResponse({
#                 "status": "error",
#                 "message": "All fields are required."
#             }, status=400)

        
#         # Fetch the user
#         try:
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "User not found."
#             }, status=404)

#         # Prepare API call
#         url = f"{host_url(request)}{reverse_lazy('update_user_api')}"
        
#         payload = json.dumps({
#             "user_type_id": user_type_id,
#             "user_id": user_id,
#             "first_name": first_name,
#             "last_name": last_name,
#             "email": email,
#         })

#         headers = {
#             'Authorization': f'Token {request.session.get("token")}',
#             'Content-Type': constants.JSON_APPLICATION
#         }

#         # Make API call
#         response_data = api_connection(method="POST",url=url,headers=headers,data=payload)

#         if response_data.get('status') == 'success':
#             print('sucesful')
#             return JsonResponse({
#                 "status": "success",
#                 "message": "User updated successfully"
#             })
#         else:
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('message', 'Update failed')
#             }, status=400)

#     except json.JSONDecodeError:
#         return JsonResponse({
#             "status": "error",
#             "message": "Invalid JSON data"
#         }, status=400)
#     except Exception as e:
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)

import logging

# Configure logging if not already done in your project
logging.basicConfig(level=logging.INFO)

# @check_token_in_session
# @session_timeout
@csrf_exempt
def update_user(request, user_id):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Log request metadata
        logging.info(f"Headers: {dict(request.headers)}")
        logging.info(f"Body: {request.body.decode('utf-8')}")
        logging.info(f"User ID: {user_id}")
        logging.info(f"Session Token: {request.session.get('token')}")

        # Parse and validate request data
        data = json.loads(request.body)
        user_type_id = data.get('user_type_id')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        csrf_token_from_cookie = request.COOKIES.get('csrftoken')
        logging.info(f"CSRF Token from Cookie: {csrf_token_from_cookie}")
        logging.info(f"CSRF Token from Header: {request.headers.get('X-CSRFToken')}")

        if not all([user_type_id, first_name, last_name, email]):
            return JsonResponse({
                "status": "error",
                "message": "All fields are required."
            }, status=400)

        # Fetch the user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "User not found."
            }, status=404)

        # Prepare API call
        url = f"{host_url(request)}{reverse_lazy('update_user_api')}"
        payload = json.dumps({
            "user_type_id": user_type_id,
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
        })

        headers = {
            'Authorization': f'Token {request.session.get("token")}',
            'Content-Type': constants.JSON_APPLICATION
        }

        # Log API call details
        logging.info(f"API URL: {url}")
        logging.info(f"Payload: {payload}")
        logging.info(f"Headers for API call: {headers}")

        # Make API call
        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)

        if response_data.get('status') == 'success':
            logging.info("User updated successfully.")
            return JsonResponse({
                "status": "success",
                "message": "User updated successfully"
            })
        else:
            # Return early if response is unsuccessful, no further processing required
            logging.error("Update failed: " + response_data.get('message', 'Unknown error'))
            return JsonResponse({
                "status": "error",
                "message": response_data.get('message', 'Update failed')
            }, status=400)

    except json.JSONDecodeError:
        logging.error("Invalid JSON data in request.")
        return JsonResponse({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=400)
    except Exception as e:
        logging.exception("An unexpected error occurred.")
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)

    
