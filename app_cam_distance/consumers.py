import asyncio

from aiortc import RTCSessionDescription, RTCPeerConnection
from channels.generic.websocket import JsonWebsocketConsumer, AsyncJsonWebsocketConsumer
from django.http import JsonResponse


class CamHandshake(AsyncJsonWebsocketConsumer):

    def __init__(self):
        super().__init__(self)
        self.local_pc = None
        self.remote_track = None

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        await self.local_pc.close()
        self.local_pc = None
        self.remote_track = None

    async def receive_json(self, text_data=None, bytes_data=None):
        await self.offer(text_data)

    async def offer(self, offer_json):
        print('offer received')
        offer = RTCSessionDescription(sdp=offer_json["sdp"], type=offer_json["type"])
        if self.local_pc is not None:
            await self.local_pc.close()
        self.local_pc = RTCPeerConnection()

        @self.local_pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            print(f"ICE connection state is {self.local_pc}")
            if self.local_pc.iceConnectionState == "failed":
                await self.disconnect(None)

        @self.local_pc.on("track")
        def on_track(track):
            print(f"Track {track.kind} received")

            @track.on("ended")
            async def on_ended():
                print(f"Track {track.kind} ended")

        await self.local_pc.setRemoteDescription(offer)
        answer = await self.local_pc.createAnswer()
        await self.local_pc.setLocalDescription(answer)
        await self.send_json({"sdp": self.local_pc.localDescription.sdp, "type": self.local_pc.localDescription.type})


def get_or_set_event_loop():
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError as e:
        if str(e).startswith('There is no current event loop in thread'):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        else:
            raise
    return loop
