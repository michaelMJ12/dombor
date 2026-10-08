from django.db import models
from cloudinary_storage.storage import VideoMediaCloudinaryStorage

# Create your models here.


class Video(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=500)
    video = models.FileField(upload_to='videos/', storage=VideoMediaCloudinaryStorage())
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    


class Quote(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=255)
    country = models.CharField(max_length=255)
    message = models.TextField(max_length=1000)

    def __str__(self):
        return f"{self.name} {self.email}"

    

