from django.shortcuts import render

# Create your views here.

def login_view(request):
    """User login function with API."""

    if request.method == "GET":
      
        # Update this path to point to your React app's index.html
        return render(request, 'index.html')  # Adj
    