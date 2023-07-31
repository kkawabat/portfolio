import json

from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer
from morse_code_util.morse_engine import MorseEngine


class MorseCoder(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        self.send_json({'disconnected': True})

    def receive_json(self, text_data=None, bytes_data=None):
        event_type = text_data['type']

        if event_type == 'decode':
            morse = MorseEngine.signal_to_morse(text_data['data'])
            text = MorseEngine.morse_to_text(morse)
            self.send_json({'morse': morse, 'text': text})
