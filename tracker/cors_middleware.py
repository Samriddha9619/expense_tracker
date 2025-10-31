"""
Custom CORS middleware to handle preflight requests
"""
from django.http import HttpResponse

class CustomCORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        print("CustomCORSMiddleware initialized!")

    def __call__(self, request):
        print(f"CustomCORSMiddleware called for {request.method} {request.path}")
        
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            response.status_code = 200
            print("Returning OPTIONS response with CORS headers")
            return response
        
        # Process normal requests
        response = self.get_response(request)
        
        # Add CORS headers to all responses
        print(f"Adding CORS headers to {response.status_code} response")
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
        response['Access-Control-Allow-Credentials'] = 'true'
        
        return response
