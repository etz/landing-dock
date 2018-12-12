// animate.js for jk.la
// KoanHost / Nine @ mc-market.org
// Copyright 2016, All rights reserved

var songs = 59;
var source = "songs.json";
var AudioAnalyser;
var globalAmp = 0;

// helper functions
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function getAvg(arr) {
    if (arr.length == 0) return 0;
    return arr.reduce(function (p, c) {
        return p + c;
    }) / arr.length;
}
function rand(minValue,maxValue,precision){
    if(typeof(precision) == 'undefined'){
        precision = 4;
    }
    return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
}
// simple moving average, rosettacode
function SMA(period) {
    var nums = [];
    return function(num) {
        nums.push(num);
        if (nums.length > period)
            nums.splice(0,1);  // remove the first element of the array
        var sum = 0;
        for (var i in nums)
            sum += nums[i];
        var n = period;
        if (nums.length < period)
            n = nums.length;
        return(sum/n);
    }
}

function get(url){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", url, false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

// audio eq processor
AudioAnalyser = (function() {
    AudioAnalyser.AudioContext = self.AudioContext || self.webkitAudioContext;
    AudioAnalyser.enabled = AudioAnalyser.AudioContext != null;

    function AudioAnalyser(audio, numBands, smoothing) {
        var src;
        this.audio = audio != null ? audio : new Audio();
        this.numBands = numBands != null ? numBands : 256;
        this.smoothing = smoothing != null ? smoothing : 0.3;
        if (typeof this.audio === 'string') {
            src = this.audio;
            this.audio = new Audio();
            this.audio.crossOrigin = "anonymous";
            this.audio.controls = true;
            this.audio.src = src;
            var audio = this.audio;
            this.audio.addEventListener('ended', function() {
                audio.currentTime = 0;
                audio.src = getSong();
                audio.play();
            }, false);
        }
        this.context = new AudioAnalyser.AudioContext();
        this.jsNode = this.context.createScriptProcessor(2048, 1, 1);
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.analyser.fftSize = this.numBands * 2;
        this.bands = new Uint8Array(this.analyser.frequencyBinCount);
        this.audio.addEventListener('canplay', (function(_this) {
            return function() {
                _this.source = _this.context.createMediaElementSource(_this.audio);
                _this.source.connect(_this.analyser);
                _this.analyser.connect(_this.jsNode);
                _this.jsNode.connect(_this.context.destination);
                _this.source.connect(_this.context.destination);
                return _this.jsNode.onaudioprocess = function() {
                    _this.analyser.getByteFrequencyData(_this.bands);
                    if (!_this.audio.paused) {
                      return typeof _this.onUpdate === "function" ? _this.onUpdate(_this.bands) : void 0;
                    }
                };
            };
        })(this));
    }

    AudioAnalyser.prototype.start = function() {
        return this.audio.play();
    };

    AudioAnalyser.prototype.stop = function() {
        return this.audio.pause();
    };

    return AudioAnalyser;
})();

function startMarquee() {
    
    var menuItemWidth = $(this).width();
    var listItemWidth = $(this).parent().width();
    
    if(menuItemWidth > listItemWidth) {
        var scrollDistance = menuItemWidth - listItemWidth;
        var listItem = $(this).parent();
        // Stop any current animation
        listItem.stop();
        
        // Start animating the left scroll position over 3 seconds, using a smooth linear motion
        listItem.animate({scrollLeft: scrollDistance}, 3000, 'linear');
    }
}

function stopMarquee() {
    var listItem = $(this).parent();
    
    // Stop any current animation
    listItem.stop();
    
    // Start animating the left scroll position quickly, with a bit of a swing to the animation.
    // This will make the item seem to 'whip' back to it's starting point
    listItem.animate({scrollLeft: 0}, 'medium', 'swing');
}

// hover() calls the first function when mousing over the element, and the second function when mousing out of it
$('.marquee').hover(startMarquee, stopMarquee);

var music;
music = JSON.parse(get(source));

function getSong(id) {
    if (id == null) {
        id = Math.floor(Math.random() * music.length);
    }
    var song = music[id];
    document.getElementById('artist').innerHTML = song.artist;
    document.getElementById('song').innerHTML = song.title;
    if (song.art.length > 20) {
        document.getElementById('art').style.backgroundImage = 'url('+song.art+')';
    }
    else {
        document.getElementById('art').style.backgroundImage = 'url(disk.png)';
    }
    window.location.hash = "song-" + id;
    return song.path;
}

// build the eq div elements
var e = document.getElementById('draw');
for (var i = 0; i < 16; i++) {
    e.innerHTML = e.innerHTML + '<div class="bar" id="bar'+i+'"></div>'
};




var song;

if (window.location.hash) {
    song = getSong(window.location.hash.substring(6));
}
else {
    song = getSong();
}



var vSMA = SMA(16);
var vLast = 0;
var vInt = 0;
var aa = new AudioAnalyser(song, 16, 0);
aa.onUpdate = (function(_this) {
    return function(bands) {

        // generate the simple 16 band EQ
        for (i = 0, len = bands.length; i < len; i++) {
            document.getElementById('bar'+i).style.left = i * (265 / 16) + 'px';
            document.getElementById('bar'+i).style.height = (bands[i]).map(0, 255, 0, 32) + 'px';
        }

        // loop over the last few bands for the text glitch transforms
        var aHigh = 0;
        var aLow = 256;
        var lowBand = 0;
        for (k = 12, len = bands.length; k < len; k++) {
            if (bands[k] > aHigh) aHigh = bands[k]; 
            if (bands[k] < aLow && bands[k] != 0) aLow = bands[k]; lowBand = k;
        }
        aLow = aLow/4;
        aHigh = aHigh/4;

        // clamp values to sane ranges
        if (aLow < 64) {
            document.getElementById('glitchAfter').style.clip = 'rect('+aLow+'px, 9999px, '+aHigh.map(0, 115, 0, 255)+'px, 0)';
        }
        else {
            document.getElementById('glitchAfter').style.clip = 'rect(0, 9999px, 0, 0)';
        }
        if (aHigh > 0) {
            document.getElementById('glitchBefore').style.clip = 'rect('+ (aHigh-lowBand).map(0, 115, 0, 255) +'px, 9999px, '+ aLow+lowBand +'px, 0)';
        }
        else {
            document.getElementById('glitchBefore').style.clip = 'rect(0, 9999px, 0, 0)';
        }

        var avg = getAvg(bands);

        vLast = vInt;
        vInt = vSMA(avg);
        if (vInt > vLast) {
            globalAmp = 0.5;
        }
        else {
            globalAmp = 0;
        }

        return;
    };
})(this);
aa.start();

var element = document.getElementById("canvas");

function Connected(e) {
    this.element = e;
    this.canvas = e.getContext("2d");
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.element.width = window.innerWidth;
    this.element.height = window.innerHeight;
    this.mouse = {
        x: 0,
        y: 0
    };
    this.dots = [];
}

Connected.prototype.setDots = function(dots) {
    for (var i = 0; i < dots; i++) {
        this.dots.push({
            x: rand(10, this.width-10),
            y: rand(10, this.height-10),
            t: rand(0, Math.PI * 2),
            vx: 1,
            vy: 1
        });
    };
};

Connected.prototype.drawDot = function(dot) {
    this.canvas.beginPath();
    this.canvas.arc(dot.x, dot.y, 3, 0, 2 * Math.PI, false);
    this.canvas.fillStyle = 'rgba(170,170,170,' + globalAmp + ')';
    this.canvas.fill();

    // move the dot
    dot.x += 1 * Math.cos(dot.t);
    dot.y += 1 * Math.sin(dot.t);

    if (dot.x < 0 || dot.x > this.width) {
        dot.t = Math.PI - dot.t;
    }
    else if (dot.y < 0 || dot.y > this.height) {
        dot.t = Math.PI * 2 - dot.t;
    }
};

Connected.prototype.connectDot = function(ref, dot, max) {
    var dist = Math.sqrt( Math.pow(ref.x-dot.x, 2) + Math.pow(ref.y-dot.y, 2) );
    if (dist <= max) {
        this.canvas.beginPath();
        this.canvas.moveTo(dot.x+1, dot.y);
        this.canvas.lineTo(ref.x+1, ref.y);
        this.canvas.strokeStyle = 'rgba(170,170,170,' + globalAmp / 2 + ')';
        this.canvas.lineWidth = 1;
        this.canvas.stroke();
    };
};

Connected.prototype.clearCanvas = function() {
    this.width  = this.element.width;
    this.height = this.element.height;
    this.canvas.width  = this.element.width;
    this.canvas.height = this.element.height;
    this.canvas.clearRect(0, 0, canvas.width, canvas.height);
};

Connected.prototype.animate = function(distance) {
    this.clearCanvas();

    for (var i = 0; i < this.dots.length; i++) {
        this.drawDot(this.dots[i]);
        this.connectDot(this.mouse, this.dots[i], this.distance);
    };
    for (var i = 0; i < this.dots.length; i++) {
        for (var j = 0; j < this.dots.length; j++) {
            this.connectDot(this.dots[i], this.dots[j], this.distance);
        };
    };
    requestAnimationFrame(this.animate.bind(this));
};

Connected.prototype.init = function(dots, distance) {
    var self = this;
    this.distance = distance;
    window.addEventListener("mousemove", function(e){
    self.mouse.x = e.clientX + 4 + document.body.scrollLeft;
    self.mouse.y = e.clientY + document.body.scrollTop;
});

var dynDots = Math.floor((window.innerHeight * window.innerHeight) / 4000);
    this.setDots( ( dynDots > 20 && dynDots < 100 ) ? dynDots : (  dynDots < 20  ?  20 : (  dynDots > 100 ? 100 : dynDots )  )  );
    requestAnimationFrame(this.animate.bind(this));
}

var animated = new Connected(element);
animated.init(100, 200);