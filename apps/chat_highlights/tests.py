from django.test import TestCase

from apps.chat_highlights.business_logic import detect_lols, preprocess


# Create your tests here.
def test1():
    lol_list = ["lmaoooo", "lmffaaaoooo", "lol", "lul", "lulw", "lolw"]
    assert all(detect_lols(l) for l in lol_list)


def test2():
    msg = 'PEACEFUL PROTEST:face-red-droopy-eyes::face-red-droopy-eyes::face-red-droopy-eyes:'
    preprocess(msg)
