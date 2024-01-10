// GROUP MB-C
// color C3, neopixel N3
// radio from MB-A
// radio to MB-B

// LAST UPDATE 01/10/24

// PINOUT
let PIN_NEOPIXEL = DigitalPin.P1;

//////////////////////////////////////////////
//// BEGIN ULTRASONIC

// PINOUT
let PIN_US_NEOPIXEL = DigitalPin.P1;
let PIN_US_TRIG = DigitalPin.P8;
let PIN_US_ECHO = DigitalPin.P9;

// NEOPIXEL
let NUM_US_LEDS = 20;
let strip_US = neopixel.create(PIN_US_NEOPIXEL, NUM_US_LEDS, NeoPixelMode.RGB);

// CONSTANTS
let COLOR_US = NeoPixelColors.Red;
let DIST_US_LIM = 400
let DIST_US_MAX = 70;
let DIST_US_MIN = 25;
let distanceMeasured = 0;
let distanceFiltered = 0;
let leds = 0;
let alpha = 0.3;

//// END ULTRASONIC
//////////////////////////////////////////////

// INIT
radio.setGroup(9);
basic.showString("C");
apds9960.Init(11.12);
apds9960.ColorMode();
let NUM_LEDS = 8;
let strip = neopixel.create(PIN_NEOPIXEL, NUM_LEDS, NeoPixelMode.RGB);

// COLORS
let COL_WHITE = 256;
let COL_BLUE = 216;
let COL_GREEN = 150;
let COL_YELLOW = 20;
// let COL_ORANGE = 0;
let COL_PINK = -14;
let COL_NO_COLOR = 60;
let COL_EMPTY = -1000;
let ARR_COL = [COL_BLUE, COL_GREEN, COL_YELLOW, COL_PINK];
let NUM_COLORS = ARR_COL.length;
let ERROR = 20;
let LIGHT_TRESHOLD = 1000;

// NEOPIXEL COLORS
let NEO_BLUE = neopixel.rgb(0, 203, 255);
let NEO_GREEN = neopixel.rgb(28, 238, 0);
let NEO_YELLOW = neopixel.rgb(255, 130, 0);
let NEO_PINK = neopixel.rgb(255, 0, 59);
let NEO_ORANGE = neopixel.rgb(255, 34, 0);

// VARIABLES
let colorCorrect = COL_EMPTY;
let colorMeasured = COL_NO_COLOR;
let colorNeopixel = 0;
let ambientMeasured = 0;
let isCorrect = false;

let RADIO_RESET = 1;
let RADIO_CLOSE = 2;
let RADIO_COLOR_NAME = "COLOR3";

// INTERRUPT
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber === RADIO_RESET) {
        resetState();
    }
})

radio.onReceivedValue(function(name: string, value: number) {
    if(name === RADIO_COLOR_NAME){
        colorCorrect = value;
    }
})

// MAIN
basic.forever(function () {
    if (apds9960.Data_Ready()) {
        colorMeasured = apds9960.ReadColor();
        ambientMeasured = apds9960.Read_Ambient();
    }
    if (ambientMeasured <= LIGHT_TRESHOLD) {
        colorNeopixel = NeoPixelColors.White;
        isCorrect = false;
    } else {
        // check if correct
        if (colorMeasured <= colorCorrect + ERROR && colorMeasured >= colorCorrect - ERROR) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
        // neopixel
        if (colorMeasured <= COL_GREEN + ERROR && colorMeasured >= COL_GREEN - ERROR) {
            colorNeopixel = NEO_GREEN;
        } else if (colorMeasured <= COL_BLUE + ERROR && colorMeasured >= COL_BLUE - ERROR) {
            colorNeopixel = NEO_BLUE;
        } else if (colorMeasured <= COL_YELLOW + ERROR && colorMeasured >= COL_YELLOW - ERROR) {
            colorNeopixel = NEO_YELLOW;
        } else if (colorMeasured <= COL_PINK + ERROR && colorMeasured >= COL_PINK - ERROR) {
            colorNeopixel = NEO_PINK;
        } else {
            colorNeopixel = NeoPixelColors.White;
        }
    }
    strip.showColor(colorNeopixel);
    pause(100);
})

basic.forever(function () {
    if (isCorrect) {
        radio.sendValue("C3", 1);
    } else {
        radio.sendValue("C3", 0);
    }
    pause(123);
})

// FUNCTIONS
function resetState() {
    //
}

//////////////////////////////////////////////
//// BEGIN ULTRASONIC

// get distance and num of leds
basic.forever(function () {
    distanceMeasured = sonar.ping(PIN_US_TRIG, PIN_US_ECHO, PingUnit.Centimeters, DIST_US_LIM);
    distanceFiltered = alpha*distanceMeasured + (1 - alpha)*distanceFiltered;
    leds = Math.floor(Math.map(distanceFiltered, DIST_US_MIN, DIST_US_MAX, 0, NUM_US_LEDS));
})

// turn on num of leds
basic.forever(function () {
    for (let i = 0; i < NUM_US_LEDS; i++) {
        if (i < leds) {
            strip_US.setPixelColor(i, COLOR_US);
        } else {
            strip_US.setPixelColor(i, NeoPixelColors.Black);
        }
    }
    strip_US.show()
})

//// END ULTRASONIC
//////////////////////////////////////////////