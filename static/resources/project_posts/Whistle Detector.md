This project records your whistles detects your pitch and generates a midi file.

The business logic can be found in the WhistleDetector repo [here](https://github.com/kkawabat/WhistleDetector) and the web interface for it can be found [here](https://github.com/kkawabat/portfolio/tree/main/app_whistle_detector).

The audio-to-whistle tone algorithm is relatively simplistic. We take the spectrogram of the audio take the frequencies with the highest energy then use a peak detection algorithm to determine the duration of the note to hold.