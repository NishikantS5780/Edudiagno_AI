import brevo_python
from brevo_python.rest import ApiException
import os
from app import config

configuration = brevo_python.Configuration()
configuration.api_key["api-key"] = config.settings.BREVO_API_KEY

api_instance = brevo_python.TransactionalEmailsApi(
    brevo_python.ApiClient(configuration)
)
