from django.db import models

# Create your models here.

class Tamaño(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Ingrediente(models.Model):
    nombre = models.CharField(max_length=100)
    disponibilidad = models.BooleanField(default=True)
    costo_extra = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    opcional = models.BooleanField(default=True)

    def __str__(self):
        return (f"{self.nombre}")

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    disponibilidad = models.BooleanField(default=True)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    foto_producto = models.ImageField(upload_to='productos/', blank=True, null='True')
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    ingredientes = models.ManyToManyField(Ingrediente)

    def __str__(self):
        return (f"{self.nombre}")

class VarianteProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name='variantes')
    tamaño = models.ForeignKey(Tamaño, on_delete=models.PROTECT)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    disponibilidad = models.BooleanField(default=True)

    def __str__(self):
        return (f"{self.producto.nombre} - {self.tamaño.nombre} ($ {self.precio})")
