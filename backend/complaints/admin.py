from django.contrib import admin
from .models import User,Approvedemployee,Complaint#DeletedComplaint
admin.site.register(User)
admin.site.register(Approvedemployee)
admin.site.register(Complaint)
