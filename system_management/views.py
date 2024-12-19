from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from system_management.general_func_classes import host_url



def login_view(request):
    """User login function with API."""

    if request.method == "GET":
      
        # Update this path to point to your React app's index.html
        return render(request, 'index.html')  # Adj
    
