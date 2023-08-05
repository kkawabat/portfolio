let rtc_config = { sdpSemantics: 'unified-plan',
                   iceServers: [{urls: ['stun:stun.voztele.com:3478', 'stun:stun.gmx.net:3478', 'stun:stun.myspeciality.com:3478', 'stun:stun.syncthing.net:3478', 'stun:stun.siedle.com:3478', 'stun:stun.smartvoip.com:3478', 'stun:stun.ttmath.org:3478', 'stun:stun.optdyn.com:3478', 'stun:stun.mywatson.it:3478', 'stun:stun.liveo.fr:3478', 'stun:stun.genymotion.com:3478', 'stun:stun.ekiga.net:3478', 'stun:stun1.l.google.com:19305', 'stun:stun.sma.de:3478', 'stun:stun.eoni.com:3478', 'stun:stun.wifirst.net:3478', 'stun:stun.meetwife.com:3478', 'stun:stun.bethesda.net:3478', 'stun:stun.bitburger.de:3478', 'stun:stun.vivox.com:3478', 'stun:stun.dcalling.de:3478', 'stun:stun.telbo.com:3478', 'stun:stun.freevoipdeal.com:3478', 'stun:stun.it1.hr:3478', 'stun:stun.commpeak.com:3478', 'stun:stun.signalwire.com:3478', 'stun:stun.vincross.com:3478', 'stun:stun.ippi.fr:3478', 'stun:stun.allflac.com:3478', 'stun:stun.m-online.net:3478', 'stun:stun.voipcheap.com:3478', 'stun:stun.atagverwarming.nl:3478', 'stun:stun.3deluxe.de:3478', 'stun:iphone-stun.strato-iphone.de:3478', 'stun:stun.leonde.org:3478', 'stun:stun.poetamatusel.org:3478', 'stun:stun.internetcalls.com:3478', 'stun:stun.kaseya.com:3478', 'stun:stun.marcelproust.it:3478', 'stun:stun.tel.lu:3478', 'stun:stun.wemag.com:3478', 'stun:stun.thebrassgroup.it:3478', 'stun:stun.carlovizzini.it:3478', 'stun:stun.swrag.de:3478', 'stun:stun.kedr.io:3478', 'stun:stun.heeds.eu:3478', 'stun:stun.sippeer.dk:3478', 'stun:stun.callromania.ro:3478', 'stun:stun.ozekiphone.com:3478', 'stun:stun.healthtap.com:3478', 'stun:stun.siptrunk.com:3478', 'stun:stun.gntel.nl:3478', 'stun:stun.bcs2005.net:3478', 'stun:stun.futurasp.es:3478', 'stun:stun.uls.co.za:3478', 'stun:stun.lowratevoip.com:3478', 'stun:stun.medvc.eu:3478', 'stun:stun.fixup.net:3478', 'stun:stun.dunyatelekom.com:3478', 'stun:stun.schoeffel.de:3478', 'stun:stun.rockenstein.de:3478', 'stun:stun.voipvoice.it:3478', 'stun:stun.vo.lu:3478', 'stun:stun.alberon.cz:3478', 'stun:stun4.l.google.com:19305', 'stun:stun.solcon.nl:3478', 'stun:stun.freeswitch.org:3478', 'stun:stun.next-gen.ro:3478', 'stun:stun.lleida.net:3478', 'stun:stun.qq.com:3478', 'stun:stun.voipcheap.co.uk:3478', 'stun:stun.mixvoip.com:3478', 'stun:stun.neomedia.it:3478', 'stun:stun.ipshka.com:3478', 'stun:stun.imp.ch:3478', 'stun:stun.eleusi.com:3478', 'stun:stun.shadrinsk.net:3478', 'stun:stun.yesdates.com:3478', 'stun:stun.studio71.it:3478', 'stun:stun.pure-ip.com:3478', 'stun:stun.landvast.nl:3478', 'stun:stun.thinkrosystem.com:3478', 'stun:stun.callwithus.com:3478', 'stun:stun.piratenbrandenburg.de:3478', 'stun:stun.h4v.eu:3478', 'stun:stun.poivy.com:3478', 'stun:stun.jabbim.cz:3478', 'stun:stun.stochastix.de:3478', 'stun:stun.autosystem.com:3478', 'stun:stun.dls.net:3478', 'stun:stun.syrex.co.za:3478', 'stun:stun.eurosys.be:3478', 'stun:stun.f.haeder.net:3478', 'stun:stun.oncloud7.ch:3478', 'stun:stun.muoversi.net:3478', 'stun:stun.fathomvoice.com:3478', 'stun:stun.kotter.net:3478', 'stun:stun.webcalldirect.com:3478', 'stun:stun.root-1.de:3478', 'stun:stun.ncic.com:3478', 'stun:stun.babelforce.com:3478', 'stun:stun.myhowto.org:3478', 'stun:stun.isp.net.au:3478', 'stun:stun.foad.me.uk:3478', 'stun:stun.hot-chilli.net:3478', 'stun:stun.wia.cz:3478', 'stun:stun.smslisto.com:3478', 'stun:stun.files.fm:3478', 'stun:stun.counterpath.com:3478', 'stun:stun.nextcloud.com:3478', 'stun:stun.technosens.fr:3478', 'stun:stun.olimontel.it:3478', 'stun:stun.voip.eutelia.it:3478', 'stun:stun.nanocosmos.de:3478', 'stun:stun.galeriemagnet.at:3478', 'stun:stun.zadarma.com:3478', 'stun:stun.wxnz.net:3478', 'stun:stun.aa.net.uk:3478', 'stun:stun.freecall.com:3478', 'stun:stun.wcoil.com:3478', 'stun:stun.radiojar.com:3478', 'stun:stun.jumblo.com:3478', 'stun:stun.wtfismyip.com:3478', 'stun:stun.godatenow.com:3478', 'stun:stun.fairytel.at:3478', 'stun:stun.imafex.sk:3478', 'stun:stun.voicetech.se:3478', 'stun:stun.tel2.co.uk:3478', 'stun:stun.meowsbox.com:3478', 'stun:stun.halonet.pl:3478', 'stun:stun.sylaps.com:3478', 'stun:stun.voipgate.com:3478', 'stun:stun.talkho.com:3478', 'stun:stun.siplogin.de:3478', 'stun:stun.antisip.com:3478', 'stun:stun.deepfinesse.com:3478', 'stun:stun.otos.pl:3478', 'stun:stun.newrocktech.com:3478', 'stun:stun.ppdi.com:3478', 'stun:stun.sewan.fr:3478', 'stun:stun.gravitel.ru:3478', 'stun:stun.sip.us:3478', 'stun:stun.londonweb.net:3478', 'stun:stun.cablenet-as.net:3478', 'stun:stun.verbo.be:3478', 'stun:stun.nfon.net:3478', 'stun:stun.rynga.com:3478', 'stun:stun.voicetrading.com:3478', 'stun:stun.tng.de:3478', 'stun:stun.3wayint.com:3478', 'stun:stun.voipinfocenter.com:3478', 'stun:stun.dus.net:3478', 'stun:stun.soho66.co.uk:3478', 'stun:stun.lovense.com:3478', 'stun:stun.alphacron.de:3478', 'stun:stun.hitv.com:3478', 'stun:stun.xten.com:3478', 'stun:stun.geesthacht.de:3478', 'stun:stun.easter-eggs.com:3478', 'stun:stun.rolmail.net:3478', 'stun:stun.romaaeterna.nl:3478', 'stun:stun.nexxtmobile.de:3478', 'stun:stun.ringostat.com:3478', 'stun:stun.axeos.nl:3478', 'stun:stun.voipconnect.com:3478', 'stun:stun.framasoft.org:3478', 'stun:stun.1-voip.com:3478', 'stun:stun.bandyer.com:3478', 'stun:stun.telnyx.com:3478', 'stun:stun.5sn.com:3478', 'stun:stun.geonet.ro:3478', 'stun:stun.cope.es:3478', 'stun:stun.komsa.de:3478', 'stun:stun.smsdiscount.com:3478', 'stun:stun.sparvoip.de:3478', 'stun:stun.voys.nl:3478', 'stun:stun.fitauto.ru:3478', 'stun:stun.gigaset.net:3478', 'stun:stun.bluesip.net:3478', 'stun:stun.cibercloud.com.br:3478', 'stun:stun.selasky.org:3478', 'stun:stun.engineeredarts.co.uk:3478', 'stun:stun.voipzoom.com:3478', 'stun:stun.ipfire.org:3478', 'stun:stun.voipraider.com:3478', 'stun:stun.ladridiricette.it:3478', 'stun:stun.sipglobalphone.com:3478', 'stun:stun.schulinformatik.at:3478', 'stun:stun.avigora.fr:3478', 'stun:stun.aaisp.co.uk:3478', 'stun:stun.eol.co.nz:3478', 'stun:stun.acquageraci.it:3478', 'stun:stun.voipwise.com:3478', 'stun:stun.solnet.ch:3478', 'stun:stun2.l.google.com:19302', 'stun:stun.tichiamo.it:3478', 'stun:stun.voipbusterpro.com:3478', 'stun:stun.voipgain.com:3478', 'stun:stun.myvoiptraffic.com:3478', 'stun:stun.bridesbay.com:3478', 'stun:stun.junet.se:3478', 'stun:stun.teliax.com:3478', 'stun:stun.justvoip.com:3478', 'stun:stun.ortopediacoam.it:3478', 'stun:stun.lebendigefluesse.at:3478', 'stun:stun.schlund.de:3478', 'stun:stun.l.google.com:19302', 'stun:stun.acronis.com:3478', 'stun:stun.var6.cn:3478', 'stun:relay.webwormhole.io:3478', 'stun:stun.voippro.com:3478', 'stun:stun.irishvoip.com:3478', 'stun:stun.skydrone.aero:3478', 'stun:stun.yollacalls.com:3478', 'stun:stun.jay.net:3478', 'stun:stun.sipy.cz:3478', 'stun:stun.sonetel.net:3478', 'stun:stun.acrobits.cz:3478', 'stun:stun.connecteddata.com:3478', 'stun:stun.easyvoip.com:3478', 'stun:stun.sonetel.com:3478', 'stun:stun.netappel.com:3478', 'stun:stun.voipbuster.com:3478', 'stun:stun.voipplanet.nl:3478', 'stun:stun.planetarium.com.br:3478', 'stun:stun.crimeastar.net:3478', 'stun:stun.cheapvoip.com:3478', 'stun:stun.taxsee.com:3478', 'stun:stun.hicare.net:3478', 'stun:stun.easybell.de:3478', 'stun:stun1.l.google.com:19302', 'stun:stun.istitutogramscisiciliano.it:3478', 'stun:stun.linphone.org:3478', 'stun:stun.teamfon.de:3478', 'stun:stun3.l.google.com:19302', 'stun:stun.openjobs.hu:3478', 'stun:stun.anlx.net:3478', 'stun:stun.levigo.de:3478', 'stun:stun.synergiejobs.be:3478', 'stun:stun.voip.blackberry.com:3478', 'stun:stun.fbsbx.com:3478', 'stun:stun.clickphone.ro:3478', 'stun:stun.annatel.net:3478', 'stun:stun.sky.od.ua:3478', 'stun:stun.graftlab.com:3478', 'stun:stun.voipstunt.com:3478', 'stun:stun.groenewold-newmedia.de:3478', 'stun:stun.megatel.si:3478', 'stun:stun.vavadating.com:3478', 'stun:stun.l.google.com:19305', 'stun:stun.comrex.com:3478', 'stun:stun.edwin-wiegele.at:3478', 'stun:stun.voztovoice.org:3478', 'stun:stun3.l.google.com:19305', 'stun:stun.mit.de:3478', 'stun:stun.sipthor.net:3478', 'stun:stun.hoiio.com:3478', 'stun:stun.counterpath.net:3478', 'stun:stun.studio-link.de:3478', 'stun:stun.threema.ch:3478', 'stun:stun.lineaencasa.com:3478', 'stun:stun.mobile-italia.com:3478', 'stun:stun.localphone.com:3478', 'stun:stun2.l.google.com:19305', 'stun:stun.1und1.de:3478', 'stun:stun.arkh-edu.ru:3478', 'stun:stun.bernardoprovenzano.net:3478', 'stun:stun.alpirsbacher.de:3478', 'stun:stun.voipxs.nl:3478', 'stun:stun4.l.google.com:19302', 'stun:stun.frozenmountain.com:3478', 'stun:stun.bergophor.de:3478', 'stun:stun.solomo.de:3478', 'stun:stun.zentauron.de:3478', 'stun:stun.kanojo.de:3478', 'stun:stun.webmatrix.com.br:3478', 'stun:stun.sipdiscount.com:3478', 'stun:stun.ixc.ua:3478', 'stun:stun.nonoh.net:3478', 'stun:stun.openvoip.it:3478', 'stun:stun.ctafauni.it:3478', 'stun:stun.nextcloud.com:443', 'stun:stun.gmx.de:3478', 'stun:stun.peeters.com:3478', 'stun:stun.netgsm.com.tr:3478', 'stun:stun.voipdiscount.com:3478', 'stun:stun.siptraffic.com:3478', 'stun:stun.vozelia.com:3478', 'stun:stun.vomessen.de:3478', 'stun:stun.plexicomm.net:3478', 'stun:stun.axialys.net:3478', 'stun:stun.actionvoip.com:3478', 'stun:stun.grazertrinkwasseringefahr.at:3478', 'stun:stun.linuxtrent.it:3478', 'stun:stun.totalcom.info:3478', 'stun:stun.diallog.com:3478', 'stun:stun.ru-brides.com:3478', 'stun:stun.powervoip.com:3478', 'stun:stun.streamnow.ch:3478', 'stun:stun.splicecom.com:3478', 'stun:stun.srce.hr:3478', 'stun:stun.tula.nu:3478', 'stun:stun.voip.aebc.com:3478', 'stun:stun.avoxi.com:3478', 'stun:stun.voipgrid.nl:3478', 'stun:stun.westtel.ky:3478', 'stun:stun.12voip.com:3478', 'stun:stun.elitetele.com:3478', 'stun:stun.vadacom.co.nz:3478', 'stun:stun.twt.it:3478', 'stun:stun.logic.ky:3478', 'stun:stun.intervoip.com:3478', 'stun:stun.baltmannsweiler.de:3478', 'stun:stun.qcol.net:3478', 'stun:stun.url.net.au:3478', 'stun:stun.jowisoftware.de:3478', 'stun:stun.goldfish.ie:3478', 'stun:stun.ukh.de:3478', 'stun:stun.labs.net:3478', 'stun:stun.nexphone.ch:3478', 'stun:stun.infra.net:3478', 'stun:stun.voipia.net:3478', 'stun:stun.moonlight-stream.org:3478', 'stun:stun.myvoipapp.com:3478', 'stun:stun.romancecompass.com:3478', 'stun:stun.voipfibre.com:3478', 'stun:stun.waterpolopalermo.it:3478', 'stun:stun.usfamily.net:3478', 'stun:stun.simlar.org:3478', 'stun:stun.hide.me:3478', 'stun:stun.t-online.de:3478', 'stun:stun.officinabit.com:3478', 'stun:stun.leucotron.com.br:3478', 'stun:stun.fmo.de:3478', 'stun:stun.epygi.com:3478', 'stun:stun.bearstech.com:3478', 'stun:stun.voipstreet.com:3478', 'stun:stun.sigmavoip.com:3478', 'stun:stun.peethultra.be:3478', 'stun:stun.uabrides.com:3478', 'stun:stun.voipblast.com:3478', 'stun:stun.cellmail.com:3478', 'stun:stun.stadtwerke-eutin.de:3478', 'stun:stun.ippi.com:3478']}]; };


