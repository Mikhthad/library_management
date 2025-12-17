from datetime import date
from django.shortcuts import get_object_or_404
import csv
from django.db.models import Count
from django.utils.timezone import now
from django.http import HttpResponse
from rest_framework.decorators import api_view,authentication_classes,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permission import IsAdminOrLibrarian
from users.auth import CsrfExemptSessionAuthentication
from users.models import MemberProfile
from books.models import BookModel
from transactions.models import Transaction
from .models import Report
from .serializer import ReportSerializer

def save_report(title, report_type, user, data):
    report = Report.objects.create(
        title = title,
        report_type = report_type,
        date = now().date(),
        month = now().month,
        year = now().year,
        generated_by = user,
        data = data
    )
    return report

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def dialy_report(request):
    today = date.today()
    issues = Transaction.objects.filter(issue_date__date = today).count()
    returns = Transaction.objects.filter(return_date = today).count()

    data = {
        "date":str(today),  
        "total_issued" : issues,
        "total_returned" : returns,
    }

    report = save_report("Daily Issue & Return Report", "daily",request.user.memberprofile, data)
    return Response(ReportSerializer(report).data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def monthly_report(request):
    today = now()
    transactions = Transaction.objects.filter(
        issue_date__year = today.year,
        issue_date__month = today.month 
    ).count()

    data = {
        "month" : today.month,
        "year" : today.year,
        "total_transactions" : transactions
    }

    report = save_report("Monthly active report","monthly",request.user.memberprofile, data)
    return Response(ReportSerializer(report).data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def book_popularity_report(request):
    popular_books = (
        Transaction.objects
        .values("book_copy__book__title")
        .annotate(total = Count("id"))
        .order_by('-total')
    )

    data = list(popular_books)
    report = save_report("Book popularity report", "book_popularity", request.user.memberprofile, data)
    return Response(ReportSerializer(report).data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def active_member_report(request):
    active_members = (
        Transaction.objects
        .values("member__user__username")
        .annotate(total = Count("id"))
        .order_by("-total")
    )
    data = list(active_members)
    report = save_report("Most active members report", "active_members", request.user.memberprofile, data)
    return Response(ReportSerializer(report).data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def list_reports(request):
    reports = Report.objects.all().order_by("-generated_at")
    serializer = ReportSerializer(reports, many = True)
    return Response(serializer.data, status=200)

@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def export_csv(request, id):
    report = get_object_or_404(Report, id = id)

    response = HttpResponse(content_type = "text/csv")
    response['Content-Disposition'] = f'attachement; filename = "{report.title}.csv"'

    writer = csv.writer(response)
    writer.writerow(["Report Title", report.title])
    writer.writerow(["Generated At", report.generated_at])
    writer.writerow([])

    if isinstance(report.data, list) and len(report.data)>0:
        keys = report.data[0].keys()
        writer.writerow(keys)

        for row in report.data:
            writer.writerow(row.values())
    else:
        for key, value in report.data.items():
            writer.writerow([key, value])
    return response

@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated, IsAdminOrLibrarian])
def delete_report(request, id):
    report = get_object_or_404(Report, id=id)
    report.delete()
    return Response({"detail": "Report deleted successfully"}, status=200)