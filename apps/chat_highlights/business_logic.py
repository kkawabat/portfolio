import re
from os.path import join, abspath, dirname, exists

import matplotlib.pyplot as plt
import pandas as pd
from chat_downloader import ChatDownloader
import os

import dotenv
from googleapiclient.discovery import build

scopes = ["https://www.googleapis.com/auth/youtube.readonly"]
dotenv.load_dotenv()

CHAT_LOG_DIR = join(dirname(abspath(__file__)), 'static', 'chat_logs')
CAPITALIZED_WORDS_REGEX = re.compile(r'\b([A-Z]{2,}(?:[-\'][A-Z]+)+|[A-Z]{2,})\b')
PUNCTUATION_SUFFIX_REGEX = re.compile(r"\b[!?.]+")
LOL_REGEX = re.compile(r'(l+m+(?:f+)?a+o+)|(l+o+l+w?)|(l+u+l+w?)|((?:ha)+)|(k+e+k+w?)')


def analyze_chat_logs(chat_logs):
    def parse_emote_name(emote_data):
        if isinstance(emote_data, list):
            return set(e['name'] for e in emote_data)
        return emote_data

    chat_logs['timestamp'] = chat_logs['timestamp'].apply(pd.Timestamp)
    chat_logs = chat_logs.set_index(pd.DatetimeIndex(chat_logs['timestamp']))

    # chat_logs['emote_names'] = chat_logs['emotes'].apply(parse_emote_name)
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
    downloader = ChatDownloader()
    full_log = True
    try:
        print(f"fetching youtube chat...")
        cur_time = pd.Timestamp.utcnow().value / 1000
        chat_log_list = []
        for chat in downloader.get_chat(url, start_time="00:00:00"):
            # by default the loop doesn't end until reaching the end of the video
            # but if we are fetching from a live broadcast this loop exits once we reach the end
            if cur_time < chat['timestamp']:
                full_log = False
                break
            print(pd.Timestamp(chat['timestamp']*1000))
            chat_log_list.append(chat)

        chat_log_df = pd.DataFrame(chat_log_list)
        chat_log_df['timestamp'] = chat_log_df['timestamp'] * 1000  # convert chatDownloader's timestamp to standard

        if 'time_in_seconds' not in chat_log_df.columns:
            # todo the start time is not accurate atm this is the best I can do on a live session
            start_time = pd.Timestamp(chat_log_df.iloc[0]['timestamp'])
            chat_log_df['time_in_seconds'] = (chat_log_df['timestamp'].apply(pd.Timestamp) - start_time).iloc[0].total_seconds()
    finally:
        downloader.close()
    return chat_log_df, full_log


def plot_lols(chat_logs):
    plt.figure()
    plt.xlabel('timeline')
    for lol_spike in chat_logs[chat_logs['has_lols']]['time_in_seconds']:
        plt.axvline(lol_spike)
    plt.show()


def parse_youtube_chat_logs_from_url(url):
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

    lol_ts_list = [{"timestamp": ts, "value": lols} for ts, lols in zip(lol_ts_series.index.to_list(), lol_ts_series['has_lols'].to_list())]

    log_highlights = {'lol_ts': lol_ts_list,
                      'total_duration': log_stats.iloc[-1]['time_in_seconds'],
                      'url': vid_url,
                      'youtube_id': vid_id}
    return log_highlights


def fetch_youtube_vid_metadata(vid_id):
    youtube = build("youtube", version="v3", developerKey=os.environ['YOUTUBE_API_KEY'])

    request = youtube.videos().list(part="snippet", id=vid_id)
    response = request.execute()
    if len(response.get('items')) != 0:
        return response.get('items')[0]
    raise Exception(f"video with id {vid_id} does not exist")


def test():
    chat_logs = pd.read_csv(r'C:\Users\kkawa\PycharmProjects\portfolio\apps\chat_highlights\static\chat_logs\testing_na-cQuub-QU.csv')
    log_stats = analyze_chat_logs(chat_logs)
    log_stats = log_stats[log_stats['time_in_seconds'] > 0]

    lol_ts_series = log_stats[['has_lols']].resample('10s') \
        .sum().fillna(0) \
        .rolling(window=15, min_periods=1).mean() \
        .interpolate(method='cubic')

    lol_ts_series.index = (lol_ts_series.index - lol_ts_series.index[0]).total_seconds() * 1000

    a = pd.read_json(r'C:\Users\kkawa\PycharmProjects\portfolio\apps\chat_highlights\static\chat_logs\testing_na-cQuub-QU.json')
    log_stats2 = analyze_chat_logs(a)
    log_stats2 = log_stats2[log_stats2['time_in_seconds'] > 0]

    lol_ts_series2 = log_stats2[['has_lols']].resample('10s') \
        .sum().fillna(0) \
        .rolling(window=15, min_periods=1).mean() \
        .interpolate(method='cubic')

    lol_ts_series2.index = (lol_ts_series2.index - lol_ts_series2.index[0]).total_seconds() * 1000


if __name__ == "__main__":
    sample_url = 'https://www.youtube.com/watch?v=na-cQuub-QU'
    chat_log_results = parse_youtube_chat_logs_from_url(sample_url)
    pass
