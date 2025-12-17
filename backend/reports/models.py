from django.db import models
from users.models import MemberProfile
from books.models import BookModel

class Report(models.Model):
    Report_Types = [
        ("daily", "Daily Issue / Return"),
        ("monthly", "Monthly Activity"),
        ("popular_books", "Book Popularity"),
        ("active_members", "Active Members"),
    ]
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=50, choices=Report_Types)
    date = models.DateField(null=True, blank=True)
    month = models.PositiveSmallIntegerField(null=True, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    generated_by = models.ForeignKey(MemberProfile, on_delete=models.SET_NULL, null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(default=dict)
    expoted_csv = models.FileField(upload_to='reports/csv', null=True, blank=True)
    exported_pdf = models.FileField(upload_to='reports/pdf', null=True, blank=True)
    

    def __str__(self):
        return f"{self.title} - {self.report_type}"