from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    Registrationview,
    UserComplaintRetrieveUpdateDestroyAPIView,
    AdminComplaintRetrieveUpdateDestroyAPIView,
    SolutionCreateAPIView,
    SolutionRetrieveUpdateDestroyAPIView,
    LoginView,
    ComplaintDetectView,
    ApprovedEmployeeCreateView,
    ForgetPassword,
    ResetPassword,
    VerifyOTP,
    AdminComplaintListView,
    UserComplaintListCreateView,
    DeleteComplaintView,
    #find_technician,
    #nearby_shops
)
from . import views


urlpatterns = [
    path("api/register/", Registrationview.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api/admin/complaints/", AdminComplaintListView.as_view(), name="admin-complaint-list"),
    path("api/admin/complaints/<int:pk>/", AdminComplaintRetrieveUpdateDestroyAPIView.as_view(), name="admin-complaint-detail"),
    path("api/user/complaints/", UserComplaintListCreateView.as_view(), name="user-complaint-list-create"),
    path("api/user/complaints/<int:pk>/", UserComplaintRetrieveUpdateDestroyAPIView.as_view(), name="user-complaint-detail"),
    path("api/solutions/", SolutionCreateAPIView.as_view(), name="solution-create"),
    path("api/solutions/<int:pk>/", SolutionRetrieveUpdateDestroyAPIView.as_view(), name="solution-detail"),
    path("api/detect/", ComplaintDetectView.as_view(), name="complaint-detect"),
    path("api/approved-employees/", ApprovedEmployeeCreateView.as_view(), name="approved-employees"),
    path("api/forgot-password/", ForgetPassword.as_view(), name="forgot-password"),
    path("api/verify-otp/", VerifyOTP.as_view(), name="verify-otp"), 
    path("api/reset-password/", ResetPassword.as_view(), name="reset-password"),
    path('api/delete/<int:complaint_id>/', DeleteComplaintView.as_view(), name='delete-complaint'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)