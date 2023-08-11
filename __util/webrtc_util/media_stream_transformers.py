#  modified from https://github.com/aiortc/aiortc/blob/2362e6d1f0c730a0f8c387bbea76546775ad2fe8/examples/server/server.py
from abc import abstractmethod

from aiortc import MediaStreamTrack


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self):
        super().__init__()
        self.tracks = []

    def add_track(self, track):
        self.tracks.append(track)
        return self

    async def recv(self):
        frame = await self._recv(self.tracks[0])
        return frame

    @abstractmethod
    async def _recv(self, track):
        pass

    async def set_params(self, **kwargs):
        pass


class VideoPassThroughTrack(VideoTransformTrack):
    async def _recv(self, track):
        frame = await track.recv()
        return frame
