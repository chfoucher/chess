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
const ROI = 3;
const FOU = 4;
const CHEVAL = 5;
const REINE = 6;
let imageCount = 0;

function chargeImage(fileName) {
    img[imageCount] = new Image();
    img[imageCount].onload = onImgLoad;
    img[imageCount++].src = "images/" + fileName;
}

function chargeImages() {
    chargeImage("viseur_noir.svg");
    chargeImage("viseur_blanc.svg");
    chargeImage("Chess_pdt45.svg");
    chargeImage("Chess_plt45.svg");
    chargeImage("Chess_rdt45.svg");
    chargeImage("Chess_rlt45.svg");
    chargeImage("Chess_kdt45.svg");
    chargeImage("Chess_klt45.svg");
    chargeImage("Chess_bdt45.svg");
    chargeImage("Chess_blt45.svg");
    chargeImage("Chess_ndt45.svg");
    chargeImage("Chess_nlt45.svg");
    chargeImage("Chess_qdt45.svg");
    chargeImage("Chess_qlt45.svg");
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
        context.fillStyle = 'grey';
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
    const mousePos = getMousePos(canvas, evt);
    return {c: Math.floor(mousePos.x /size), r:Math.floor(mousePos.y / size)};
}

function onClick(evt) {
    const destination = getPointedSquare(canvas, evt);
    if (selection) {
        plateau[destination.r][destination.c].piece = selection.piece;
        drawCase(plateau[destination.r][destination.c]);
        if ((destination.c != selection.c) || (destination.r != selection.r)) {
            selection.piece = null;
            drawCase(selection);
        }
        selection = null;
        showMessage("Sélectionne une pièce");
    } else {
        const position = plateau[destination.r][destination.c]; 
        if (position.piece) {
            selection = position;
            drawSelection(destination.r,  destination.c);
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
    plateau[0][1].piece = new Piece(CHEVAL, true);
    plateau[0][2].piece = new Piece(FOU, true);
    plateau[0][3].piece = new Piece(REINE, true);
    plateau[0][4].piece = new Piece(ROI, true);
    plateau[0][5].piece = new Piece(FOU, true);
    plateau[0][6].piece = new Piece(CHEVAL, true);
    plateau[0][7].piece = new Piece(TOUR, true);
    plateau[7][0].piece = new Piece(TOUR, false);
    plateau[7][1].piece = new Piece(CHEVAL, false);
    plateau[7][2].piece = new Piece(FOU, false);
    plateau[7][3].piece = new Piece(REINE, false);
    plateau[7][4].piece = new Piece(ROI, false);
    plateau[7][5].piece = new Piece(FOU, false);
    plateau[7][6].piece = new Piece(CHEVAL, false);
    plateau[7][7].piece = new Piece(TOUR, false);
    return plateau;
}

function initialise() {
    canvas = document.getElementById('myCanvas');
    let length = window.innerHeight;
    if (length > window.innerWidth) length = window.innerWidth;
    length = 0.9 * length;
    canvas.width = length;
    canvas.height = length;
    var rect = canvas.getBoundingClientRect();
    size = Math.floor(rect.width / 8);
    context = canvas.getContext('2d');
    plateau = initPlateau();
    canvas.addEventListener('click', onClick, false);
}

chargeImages();
