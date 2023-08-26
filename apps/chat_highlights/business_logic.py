import re
from os.path import join, abspath, dirname, exists

import pandas as pd
from chat_downloader import ChatDownloader

CHAT_LOG_DIR = join(dirname(abspath(__file__)), 'static', 'chat_logs')
CAPITALIZED_WORDS_REGEX = re.compile(r'([A-Z]+)')


def parse_chat(output_path):
    def parse_emote_name(emote_data):
        if isinstance(emote_data, list):
            return set(e['name'] for e in emote_data)
        return emote_data

    def is_replying(message):
        return message.startswith('@')

    chat_logs = pd.read_json(output_path)
    chat_logs['emote_names'] = chat_logs['emotes'].apply(parse_emote_name)
    chat_logs['message_keywords'] = chat_logs['message'].apply(parse_keywords)
    chat_logs['is_replying'] = chat_logs['message'].apply(is_replying)
    return {}


def preprocess(message):
    message = message.replace('::', ': :')  # adds space between two consecutive emotes
    message = CAPITALIZED_WORDS_REGEX.sub(r'"\1":', message)
    return message


def parse_keywords(message):
    message = preprocess(message)
    return set(message.split())


def fetch_youtube_chat_logs(url):
    vid_id = url.split('.com/watch?v=')[-1].split('&')[0]
    output_path = join(CHAT_LOG_DIR, f'{vid_id}.json')
    if not exists(output_path):
        ChatDownloader().get_chat(url, output=output_path)
    return output_path


if __name__ == "__main__":
    # sample_url = 'https://www.youtube.com/watch?v=NrY0kCOc-zw&list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6&ab_channel=Destiny'
    # sample_output_path = fetch_youtube_chat_logs(sample_url)
    # highlight_data = parse_chat(sample_output_path)

    msg = 'PEACEFUL PROTEST:face-red-droopy-eyes::face-red-droopy-eyes::face-red-droopy-eyes:'
    preprocess(msg)
