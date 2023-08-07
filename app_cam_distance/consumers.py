from channels.generic.websocket import AsyncJsonWebsocketConsumer

from __util.webrtc_util.media_stream_transformers import VideoTransformTrack
from __util.webrtc_util.real_time_interface import RealTimeInterfacer


class CamHandshake(AsyncJsonWebsocketConsumer):

    def __init__(self):
        super().__init__(self)
        self.rt_interface = RealTimeInterfacer(FaceDistanceTrack)

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        await self.rt_interface.disconnect()

    async def receive_json(self, text_data=None, bytes_data=None):
        response = await self.rt_interface.take_offer(text_data)
        await self.send_json(response)


class FaceDistanceTrack(VideoTransformTrack):
    async def recv(self):
        #  todo update with face distance code
        frame = await self.track.recv()
        print('recv')
        return frame
