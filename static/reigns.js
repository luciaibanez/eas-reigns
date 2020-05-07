/* jshint esversion:6 */

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
var cvWidth = canvas.width;
var cvHeight = canvas.height;

var currentCardImage = new Image();
let sessionId = makeid(10);
currentCardImage.onload = () => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/move?data=' + sessionId, true); // true for asynchronous
    xmlHttp.send(null);
    requestAnimationFrame(animate);
};

let cards_data = [
    ["student", ["City needs you, swipe left or right to continue", ["Left", 0, 0, 0], ["Right...", 0, 0, 0]]],
    ["student", ["Swipe left or right to make a decision", ["Left", 0, 0, 0], ["Right...", 0, 0, 0]]],
    ["student", ["Don't let your points reach 0. Good luck!", ["Ok...", 0, 0, 0], ["Wait...", 0, 0, 0]]],
    ["work", ["Some guy is building a new architectures, where do you want to have it?", ["In the work place", -100, 0, 0], ["Outside the city", 50, -0, -50]]],
    ["work", ["Should we use steam engines to transport goods", ["No, keep having horses pull wagons", -25, 25, 0], ["Yes, let's move some merchandise", 50, -25, -50]]],
    ["worker", ["What should I take to go to work?", ["By car", -25, 25, 0], ["Walking", 0, 25, -50]]],
    ["mother", ["What should I buy my food?", ["In the supermarket", -50, -50, 50], ["Urban garden", 0, 0, 0]]],
    ["student", ["Should we have more library?", ["Yes, they might be for the students", -50, -25, 0], ["No I prefer to build malls", 25, 25, -50]]],
    ["muslim", ["Do you think that we should have spaces for women and others for men", ["Yes", 0, -25, 0], ["No", 100, 25, -50]]],
    ["worker", ["Guy named Gesner says he invented something called co-working spaces", ["We should listen to him!", 100, 50, -50], ["Ignore him", -25, -50, 0]]],
    ["work", ["People are stealing petrol for their own cars", ["That's crazy talk! Have them stop!", 0, -50, 25], ["I'm going to steal too!", 25, 50, -50]]],
    ["mother", ["Oil spills in lakes and rivers are killing fish", ["Start using ecological tranport", -50, -50, 100], ["Plenty of fish in the sea", 0, 0, -100]]],
    ["mother", ["Someone figured out how to improve our urban gardens!", ["Finally we can stop going to supermarkets!", 50, 50, -50], ["But I junk food", -25, -25, 50]]],
    ["muslim", ["Girl named Ruperta says he invented something called rest-cabins", ["Finally some good news!", 50, 50, 50], ["Finally some bad news!", 50, 50, 50]]],


let game_over = [
    "The citizens need help to take control of the situation and be more active in living the city life! We are succumbing by the technology of the city",
    "The city is not human-friendly!",
    "Men can no longer live in places of inequality or passivity, so now it’s your turn"
];

var year = -1;
function getNextCard() {
    year++;
    data = cards_data[year];
    currentCardImage.src = '/static/' + data[0] + '.png';
    return data[1];
}

var currentCard = getNextCard();

var stats = [250, 250, 250];
var show = [true, true, false];
var names = ['Wealth', 'Popularity', 'Environment'];
let symbolHeight = 0.1 * cvHeight;
var images = names.map((name) => {
    img = new Image();
    img.src = '/static/' + name + '.svg';
    return img;
});

let arrows = [new Image(), new Image()];
arrows[0].src = '/static/ArrowDown.svg';
arrows[1].src = '/static/ArrowUp.svg';

var dragOriginX = null;
var dragDeltaX = 0;
var stage = 0;

canvas.onmousedown = function(e) {
    dragOriginX = e.screenX;
    requestAnimationFrame(animate);
};
canvas.ontouchstart = canvas.onmousedown;
canvas.onmouseup = function(e) {
    dragOriginX = null;
    if (Math.abs(stage) >= 0.9) {
        updateState();
    }
    dragDeltaX = 0;
    stage = 0;
    requestAnimationFrame(animate);
};
canvas.ontouchend = canvas.onmouseup;
canvas.onmousemove = function(e) {
    if (dragOriginX != null) {
        dragDeltaX = dragOriginX - e.screenX;
        stage = Math.min(Math.max(dragDeltaX/100, -1), 1);
        requestAnimationFrame(animate);
    }
};
canvas.ontouchmove = canvas.onmousemove;

var gameOver = false;
function updateState() {
    let idx = stage > 0 ? 1 : 2;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/move?data=' + stats + ',' + year + ',' + idx, true); // true for asynchronous
    xmlHttp.send(null);
    if (gameOver) {
        gameOver = false;
        show[idx] = true;
        stats = [250, 250, 250];
        year = 1;
    } else {
        for (var i = 0; i < stats.length; i++) {
            stats[i] += currentCard[idx][1 + i];
            if (stats[i] <= 0) {
                gameOver = true;
                currentCard = [game_over[i], ["Start over", 0, 0, 0], ["Start over with environment info", 0, 0, 0]];
                return;
            }
        }
        if (year == 16) {
            show[2] = true;
        }
        if (year == 22) {
            if (idx == 1) {
                window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScnW8aQZJfeSjLCsGHoK97TqshFx8GGdkfU535_7BrdspiEjA/viewform?usp=pp_url&entry.1285145035=' + sessionId;
            }
            gameOver = true;
            updateState();
            return;
        }
    }
    currentCard = getNextCard();
}

function drawStroked(text, x, y, alpha, centered=true) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(alpha)})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.abs(alpha)})`;
    ctx.font = "30px Sans-serif";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    function w(t) { return ctx.measureText(t).width; }
    function draw(t, yy) {
        width = w(t);
        var tx = x;
        if (centered) tx -= width / 2;
        ctx.strokeText(t, tx, yy);
        ctx.fillText(t, tx, yy);
    }

    let words = text.split(' ');
    var b = 0;
    for (var i = 1; i <= words.length; i++) {
        let tw = w(words.slice(b, i).join(' '));
        if (tw >= cvWidth - 20) {
            draw(words.slice(b, i - 1).join(' '), y);
            b = i - 1;
            y += 30;
        }
    }
    draw(words.slice(b).join(' '), y);
}

function symbolWithFill(symbol, x, y, fill) {
    charSize = cvHeight*0.1;
    ctx.fillStyle = "white";
    ctx.fillText(symbol, x, y);
    ctx.fillStyle = "brown";
    ctx.fillRect(x, y - charSize, charSize, charSize * fill);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5";
    ctx.fillText(symbol, x, y);
}

function drawImage(image, x, y, w, h) {
    x -= w/2;
    y -= h/2;
    ctx.drawImage(image, x, y, w, h);
}

function fillRect(x, y, w, h) {
    x -= w/2;
    y -= h/2;
    ctx.fillRect(x, y, w, h);
}

function drawHeader(action) {
    ctx.save();

    function drawShapes() {
        for (var i = 0; i < images.length; i++) {
            if (show[i]) {
                var x = cvWidth * 0.25 * (i + 1);
                var y = cvHeight * 0.15;
                drawImage(images[i], x, y, symbolHeight, symbolHeight);
            }
        }
    }

    ctx.fillStyle = "brown";
    ctx.fillRect(0, 0, cvWidth, cvHeight * 0.2);

    drawShapes();

    for (var i = 0; i < images.length; i++) {
        if (show[i]) {
            var x = cvWidth * 0.25 * (i + 1);
            var y = cvHeight * 0.15;
            var w = symbolHeight;
            var h = symbolHeight * (1 - stats[i] / 500);
            y -= (symbolHeight - h) / 2;
            fillRect(x, y, w, h);
            let modifier = action[i + 1];
            w = h = Math.abs(modifier) * 1.5;
            y = cvHeight * 0.05;
            arrow = arrows[modifier < 0 ? 0 : 1];
            ctx.globalAlpha = Math.abs(stage);
            drawImage(arrow, x, y, w, h);
            ctx.globalAlpha = 1;
        }
    }

    ctx.globalAlpha = 0.5;
    drawShapes();

    ctx.restore();
}

function drawFooter() {
    ctx.fillStyle = "brown";
    ctx.fillRect(0, cvHeight * 0.9, cvWidth, cvHeight * 0.1);
    drawStroked(`Year: ${1800+year*10}s`, 10, cvHeight * 0.98, 1, false);
}

function animate() {
    ctx.clearRect(0, 0, cvWidth, cvHeight);
    let x = (cvWidth - currentCardImage.width)/2;
    let y = cvHeight - currentCardImage.height;
    var mod = 0;
    if (Math.abs(stage) >= 0.9) {
        mod = (Math.abs(stage) - 0.9) * 200;
    }
    ctx.drawImage(currentCardImage, x - stage * 40, y - mod);
    let tx = cvWidth / 2;
    let ty = 0.7 * cvHeight;
    let ti = stage > 0 ? 1 : 2;
    let action = currentCard[ti];
    drawStroked(action[0], tx, ty, stage);
    drawHeader(action);
    drawStroked(currentCard[0], tx, cvHeight * 0.3, 1);
    drawFooter();
}

// taken from https://stackoverflow.com/a/1349426/1348374
function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
