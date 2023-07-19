from django.db import models
from django.urls import reverse
from django.utils.crypto import get_random_string
from django.utils.text import slugify

STATUS = (
    (0, "Draft"),
    (1, "Public"),
    (2, "Private")
)

TYPE = (
    (0, "blog"),
    (1, "project")
)


def generate_id():
    return get_random_string(6)


class Post(models.Model):
    id = models.CharField(primary_key=True, unique=True, max_length=6, default=generate_id)
    title = models.CharField(max_length=200, unique=True,)
    slug = models.SlugField(unique=True, max_length=200)
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)
    raw_content = models.TextField()
    content = models.TextField(blank=True, null=True)
    content_type = models.IntegerField(choices=TYPE)
    status = models.IntegerField(choices=STATUS)
    objects = models.Manager()

    class Meta:
        ordering = ['-created_on']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('post', kwargs={'slug': self.slug, 'pk': self.id})
