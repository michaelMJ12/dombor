from django.contrib import admin
from .models import Video, Quote


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'description',
        'video',
        'created_at',
    )

    search_fields = (
        'title',
        'description',
    )

    list_filter = (
        'created_at',
    )

    readonly_fields = (
        'id',
        'created_at',
    )

    ordering = (
        '-created_at',
    )

    fieldsets = (
        ('Video Information', {
            'fields': (
                'title',
                'description',
                'video',
            )
        }),
        ('Metadata', {
            'fields': (
                'id',
                'created_at',
            )
        }),
    )




@admin.register(Quote)
class QuateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'email',
        'phone',
        'country',
    )

    search_fields = (
        'name',
        'email',
        'country',
        'phone',
    )

    list_filter = (
        'country',
    )

    ordering = ('-id',)

    readonly_fields = ('id',)

    fieldsets = (
        ('Customer Information', {
            'fields': (
                'id',
                'name',
                'email',
                'phone',
                'country',
            )
        }),
        ('Message', {
            'fields': (
                'message',
            )
        }),
    )    