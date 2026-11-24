from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pedidos', '0006_pedido_empleado_preparacion'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='fecha_registro',
            field=models.DateTimeField(auto_now_add=True, blank=True, null=True, verbose_name='Fecha de registro'),
        ),
    ]
