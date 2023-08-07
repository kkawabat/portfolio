#  modified from https://github.com/aiortc/aiortc/blob/2362e6d1f0c730a0f8c387bbea76546775ad2fe8/examples/server/server.py
from abc import abstractmethod

from aiortc import MediaStreamTrack


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track

    @abstractmethod
    async def recv(self):
        pass


class VideoPassThroughTrack(VideoTransformTrack):
    async def recv(self):
        frame = await self.track.recv()
        return frame


