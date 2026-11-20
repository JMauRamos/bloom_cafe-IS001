from django.contrib import admin
from .models import Categoria, Ingrediente, Extra, Producto, Tamaño, VarianteProducto, Promocion
from django.urls import reverse
from django.utils.html import format_html, format_html_join

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
    list_display = ('nombre', 'disponibilidad')
    list_filter = ('disponibilidad',)
    search_fields = ('nombre',)
    list_editable = ('disponibilidad',)
    exclude = ('es_extra',)
    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            es_extra=False
        )
    def save_model(self, request, obj, form, change):
        obj.es_extra = False
        super().save_model(request, obj, form, change)

@admin.register(Extra)
class ExtraAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'costo_extra', 'disponibilidad')
    list_filter = ('disponibilidad',)
    search_fields = ('nombre',)
    list_editable = ('disponibilidad',)
    exclude = ('es_extra',)
    def get_queryset(self, request):
        return super().get_queryset(request).filter(
            es_extra=True
        )
    def save_model(self, request, obj, form, change):
        obj.es_extra = True
        super().save_model(request, obj, form, change)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'categoria', 'disponibilidad')
    inlines = [VarianteInline]
    list_filter = ('categoria', 'disponibilidad')
    search_fields = ('nombre',)

    # Organizar la edición del producto en secciones
    fieldsets = (
        ('Datos del producto', {
            'fields': (
                'nombre', 'descripcion', 'precio',
                'foto_producto', 'categoria', 'disponibilidad'
            )
        }),
        ('Ingredientes de la receta', {
            'fields': ('ingredientes',)
        }),
        ('Extras / Upgrades (generales)', {
            'fields': ('lista_extras',),
            'description': 'Estos extras están disponibles para todos los productos. Se administran desde Extras / Upgrades.'
        }),
    )

    readonly_fields = ('lista_extras',)

    # Mostrar solo ingredientes normales en la receta
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == 'ingredientes':
            kwargs['queryset'] = Ingrediente.objects.filter(es_extra=False)

        return super().formfield_for_manytomany(
            db_field, request, **kwargs
        )
    @admin.display(description='Lista de Extras / Upgrades')
    def lista_extras(self, obj):
        extras = Ingrediente.objects.filter(
            es_extra=True
        ).order_by('nombre')

        if not extras.exists():
            return 'No hay extras registrados'

        lista_html = format_html_join(
            '',
            '<div style="padding: 6px 4px;">'
            '<a href="{}">{}</a> — {}'
            '</div>',
            (
                (
                    reverse('admin:menu_extra_change', args=[extra.id]),
                    extra.nombre,
                    'Disponible' if extra.disponibilidad else 'Agotado'
                )
                for extra in extras
            )
        )

        return format_html(
            '<div style="'
            'width: 250px;'
            'height: 170px;'
            'overflow-y: auto;'
            'border: 1px solid var(--border-color);'
            'border-radius: 4px;'
            'padding: 5px;'
            'background: var(--body-bg);'
            'box-sizing: border-box;'
            '">{}</div>',
            lista_html
        )

    
@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activa')
    list_filter = ('activa',)
    search_fields = ('nombre',)
    list_editable = ('activa',)
    fields = ('nombre', 'descripcion', 'activa')
