
import json
from base.serializer import converter
from base.serializer import to_dict
from django.db.models import *
from django.db.models import fields
from ninja.renderers import BaseRenderer


# class ConcatSubquery(Subquery):
#     """ Concat multiple rows of a subquery with only one column in one cell.
#         Subquery must return only one column.
#     >>> store_produts = Product.objects.filter(
#                                             store=OuterRef('pk')
#                                         ).values('name')
#     >>> Store.objects.values('name').annotate(
#                                             products=ConcatSubquery(store_produts)
#                                         )
#     <StoreQuerySet [{'name': 'Dog World', 'products': ''}, {'name': 'AXÉ, Ropa Deportiva
#     ', 'products': 'Playera con abertura ojal'}, {'name': 'RH Cosmetiques', 'products':
#     'Diabecreme,Diabecreme,Diabecreme,Caída Cabello,Intensif,Smooth,Repairing'}...
#     """
#     template = 'ARRAY_TO_STRING(ARRAY(%(subquery)s), %(separator)s)'
#     output_field = fields.CharField()

#     def __init__(self, *args, separator=', ', **kwargs):
#         self.separator = separator
#         super().__init__(*args, separator, **kwargs)

#     def as_sql(self, compiler, connection, template=None, **extra_context):
#         extra_context['separator'] = '%s'
#         sql, sql_params = super().as_sql(compiler, connection, template, **extra_context)
#         sql_params = sql_params + (self.separator, )
#         return sql, sql_params


class Concat(Aggregate):
    function = 'GROUP_CONCAT'
    template = '%(function)s(%(distinct)s%(expressions)s)'

    def __init__(self, expression, distinct=False, **extra):
        super(Concat, self).__init__(
            expression,
            distinct=True if distinct else False,
            output_field=CharField(),
            **extra)

class MyRenderer(BaseRenderer):
    media_type = "application/json"

    def render(self, request, data, *, response_status):
        if data:
            if isinstance(data, dict):
                if data.get('type') == "paginated":
                    return json.dumps(data)
            # return json.dumps({
            #     "data": converter(data)
            # })
            return json.dumps(converter(data))
        else:
            return json.dumps([])
        
        

def qs_to_list(query_set):
    return list(map(lambda x: to_dict(x), query_set))