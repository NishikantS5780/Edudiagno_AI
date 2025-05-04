from app import config
from app.configs.brevo import api_instance
from brevo_python.rest import ApiException
import brevo_python
import os

from app.lib.errors import CustomException


def send_otp_email(to: str, otp: str, expiration_time: str):
    try:
        html_content = f"""
            <h1>Edudiagno</h1>
            <p>Your OTP is: {otp}</p>
            <p>OTP is valid for {expiration_time}.</p>
        """
        send_smtp_email = brevo_python.SendSmtpEmail(
            sender={
                "name": config.settings.MAIL_SENDER_NAME,
                "email": config.settings.MAIL_SENDER_EMAIL,
            },
            to=[{"email": to}],
            html_content=html_content,
            subject="OTP for Edudiagno Jobs Portal",
        )

        api_instance.send_transac_email(send_smtp_email)
    except ApiException as e:
        print("Exception when calling EmailCampaignsApi->send_test_email: %s\n" % e)
        raise CustomException("Error while sending otp")
