Here is a list of resources I found useful while working on this project. They have helped give me context and insight.  this list isn't exhaustive as sometimes I forget to update it. 

### django starting point
- https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04#step-6-testing-gunicorn-s-ability-to-serve-the-project  
- https://www.youtube.com/watch?v=Jyvffr3aCp0&ab_channel=WebDevSimplified  
- https://djangocentral.com/building-a-blog-application-with-django/  

### production server related
- https://plainenglish.io/blog/how-deploy-an-asgi-django-application-with-nginx-gunicorn-daphne-and-supervisor-on-ubuntu-server # gunicorn + daphne server configuration help  
- http://www.learningaboutelectronics.com/Articles/How-to-create-a-gunicorn-service-file-in-linux.php  
- https://www.digitalocean.com/community/questions/502-bad-gateway-nginx-2  # useful debugging comment
- https://wolfx.io/how-to-serve-static-and-media-files-in-nginx  # staticfile

### python packaging
- https://towardsdatascience.com/create-your-custom-python-package-that-you-can-pip-install-from-your-git-repository-f90465867893
- https://blog.ionelmc.ro/2014/05/25/python-packaging/#the-structure
- https://kiwidamien.github.io/making-a-python-package.html

### real time application related
- https://stackoverflow.com/a/63418292  # insightful stackoverflow comment on the handshake process in webrtc
- https://stackoverflow.com/a/23938600/4231985  # helped solved my confusion about peer-to-peer for peer-to-server
- https://stackoverflow.com/a/29056385/4231985  # another insightful comment about webrtc
- https://github.com/vsjakhar/Django-WebRtc/tree/master # real time chat example  
- https://github.com/InfoDevkota/WebRTC-Django-Django-Channels-Video-Call/tree/main # webrtc video call example  
- https://blog.miguelgrinberg.com/post/video-streaming-with-flask/page/8  # flask video streaming example 
- https://github.com/saurav-codes/django-video-streaming-app/tree/main  # django video streaming example
- https://web.dev/webrtc-basics/ # very thorough explanation of webrtc
- https://stackoverflow.com/questions/48933972/webrtc-python-implementation  # this question on SO finally lead to what I wanted (i.e. client-server connection using WebRTC)
- https://stackoverflow.com/questions/70554961/webrtc-vs-websockets-server-to-client-s-one-to-many-live-video-streaming-from  # more insight into what tech is out here for client-server connection
- https://stackoverflow.com/questions/76515691/how-to-setup-webrtc-connection-between-django-server-and-browser-using-aiortc  # more insight into what tech is out here for client-server connection
- https://www.youtube.com/watch?v=MBOlZMLaQ8g&ab_channel=TauhidCodes  # youtube tutorial on websocket and p2p webrtc usage
- https://www.reddit.com/r/django/comments/on8fh1/how_to_deploy_opencv_video_feed_cam_with_my/  # reddit thread that seems to be a good lead
- https://michaelsusanto81.medium.com/real-time-app-with-websocket-through-django-channels-adb436e9a17a  # medium article about using websocket to stream video
- https://stackoverflow.com/questions/53813696/sending-webrtc-video-stream-to-server-with-django-channels  # another webrtc question/lead 
- https://github.com/aiortc/aiortc/issues/447  # opencv frame to webrtc sampel code
- https://www.youtube.com/watch?v=Y1mx7cx6ckI  # google talk about server component of webrtc
- https://www.youtube.com/watch?v=8I2axE6j204  # another pretty accessible talk about webrtc
- https://niccoloterreri.com/webrtc-with-transceivers  # webrtc with transceivers
- https://sahilchachra.medium.com/all-you-want-to-get-started-with-gstreamer-in-python-2276d9ed548e  # intro to gstreamer
- https://stackoverflow.com/questions/31635275/what-is-rtsp-and-webrtc-for-streaming  # a hit on rtsp which seems exactly what I want
- https://getstream.io/blog/streaming-protocols/  # a list of streaming protocols and descriptions
- https://stackoverflow.com/questions/76643088/display-encoded-video-frames-using-react-and-django  # django channels http + websocket streaming solution
- https://webrtc.github.io/samples/  # webrtc samples
- https://gist.github.com/kueblert/fc1517fc9254e9a3cb0add7795c337f4  # webrtc example with opencv
- https://gist.github.com/mondain/b0ec1cf5f60ae726202e?permalink_comment_id=3273048#gistcomment-3273048  # entry point to making my own stun/turn server
- https://dev.to/whitphx/python-webrtc-basics-with-aiortc-48id  # best article on webrtc aiortc


### video and audio recording related
- https://www.geeksforgeeks.org/how-to-open-web-cam-in-javascript/#  # video demo
- https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee  # audio demo

### css/javascript
- https://www.youtube.com/@KevinPowell  # a pretty helpful youtuber for css  
- https://thoughtbot.com/blog/transitions-and-transforms  # transition/transforms explaination  
- https://codepen.io/dcode-software/pen/abZPmRb  # button with loading spinner  
- https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee  # audio recording js  
- https://codepen.io/dcode-software/pen/xxwpLQo  # drag-dropzone  
- https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_scroll_to_top  # scroll to top example  
- https://codepen.io/cathydutton/pen/xxpOOw # stopwatch

### cool stuff
- https://github.com/cwilso/WebAudio/tree/master  # very cool web audio playground


### face recognition
- https://github.com/opencv/opencv_contrib/blob/4.8.0/modules/face/samples/landmarks_demo.py  # sample code from opencv website for face landmark detection 