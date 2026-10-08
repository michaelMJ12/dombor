from django.urls import  path
from MachineApp import views


urlpatterns = [
    path('', views.home, name='home'),
    path('product/', views.product, name='products'),
    path('quote/', views.QuoteMessage, name='quote'),
    path('application/', views.Application, name='application' ),
    path('about/', views.About, name='about'),
    path('feedback/', views.Feedback, name='feedback'),
    path('blog/', views.Blog, name='blog'),
    path('contact/', views.Contact, name='contact'),
    path('stories/', views.Story, name='story'),
    path(
        "machines/ag-nova-si400/",
        views.ag_nova_si400,
        name="ag_nova_si400"
    ),
   

]