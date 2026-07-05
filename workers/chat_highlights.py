import os
import re
from os.path import abspath, dirname, exists, join

import dotenv
import pandas as pd
from chat_downloader import ChatDownloader

dotenv.load_dotenv()

CHAT_LOG_DIR = os.environ.get(
    'CHAT_LOG_DIR',
    join(dirname(abspath(__file__)), 'chat_logs'),
)
CAPITALIZED_WORDS_REGEX = re.compile(r'\b([A-Z]{2,}(?:[-\'][A-Z]+)+|[A-Z]{2,})\b')
PUNCTUATION_SUFFIX_REGEX = re.compile(r"\b[!?.]+")
LOL_REGEX = re.compile(r'(l+m+(?:f+)?a+o+)|(l+o+l+w?)|(l+u+l+w?)|((?:ha)+)|(k+e+k+w?)')


def analyze_chat_logs(chat_logs):
    chat_logs['timestamp'] = chat_logs['timestamp'].apply(pd.Timestamp)
    chat_logs = chat_logs.set_index(pd.DatetimeIndex(chat_logs['timestamp']))

    chat_logs['is_replying'] = chat_logs['message'].apply(lambda x: x.startswith('@'))
    chat_logs['message_unique'] = chat_logs['message'].apply(parse_keywords)
    chat_logs['has_lols'] = chat_logs['message_unique'].apply(detect_lols)
    return chat_logs


def preprocess(raw_message):
    cleaned_message = CAPITALIZED_WORDS_REGEX.sub(r':\1:', raw_message)
    cleaned_message = PUNCTUATION_SUFFIX_REGEX.sub("", cleaned_message)
    cleaned_message = cleaned_message.replace('::', ': :')
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
    downloader = ChatDownloader()
    full_log = True
    try:
        cur_time = pd.Timestamp.utcnow().value / 1000
        chat_log_list = []
        for chat in downloader.get_chat(url, start_time="00:00:00"):
            if cur_time < chat['timestamp']:
                full_log = False
                break
            chat_log_list.append(chat)

        chat_log_df = pd.DataFrame(chat_log_list)
        chat_log_df['timestamp'] = chat_log_df['timestamp'] * 1000

        if 'time_in_seconds' not in chat_log_df.columns:
            start_time = pd.Timestamp(chat_log_df.iloc[0]['timestamp'])
            chat_log_df['time_in_seconds'] = (
                chat_log_df['timestamp'].apply(pd.Timestamp) - start_time
            ).iloc[0].total_seconds()
    finally:
        downloader.close()
    return chat_log_df, full_log


def parse_youtube_chat_logs_from_url(url):
    os.makedirs(CHAT_LOG_DIR, exist_ok=True)

    vid_url = url.split('&')[0]
    vid_id = vid_url.split('watch?v=')[-1]
    log_output_path = join(CHAT_LOG_DIR, f'{vid_id}.csv')
    if not exists(log_output_path):
        chat_logs, all_chat = fetch_youtube_chat_logs(url)
        if not all_chat:
            log_output_path = log_output_path.replace('.csv', '-partial.csv')
        chat_logs.to_csv(log_output_path, index=False)
    else:
        chat_logs = pd.read_csv(log_output_path)

    log_stats = analyze_chat_logs(chat_logs)

    lol_ts_series = log_stats[['has_lols']].resample('10s') \
        .sum().fillna(0) \
        .rolling(window=10, min_periods=1).mean() \
        .interpolate(method='cubic')

    lol_ts_series.index = (lol_ts_series.index - lol_ts_series.index[0]).total_seconds() * 1000

    lol_ts_list = [
        {"timestamp": ts, "value": lols}
        for ts, lols in zip(lol_ts_series.index.to_list(), lol_ts_series['has_lols'].to_list())
    ]

    return {
        'lol_ts': lol_ts_list,
        'total_duration': log_stats.iloc[-1]['time_in_seconds'],
        'url': vid_url,
        'youtube_id': vid_id,
    }
