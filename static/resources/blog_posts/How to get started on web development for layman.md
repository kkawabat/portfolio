### introduction  

If you are reading this, chances are you are reading it from my personal website. In which case I pat my future self on the back for getting this thing up and running.

For a while now I've wanted to create a website where I can showcase some projects and ideas that were collecting digital dust in my GitHub repo and local drive. However, the task always felt daunting, the list of prerequisites to learn was huge, interconnected, ever-shifting, and outside my expertise. I felt like a country boy lost in a city. Every new concept I learned required two new concepts to understand and those concepts might require two more.

Slowly over the years, I've developed a set of skills to help me navigate the city. My goal with this post is to hopefully give some landmarks to better get a feel of web development.

#### Frontend and Backend  

You might have heard the terms frontend and backend before. Simply put frontend is all the stuff that happens on your computer (also known as client-side) while the backend is all the stuff that happens on the server. If you are subscribed to a meal-kit delivery, for example, the front-end would be you cooking all the ingredients while following their recipe while the back-end would be the portioning, packaging, and shipping that happens at the factory.

HTML, CSS, and Javascript are considered frontend as it is the job of your web browser to render it into what you see on the screen which all happens on the CPU of your computer.

The backend determines what to serve you. When you click on a link to a post, it's the server that redirects you to the other webpage. All the likes on a post are pulled from a database maintained and updated by the server.

#### HTML + CSS + Javascript  

From youtube to Gmail, every website is made out of these three components. HTML determines all the elements on the website, CSS defines how they would look, and Javascript defines the rules of how they interact.

For example, on Facebook HTML determines all the text, all the buttons, images, etc that will exist on the page. CSS determines the font, size, and shape of these elements and javascript determines their behavior such as what happens when you click on an image or hover over a button.

These components are simply instruction files written in their specific coding language. Your web browser (e.g. chrome, internet explorer) then reads these files and renders the results onto your screen.

#### Backend  

When you go to a website your web browser sends a request for the front end element to display on your screen. This requires backend code to listen to requests, figure out what is needed, collect necessary data for the request, perform any necessary processing, and send the result back to the end user to be displayed.

Not only is the backend responsible for the operations of the factory but also responsible for the construction of the factory itself. Setting up your computer (or web host) so that the factory can start taking orders is a whole nother skillset in and of itself.

#### Web Hosting  

Using our meal-kit delivery analogy, it is possible to have all the business operating inside your garage with makeshift cutting and packaging stations but if you want to have a proper business with lots of traffic you would most likely need to operate at a factory in the industrial district. Web hosting is that industrial district. Web hosting services like DigitalOcean allow you to use their computer to host your backend so that people don't have to access your gated community in the suburbs to order a meal.

#### domain name and DNS  

Another aspect of getting a proper business would be to register your company's name. You don't want to keep referring to your company as "the building at 4733 Elmwood Avenue, AZ" or not be able to refer to your company by name on google maps and have it come up blank.

For my site kankawabata.com would be the domain name with an IP address of 24.199.113.236. In order to associate the IP address with the domain name I had to register it on a domain name registrar.

#### Beyond analogies  

Depending on where you are in your web development journey there are a lot of things that need to be learned.

As a start, it's probably good to get a basic feel of front-end development. Frontend is going to require an understanding of HTML, CSS, and javascript. I recommend googling "beginner frontend projects" and going through some tutorials until you get a feel for it.

For the Backend, I recommend learning Python and Django. Python is the most popular programming language there is and Django is the most popular framework built on top of it so you can't really go wrong learning it. One of the benefits of using a popular tool is that there are a wealth of polished resources to learn from. As a start, I recommend following Django's official "Writing your first Django app" tutorial on their site.

Finally, If you want to do anything backend related you would probably need to learn how to use command prompts/terminal. Unlike your desktop which uses icons and can be interacted with using your mouse. Server interfaces are all text-based. For example, to move your files on your desktop you probably use file explorer/finders and drag/drop your files to the appropriate folder. However, you can do the same thing in text using the command line. I recommend googling "Basic Linux Commands for Beginners" for some introduction material.

#### Conclusion  

Hopefully, this gives a pretty intuitive understanding of the web development landscape. The city is vast you don't need to know the address of every street. However, if you stay long enough and get lost once in a while you would naturally start to know your directions around.