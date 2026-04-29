import logging
import os
import json
from json import JSONDecodeError
from smtplib import SMTPException
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from email.mime.image import MIMEImage

logger = logging.getLogger(__name__)

def send_complaint_email(user_email, user_name, complaint, status, solution=None):
    title = complaint.title
    category = complaint.category
    description = complaint.description
    location = complaint.location
    ai_solution_json = complaint.ai_recommended_solution

    # Subject
    subject_map = {
        "submitted": "Complaint Submitted Successfully",
        "verified": "Complaint Verified",
        "resolved": "Complaint Resolved",
        "rejected": "Complaint Rejected",
    }
    subject = f"{subject_map.get(status, 'Complaint Update')}: {title}"

    # AI solution parsing
    ai_points = "<p>Not Available</p>"
    if ai_solution_json:
        try:
            steps = json.loads(ai_solution_json)
            if steps:
                ai_points = "<ol>"
                for step in steps:
                    ai_points += f"<li>{step}</li>"
                ai_points += "</ol>"
        except JSONDecodeError:
            logger.warning("AI solution JSON parsing failed", exc_info=True)

    # HTML content
    html_content = f"""<html><body>
    <p>Dear {user_name},</p>
    <p>Your complaint has been <b>{status}</b>.</p>

    <h3>Complaint Details:</h3>
    <p><b>Title:</b> {title}</p>
    <p><b>Category:</b> {category}</p>
    <p><b>Description:</b> {description}</p>
    <p><b>Location:</b> {location}</p>

    <h3>AI Suggested Solution:</h3>
    {ai_points}

    {f"<h3>Resolved Solution:</h3><p>{solution}</p>" if status == "resolved" else ""}
    {f"<h3>Rejection Reason:</h3><p>{complaint.rejection_reason}</p>" if status == "rejected" else ""}

    {('<h3>Photo:</h3><img src="cid:complaint_image" style="max-width:600px;"/>') if complaint.photo else ""}

    <p>Regards,<br>Nueve Support Team</p>
    </body></html>"""

    text_content = f"Your complaint '{title}' status is: {status}\n"

    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.EMAIL_HOST_USER,
        [user_email],
    )
    email.attach_alternative(html_content, "text/html")

    # Attach image
    if complaint.photo:
        image_path = os.path.join(settings.MEDIA_ROOT, complaint.photo.name)
        with open(image_path, 'rb') as file_obj:
            img = MIMEImage(file_obj.read())
            img.add_header('Content-ID', '<complaint_image>')
            img.add_header('Content-Disposition', 'inline', filename=os.path.basename(image_path))
            email.attach(img)

    try:
        email.send()
    except (SMTPException, OSError, ValueError):
        logger.error("Email sending failed completely", exc_info=True)
        raise

    logger.info("Email sent successfully to %s", user_email)
