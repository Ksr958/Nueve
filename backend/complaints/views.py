from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from backend.authentication import CookieJWTAuthentication
from utils.emails import send_complaint_email
from yolo_service import detect_issue

from .groq_solution import generate_solution
from .models import Approvedemployee, Complaint, Solution, User
from .permissions import IsAdmin, IsUser
from .serializer import (
    ApprovedEmployeeSerializer,
    Complaintserializer,
    Loginserializer,
    Registrationserializer,
    Solutionserializer,
)

import logging
import os
import secrets
import tempfile


logger = logging.getLogger(__name__)


class ApprovedEmployeeCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        employees = Approvedemployee.objects.all()
        serializer = ApprovedEmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ApprovedEmployeeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)


class Registrationview(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Registrationserializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "User registered successfully"}, status=201)


class LoginView(TokenObtainPairView):
    serializer_class = Loginserializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        response_data = {
            "message": "Login successful",
            "is_admin": response.data.get("is_admin"),
            "username": response.data.get("username"),
        }

        res = Response(response_data)

        res.set_cookie(
            key="accessToken",
            value=response.data.get("access"),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )
        res.set_cookie(
            key="refreshToken",
            value=response.data.get("refresh"),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
        )
        return res


class SessionView(APIView):
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        return Response(
            {
                "username": request.user.username,
                "is_admin": request.user.is_staff,
            }
        )


class LogoutView(APIView):
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("accessToken", samesite="Lax")
        response.delete_cookie("refreshToken", samesite="Lax")
        return response


class AdminComplaintListView(generics.ListAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]
    serializer_class = Complaintserializer
    queryset = Complaint.objects.all().order_by("-created_at")


class AdminComplaintRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = Complaintserializer
    permission_classes = [IsAdmin]
    queryset = Complaint.objects.all()

    def perform_update(self, serializer):
        complaint = self.get_object()
        old_status = complaint.status
        new_status = self.request.data.get("status", old_status)

        final_statuses = ["resolved", "rejected"]
        if old_status in final_statuses:
            raise PermissionDenied(f"Finalized: {old_status}")

        valid_transitions = {
            "submitted": ["verified", "resolved", "rejected"],
            "verified": ["resolved", "rejected"],
        }

        if new_status not in valid_transitions.get(old_status, []):
            raise PermissionDenied(f"Invalid transition {old_status} -> {new_status}")

        solution_text = None
        if new_status == "resolved":
            solution_text = self.request.data.get("solution")
            if not solution_text:
                raise ValidationError({"solution": "Solution required"})

            Solution.objects.update_or_create(
                complaint=complaint,
                defaults={"description": solution_text},
            )

        updated = serializer.save()

        if old_status != new_status:
            updated.status_updated_at = timezone.now()
            updated.save(update_fields=["status_updated_at"])

        send_complaint_email(
            user_email=updated.user.email,
            user_name=updated.user.username,
            complaint=updated,
            status=new_status,
            solution=solution_text,
        )

    def perform_destroy(self, instance):
        instance.delete()


