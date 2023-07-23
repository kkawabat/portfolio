import base64
import io

from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render
from magic_eye_util.magic_eye_decoder import decode_magic_eye
from magic_eye_util.magic_eye_generator import generate_magic_eye

from main.models import Post


def magic_eye_view(request):
    magic_eye_proj = Post.objects.get(slug="magic-eye-generator")
    return render(request, 'magic_eye.html', context={"post": magic_eye_proj})


def magic_eye_decode_view(request):
    file = request.FILES.get('input_image')
    if file is not None:
        magic_eye_img = Image.open(io.BytesIO(file.read()))
        decoded_img = decode_magic_eye(magic_eye_img)
        img_uri = f'data:image/png;base64,{pillow_image_to_base64_string(decoded_img)}'
        return JsonResponse({'image_url': img_uri})
    else:
        return JsonResponse({'image_url': None})


def magic_eye_generate_view(request):
    t_file = request.FILES.get('texture')
    d_file = request.FILES.get('depth_map')
    if t_file is not None and d_file is not None:
        t_img = Image.open(io.BytesIO(t_file.read()))
        d_img = Image.open(io.BytesIO(d_file.read()))
        magic_eye_img = generate_magic_eye(d_img, t_img)
        img_uri = f'data:image/png;base64,{pillow_image_to_base64_string(magic_eye_img)}'
        return JsonResponse({'image_url': img_uri})
    else:
        return JsonResponse({'image_url': None})


def pillow_image_to_base64_string(img):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")
