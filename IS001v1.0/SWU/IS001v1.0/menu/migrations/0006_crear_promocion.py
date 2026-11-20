
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0005_clasificar_extras'),
    ]

    operations = [
        migrations.CreateModel(
            name='Promocion',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID'
                    )
                ),
                (
                    'nombre',
                    models.CharField(max_length=100)
                ),
                (
                    'descripcion',
                    models.TextField(blank=True)
                ),
                (
                    'activa',
                    models.BooleanField(default=False)
                ),
            ],
            options={
                'verbose_name': 'Promoción',
                'verbose_name_plural': 'Promociones',
            },
        ),
    ]