function init_webrtc(pc, media_stream, offer_uri) {
    pc = new RTCPeerConnection(rtc_config);
    media_stream.getTracks().forEach(function(track) { pc.addTrack(track, stream); });
    return negotiate(offer_uri);
}

function disconnect_webrtc(pc) {
    if (pc.getTransceivers) { pc.getTransceivers().forEach(function(transceiver) { if (transceiver.stop) { transceiver.stop(); } }); }

    pc.getSenders().forEach(function(sender) { if(sender != null && sender.track != null) { sender.track.stop(); } });

    setTimeout(function() { pc.close(); }, 500);
}

function negotiate(offer_uri) {
    return pc.createOffer()
            .then( pc.setLocalDescription )
            .then( waitForIceStatePromise )
            .then( function() { sendOffer(offer_uri); } )
            .then( function(response) { return pc.setRemoteDescription(response.sdp); } )
            .catch( function(e) { alert(e); } );
}

function waitForIceStatePromise() {
    function waitForIceState(resolve){
        if (pc.iceGatheringState === 'complete') { resolve(); }
        else {
            function checkState() {
                if (pc.iceGatheringState === 'complete') {
                    pc.removeEventListener('icegatheringstatechange', checkState);
                    resolve();
            }}
            pc.addEventListener('icegatheringstatechange', checkState);
    }}
    return new Promise(waitForIceState);
}

function sendOffer(offer_uri) {
    var offer = pc.localDescription;
    offer.sdp = sdpFilterCodec('video', video_codec, offer.sdp);
    return fetch(offer_uri, {
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
    });
}

function sdpFilterCodec(kind, codec, realSdp) {
    var allowed = []
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')

    var lines = realSdp.split('\n');

    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) { isKind = true; }
        else if (lines[i].startsWith('m=')) { isKind = false; }

        if (isKind) {
            var match = lines[i].match(codecRegex);
            if (match) { allowed.push(parseInt(match[1])); }
            match = lines[i].match(rtxRegex);
            if (match && allowed.includes(parseInt(match[2]))) { allowed.push(parseInt(match[1])); }
        }
    }

    var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    var sdp = '';

    isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) { isKind = true; }
        else if (lines[i].startsWith('m=')) { isKind = false; }

        if (isKind) {
            var skipMatch = lines[i].match(skipRegex);
            if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) { continue; }
            else if (lines[i].match(videoRegex)) { sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n'; }
            else { sdp += lines[i] + '\n'; }
        }
        else { sdp += lines[i] + '\n'; }
    }
    return sdp;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}