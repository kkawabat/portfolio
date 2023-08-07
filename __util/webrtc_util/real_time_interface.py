from aiortc import RTCPeerConnection, RTCSessionDescription


class RealTimeInterfacer:

    def __init__(self, track_transform):
        self.pc = RTCPeerConnection()

        @self.pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            print(f"ICE connection state is {self.pc}")
            if self.pc.iceConnectionState == "failed":
                await self.disconnect()

        @self.pc.on("track")
        def on_track(track):
            print(f"Track {track.kind} received")
            self.pc.addTrack(track_transform(track))

            @track.on("ended")
            async def on_ended():
                print(f"Track {track.kind} ended")

    async def take_offer(self, offer):
        offer = RTCSessionDescription(sdp=offer["sdp"], type=offer["type"])
        await self.pc.setRemoteDescription(offer)
        answer = await self.pc.createAnswer()
        await self.pc.setLocalDescription(answer)
        return {"sdp": self.pc.localDescription.sdp, "type": self.pc.localDescription.type}

    async def disconnect(self):
        await self.pc.close()
