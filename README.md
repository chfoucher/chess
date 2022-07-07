# chess
Jeu d'échecs

À faire :
* Ecrire API history/clear
* Ecrire API history/save
* Appeler history/clear dans onNouveau()
* Bouton Sauve appelle history/save
* Ecrire chargePartie sur modèle de initPartie et appelle history/get 
* Coder les roques

## Backend
Serveur backend pour la mémorisation de l'historique d'une partie d'échecs.
Ce serveur utilise une API HTTP.

## Fonctions

### DELETE
Efface l'historique

### POST
Enregistre l'historique
Le corps de la requête contient un tableau de mouvements encodé en JSON.
Un mouvement a une case origine et une case destination.
Une case a une pièce et une position (c, r).
Une pièce a un type (roi, pion, etc.) et une couleur (blanc ou noir).

### GET
Récupère l'historique

## Persistence
Les informations sont mémorisées dans une BDD MySQL.

## Test automatique
Les tests automatiques sont réalisés par un script node.js écrit en typescript.
