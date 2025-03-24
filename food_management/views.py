from django.shortcuts import render

# Create your views here.
import json
from django.http import JsonResponse
from django.urls import reverse, reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status

from system_management import constants
from system_management.amazons3 import upload_to_s3
from system_management.general_func_classes import api_connection, host_url
from .models import Restaurant, Category


@csrf_exempt  # Bypass CSRF check for this view if needed
def create_category(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
    
    try:
        # Extract token from session or headers
        token = request.session.get("token") or request.headers.get("Authorization", "").split("Token ")[-1]
        
        if token:
            request.session["token"] = token
            request.session.modified = True
        
        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Token not found in session or headers"
            })
        
        # Extract form fields
        title = request.POST.get('title')
        featured = request.POST.get('featured')  # Will always be 'Yes' or 'No'
        active = request.POST.get('active') 
        restaurant_id = request.POST.get('restaurant')    # Will always be 'Yes' or 'No'
        
        
        
       

        # Handle file upload
        image = None
        
        if 'image' in request.FILES:
            uploaded_image = request.FILES['image']
            

            try:
                image = handle_image_upload(uploaded_image)
            except Exception as e:
                print('Error handling image upload:', str(e))
                return JsonResponse({
                    "status": "error",
                    "message": "Failed to upload image: " + str(e)
                }, status=500)
        else:
            print('No image uploaded.')

        # Validate the required fields
        if not title:
            return JsonResponse({
                "status": "error",
                "message": "Title is required."
            }, status=400)
        
        # Prepare data for the API call to create the category
        # url = f"{host_url(request)}{reverse('create_category_api')}"
        url = f"{host_url(request)}{reverse_lazy('create_category_api')}"

        payload = json.dumps({
            "title": title,
            "image": image,
            "featured": featured,   
            "active": active,
            "restaurant_id" :restaurant_id,
        })
        
       
        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json',
        }

        
        # Send POST request to the API endpoint to create the category
        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)
        
        # Check if the response is successful
        if response_data.get('status_code') == 201:
            return JsonResponse({
                "status": "success",
                "message": "Category created successfully",
                "category": response_data.get('category')
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('message', 'Failed to create category')
            }, status=400)
    
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


def handle_image_upload(image_file):
    if not image_file:
        return None

    file_name = f"category_images/{image_file.name}"  # Define the file path in S3
    s3_url = upload_to_s3(image_file, file_name)  # Upload to S3
    
    if s3_url:
        return s3_url  # Return the S3 URL of the uploaded image
    else:
        return None  # Return None if upload fails
    


@csrf_exempt
def get_all_categories(request):
    """
    Returns all restaurant managers with their assigned restaurants.
    """
    if request.method == "GET":
        try:
            
            restaurant_id = request.GET.get('restaurant_id')

            if not restaurant_id:
                return JsonResponse({
                    "status": "error",
                    "message": "restaurant_id is required"
                })

            token = request.session.get("token") or request.headers.get("Authorization", "").split("Token ")[-1]

            if not token:
                return JsonResponse({
                    "status": "error",
                    "message": "Token not found in session or headers"
                })

            request.session["token"] = token
            request.session.modified = True

            url = f"{host_url(request)}{reverse_lazy('get_all_categories_api')}"
            payload = json.dumps({'token': token,
                                  'restaurant_id': restaurant_id})
            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)
            categories = response_data.get('categories', []) if response_data.get('status') == 'success' else []
            

            return JsonResponse({
                'status': 'success',
                'categories': categories
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
