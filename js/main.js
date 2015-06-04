var FREQUENCY = 440;
var PI2 = 2 * Math.PI;
var filterBuffer1 = 0.0;
var filterBuffer2 = 0.0;

function main(){
    console.log("Im ready!");
    $('#volumeSlider').bootstrapSlider({
	       formatter: function(value) {
		             return value*100 + "%";
	                }
    });
    $('#cutoffSlider').bootstrapSlider({
	       formatter: function(value) {
		             return value;
	                }
    });
    $('#distortionSlider').bootstrapSlider({
	       formatter: function(value) {
		             return "Threshold " + value;
	                }
    });

    $('.dropdown-menu li > a').click(function(e){
        $('.btnWaveForm').text(this.innerHTML);
    });

    $('#play').mousedown(play);
    $('#play').mouseup(stop);

}

function play(){
    var waveForm = getWaveFormType();
    var volume = getVolume();
    var cutoff = getCutoff();
    var threshold = getDistortionValue();
    if (!Pico.isPlaying) checkAndPlayWave(waveForm, volume, cutoff, threshold);
}

function getVolume(){
    return $('#volumeSlider').bootstrapSlider().bootstrapSlider('getValue');
}

function checkAndPlayWave(waveForm, volume, cutoff, threshold) {
    if(waveForm == "Sine"){
        Pico.play(playSineWave(FREQUENCY, volume, cutoff, threshold));
    } else if (waveForm == "Square") {
        Pico.play(playSquareWave(FREQUENCY, volume, cutoff, threshold));
    } else if (waveForm == "Sawtooth") {
        Pico.play(playSawtoothWave(FREQUENCY, volume, cutoff, threshold));
    } else if (waveForm == "Triangle") {
        Pico.play(playTriangleWave(FREQUENCY, volume, cutoff, threshold));
    }
}

function playSineWave(freq, volume, cutoff, threshold) {
    var phase = 0;
    var phaseIncr = freq * PI2 / Pico.sampleRate;

    return function(e) {
        var out = e.buffers;
        for (var i = 0; i < e.bufferSize; i++) {
            var output = Math.sin(phase);
            out[0][i] = out[1][i] = process(output, cutoff, threshold) * volume;
            phase += phaseIncr;
            while (phase >= PI2) {
                phase -= PI2;
            }
        }
    };
}

function playSquareWave(freq, volume, cutoff, threshold) {
    var phase = 0;
    var phaseIncr = freq * PI2 / Pico.sampleRate;

    return function(e) {
        var out = e.buffers;
        for (var i = 0; i < e.bufferSize; i++) {
            var output;
            if(phase <= Math.PI){
                output =  1.0;
            }
            else {
                output = -1.0;
            }
            out[0][i] = out[1][i] = process(output, cutoff, threshold) * volume;
            phase += phaseIncr;
            while (phase >= PI2) {
                phase -= PI2;
            }
        }
    };
}

function playSawtoothWave(freq, volume, cutoff, threshold) {
    var phase = 0;
    var phaseIncr = freq * PI2 / Pico.sampleRate;

    return function(e) {
        var out = e.buffers;
        for (var i = 0; i < e.bufferSize; i++) {
            var output =  1.0 - (2.0 * phase / PI2);
            out[0][i] = out[1][i] = process(output, cutoff, threshold) * volume;
            phase += phaseIncr;
            while (phase >= PI2) {
                phase -= PI2;
            }
        }
    };
}

function playTriangleWave(freq, volume, cutoff, threshold) {
    var phase = 0;
    var phaseIncr = freq * PI2 / Pico.sampleRate;

    return function(e) {
        var out = e.buffers;
        for (var i = 0; i < e.bufferSize; i++) {
            var value = 1.0 - (2.0 * phase / PI2);
            var output = 2.0 * (Math.abs(value) - 0.5);
            out[0][i] = out[1][i] = process(output, cutoff, threshold) * volume;
            phase += phaseIncr;
            while (phase >= PI2) {
                phase -= PI2;
            }
        }
    };
}

function process(value, cutoff, threshold) {
    return filter(distort(value, threshold), cutoff);
}

function distort(value, threshold) {
    var output;
    if (value >= 0) output = Math.min(value, threshold);
    else output = Math.max(value, -threshold);
    return output / threshold;
}

function filter(value, cutoff) {
    filterBuffer1 += cutoff * (value - filterBuffer1);
    filterBuffer2 += cutoff * (filterBuffer1 - filterBuffer2);
    return filterBuffer2;
}

function stop(){
    Pico.pause();
}

function getDistortionValue() {
    return $('#distortionSlider').bootstrapSlider().bootstrapSlider('getValue');
}

function getWaveFormType(){
    return $('.btnWaveForm').text();
}

function getCutoff() {
    return $('#cutoffSlider').bootstrapSlider().bootstrapSlider('getValue');
}
