from django.contrib import admin
from .models import Post
import mistune
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import html


class HighlightRenderer(mistune.HTMLRenderer):
    def block_code(self, code, info=None):
        if info:
            lexer = get_lexer_by_name(info, stripall=True)
            formatter = html.HtmlFormatter()
            return highlight(code, lexer, formatter)
        return '<pre><code>' + mistune.escape(code) + '</code></pre>'


markdown = mistune.create_markdown(renderer=HighlightRenderer())


class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'status', 'content_type', 'created_on')
    list_filter = ("status", 'content_type')
    search_fields = ['title', 'raw_content']
    prepopulated_fields = {'slug': ('title',)}
    exclude = ('content',)

    def save_model(self, request, obj, form, change):
        obj.content = markdown(obj.raw_content)
        super().save_model(request, obj, form, change)


admin.site.register(Post, PostAdmin)
