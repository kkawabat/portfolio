import base64

from django.http import JsonResponse
from django.shortcuts import render


def magic_eye_view(request):
    return render(request, 'magic_eye.html')


def magic_eye_decode_view(request):
    file = request.FILES.get('input_image')
    if file is not None:
        imgblob = base64.b64encode(file.read()).decode('utf-8')
        img_uri = f'data:image/png;base64,{imgblob}'
        return JsonResponse({'image_url': img_uri})
    else:
        return JsonResponse({'image_url': None})


def magic_eye_generate_view(request):
    t_file = request.FILES.get('texture')
    d_file = request.FILES.get('depth_map')
    if t_file is not None:
        imgblob = base64.b64encode(t_file.read()).decode('utf-8')
        img_uri = f'data:image/png;base64,{imgblob}'
        return JsonResponse({'image_url': img_uri})
    else:
        return JsonResponse({'image_url': None})

