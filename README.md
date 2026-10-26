# Pizza Lyght — maquette « Boucan de nuit »

Maquette du futur site de Pizza Lyght (Cayenne, Kourou, Saint-Laurent-du-Maroni).
Site statique HTML, CSS et JavaScript, sans étape de construction, prêt pour Vercel.

## Pages

- `index.html` : accueil (pizza qui cuit, fait maison, recettes du pays, carte, composeur Allasani, formules, RN1 et pizzerias)
- `carte.html` : carte complète, filtres, recherche, panier
- `cayenne.html`, `kourou.html`, `saint-laurent.html` : une page par pizzeria (statut en direct, cadran 24 h, accès)

## Ce qui est simulé

Le panier, le paiement et la confirmation sont simulés : rien n’est envoyé, rien n’est débité.
Le bouton « Commander pour de vrai » renvoie vers la page de commande actuelle (pizzalyght.fr/online-ordering).

## Données

Toute la carte, les adresses, téléphones et horaires sont dans `assets/js/data.js` (relevé du site actuel, octobre 2026).
Les images Grok, une fois livrées, se déposent dans `assets/img/grok/` et s’ajoutent à la liste `grok` du même fichier.

## À compléter avec la pizzeria

- jours d’ouverture et fermetures exceptionnelles
- cartes et prix de Kourou et de Saint-Laurent (seule la carte de Cayenne est en ligne)
- allergènes et origine des viandes (obligatoires avant une commande en ligne)
- zones et frais de livraison
- base et liste des ingrédients de la pizza Allasani
- recettes des lasagnes et tagliatelles, prix du jus local, différence entre salades 2 et 3
- photos des pizzas, des restaurants et de l’équipe

## Crédits techniques

GSAP 3.15 (licence GreenSock), Lenis 1.3.4 (MIT), OGL 1.0.11 (Unlicense),
polices Bricolage Grotesque et Instrument Sans (SIL Open Font License, fichiers dans `assets/fonts`).
Photos issues du site pizzalyght.fr. Illustrations des pizzas dessinées en code d’après les recettes.
