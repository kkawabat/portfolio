from urllib import request


def fetch_stun():
    #  we pull the stun list from https://github.com/pradt2/always-online-stun and parse it into the right format to copy and paste into the webrtc_client.js
    stun_list_url = 'https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_hosts.txt'
    with request.urlopen(stun_list_url) as ifile, open('stun_list_js.txt', 'w') as ofile:
        stun_list = ifile.read().decode("utf8").split()
        print([f"stun:{stun_url}" for stun_url in stun_list])
        ofile.write(str([f"stun:{stun_url}" for stun_url in stun_list]))


if __name__ == '__main__':
    fetch_stun()
