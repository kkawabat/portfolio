import av.video
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from __util.webrtc_util.media_stream_transformers import VideoTransformTrack
from __util.webrtc_util.real_time_interface import RealTimeInterfacer
from opencv_dist_measurer.distance_draw import add_facial_distance_img, add_qr_code_distance_img


class CamHandshake(AsyncJsonWebsocketConsumer):

    def __init__(self):
        super().__init__(self)
        self.rt_interface = RealTimeInterfacer(FaceDistanceTrack())

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        await self.rt_interface.disconnect()

    async def receive_json(self, text_data=None, bytes_data=None):
        if ('type' in text_data) and (text_data['type'] == 'offer'):
            response = await self.rt_interface.take_offer(text_data)
            await self.send_json(response)
        else:
            await self.rt_interface.track_transformer.set_params(**text_data)


class FaceDistanceTrack(VideoTransformTrack):
    def __init__(self, detector_type='face'):
        super().__init__()
        self.detector_type = detector_type

    async def _recv(self, track):
        frame = await track.recv()
        try:
            img = frame.to_ndarray(format="bgr24")

            if self.detector_type == 'face':
                img = add_facial_distance_img(img)
            elif self.detector_type == 'qr_code':
                img = add_qr_code_distance_img(img)

            new_frame = av.video.VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        except Exception as e:
            print(f"failed to processes from {e}")
            return frame

    async def set_params(self, **kwargs):
        self.detector_type = kwargs['detector_type']
