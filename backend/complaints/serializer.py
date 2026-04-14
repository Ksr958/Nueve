from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Approvedemployee,Complaint,Solution
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from PIL import Image
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.models import update_last_login
User=get_user_model()
class ApprovedEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approvedemployee
        fields = ["email", "employee_id"]

    def validate(self, data):
        email = data.get("email")
        employee_id = data.get("employee_id")

        # 1. Validate email format
        try:
            validate_email(email)
        except ValidationError:
            raise serializers.ValidationError({"email": "Enter a valid email address."})

        # 2. Check if email already exists
        if Approvedemployee.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Employee with this email already exists."})

        # 3. Check if employee_id already exists
        if Approvedemployee.objects.filter(employee_id=employee_id).exists():
            raise serializers.ValidationError({"employee_id": "This employee ID already exists."})

        # 4. Email and employee_id should not be the same
        if email == employee_id:
            raise serializers.ValidationError({"error": "Email and Employee ID cannot be the same."})

        # 5. Employee ID should not be an email
        try:
            validate_email(employee_id)
            raise serializers.ValidationError({"employee_id": "Employee ID cannot be an email."})
        except ValidationError:
            pass  # employee_id is valid (not an email)

        return data   
class Registrationserializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["username",'email','password']
    def validate(self, data):
        email=data.get('email')
        username=data.get('username')
        password=data.get('password')
        try:
            validate_email(email)
            employee=Approvedemployee.objects.get(email=email)
        except Approvedemployee.DoesNotExist:
            raise serializers.ValidationError("Employee does not exist")
        if employee.is_registered:
            raise serializers.ValidationError("User Already Registered")
        if username == email:
            raise serializers.ValidationError("Username cannot be the same as email")

        if password == username:
            raise serializers.ValidationError("Password cannot be same as username")

        if password == email:
            raise serializers.ValidationError("Password cannot be same as email")
        if len(password)<4:
            raise serializers.ValidationError("Minimum length of Password is 4")
        return data
    def create(self,validated_data):
        email = validated_data.get('email')

        with transaction.atomic():
            approved = Approvedemployee.objects.select_for_update().get(email=email)

            if approved.is_registered:
                raise serializers.ValidationError("This email is already registered.")

            user = User.objects.create_user(**validated_data)

            approved.is_registered = True
            approved.save()
        return user
class Loginserializer(TokenObtainPairSerializer):
    def validate(self,attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        # Try to find user by email
        user = User.objects.filter(email=username_or_email).first()

        # If not found by email, try username
        if user is None:
            user = User.objects.filter(username=username_or_email).first()

        if user is None:
            raise serializers.ValidationError("Invalid username/email or password")

        # Authenticate using username (Django auth needs username)
        authenticated_user = authenticate(
            username=user.username,
            password=password
        )

        if authenticated_user is None:
            raise serializers.ValidationError("Invalid username/email or password")
        update_last_login(None, authenticated_user)
        refresh = self.get_token(authenticated_user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "is_admin":user.is_staff,
            "username":user.username
        }


class Complaintserializer(serializers.ModelSerializer):
    photo = serializers.ImageField(required=False)
    user = serializers.SerializerMethodField()
    solution = serializers.SerializerMethodField()
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['user']
    def validate(self, data):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        self._check_final_status()

        if user and not user.is_staff:
            return self._validate_user(data)

        return self._validate_admin(data)
    def _check_final_status(self):
        FINAL_STATUSES = ["resolved", "rejected"]

        if self.instance and self.instance.status in FINAL_STATUSES:
            raise serializers.ValidationError(
                f"This complaint is already finalized: {self.instance.status}"
            )
    def _validate_user(self, data):
        if "status" in data:
            raise serializers.ValidationError("You cannot change status")

        if "rejection_reason" in data:
            raise serializers.ValidationError("You cannot set rejection reason")

        if "solution" in data:
            raise serializers.ValidationError("You cannot set Provide Solution")

        return data
    def _validate_admin(self, data):
        status = data.get("status", getattr(self.instance, "status", None))
        rejection_reason = data.get(
            "rejection_reason",
            getattr(self.instance, "rejection_reason", None)
        )

        VALID_TRANSITIONS = {
            "submitted": ["verified", "resolved", "rejected"],
            "verified": ["resolved", "rejected"],
        }

        if self.instance:
            old_status = self.instance.status

            if status not in VALID_TRANSITIONS.get(old_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from '{old_status}' to '{status}'"
                )

        if status == "rejected" and not rejection_reason:
            raise serializers.ValidationError({
                "rejection_reason": "Required when rejected."
            })

        return data
    def validate_photo(self, value):
        try:
            img = Image.open(value)
            img.verify()
        except Exception:
            raise serializers.ValidationError(
                "Upload a valid image. The file you uploaded was either not an image or a corrupted image."
            )
        return value

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username
        }
    def get_solution(self, obj):
        if hasattr(obj, 'solution'):
            return {
                "description": obj.solution.description,
                "created_at": obj.solution.created_at
            }
        return None
    def get_photo(self, obj):
        if obj.photo:  # check if photo exists
            return obj.photo.url  # or your Cloudinary URL field
        return None
class Solutionserializer(serializers.ModelSerializer):
    class Meta:
        model=Solution
        fields='__all__'  
  
