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
const NOIR = "noir";
const BLANC = "blanc";
let imageCount = 0;
let joueurActif = BLANC;
let historique = [];
const mvtsPossibles = [];
let indexOrigine;

function chargeImage(fileName) {
    img[imageCount] = new Image();
    img[imageCount].onload = onImgLoad;
    img[imageCount++].src = "images/" + fileName;
}

function chargeImages() {
    const nomFichiers = [
        "viseur_noir.svg", "viseur_blanc.svg", "Chess_hdt45.svg",
        "Chess_plt45.svg", "Chess_mdt45.svg", "Chess_rlt45.svg",
        "Chess_fdt45.svg", "Chess_klt45.svg", "Chess_Bdt45.svg",
        "Chess_blt45.svg", "Chess_Ndt45.svg", "Chess_nlt45.svg",
        "Chess_gdt45.svg", "Chess_qlt45.svg"
    ];
    for (nom of nomFichiers) chargeImage(nom);
}

function initPartie() {
    historique = [];
    plateau = initPlateau();
    drawBoard(size, plateau);
    joueurActif = BLANC;
    calculeMouvements();
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
        context.fillStyle = '#d18b47';
    } else {
        context.fillStyle = '#ffce9e';
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
        showMessage(`Aux ${joueurActif}s de jouer`);
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function promotion(caseDestination) {
    const piece = caseDestination.piece;
    if (piece.type === PION) {
        if ((piece.couleur === NOIR && caseDestination.r === 7) ||
         (piece.couleur === BLANC && caseDestination.r === 0)) {
             const nouvPiece = {type: REINE, couleur: piece.couleur};
             caseDestination.piece = nouvPiece;
         }
    }
}

function roque(or, oc, dr, dc) {
    const couleur = plateau[or][oc].piece.couleur;
    const row = or;
    let origCol, destCol;
    let roqueEnCours = false;
    if ((oc == 4) && (plateau[or][oc].piece.type === ROI)) {
        if (dc == 2) {
            origCol = 0;
            destCol = dc + 1;
            roqueEnCours = true;
        }
        if (dc == 6) {
            origCol = 7;
            destCol = dc - 1;
            roqueEnCours = true;
        }
        if (roqueEnCours) {
            const caseOrigTour = plateau[row][origCol];
            const caseDestTour = plateau[row][destCol];
            caseDestTour.piece = caseOrigTour.piece;
            caseOrigTour.piece = null;
            drawCase(caseDestTour);
            drawCase(caseOrigTour);
            retireOrigine(couleur, row, origCol);
            ajouteOrigine(couleur, row, destCol);
        }
    }
}

function ajouteOrigine(couleur, r, c) {
    mvtsPossibles[couleur].push({origine: [r, c], destinations:[]});
}

function retireOrigine(couleur, r, c) {
    const mvts = mvtsPossibles[couleur];
    for (let i = 0; i < mvts.length; i++) {
        if (mvts[i].origine[0] === r && mvts[i].origine[1] === c) {
            mvts.splice(i, 1);
            break;
        }
    }
}

function calculeMouvementsPion(r, c) {
    const resultat = [];
    var dr, dc;
    const direction = (joueurActif) === BLANC?-1:1;
    // Avance de 1
    dr = r + direction;
    dc = c;
    if (dr <= 7 && dr >= 0 && !(plateau[dr][dc].piece)) resultat.push([dr, dc]);
    // Avance de 2
    const startingRow = (joueurActif) === BLANC?6:1;
    if (r === startingRow) {
        dr = r + direction * 2;
        if (dr <= 7 && dr >= 0 && !(plateau[dr][dc].piece)) resultat.push([dr, dc]);
    }
    // Mange à gauche
    dr = r + direction;
    dc = c - 1;
    if (dr <= 7 && dr >= 0 && dc >= 0 && (plateau[dr][dc].piece) &&
        plateau[dr][dc].piece.couleur != joueurActif)
        resultat.push([dr, dc]);
    // Mange à droite
    dc = c + 1;
    if (dr <= 7 && dr >= 0 && dc <= 7 && (plateau[dr][dc].piece) &&
        plateau[dr][dc].piece.couleur != joueurActif)
        resultat.push([dr, dc]);
    return resultat;
}

function calculeMouvementsCercle(mvts, r, c) {
    const resultat = [];
    var dr, dc;
    for (const mvt of mvts) {
        dr = r + mvt[0];
        dc = c + mvt[1];
        if (dr <= 7 && dr >= 0 && dc <= 7 && dc >= 0) {
            if (!(plateau[dr][dc].piece) || (plateau[dr][dc].piece.couleur != joueurActif)) {
                resultat.push([dr, dc]);
            }
        }
    }
    return resultat;
}

function calculeMouvementsCavalier(r, c) {
    return calculeMouvementsCercle(
        [[1, 2], [2, 1], [-1, 2], [2, -1],
         [1, -2], [-2, 1], [-1, -2], [-2, -1]],
        r, c);
}

function calculeRoque(r, c) {
    const resultat = [];
    const startingRow = (joueurActif) === BLANC?7:0;
    if (r == startingRow && c == 4 && !plateau[r][c+1].piece && !plateau[r][c+2].piece) {
        resultat.push([r, c + 2]);
    }
    if (r == startingRow && c == 4 && !plateau[r][c-1].piece && !plateau[r][c-2].piece && !plateau[r][c-3].piece) {
        resultat.push([r, c - 2]);
    }
    return resultat;
}

function calculeMouvementsRoi(r, c) {
    const mvtsNormaux = calculeMouvementsCercle(
        [[1, 0], [1, 1], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [-1, -1], [0, 1]],
        r, c);
    const mvtsRoque = calculeRoque(r, c);
    return mvtsNormaux.concat(mvtsRoque);
}

function calculeMouvementsLigne(mvts, r, c) {
    const resultat = [];
    var dr, dc;
    for (const mvt of mvts) {
        dr = r + mvt[0];
        dc = c + mvt[1];
        while (dr <= 7 && dr >= 0 && dc <= 7 && dc >= 0) {
            if (plateau[dr][dc].piece) {
                if (plateau[dr][dc].piece.couleur != joueurActif) {
                    // Prise
                    resultat.push([dr, dc]);
                }
                break; // Fin de la trajectoire
            } else { // Simple mouvement
                resultat.push([dr, dc]);
            }
            dr += mvt[0];
            dc += mvt[1];
        }
    }
    return resultat;
}

function calculeMouvementsFou(r, c) {
    return calculeMouvementsLigne([[1, 1], [1, -1], [-1, -1], [-1, 1]], r, c);
}

function calculeMouvementsTour(r, c) {
    return calculeMouvementsLigne([[0, 1], [0, -1], [-1, 0], [1, 0]], r, c);
}

function calculeMouvementsReine(r, c) {
    const mvtsFou = calculeMouvementsFou(r, c);
    const mvtsTour = calculeMouvementsTour(r, c);
    return mvtsFou.concat(mvtsTour);
}

function calculeMouvementsOrigine(r, c) {
    const piece = plateau[r][c].piece;
    var resultat = [];
    switch (piece.type) {
        case PION:
            resultat = calculeMouvementsPion(r, c);
            break;
        case CHEVAL:
            resultat = calculeMouvementsCavalier(r, c);
            break;
        case FOU:
            resultat = calculeMouvementsFou(r, c);
            break;
        case TOUR:
            resultat = calculeMouvementsTour(r, c);
            break;
        case REINE:
            resultat = calculeMouvementsReine(r, c);
            break;
        case ROI:
            resultat = calculeMouvementsRoi(r, c);
            break;
    }
    return resultat;
}

function calculeMouvements() {
    for (possibilite of mvtsPossibles[joueurActif]) {
        possibilite.destinations = calculeMouvementsOrigine(...(possibilite.origine));
    }
}

function origineAutorisee(r, c) {
    const cases = mvtsPossibles[joueurActif];
    for (let i = 0; i < cases.length; i++) {
        if (cases[i].origine[0] === r && cases[i].origine[1] === c && cases[i].destinations.length) {
            indexOrigine = i;
            return true;
            break;
        }
    }
    return false;
}

function destinationAutorisee(dr, dc) {
    const destinations = mvtsPossibles[joueurActif][indexOrigine].destinations;
    for (let i = 0; i < destinations.length; i++) {
        if (destinations[i][0] === dr && destinations[i][1] === dc) {
            return true;
            break;
        }
    }
    return false;
}

function onClick(evt) {
    const mousePos = getMousePos(canvas, evt);
    const c = Math.floor(mousePos.x /size);
    const r = Math.floor(mousePos.y / size);
    const caseChoisie = plateau[r][c];
    if (selection) {
        if (destinationAutorisee(r, c)) {
            historique.push({
                origine: {r: selection.r, c:selection.c, piece: selection.piece},
                destination: {r: caseChoisie.r, c: caseChoisie.c, piece: caseChoisie.piece}
            });
            document.getElementById("btnAnnule").disabled = false;
            const adversaire = (joueurActif === BLANC)?NOIR:BLANC;
            retireOrigine(joueurActif, selection.r, selection.c);
            if (caseChoisie.piece) retireOrigine(adversaire, caseChoisie.r, caseChoisie.c);
            ajouteOrigine(joueurActif, caseChoisie.r, caseChoisie.c);
            caseChoisie.piece = selection.piece;
            promotion(caseChoisie);
            roque(selection.r, selection.c, caseChoisie.r, caseChoisie.c);
            drawCase(caseChoisie);
            selection.piece = null;
            joueurActif = adversaire;
            calculeMouvements();
        }
        drawCase(selection);
        selection = null;
    } else {
        if (origineAutorisee(r, c)) {
            selection = caseChoisie;
            drawSelection(r, c);
        }
    }
    showStatus();
}

function onAnnule() {
    const mouvement = historique.pop();
    const orig = mouvement.origine; // {row, col, piece}
    const dst = mouvement.destination;
    const couleur = orig.piece.couleur;
    const roque = (orig.piece.type === ROI) && (Math.abs(dst.c - orig.c) == 2);
    if (roque) {
        if (dst.c - orig.c > 0) {
            const dt = dst.c - 1;
            retireOrigine(couleur, dst.r, 5);
            ajouteOrigine(couleur, dst.r, 7);
            plateau[dst.r][7].piece = plateau[dst.r][5].piece;
            plateau[dst.r][5].piece = null;
            drawCase(plateau[dst.r][7]);
            drawCase(plateau[dst.r][5]);
        } else {
            retireOrigine(couleur, dst.r, 3);
            ajouteOrigine(couleur, dst.r, 0);
            plateau[dst.r][0].piece = plateau[dst.r][3].piece;
            plateau[dst.r][3].piece = null;
            drawCase(plateau[dst.r][0]);
            drawCase(plateau[dst.r][3]);
        }
    }
    retireOrigine(couleur, dst.r, dst.c);
    if (dst.piece) ajouteOrigine(dst.piece.couleur, dst.r, dst.c);
    ajouteOrigine(couleur, orig.r, orig.c);
    plateau[orig.r][orig.c].piece = orig.piece;
    drawCase(plateau[orig.r][orig.c]);
    plateau[dst.r][dst.c].piece = dst.piece;
    drawCase(plateau[dst.r][dst.c]);
    joueurActif = (joueurActif === BLANC)?NOIR:BLANC;
    calculeMouvements();
    showStatus();
    if (historique.length === 0) document.getElementById("btnAnnule").disabled = true;
}

function onNouveau() {
    initPartie();
}

function drawPiece(p, r, c) {
    if (p.couleur === NOIR) id = 2 * p.type;
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

function Piece(type, couleur) {
    this.type = type;
    this.couleur = couleur;
}

function initPlateau() {
    mvtsPossibles[NOIR] = [];
    mvtsPossibles[BLANC] = [];
    var plateau = new Array();
    var currentNoir = false;
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
        plateau[0][c].piece = new Piece(agencement[c], NOIR);
        ajouteOrigine(NOIR, 0, c);
        plateau[1][c].piece = new Piece(PION, NOIR);
        ajouteOrigine(NOIR, 1, c);
        plateau[6][c].piece = new Piece(PION, BLANC);
        ajouteOrigine(BLANC, 6, c);
        plateau[7][c].piece = new Piece(agencement[c], BLANC);
        ajouteOrigine(BLANC, 7, c);
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
    size = Math.floor(length / 8);
    canvas.width = size * 8;
    canvas.height = size * 8;
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
