// GROUP MB-C
// color C3, neopixel N3
// radio to MB-B

// PINOUT
let PIN_NEOPIXEL = DigitalPin.P0;

// INIT
radio.setGroup(8);
led.enable(false);
apds9960.Init(11.12)
apds9960.ColorMode()
let NUM_LEDS = 8;
let strip = neopixel.create(PIN_NEOPIXEL, NUM_LEDS, NeoPixelMode.RGB);

// COLORS
let COL_BLUE = 216;
let COL_PINK = -14;
let COL_GREEN = 150;
let COL_ORANGE = 0;
let COL_YELLOW = 20;
let COL_NO_COLOR = 60;
let COL_EMPTY = -1000;
let ERROR = 10;
let LIGHT_TRESHOLD = 300;
let ARR_COL = [COL_BLUE, COL_PINK, COL_GREEN, COL_YELLOW];

// VARIABLES
let colorCorrect = COL_EMPTY;
let colorMeasured = COL_NO_COLOR;
let colorNeopixel = 0;
let ambientMeasured = 0;
let isCorrect = false;

let RADIO_RESET = 1;
let RADIO_CLOSE = 2;
let RADIO_GET_COLOR = "getColor";

// INTERRUPT
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber === RADIO_RESET) {
        resetState();
    }
})

radio.onReceivedValue(function(name: string, value: number) {
    if(name === RADIO_GET_COLOR){
        colorCorrect = value;
    }
})

// MAIN
basic.forever(function () {
    if (apds9960.Data_Ready()) {
        colorMeasured = apds9960.ReadColor();
        strip.showColor(colorNeopixel);
    } else {
        //
    }
    if (ambientMeasured <= LIGHT_TRESHOLD) {
        colorNeopixel = neopixel.rgb(0, 0, 0);
    } else {
        // neopixel
        if (colorMeasured <= COL_GREEN + ERROR && colorMeasured >= COL_GREEN - ERROR) {
            colorNeopixel = neopixel.rgb(28, 238, 0);
        } else if (colorMeasured <= COL_BLUE + ERROR && colorMeasured >= COL_BLUE - ERROR) {
            colorNeopixel = neopixel.rgb(0, 203, 255);
        } else if (colorMeasured <= COL_ORANGE + ERROR && colorMeasured >= COL_ORANGE - ERROR) {
            colorNeopixel = neopixel.rgb(255, 34, 0);
        } else if (colorMeasured <= COL_YELLOW + ERROR && colorMeasured >= COL_YELLOW - ERROR) {
            colorNeopixel = neopixel.rgb(255, 130, 0);
        } else if (colorMeasured <= COL_PINK + ERROR && colorMeasured >= COL_PINK - ERROR) {
            colorNeopixel = neopixel.rgb(255, 0, 59);
        } else {
            colorNeopixel = neopixel.rgb(0, 0, 0);
        }
        // check if correct
        if (colorMeasured <= colorCorrect + ERROR && colorMeasured >= colorCorrect - ERROR){
            isCorrect = true;
        } else {
            isCorrect = false;
        }
    }
    strip.showColor(colorNeopixel);
    pause(100);
})

basic.forever(function() {
    if (isCorrect){
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