var canvas;
var size;
var context;
var plateau;
var nbImgChargees = 0;
var img = [];
var selection = false;
const PION = 0;
const TOUR = 4;

function chargeImages() {
    var i = 0;
    img[i] = new Image();
    img[i].onload = onImgLoad;
    img[i++].src = "images/pion_noir2.svg";
    img[i] = new Image();
    img[i].onload = onImgLoad;
    img[i++].src = "images/pion_blanc2.svg";
    img[i] = new Image();
    img[i].onload = onImgLoad;
    img[i++].src = "images/viseur_noir.svg";
    img[i] = new Image();
    img[i].onload = onImgLoad;
    img[i++].src = "images/viseur_blanc.svg";
}

function onImgLoad() {
    nbImgChargees++;
    if (nbImgChargees == 4) {
        initialise();
        drawBoard(size, plateau);
    }
}

function drawCase(Case) {
    if (Case.noir) {
        context.fillStyle = 'black';
    } else {
        context.fillStyle = 'white';
    }
    context.fillRect(Case.c * size, Case.r * size, size, size);
    if (Case.piece != 0) drawPiece(Case.piece, Case.r, Case.c)
}

function drawBoard(size, plateau) {
    var nbSquares = 8;
    for (var r = 0; r < nbSquares; r += 1) {
        for (var c = 0; c < nbSquares; c += 1) drawCase(plateau[r][c]);
    }
}

function showMessage(message) {
    var messageBlock = document.getElementById("message");
    messageBlock.innerText = message;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getPointedSquare(canvas, evt) {
    var mousePos = getMousePos(canvas, evt);
    mousePos.x = Math.floor(mousePos.x /size);
    mousePos.y = Math.floor(mousePos.y / size);
    return mousePos;
}

function onClick(evt) {
    console.log("onClick");
    var mousePos = getPointedSquare(canvas, evt);
    var message;
    if (selection) {
        plateau[mousePos.y][mousePos.x].piece = selection.piece;
        selection.piece = 0;
        drawCase(selection);
        drawCase(plateau[mousePos.y][mousePos.x]);
        selection = false;
        message = "Sélectionne une pièce";
    } else {
        selection = plateau[mousePos.y][mousePos.x];
        drawSelection(mousePos.y,  mousePos.x);
        message = "Sélectionne la destination";
    }
    showMessage(message);
}

function drawPiece(p, r, c) {
    if (p.noir) id = 0;
    else id = 1;
    context.drawImage(img[id], c * size, r * size, size * 0.95, size * 0.95);
}

function drawSelection(r, c) {
    if (plateau[r][c].noir) id = 3;
    else id = 2;
    context.drawImage(img[id], c * size, r * size, size * 0.95, size * 0.95);
}

function Case(r, c, noir) {
    this.r = r;
    this.c = c;
    this.noir = noir;
    this.piece = 0;
}

function Piece(type, noir) {
    this.type = type;
    this.noir = noir;
}

function initPlateau() {
    var plateau = new Array();
    var currentNoir = true;
    for (var r = 0; r < 8; r++) {
        plateau[r] = new Array();
        for (var c = 0; c < 8; c++) {
            plateau[r][c] = new Case(r, c, currentNoir);
            currentNoir = !currentNoir;
        }
        currentNoir = !currentNoir;
    }
    for (var c = 0; c < 8; c++) {
        plateau[1][c].piece = new Piece(PION, true);
        plateau[6][c].piece = new Piece(PION, false);
    }
    //plateau[0][0].piece = new Piece(TOUR, true);
    return plateau;
}

function initialise() {
    canvas = document.getElementById('myCanvas');
    var rect = canvas.getBoundingClientRect();
    size = Math.floor(rect.width / 8);
    context = canvas.getContext('2d');
    plateau = initPlateau();
    canvas.addEventListener('click', onClick, false);
}

chargeImages();
