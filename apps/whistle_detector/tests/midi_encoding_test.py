import base64

with open('MIDI_sample.mid', 'rb') as ifile:
    a = f"data:audio/midi;base64,{base64.b64encode(ifile.read()).decode('utf-8')}"
    print(a)
