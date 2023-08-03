from channels.generic.websocket import JsonWebsocketConsumer
from morse_code_util.morse_engine import MorseEngine


class MorseCoder(JsonWebsocketConsumer):
    def connect(self):
        self.accept()
        self.morse_engine = MorseEngine(tapping_speed=.2, short_pause_multiple=1, long_pause_multiple=4)

    def disconnect(self, close_code):
        self.send_json({'disconnected': True})

    def receive_json(self, text_data=None, bytes_data=None):
        event_type = text_data['type']

        if event_type == 'decode':
            morse = self.morse_engine.signal_to_morse(text_data['data'])
            text = self.morse_engine.morse_to_text(morse)
            self.send_json({'morse': morse, 'text': text})
