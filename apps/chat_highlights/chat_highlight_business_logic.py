from os.path import join, abspath, dirname, exists

import pandas as pd
from chat_downloader import ChatDownloader

CHAT_LOG_DIR = join(dirname(abspath(__file__)), 'static', 'chat_logs')


def parse_chat(output_path):
    chat_logs = pd.read_json(output_path)
    return {}


def fetch_youtube_chat_logs(url):
    vid_id = url.split('.com/watch?v=')[-1].split('&')[0]
    output_path = join(CHAT_LOG_DIR, f'{vid_id}.json')
    if not exists(output_path):
        ChatDownloader().get_chat(url, output=output_path)
    return output_path


if __name__ == "__main__":
    sample_url = 'https://www.youtube.com/watch?v=NrY0kCOc-zw&list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6&ab_channel=Destiny'
    sample_output_path = fetch_youtube_chat_logs(sample_url)
    highlight_data = parse_chat(sample_output_path)
