from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

from food_management.models import Category
from .serializers import CategorySerializer, CreateCategorySerializer, DeleteCategorySerializer, UpdateCategorySerializer  # Assuming you have this serializer
from Restaurant_Management.models import Restaurant



@api_view(['POST'])
def create_category_api(request):
    """
    API endpoint to create a new category.
    """
    if request.method == 'POST':
        restaurant_id = request.data.get('restaurant_id')
        print('restaurant_id',restaurant_id)
        title = request.data.get('title')
        print('title',title)


        # Ensure restaurant exists
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
            print('reaturant exists',restaurant)
        except Restaurant.DoesNotExist:
            print('no exiat')
            return Response(json.dumps({
                'status': "error",
                'message': "Restaurant does not exist."
            }), status=status.HTTP_400_BAD_REQUEST)

        # Check if a category with the same title exists in the restaurant
        if Category.objects.filter(title=title, restaurant=restaurant).exists():
            print('Category exists')
            return Response(json.dumps({
                'status': "error",
                'message': "A category with this title already exists for this restaurant."
            }), status=status.HTTP_400_BAD_REQUEST)

        # Proceed to create the category
        print('check serlalizer')
        serializer = CreateCategorySerializer(data=request.data)
        
        if serializer.is_valid():
            print('serializer valid')
            try:
                category = serializer.save()
                return Response(json.dumps({
                    'status': "success",
                    'message': "Category created successfully",
                    'category': serializer.data
                }), status=status.HTTP_201_CREATED)
            except Exception as e:
                print('serializer invalid')
                print(f"Error saving category: {e}")
                return Response(json.dumps({
                    'status': "error",
                    'message': "An error occurred while creating the category."
                }), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(json.dumps({
            'status': "error",
            'message': serializer.errors
        }), status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['GET'])
def get_all_categories_api(request):
    """
    API endpoint to retrieve all categories for a specific restaurant.
    """
    
    data = json.loads(request.body)  # Load JSON data
    restaurant_id = data.get('restaurant_id')
    print('restaurant_id',restaurant_id)

    categories = Category.objects.filter(restaurant_id=restaurant_id)
    # categories = Category.objects.filter(restaurant_id=restaurant_id)

    if not categories.exists():
        return Response(json.dumps({
            'status': "error",
            'message': "No categories found for this restaurant."
        }), status=status.HTTP_404_NOT_FOUND)

    serializer = CategorySerializer(categories, many=True)

    return Response(json.dumps({
        'status': "success",
        'categories': serializer.data
    }), status=status.HTTP_200_OK)

# @api_view(['GET'])
# def get_all_categories_api(request):
#     """
#     API endpoint to retrieve all categories.
#     """

#     print('executing')
#     data = json.loads(request.body)  # Load JSON data
#     restaurant_id = data.get('restaurant_id')

#     categories = Category.objects.filter(restaurant_id=restaurant_id)
#     # categories = Category.objects.all()
#     serializer = CategorySerializer(categories, many=True)
    
#     return Response(json.dumps({
#         'status': "success",
#         'categories': serializer.data
#     }), status=status.HTTP_200_OK)



@api_view(['PUT', 'POST'])
def update_category_api(request):
    """
    API endpoint to update a category.
    """
    try:
        data = json.loads(request.body)  # Load JSON data
        category_id = data.get('category_id')

        if not category_id:
            return Response(json.dumps({
                'status': "error",
                'message': "category_id is required."
            }), status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response(json.dumps({
            'status': "error",
            'message': "Category not found."
        }), status=status.HTTP_404_NOT_FOUND)
    except json.JSONDecodeError:
        return Response(json.dumps({
            'status': "error",
            'message': "Invalid JSON format."
        }), status=status.HTTP_400_BAD_REQUEST)

    serializer = UpdateCategorySerializer(category, data=data, partial=True)

    if serializer.is_valid():
        category = serializer.save()
        return Response(json.dumps({
            'status': "success",
            'message': "Category updated successfully",
            'category': serializer.data
        }), status=status.HTTP_200_OK)

    return Response(json.dumps({
        'status': "error",
        'message': serializer.errors
    }), status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def delete_category_api(request):
    print('inside API')
    body = json.loads(request.body) if isinstance(request.body, bytes) else request.data
    
    print('body is', body)
    serializer = DeleteCategorySerializer(data=body)
    
    if serializer.is_valid():
        print('get here')
        validated_data = serializer.validated_data
        category_id= validated_data.get('category_id')
        
        try:
            print('trying')
            category_id = Category.objects.get(id=category_id)
            print('category_ids', category_id)
            category_id.delete()
            print('deleted')
            return Response(json.dumps({
                'status': "success",
                'message': "User deleted successfully."
            }), status=status.HTTP_200_OK)
        except category_id.DoesNotExist:
            return Response(json.dumps({
                'status': "error",
                'message': f"category with id {category_id} does not exist."
            }), status=status.HTTP_400_BAD_REQUEST)
    
    return Response(json.dumps({
        'status': "error",
        'message': str(serializer.errors)
    }), status=status.HTTP_400_BAD_REQUEST)
