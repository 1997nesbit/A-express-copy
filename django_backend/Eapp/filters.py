import django_filters
from .models import Task, Payment
from django.utils import timezone

class TaskFilter(django_filters.FilterSet):
    created_at = django_filters.DateFromToRangeFilter()
    updated_at = django_filters.DateFromToRangeFilter()
    status = django_filters.CharFilter(method='filter_status')

    class Meta:
        model = Task
        fields = {
            'assigned_to': ['exact'],
            'customer': ['exact'],
            'created_by': ['exact'],
            'is_debt': ['exact'],
        }

    def filter_status(self, queryset, name, value):
        statuses = value.split(',')
        return queryset.filter(status__in=statuses)


class PaymentFilter(django_filters.FilterSet):
    task__title = django_filters.CharFilter(lookup_expr='icontains')
    method_name = django_filters.CharFilter(field_name='method__name', lookup_expr='iexact')
    category = django_filters.CharFilter(field_name='category__name', lookup_expr='iexact')
    is_refunded = django_filters.BooleanFilter(method='filter_refunded')
    date = django_filters.DateFilter(field_name='date', lookup_expr='exact', initial=timezone.now().date())

    class Meta:
        model = Payment
        fields = ['task__title', 'method_name', 'is_refunded', 'date', 'category']

    def filter_refunded(self, queryset, name, value):
        if value:
            return queryset.filter(amount__lt=0)
        return queryset
