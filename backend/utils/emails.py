from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from email.mime.image import MIMEImage
import os
import json

def send_complaint_email(user_email, user_name, complaint, status, solution=None):
    title = complaint.title
    category = complaint.category
    description = complaint.description
    location = complaint.location
    ai_solution_json = complaint.ai_recommended_solution  # AI output in JSON array format

    # Subject
    subject_map = {
        "submitted": "Complaint Submitted Successfully",
        "verified": "Complaint Verified",
        "resolved": "Complaint Resolved",
        "rejected": "Complaint Rejected",
    }
    subject = f"{subject_map.get(status, 'Complaint Update')}: {title}"

    # Convert AI JSON array to HTML numbered list
    ai_points = "<p>Not Available</p>"
    if ai_solution_json:
        try:
            steps = json.loads(ai_solution_json)  # parse JSON array
            if steps:
                ai_points = "<ol>"
                for step in steps:
                    ai_points += f"<li>{step}</li>"
                ai_points += "</ol>"
        except Exception:
            ai_points = "<p>Not Available</p>"

    # HTML content
    html_content = f"""
    <html>
    <body style="font-family: Arial; line-height:1.6;">
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

       {('<h3>Photo:</h3><img src="cid:complaint_image" alt="Complaint Image" style="max-width:600px; height:auto;"/>') if complaint.photo else ""}

        <p>Thank you for using our system.</p>
        <p>Regards,<br>Nueve Support Team</p>
    </body>
    </html>
    """

    # Plain text fallback
    text_content = f"Your complaint '{title}' status is: {status}\n"
    if complaint.photo:
        text_content += "Photo attached in email.\n"

    # Create email
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.EMAIL_HOST_USER,
        [user_email],
    )
    email.attach_alternative(html_content, "text/html")

    # Attach inline image from local storage
    if complaint.photo:
        try:
            image_path = os.path.join(settings.MEDIA_ROOT, complaint.photo.name)
            with open(image_path, 'rb') as f:
                img = MIMEImage(f.read())
                img.add_header('Content-ID', '<complaint_image>')
                img.add_header('Content-Disposition', 'inline', filename=os.path.basename(image_path))
                email.attach(img)
        except Exception as e:
            print("Could not attach image:", e)

    email.send()