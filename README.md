# Kan's Portfolio

Hello this is my repo for my website at kankawabata.com.

This repo contains:
- main page
  - details about myself
- web interfaces/apps for some of my personal projects  
  - magic eye generator
  - whistle to midi app
  - etc.

### dependency
- git
- poetry 
- dependencies for pyaudio
- ffmpeg
- npm

### installation for local development 

- clone this repo with `git clone https://github.com/kkawabat/portfolio.git`
- run `poetry install`
- run `python manage.py runserver`


### network notes
The miscellaneous notes below are related to server and network configuration and may only be relevant to my own server setup. Because port 80 is blocked by my ISP provider, I need to setup ssl using dns-challenge. I'm still a bit fuzzy on the meaning of this but was able to brute force my way into getting this working.  
  
  
- certbot instructions to setup ssl https://certbot.eff.org/instructions?ws=nginx&os=pip when port 80 is blocked by isp
  - setting up dns-challenge for duckdns https://pypi.org/project/certbot-dns-duckdns/
  - useful duck dns api help https://community.letsencrypt.org/t/raspberry-pi-with-duckdns-ddns-failing-to-verify/53567/9
  - renewal https://eff-certbot.readthedocs.io/en/latest/using.html#setting-up-automated-renewal