from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('profile/upload-picture/', views.upload_profile_picture, name='upload-profile-picture'),
    path('users/', views.list_users, name='user-list'),
    path('users/<int:user_id>/', views.get_user_detail, name='user-detail'),
    path('users/<int:user_id>/update/', views.update_user, name='user-update'),
    path('users/<int:user_id>/delete/', views.delete_user, name='user-delete'),
    path('users/<int:user_id>/deactivate/', views.deactivate_user, name='user-deactivate'),
    path('users/<int:user_id>/activate/', views.activate_user, name='user-activate'),
    path('users/role/<str:role>/', views.list_users_by_role, name='users-by-role'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', views.change_password, name='change-password'),
    # Task URLs
    path('tasks/', views.task_list_create, name='task-list-create'),
    path('tasks/<int:task_id>/', views.task_detail, name='task-detail'),
    path('tasks/<int:task_id>/delete/', views.delete_task, name='task-delete'),
    path('tasks/<int:task_id>/activities/', views.task_activities, name='task-activities'),
    path('tasks/<int:task_id>/activities/add/', views.add_task_activity, name='add-task-activity'),
    path('tasks/<int:task_id>/payments/', views.task_payments, name='task-payments'),
    path('tasks/<int:task_id>/payments/add/', views.add_task_payment, name='add-task-payment'),
    path('tasks/<int:task_id>/send-update/', views.send_customer_update, name='send-customer-update'),
    path('technicians/', views.list_technicians, name='technicians-list'),

    # Collaboration Request URLs
    path('tasks/<int:task_id>/collaboration-requests/', views.create_collaboration_request, name='create-collaboration-request'),
    path('collaboration-requests/', views.list_collaboration_requests, name='list-collaboration-requests'),
    path('collaboration-requests/<int:request_id>/', views.collaboration_request_detail, name='collaboration-request-detail'),
 ]