class UserComplaintListCreateView(generics.ListCreateAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsUser]
    serializer_class = Complaintserializer

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Complaint.objects.none()
        return Complaint.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.is_staff:
            raise PermissionDenied("Admins cannot create complaints")

        photo = request.FILES.get("photo")
        if not photo:
            return Response({"error": "Image is required"}, status=400)

        ext = os.path.splitext(photo.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp:
            temp.write(photo.read())
            temp_path = temp.name

        try:
            result = detect_issue(temp_path)
            category = result.get("category")
            confidence = result.get("confidence")
        except Exception:
            logger.error("YOLO detection failed", exc_info=True)
            category = None
            confidence = None
        finally:
            os.remove(temp_path)

        photo.seek(0)

        try:
            ai_solution = generate_solution(
                request.data.get("title"),
                request.data.get("description"),
                request.data.get("category"),
            )
        except Exception:
            logger.error("AI generation failed", exc_info=True)
            ai_solution = "Basic troubleshooting steps."

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        complaint = serializer.save(
            user=request.user,
            category=category,
            confidence_score=confidence,
            ai_recommended_solution=ai_solution,
            status_updated_at=timezone.now(),
            photo=photo,
        )

        try:
            send_complaint_email(
                user_email=request.user.email,
                user_name=request.user.username,
                complaint=complaint,
                status="submitted",
            )
        except Exception:
            logger.error("Email sending failed", exc_info=True)

        return Response(
            {
                "message": "Complaint submitted successfully",
                "complaint_id": complaint.id,
                "ai_solution": ai_solution,
                "photo": complaint.photo.url if hasattr(complaint.photo, "url") else None,
            },
            status=201,
        )


class UserComplaintRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = Complaintserializer
    permission_classes = [IsUser]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Complaint.objects.none()
        return Complaint.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        complaint = self.get_object()

        if complaint.status in ["resolved", "rejected"]:
            raise PermissionDenied("Complaint finalized")

        if "status" in self.request.data:
            raise PermissionDenied("You cannot change status")

        if "solution" in self.request.data:
            raise PermissionDenied("You cannot provide solution")

        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != "submitted":
            raise PermissionDenied("Cannot delete after processing")
        instance.delete()


class SolutionCreateAPIView(generics.CreateAPIView):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = Solutionserializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        if not serializer.validated_data.get("description"):
            raise ValidationError("Solution required")
        serializer.save()


class SolutionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [CookieJWTAuthentication]
    queryset = Solution.objects.all()
    serializer_class = Solutionserializer
    permission_classes = [IsAdmin]


class ComplaintDetectView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    parser_classes = [MultiPartParser]
    permission_classes = [IsUser]

    def post(self, request):
        image = request.FILES.get("photo")
        if not image:
            return Response({"error": "Image is required"}, status=400)

        ext = os.path.splitext(image.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp:
            for chunk in image.chunks():
                temp.write(chunk)
            temp_path = temp.name

        try:
            result = detect_issue(temp_path)
        except Exception:
            logger.error("Detection failed", exc_info=True)
            return Response({"error": "Detection failed"}, status=500)
        finally:
            os.remove(temp_path)

        return Response(
            {
                "category": result["category"],
                "confidence": result["confidence"],
            }
        )


class ForgetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        otp = str(secrets.randbelow(900000) + 100000)
        user.otp = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=5)
        user.save()

        try:
            send_mail(
                "OTP",
                f"Your OTP is {otp}",
                settings.EMAIL_HOST_USER,
                [email],
            )
        except Exception:
            logger.error("OTP email failed", exc_info=True)

        return Response({"message": "OTP sent"})


class VerifyOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        if user.otp_expiry < timezone.now():
            return Response({"error": "OTP expired"}, status=400)

        user.otp_verified = True
        user.save()
        return Response({"message": "OTP verified"})


class ResetPassword(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        if not email or not new_password:
            return Response({"error": "Email and password required"}, status=400)

        if len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters"}, status=400)

        try:
            user = User.objects.get(email=email, otp_verified=True)
        except User.DoesNotExist:
            return Response({"error": "OTP verification required"}, status=400)

        if user.otp_expiry and user.otp_expiry < timezone.now():
            return Response({"error": "OTP expired"}, status=400)

        user.password = make_password(new_password)
        user.otp_verified = False
        user.otp = None
        user.otp_expiry = None
        user.save()
        return Response({"message": "Password reset successful"})


class DeleteComplaintView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsUser]

    def delete(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(id=complaint_id, user=request.user)
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not found or not yours."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if complaint.status != "submitted":
            return Response(
                {"error": "Cannot delete complaint after verification."},
                status=status.HTTP_403_FORBIDDEN,
            )

        complaint.delete()
        return Response({"message": "Complaint deleted successfully."}, status=status.HTTP_200_OK)
