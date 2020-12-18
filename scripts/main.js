var canvas;
var size;
var context;
var plateau;
var nbImgChargees = 0;
var img = [];
var selection = false;
const VISEUR = 0;
const PION = 1;
const TOUR = 2;
let imageCount = 0;

function chargeImage(fileName) {
    img[imageCount] = new Image();
    img[imageCount].onload = onImgLoad;
    img[imageCount++].src = "images/" + fileName;
}

function chargeImages() {
    chargeImage("viseur_noir.svg");
    chargeImage("viseur_blanc.svg");
    chargeImage("pion_noir2.svg");
    chargeImage("pion_blanc2.svg");
    chargeImage("tour_noir.svg");
    chargeImage("tour_blanc.svg");
}

function onImgLoad() {
    nbImgChargees++;
    if (nbImgChargees == imageCount) {
        initialise();
        drawBoard(size, plateau);
        showMessage("Sélectionne une pièce");
    }
}

function drawCase(Case) {
    if (Case.noir) {
        context.fillStyle = 'black';
    } else {
        context.fillStyle = 'white';
    }
    context.fillRect(Case.c * size, Case.r * size, size, size);
    if (Case.piece) drawPiece(Case.piece, Case.r, Case.c)
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
    var mousePos = getPointedSquare(canvas, evt);
    var message;
    if (selection) {
        plateau[mousePos.y][mousePos.x].piece = selection.piece;
        selection.piece = null;
        drawCase(selection);
        drawCase(plateau[mousePos.y][mousePos.x]);
        selection = null;
        showMessage("Sélectionne une pièce");
    } else {
        const position = plateau[mousePos.y][mousePos.x]; 
        if (position.piece) {
            selection = position;
            drawSelection(mousePos.y,  mousePos.x);
            showMessage("Sélectionne la destination");
        }
    }
}

function drawPiece(p, r, c) {
    if (p.noir) id = 2 * p.type;
    else id = 2 * p.type + 1;
    context.drawImage(img[id], c * size, r * size, size * 0.95, size * 0.95);
}

function drawSelection(r, c) {
    if (plateau[r][c].noir) id = 2 * VISEUR + 1;
    else id = 2 * VISEUR;
    context.drawImage(img[id], c * size, r * size, size * 0.95, size * 0.95);
}

function Case(r, c, noir) {
    this.r = r;
    this.c = c;
    this.noir = noir;
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
    plateau[0][0].piece = new Piece(TOUR, true);
    plateau[0][7].piece = new Piece(TOUR, true);
    plateau[7][0].piece = new Piece(TOUR, false);
    plateau[7][7].piece = new Piece(TOUR, false);
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
