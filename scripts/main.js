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
let leBlancJoue = true;
historique = [];

function chargeImage(fileName) {
    img[imageCount] = new Image();
    img[imageCount].onload = onImgLoad;
    img[imageCount++].src = "images/" + fileName;
}

function chargeImages() {
    const nomFichiers = [
        "viseur_noir.svg", "viseur_blanc.svg", "Chess_pdt45.svg",
        "Chess_plt45.svg", "Chess_rdt45.svg", "Chess_rlt45.svg",
        "Chess_kdt45.svg", "Chess_klt45.svg", "Chess_bdt45.svg",
        "Chess_blt45.svg", "Chess_ndt45.svg", "Chess_nlt45.svg",
        "Chess_qdt45.svg", "Chess_qlt45.svg"
    ];
    for (nom of nomFichiers) chargeImage(nom);
}

function initPartie() {
    historique = [];
    plateau = initPlateau();
    drawBoard(size, plateau);
    leBlancJoue = true;
    showStatus();
    document.getElementById("btnAnnule").disabled = true;
}

function onImgLoad() {
    nbImgChargees++;
    if (nbImgChargees == imageCount) {
        canvas.addEventListener('click', onClick, false);
        initPartie();
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

function showStatus() {
    if (selection) {
        showMessage("Sélectionne la destination");
    } else {
        const joueur = leBlancJoue?"blancs":"noirs";
        showMessage(`Aux ${joueur} de jouer`);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function onClick(evt) {
    const mousePos = getMousePos(canvas, evt);
    const c = Math.floor(mousePos.x /size);
    const r = Math.floor(mousePos.y / size);
    const caseChoisie = plateau[r][c];
    if (selection) {
        if (caseChoisie != selection) {
            historique.push({
                source: {r: selection.r, c:selection.c, piece: selection.piece},
                destination: {r: caseChoisie.r, c: caseChoisie.c, piece: caseChoisie.piece}
            });
            document.getElementById("btnAnnule").disabled = false; 
            caseChoisie.piece = selection.piece;
            drawCase(caseChoisie);
            selection.piece = null;
            leBlancJoue = !leBlancJoue;
        }
        drawCase(selection);
        selection = null;
    } else {
        if (caseChoisie.piece && (leBlancJoue === !caseChoisie.piece.noir)) {
            selection = caseChoisie;
            drawSelection(r, c);
        }
    }
    showStatus();
}

function onAnnule() {
    const mouvement = historique.pop();
    plateau[mouvement.source.r][mouvement.source.c].piece = mouvement.source.piece;
    drawCase(plateau[mouvement.source.r][mouvement.source.c]);
    plateau[mouvement.destination.r][mouvement.destination.c].piece = mouvement.destination.piece;
    drawCase(plateau[mouvement.destination.r][mouvement.destination.c]);
    leBlancJoue = !leBlancJoue;
    showStatus();
    if (historique.length === 0) document.getElementById("btnAnnule").disabled = true;
}

function onNouveau() {
    initPartie();
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
    const agencement = [TOUR, CHEVAL, FOU, REINE, ROI, FOU, CHEVAL, TOUR];
    for (var c = 0; c < 8; c++) {
        plateau[0][c].piece = new Piece(agencement[c], true);
        plateau[1][c].piece = new Piece(PION, true);
        plateau[6][c].piece = new Piece(PION, false);
        plateau[7][c].piece = new Piece(agencement[c], false);
    }
    return plateau;
}

function enregistreHistorique() {
    const xhr = new XMLHttpRequest();

    // listen for `load` event
    xhr.onload = () => {
        // print JSON response
        if (xhr.status >= 200 && xhr.status < 300) {
            // parse JSON
            const response = JSON.parse(xhr.responseText);
            console.log(response);
        }
    };
    
    // create a JSON object
    const json = {
        "email": "eve.holt@reqres.in",
        "password": "cityslicka"
    };
    
    // open request
    xhr.open('POST', 'http://pele.foucher.free.fr/Christophe/chess/history/set.php');
    
    // set `Content-Type` header
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // send rquest with JSON payload
    xhr.send(JSON.stringify(json));

}

function initialise() {
    canvas = document.getElementById('myCanvas');
    let length = window.innerHeight;
    if (length > window.innerWidth) length = window.innerWidth;
    length = Math.floor(0.9 * length);
    canvas.width = length;
    canvas.height = length;
    size = Math.floor(canvas.width / 8);
    context = canvas.getContext('2d');
    const btn = document.getElementById("btnAnnule");
    btn.disabled = true;
    btn.addEventListener('click', onAnnule);
    document.getElementById("btnNouveau").addEventListener('click', onNouveau);
}

// Function that formats the string with HTML tags, then outputs the result
function showHistory(data) {
    var output = "<ul>"; // Open list
    var i;
    
    // Loop through the moves, and add them as list items
    for (var i in data.artists) {
        output += "<li>" + data.artists[i].artistname + " (Born: " + data.artists[i].born + ")</li>"; 
    }
    
    output += "</ul>"; // Close list

    // Output the data to the "artistlist" element
    document.getElementById("artistList").innerHTML = output;
}

// Store XMLHttpRequest and the JSON file location in variables
var xhr = new XMLHttpRequest();
var url = "http://pele.foucher.free.fr/Christophe/chess/history/get.php";

// Called whenever the readyState attribute changes 
xhr.onreadystatechange = function() {

  // Check if fetch request is done
  if (xhr.readyState == 4 && xhr.status == 200) { 
  
    // Parse the JSON string
    var jsonData = JSON.parse(xhr.responseText);
    
    // Call the showArtists(), passing in the parsed JSON string
    showHistory(jsonData);
  }
};

// Do the HTTP call using the url variable we specified above
//xhr.open("GET", url, true);
//xhr.send();

chargeImages();
initialise();
