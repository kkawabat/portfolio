from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.http import JsonResponse
from django.test import RequestFactory, TestCase

from portfolio.hardening import assert_cloud_run_safe, client_ip, limit_body, ratelimit


@ratelimit('2/m')
def _ping(request):
    return JsonResponse({'ok': True})


class CloudRunSafetyTests(TestCase):
    def test_rejects_debug_on_cloud_run(self):
        with self.assertRaises(ImproperlyConfigured):
            assert_cloud_run_safe(
                {'K_SERVICE': 'portfolio', 'DJANGO_SECRET_KEY': 'real-secret'},
                debug=True,
                secret_key='real-secret',
            )

    def test_rejects_fallback_secret_on_cloud_run(self):
        with self.assertRaises(ImproperlyConfigured):
            assert_cloud_run_safe(
                {'K_SERVICE': 'portfolio'},
                debug=False,
                secret_key='django-insecure-c^$=z@s8rfzi^b=$2_^t&bn%1%+#*m9g^zys&_*=&zk8#%g4wq',
            )

    def test_local_dev_may_use_debug_and_fallback_key(self):
        assert_cloud_run_safe({}, debug=True, secret_key='django-insecure-dev')


class RateLimitTests(TestCase):
    def setUp(self):
        cache.clear()
        self.factory = RequestFactory()

    def test_third_hit_from_the_same_ip_is_429(self):
        request = self.factory.post('/')
        self.assertEqual(_ping(request).status_code, 200)
        self.assertEqual(_ping(request).status_code, 200)
        blocked = _ping(request)
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked['Retry-After'], '60')

    def test_a_different_ip_has_its_own_quota(self):
        a = self.factory.post('/', HTTP_X_FORWARDED_FOR='1.1.1.1, 9.9.9.9')
        b = self.factory.post('/', HTTP_X_FORWARDED_FOR='2.2.2.2, 8.8.8.8')
        self.assertEqual(_ping(a).status_code, 200)
        self.assertEqual(_ping(a).status_code, 200)
        self.assertEqual(_ping(a).status_code, 429)
        self.assertEqual(_ping(b).status_code, 200)

    def test_client_ip_uses_the_last_forwarded_hop(self):
        request = self.factory.post('/', HTTP_X_FORWARDED_FOR='1.1.1.1, 9.9.9.9')
        self.assertEqual(client_ip(request), '9.9.9.9')

    def test_oversize_body_is_413_before_the_view_runs(self):
        ran = {'hit': False}

        @limit_body(8)
        def tiny(request):
            ran['hit'] = True
            return JsonResponse({'ok': True})

        request = self.factory.post('/', data='abcdefghijklmnop', content_type='text/plain')
        response = tiny(request)
        self.assertEqual(response.status_code, 413)
        self.assertFalse(ran['hit'])


class PublicSurfaceTests(TestCase):
    def test_admin_is_not_mounted_when_debug_is_off(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 404)
