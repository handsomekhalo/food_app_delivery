from django.core.management.base import BaseCommand
from system_management.models import UserType

class Command(BaseCommand):
    """
    Management command to load predefined usertypes into the UserType model
    and optionally remove specific usertypes.

    Usage:
        python manage.py load_usertypes

    This command adds predefined usertypes to the UserType model if they do not already exist
    and deletes specified usertypes if they exist.
    """

    help = 'Loads predefined usertypes into the UserType model and removes specified usertypes'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to load usertypes...')

        # List of usertypes to load
        names = ['ADMIN', 'DRIVER', 'RESTAURANT_MANAGER', 'CUSTOMER']

        # Add or get usertypes
        for name in names:
            _, created = UserType.objects.get_or_create(name=name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Added new usertype: {name}'))
            else:
                self.stdout.write(f'Usertype already exists: {name}')

        # Remove specified usertypes
        usertypes_to_delete = ['RESTAURENT_ADMIN', 'RESTAURANT_MANAGER']
        deleted_count, _ = UserType.objects.filter(name__in=usertypes_to_delete).delete()

        if deleted_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted_count} usertype(s): {", ".join(usertypes_to_delete)}'))
        else:
            self.stdout.write('No specified usertypes were found to delete.')

        self.stdout.write(self.style.SUCCESS('Finished processing usertypes'))
        print("Usertype loading completed successfully.")
