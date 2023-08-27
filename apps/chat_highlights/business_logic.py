import re
from collections import Counter
from datetime import timedelta
from os.path import join, abspath, dirname, exists

import pandas as pd
from chat_downloader import ChatDownloader
import matplotlib.pyplot as plt

CHAT_LOG_DIR = join(dirname(abspath(__file__)), 'static', 'chat_logs')
CAPITALIZED_WORDS_REGEX = re.compile(r'\b([A-Z]{2,}(?:[-\'][A-Z]+)+|[A-Z]{2,})\b')
PUNCTUATION_SUFFIX_REGEX = re.compile(r"\b[!?.]+")
LOL_REGEX = re.compile(r'(l+m+(?:f+)?a+o+)|(l+o+l+w?)|(l+u+l+w?)|((?:ha)+)|(k+e+k+w?)')


def analyze_chat_logs(output_path):
    def parse_emote_name(emote_data):
        if isinstance(emote_data, list):
            return set(e['name'] for e in emote_data)
        return emote_data

    chat_logs = pd.read_json(output_path)
    chat_logs['timestamp'] = chat_logs['timestamp'].apply(pd.Timestamp)
    chat_logs = chat_logs.set_index(pd.DatetimeIndex(chat_logs['timestamp']))

    chat_logs['emote_names'] = chat_logs['emotes'].apply(parse_emote_name)
    chat_logs['is_replying'] = chat_logs['message'].apply(lambda x: x.startswith('@'))
    chat_logs['message_unique'] = chat_logs['message'].apply(parse_keywords)

    # word_count = Counter(chat_logs['message_unique'].explode().tolist())
    # emote_freq_count = Counter([a for a in chat_logs['message_unique'].explode().tolist() if a.startswith(':')])
    # emote_freq_count_sorted = sorted(emote_freq_count.items(), key=lambda item: (-item[1], item[0]))

    chat_logs['has_lols'] = chat_logs['message_unique'].apply(detect_lols)
    return chat_logs


def preprocess(raw_message):
    cleaned_message = CAPITALIZED_WORDS_REGEX.sub(r':\1:', raw_message)  # wrap "all cap" words in ":" converting it to pseudo emotes
    cleaned_message = PUNCTUATION_SUFFIX_REGEX.sub("", cleaned_message)
    cleaned_message = cleaned_message.replace('::', ': :')  # adds space between two consecutive emotes
    return cleaned_message


def parse_keywords(message):
    message = preprocess(message)
    return set(message.split())


def detect_lols(message):
    if isinstance(message, set):
        return any(detect_lols(word) for word in message)

    match = LOL_REGEX.match(message.lower())
    return match is not None


def fetch_youtube_chat_logs(url):
    vid_id = url.split('.com/watch?v=')[-1].split('&')[0]
    output_path = join(CHAT_LOG_DIR, f'{vid_id}.json')
    if not exists(output_path):
        ChatDownloader().get_chat(url, output=output_path)
    return output_path


def plot_lols(chat_logs):
    plt.figure()
    plt.xlabel('timeline')
    for lol_spike in chat_logs[chat_logs['has_lols']]['time_in_seconds']:
        plt.axvline(lol_spike)
    plt.show()


def parse_youtube_chat_logs_from_url(url):
    output_path = fetch_youtube_chat_logs(url)
    log_stats = analyze_chat_logs(output_path)
    lol_ts_series = log_stats[['has_lols']].resample('1s').sum().fillna(0).rolling(window=15, min_periods=1).mean()
    lol_ts_series.index = (lol_ts_series.index - lol_ts_series.index[0]).total_seconds() * 1000
    lol_ts_list = [{"timestamp": ts, "value": lols} for ts, lols in zip(lol_ts_series.index.to_list(), lol_ts_series['has_lols'].to_list())]

    log_highlights = {'lol_ts': lol_ts_list,
                      'total_duration': log_stats.iloc[-1]['time_in_seconds']}
    return log_highlights


if __name__ == "__main__":
    sample_url = 'https://www.youtube.com/watch?v=NrY0kCOc-zw&list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6&ab_channel=Destiny'
    chat_log_results = parse_youtube_chat_logs_from_url(sample_url)
    pass
