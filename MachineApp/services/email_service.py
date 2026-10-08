from django.core.mail import EmailMessage
from django.conf import settings


class QuoteEmailService:

    @staticmethod
    def send_quote_email(name, phone, email, country, message):
        subject = f"New Quote Request from {name}"

        body = f"""
                New Quote Request Received:
                Phone: {phone}
                Country: {country}
                Message:{message}
                """

        email_message = EmailMessage(
            subject=subject,
            body=body,
            from_email=email,
            to=[settings.ADMIN_EMAIL],  # your receiving email
        )

        email_message.send(fail_silently=False)