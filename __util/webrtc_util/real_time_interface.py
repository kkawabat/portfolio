from aiortc import RTCPeerConnection, RTCSessionDescription

from __util.webrtc_util.media_stream_transformers import VideoTransformTrack


class RealTimeInterfacer:

    def __init__(self, track_transformer: VideoTransformTrack):
        self.pc = RTCPeerConnection()
        self.track_transformer = track_transformer

        @self.pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            print(f"ICE connection state is {self.pc}")
            if self.pc.iceConnectionState == "failed":
                await self.disconnect()

        @self.pc.on("track")
        def on_track(track):
            print(f"Track {track.kind} received")
            self.track_transformer.add_track(track)
            self.pc.addTrack(self.track_transformer)

            @track.on("ended")
            async def on_ended():
                print(f"Track {track.kind} ended")

    async def take_offer(self, offer):
        offer_sdp = RTCSessionDescription(sdp=offer["sdp"], type=offer["type"])
        await self.pc.setRemoteDescription(offer_sdp)
        answer = await self.pc.createAnswer()
        await self.pc.setLocalDescription(answer)
        return {"event": 'offer_response', "sdp": self.pc.localDescription.sdp, "type": self.pc.localDescription.type}

    async def disconnect(self):
        await self.pc.close()
