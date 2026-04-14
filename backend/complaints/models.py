from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    otp = models.CharField(max_length=6,blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)
    otp_verified = models.BooleanField(default=False)
class Approvedemployee(models.Model):
    email=models.EmailField(unique=True)
    employee_id=models.CharField(max_length=10)
    is_registered=models.BooleanField(default=False)
    def __str__(self):
        return self.email
class Complaint(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected')
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints'
    )

    photo = models.ImageField(blank=False, null=False)
    title = models.CharField(max_length=250, default="title")
    description = models.TextField(blank=True)

    category = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='submitted',
        db_index=True
    )

    rejection_reason = models.TextField( blank=True)

    status_updated_at = models.DateTimeField(null=True, blank=True)

    ai_recommended_solution = models.TextField(blank=True)

    confidence_score = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Complaint #{self.id} by {self.user.username}"

class Solution(models.Model):
    complaint = models.OneToOneField(
        'Complaint',
        on_delete=models.CASCADE,
        related_name='solution'
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Solution for Complaint #{self.complaint.id}"
