from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from MachineApp.services.email_service import QuoteEmailService
from .models import Quote, Video

# Create your views here.


def home(request):
    query_set = Video.objects.all().order_by('-created_at')
    return render(request, 'home.html', {"query_set":query_set})


def product(request):
    return render(request, 'product.html')

def Application(request):
    return render(request, 'application.html')

def About(request):
    return render(request, 'about.html')

def Feedback(request):
    return render(request, 'feedback.html')

def Blog(request):
    return render(request, 'blog.html')

def Contact(request):
    return render(request, 'contact.html')

def Story(request):
    return render(request, 'stories.html')

def QuoteMessage(request):
    if request.method == 'POST':

        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        country = request.POST.get('country')
        message = request.POST.get('message')

        # Proper validation
        if not all([name, phone, email, country, message]):
            return JsonResponse({
                "status": "error",
                "message": "All fields are required"
            }, status=400)

        try:
            quote = Quote.objects.create(
                name=name,
                phone=phone,
                email=email,
                country=country,
                message=message
            )

             # ✅ SEND EMAIL (ADD THIS ONLY)
            QuoteEmailService.send_quote_email(
                name=name,
                phone=phone,
                email=email,
                country=country,
                message=message
            )

            return JsonResponse({
                "status": "success",
                "message": "Quote submitted successfully",
                "data": {
                    "id": quote.id,
                    "name": quote.name,
                    "email": quote.email
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": "Internal server error",
                "error": str(e)
            }, status=500)

    return JsonResponse({
        "status": "error",
        "message": "Invalid request method"
    }, status=405)


def ag_nova_si400(request):
    return render(request, "machines/ag_nova_si400.html")




        