Here is a list of resources I found useful while working on this project. They have helped give me context and insight.  this list isn't exhaustive as sometimes I forget to update it. 


### general django
- https://djangocentral.com/building-a-blog-application-with-django/  # django's own tutorial good entry point for general understanding  
- https://stackoverflow.com/a/35244323/4231985  # SO thread about django folder structures
- https://brntn.me/blog/six-things-i-do-every-time-i-start-a-django-project/  # checklist for starting django projects 


### production server related
- https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-18-04#step-6-testing-gunicorn-s-ability-to-serve-the-project  # starting point for getting django setup in production server
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
- https://www.youtube.com/watch?v=MBOlZMLaQ8g&ab_channel=TauhidCodes  # YouTube tutorial on websocket and p2p webrtc usage
- https://www.reddit.com/r/django/comments/on8fh1/how_to_deploy_opencv_video_feed_cam_with_my/  # reddit thread that seems to be a good lead
- https://michaelsusanto81.medium.com/real-time-app-with-websocket-through-django-channels-adb436e9a17a  # medium article about using websocket to stream video
- https://stackoverflow.com/questions/53813696/sending-webrtc-video-stream-to-server-with-django-channels  # another webrtc question/lead 
- https://github.com/aiortc/aiortc/issues/447  # opencv frame to webrtc sample code
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
- https://dev.to/whitphx/python-webrtc-basics-with-aiortc-48id  # best article on webrtc aiortc I've found


### video and audio recording related
- https://www.geeksforgeeks.org/how-to-open-web-cam-in-javascript/#  # video demo
- https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee  # audio demo
- https://github.com/cwilso/WebAudio/tree/master  # very cool web audio playground
- https://codepen.io/brianchirls/pen/YLrgoR  # sample code for web audio output test
- https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee  # audio recording js  


### css
- https://www.youtube.com/@KevinPowell  # a pretty helpful youtuber for css
- https://matthewjamestaylor.com/holy-grail-layout  # css layout
- https://thoughtbot.com/blog/transitions-and-transforms  # transition/transforms explanation
- https://developer.mozilla.org/en-US/docs/Web/CSS/animation  # animation documentation
- https://stackoverflow.com/a/19989633/4231985  # cancel animation
- https://www.queness.com/post/356/create-a-vertical-horizontal-and-diagonal-sliding-content-website-with-jquery  # tutorial on page transitions
- https://css-tricks.com/snippets/css/typewriter-effect/  # typewriter-effect


### javascript 
- https://codepen.io/dcode-software/pen/abZPmRb  # button with loading spinner
- https://codepen.io/dcode-software/pen/xxwpLQo  # drag-dropzone  
- https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_scroll_to_top  # scroll to top example  
- https://codepen.io/cathydutton/pen/xxpOOw  # stopwatch
- https://stackoverflow.com/a/39987136/4231985  # oscillator demo
- https://codepen.io/jakejarvis/pen/pBZWZw  # hand wave-effect
- https://web.dev/read-files/  # reading files in javascript
- https://jsfiddle.net/ojrtn0g4/  # client side storage of audio files


### html 
- https://stackoverflow.com/a/60363693/4231985  # how to use markdown in html


### htmx related
- https://www.mattlayman.com/blog/2021/how-to-htmx-django/
- https://juliensalinas.com/en/htmx-intercoolerjs-django-nlpcloud/#allow-manual-page-reloading  # solution relating to manually loading 
- https://www.ratfactor.com/htmx/index  # neat webpage that shows what the htmx elements do
- https://github.com/adamchainz/django-htmx  # django htmx example
- https://www.youtube.com/watch?v=XdZoYmLkQ4w&ab_channel=BugBytes  # tutorial on htmx + django


### face recognition
- https://github.com/opencv/opencv_contrib/blob/4.8.0/modules/face/samples/landmarks_demo.py  # sample code from opencv website for face landmark detection (fun fact I got a PR merged for it!)


### youtube api
- https://blog.hubspot.com/website/how-to-get-youtube-api-key  # getting youtube api

### data visualization
- http://square.github.io/cubism/  # really cool demo of horizon plots 
- https://kmandov.github.io/d3-horizon-chart/  # horizon chart plugin for d3
- https://observablehq.com/@d3/realtime-horizon-chart  # horizon chart 
- https://www.youtube.com/watch?v=TOJ9yjvlapY&ab_channel=Academind  # d3 js introduction YouTube video I found
- https://medium.com/free-code-camp/d3-and-canvas-in-3-steps-8505c8b27444  # d3 and canvas tutorial
- https://talk.observablehq.com/t/i-want-to-learn-d3-i-don-t-want-to-learn-observable-is-that-ok/1957/60  # found this thread that helped me convert observable to plain javascript