import base64
import io

from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render
from magic_eye_util.magic_eye_decoder import decode_magic_eye
from magic_eye_util.magic_eye_generator import generate_magic_eye

from apps.main.models import Post


def magic_eye_view(request):
    return render(request, 'magic_eye/index.html')


def magic_eye_decode_page_view(request):
    return render(request, 'magic_eye/deconstruct.html')


def magic_eye_decode_view(request):
    try:
        file = request.FILES.get('input_image')
        if file is None:
            raise Exception("No file uploaded")
        magic_eye_img = Image.open(io.BytesIO(file.read()))
        decoded_img = decode_magic_eye(magic_eye_img)
        img_uri = f'data:image/jpeg;base64,{pillow_image_to_base64_string(decoded_img.convert("RGB"))}'
        return JsonResponse({'image_url': img_uri})
    except Exception as e:
        return JsonResponse({'error': f"Image failed to decode: {e}"})


def magic_eye_generate_page_view(request):
    return render(request, 'magic_eye/construct.html')


def magic_eye_generate_view(request):
    try:
        t_file = request.FILES.get('texture')
        d_file = request.FILES.get('depth_map')
        if t_file is None:
            raise Exception("No texture file uploaded")
        if d_file is None:
            raise Exception("No depth map file uploaded")

        t_img = Image.open(io.BytesIO(t_file.read()))
        d_img = Image.open(io.BytesIO(d_file.read()))
        magic_eye_img = generate_magic_eye(d_img, t_img, depth_factor=.3)
        img_uri = f'data:image/jpeg;base64,{pillow_image_to_base64_string(magic_eye_img.convert("RGB"))}'
        return JsonResponse({'image_url': img_uri})

    except Exception as e:
        return JsonResponse({'error': f"Image failed to generate: {e}"})


def pillow_image_to_base64_string(img):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


def magic_eye_about_view(request):
    return render(request, 'magic_eye/about.html')
