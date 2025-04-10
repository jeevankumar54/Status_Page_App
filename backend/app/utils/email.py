import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import emails
from emails.template import JinjaTemplate
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings
from app.utils.logger import log


def send_email(
    email_to: str,
    subject_template: str = "",
    html_template: str = "",
    environment: Dict[str, Any] = {},
) -> None:
    """
    Send an email with the provided templates and environment variables.
    """
    if not settings.EMAILS_FROM_EMAIL:
        log.warning("No EMAILS_FROM_EMAIL setting, email not sent")
        return

    message = emails.Message(
        subject=JinjaTemplate(subject_template),
        html=JinjaTemplate(html_template),
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    
    response = message.send(to=email_to, render=environment, smtp=smtp_options)
    
    if response.status_code not in [250, 200]:
        log.error(f"Email failed to send: {response.status_code}")
    else:
        log.info(f"Email sent to {email_to}")


def send_incident_notification(
    email_to: str,
    incident_title: str,
    incident_status: str,
    incident_impact: str,
    organization_name: str,
    status_page_url: str,
) -> None:
    """
    Send an incident notification email.
    """
    subject = f"[{organization_name}] Incident Alert: {incident_title}"
    
    # Simple HTML template
    html_template = f"""
    <div>
        <h1>Incident Alert</h1>
        <p>An incident has been reported for {organization_name}.</p>
        <p><strong>Title:</strong> {incident_title}</p>
        <p><strong>Status:</strong> {incident_status}</p>
        <p><strong>Impact:</strong> {incident_impact}</p>
        <p>View the full details on our <a href="{status_page_url}">status page</a>.</p>
    </div>
    """
    
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=html_template,
        environment={},
    )


def send_status_change_notification(
    email_to: str,
    service_name: str,
    old_status: str,
    new_status: str,
    organization_name: str,
    status_page_url: str,
) -> None:
    """
    Send a service status change notification email.
    """
    subject = f"[{organization_name}] Service Status Change: {service_name}"
    
    # Simple HTML template
    html_template = f"""
    <div>
        <h1>Service Status Change</h1>
        <p>A service status has changed for {organization_name}.</p>
        <p><strong>Service:</strong> {service_name}</p>
        <p><strong>Old Status:</strong> {old_status}</p>
        <p><strong>New Status:</strong> {new_status}</p>
        <p>View the full details on our <a href="{status_page_url}">status page</a>.</p>
    </div>
    """
    
    send_email(
        email_to=email_to,
        subject_template=subject,
        html_template=html_template,
        environment={},
    )