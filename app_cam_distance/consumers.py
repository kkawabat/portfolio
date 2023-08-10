import av.video
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from __util.webrtc_util.media_stream_transformers import VideoTransformTrack
from __util.webrtc_util.real_time_interface import RealTimeInterfacer
from opencv_dist_measurer.distance_draw import add_facial_distance_img


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
        frame = await self.track.recv()
        try:
            img = frame.to_ndarray(format="bgr24")
            img = add_facial_distance_img(img)
            new_frame = av.video.VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        except Exception as e:
            print(f"failed to processses from {e}")
            return frame

