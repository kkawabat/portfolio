import json

from channels.generic.websocket import WebsocketConsumer


class MorseCoder(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        event_type = text_data_json['type']

        if event_type == 'decode':
            decoded_text = self.decode_morse(text_data)
            self.send(decoded_text)

    def decode_morse(self, text_data):
        return 'test'
