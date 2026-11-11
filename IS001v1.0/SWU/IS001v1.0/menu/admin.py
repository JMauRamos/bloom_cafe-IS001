from django.contrib import admin
from .models import Categoria, Ingrediente, Producto, Tamaño, VarianteProducto

# Register your models here.

class VarianteInline(admin.TabularInline):
    model = VarianteProducto
    extra = 1

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)

@admin.register(Tamaño)
class TamañoAdmin(admin.ModelAdmin):
    list_display = ('nombre',)

@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'costo_extra', 'opcional', 'disponibilidad')
    list_filter = ('opcional', 'disponibilidad')
    search_fields = ('nombre',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'categoria', 'disponibilidad')
    inlines = [VarianteInline]
    list_filter = ('categoria', 'disponibilidad')
    search_fields = ('nombre',)