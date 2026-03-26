from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from users.models import User
from customers.models import Customer
from common.models import Brand, Model, Location
from Eapp.models import Task, TaskActivity


class Command(BaseCommand):
    help = 'Seeds realistic-looking tasks for development/testing'

    def add_arguments(self, parser):
        parser.add_argument('--number', type=int, default=35, help='How many tasks to create')
        parser.add_argument('--specific-techs', action='store_true', help='Create 10 extra tasks for mwesiga and eliya')

    def handle(self, *args, **options):
        count = options['number']
        create_specific = options['specific_techs']
        
        self.stdout.write(f"Creating {count} tasks...")
        if create_specific:
            self.stdout.write(self.style.NOTICE("Also creating 10 tasks for technicians: mwesiga & eliya"))

        # Get or create some base data
        front_desk, _ = User.objects.get_or_create(
            username='tecla', defaults={'role': 'Front Desk', 'is_active': True}
        )
        manager, _ = User.objects.get_or_create(
            username='ivan', defaults={'role': 'Manager', 'is_active': True}
        )
        
        # Get or create specific technicians: mwesiga and eliya
        mwesiga, _ = User.objects.get_or_create(
            username='mwesiga',
            defaults={
                'role': 'Technician',
                'is_active': True,
                'first_name': 'Mwesiga',
                'email': 'mwesiga@company.com'
            }
        )
        eliya, _ = User.objects.get_or_create(
            username='eliya',
            defaults={
                'role': 'Technician',
                'is_active': True,
                'first_name': 'Eliya',
                'email': 'eliya@company.com'
            }
        )
        
        technicians = list(User.objects.filter(role='Technician')[:4])
        if not technicians:
            technicians = [
                User.objects.create_user(
                    username=f'tech{i}', password='123', role='Technician', is_active=True
                ) for i in range(1, 5)
            ]

        customers = list(Customer.objects.all()[:15])
        if not customers:
            self.stdout.write(self.style.WARNING("No customers found — creating 8 dummy ones"))
            customers = [
                Customer.objects.create(
                    name=f"Customer {i}",
                ) for i in range(101, 109)
            ]
            # Add phone numbers separately if using related model
            for idx, customer in enumerate(customers):
                customer.phone_numbers.create(phone_number=f"0777{101+idx:06d}")

        brands = list(Brand.objects.all()[:5]) or [Brand.objects.create(name=n) for n in ["hP", "dell", "Sumsang",]]
        models = list(Model.objects.all()[:8]) or [
            Model.objects.create(name=n, brand=random.choice(brands)) for n in [
                "EliteBook 840", "ThinkPad X1", "Inspiron 15", "VivoBook", "Aspire 5"
            ]
        ]
        locations = list(Location.objects.all()[:5]) or [
            Location.objects.get_or_create(name=n)[0] for n in ["mbezi", "dodoma"]
        ]

        statuses = [s[0] for s in Task.Status.choices]
        urgencies = [u[0] for u in Task.Urgency.choices]
        workshop_statuses = [w[0] for w in Task.WorkshopStatus.choices if w[0]]

        created = 0

        # Create regular random tasks
        for i in range(count):
            created_at = timezone.now() - timedelta(days=random.randint(1, 90))

            task = Task.objects.create(
                title=f"Repair {random.choice(['Screen', 'Battery', 'Keyboard', 'Motherboard', 'HDD/SSD', 'Charging Port', 'Fan', 'Overheating'])} - {i+1}",
                description=random.choice([
                    "Customer says laptop turns off after 10 minutes",
                    "No display - tried external monitor, same issue",
                    "Keyboard some keys not working",
                    "Slow performance + very hot",
                    "Battery drains very fast",
                    "Won't charge - port seems damaged",
                    None,
                ]),
                status=random.choice(statuses),
                urgency=random.choice(urgencies),
                device_type=random.choice(['Full', 'Not Full', 'Motherboard Only']),
                estimated_cost=Decimal(random.randint(25, 380) * 1000),
                total_cost=Decimal(random.randint(35, 520) * 1000),
                paid_amount=Decimal(random.randint(0, 450) * 1000),
                customer=random.choice(customers),
                brand=random.choice(brands),
                laptop_model=random.choice(models),
                current_location=random.choice(locations),
                created_by=front_desk,
                assigned_to=random.choice(technicians + [None]),
                created_at=created_at,
                date_in=created_at.date(),
                is_debt=random.random() < 0.18,
            )

            # Auto-update payment status (if your model has logic)
            task.update_payment_status()

            # Create 1–5 realistic activities
            self._create_task_activities(task, front_desk, manager, technicians, created_at, statuses)

            created += 1
            if created % 10 == 0:
                self.stdout.write(f" → {created} tasks created")

        # Create 10 specific tasks for mwesiga and eliya (5 each)
        if create_specific:
            self.stdout.write(self.style.SUCCESS("\nCreating 10 tasks for mwesiga and eliya..."))
            specific_technicians = [mwesiga, eliya]
            
            for idx, tech in enumerate(specific_technicians):
                for j in range(5):
                    task_num = idx * 5 + j + 1
                    created_at = timezone.now() - timedelta(days=random.randint(1, 60))

                    task = Task.objects.create(
                        title=f"Repair {random.choice(['Screen', 'Battery', 'Keyboard', 'Motherboard', 'HDD/SSD', 'Charging Port', 'Fan', 'Overheating'])} - {tech.username}-{task_num}",
                        description=random.choice([
                            "Customer says laptop turns off after 10 minutes",
                            "No display - tried external monitor, same issue",
                            "Keyboard some keys not working",
                            "Slow performance + very hot",
                            "Battery drains very fast",
                            "Won't charge - port seems damaged",
                            "Water damage - needs thorough cleaning",
                            "Blue screen errors frequently",
                        ]),
                        status=random.choice(statuses),
                        urgency=random.choice(urgencies),
                        device_type=random.choice(['Full', 'Not Full', 'Motherboard Only']),
                        estimated_cost=Decimal(random.randint(25, 380) * 1000),
                        total_cost=Decimal(random.randint(35, 520) * 1000),
                        paid_amount=Decimal(random.randint(0, 450) * 1000),
                        customer=random.choice(customers),
                        brand=random.choice(brands),
                        laptop_model=random.choice(models),
                        current_location=random.choice(locations),
                        created_by=front_desk,
                        assigned_to=tech,  # Specifically assigned to mwesiga or eliya
                        created_at=created_at,
                        date_in=created_at.date(),
                        is_debt=random.random() < 0.18,
                    )

                    task.update_payment_status()

                    # Create activities for these specific tasks
                    self._create_task_activities(task, front_desk, manager, technicians, created_at, statuses, specific_tech=tech)

                    created += 1
                    self.stdout.write(f" → Created task for {tech.username}: {task.title}")

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully created {created} tasks total"))

    def _create_task_activities(self, task, front_desk, manager, technicians, created_at, statuses, specific_tech=None):
        """Helper method to create realistic task activities"""
        
        # Intake / creation
        TaskActivity.objects.create(
            task=task,
            user=front_desk,
            type='intake',
            message="Task created at front desk",
            timestamp=created_at,
        )

        if task.assigned_to:
            TaskActivity.objects.create(
                task=task,
                user=manager if random.random() < 0.4 else front_desk,
                type='assignment',
                message=f"Assigned to {task.assigned_to.get_full_name() or task.assigned_to.username}",
                timestamp=created_at + timedelta(minutes=random.randint(5, 120)),
                details={"new_technician_id": task.assigned_to.id}
            )

        # Random extra activities
        extra_activities = random.randint(0, 4)
        current_time = created_at
        for _ in range(extra_activities):
            current_time += timedelta(minutes=random.randint(30, 300))
            act_type = random.choice([
                'diagnosis', 'note', 'customer_contact', 'workshop', 'status_update'
            ])
            msg = {
                'diagnosis': "Replaced thermal paste + cleaned fans",
                'note': "Customer requested faster service",
                'customer_contact': "Called customer - approved extra cost",
                'workshop': "Sent to workshop A for advanced diagnostics",
                'status_update': f"Status changed to {random.choice(statuses)}",
            }[act_type]

            TaskActivity.objects.create(
                task=task,
                user=random.choice(technicians + [manager, front_desk]),
                type=act_type,
                message=msg,
                timestamp=current_time,
            )