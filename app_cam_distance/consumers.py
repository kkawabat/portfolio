import asyncio

from aiortc import RTCSessionDescription, RTCPeerConnection
from channels.generic.websocket import JsonWebsocketConsumer
from django.http import JsonResponse


class CamHandshake(JsonWebsocketConsumer):
    pcs = set()

    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        for pc in self.pcs:
            pc.close()
        self.pcs.clear()

    def receive_json(self, text_data=None, bytes_data=None):
        self.offer(text_data)

    def offer(self, offer_json):
        offer = RTCSessionDescription(sdp=offer_json["sdp"], type=offer_json["type"])
        pc = RTCPeerConnection()
        self.pcs.add(pc)
        pc.setRemoteDescription(offer)

        loop = asyncio.get_event_loop()
        answer = loop.run_until_complete(pc.createAnswer())

        pc.setLocalDescription(answer)
        return JsonResponse({"sdp": pc.localDescription.sdp, "type": pc.localDescription.type})
