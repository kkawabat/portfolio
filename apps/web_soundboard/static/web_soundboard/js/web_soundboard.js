const inputDevice = document.getElementById('inputDevice');
const outputDevice = document.getElementById('outputDevice');
load_devices();

function load_devices(){

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {

        navigator.mediaDevices.enumerateDevices().then(devices => {
            console.log(devices)
            const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
            if (audioInputDevices.length) {
                inputDevice.disabled = false;
                const deviceList = {};
                audioInputDevices.forEach(deviceInfo => {
                    const option = document.createElement('option');
                    deviceList[deviceInfo.deviceId] = deviceInfo;
                    option.value = deviceInfo.deviceId;
                    option.text = deviceInfo.label || 'Speaker ' + (inputDevice.length + 1);
                    inputDevice.appendChild(option);
                });
            }

            const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');
            if (audioOutputDevices.length) {
                outputDevice.disabled = false;
                const deviceList = {};
                audioOutputDevices.forEach(deviceInfo => {
                    const option = document.createElement('option');
                    deviceList[deviceInfo.deviceId] = deviceInfo;
                    option.value = deviceInfo.deviceId;
                    option.text = deviceInfo.label || 'Speaker ' + (outputDevice.length + 1);
                    outputDevice.appendChild(option);
                });
            }
        });
    }
}

function set_output_device(deviceId){
    audio_list = $("#soundboard").find('audio')
    for (let i = 0; i < audio_list.length; i++) {
        audio_list[i].setSinkId(deviceId);
    }
}