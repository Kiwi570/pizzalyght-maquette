/* Pizza Lyght — données de la maquette.
   Source : pizzalyght.fr (relevé du 25/10/2026). Prix en centimes, TTC, carte de Cayenne.
   Tout ce qui manque sur le site actuel est marqué "à compléter". */
(function () {
  var A_COMPLETER = 'à compléter';

  var restaurants = [
    {
      id: 'cayenne',
      ville: 'Cayenne',
      page: 'cayenne.html',
      adresse: ['Cité Médan', 'à côté de la pharmacie des Manguiers', '97300 Cayenne'],
      telephones: ['06 94 01 25 00', '05 94 46 23 19'],
      services: ['emporter', 'livraison'],
      creneaux: [[11 * 60, 15 * 60], [18 * 60, 23 * 60]],
      facebook: 'https://www.facebook.com/pizzalyghtcayenne',
      commande: 'https://www.pizzalyght.fr/online-ordering',
      maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Pizza Lyght Cité Médan Cayenne'),
      photo: { base: 'salade-saumon-bol', w: [640, 1125], ratio: 1125 / 1150, alt: 'Salade au saumon, mangue et pignons dans un bol en carton, photo Pizza Lyght' },
      signature: 'Pizza Cayennaise',
      lonlat: [-52.326, 4.9372]
    },
    {
      id: 'kourou',
      ville: 'Kourou',
      page: 'kourou.html',
      adresse: ['75 avenue du Général de Gaulle', '97310 Kourou'],
      telephones: ['06 94 47 47 31', '05 94 32 37 83'],
      services: ['sur-place', 'terrasse', 'emporter', 'livraison'],
      creneaux: [[18 * 60, 23 * 60]],
      facebook: 'https://www.facebook.com/profile.php?id=100048098959605',
      commande: 'https://www.pizzalyght.fr/online-ordering',
      maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('75 avenue du Général de Gaulle, 97310 Kourou'),
      photo: { base: 'pizza-pelle-fond-noir', w: [640, 1280], ratio: 1280 / 526, alt: 'Pizza aux tomates, olives et poivrons sur une pelle en bois, photo Pizza Lyght' },
      signature: 'Pizza Kouroucienne',
      lonlat: [-52.6503, 5.1599]
    },
    {
      id: 'saint-laurent',
      ville: 'Saint-Laurent-du-Maroni',
      villeCourte: 'Saint-Laurent',
      page: 'saint-laurent.html',
      adresse: ['Place du Marché', 'Saint-Laurent-du-Maroni'],
      telephones: ['06 94 93 85 86', '06 94 40 35 55'],
      services: ['emporter', 'livraison'],
      creneaux: [[18 * 60, 23 * 60]],
      facebook: 'https://www.facebook.com/pizzalyght',
      commande: 'https://www.pizzalyght.fr/online-ordering',
      maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Place du Marché, Saint-Laurent-du-Maroni'),
      photo: { base: 'pizza-planche-part', w: [640, 1000, 1488], ratio: 1488 / 1600, alt: 'Pizza aux olives sur une planche en bois, une part soulevée, photo Pizza Lyght' },
      signature: 'Pizza Saint Laurentaise',
      lonlat: [-54.0297, 5.4985]
    }
  ];

  var services = {
    'sur-place': { label: 'Sur place', detail: 'En salle' },
    'terrasse': { label: 'Terrasse', detail: 'Sans réservation' },
    'emporter': { label: 'À emporter', detail: 'Commande en ligne ou par téléphone' },
    'livraison': { label: 'Livraison', detail: 'Zone et frais ' + A_COMPLETER }
  };

  /* Pizzas : ingrédients tels qu'affichés sur la carte (orthographe corrigée). */
  var P = function (nom, ing, prix) { return { nom: nom, ing: ing, prix: prix }; };
  var pizzas = [
    P('Américaine', 'tomate, chorizo, fromage, olives', 1100),
    P('Angela', 'tomate, jambon, fromage, œuf', 1150),
    P('Aveyron', 'crème fraîche, fromage de chèvre, roquefort, emmental, miel', 1350),
    P('Babeloued', 'tomate, merguez, lardons, jambon, champignons, oignons, fromage, crème fraîche, olives', 1450),
    P('Bolognaise', 'tomate, viande hachée, poivrons, fromage', 1250),
    P('Calzone', 'tomate, jambon, champignons, œuf, fromage (chausson)', 1300),
    P('Cannibale', 'tomate, viande hachée, saucisse fumée, lardons, merguez, jambon, poulet fumé, fromage, crème fraîche', 2000),
    P('Campagnarde', 'crème fraîche, fromage de chèvre, lardons, fromage, olives', 1300),
    P('Caprice', 'tomate, jambon, fromage', 1000),
    P('Carbonara', 'crème fraîche, lardons, jambon, fromage, œuf', 1250),
    P('Casablanca', 'tomate, merguez, lardons, jambon, poivrons, oignons, fromage, crème fraîche, olives', 1450),
    P('Cayennaise', 'tomate, thon, crevettes, lardons, poivrons, oignons, fromage, crème fraîche', 1600),
    P('Chicken', 'tomate, poulet fumé, oignons, fromage, crème fraîche', 1450),
    P('Chicken Hawaïenne', 'tomate, poulet fumé, ananas, fromage, olives', 1550),
    P('Créole', 'tomate, poulet boucané, oignons, fromage', 1600),
    P('Flamme', 'crème fraîche, lardons, jambon, oignons, fromage', 1200),
    P('Fromagère', 'tomate, fromage de chèvre, roquefort, emmental', 1250),
    P('Hawaïenne', 'tomate, jambon, ananas, fromage, olives', 1250),
    P('Jardinière', 'tomate, jambon, lardons, pomme de terre, fromage, crème fraîche, olives', 1300),
    P('Kouroucienne', 'tomate, chorizo, lardons, poivrons, champignons, olives, fromage, crème fraîche', 1500),
    P('Kremoka', 'tomate, crevettes, fines herbes, fromage, crème fraîche', 1700),
    P('Mananaise', 'tomate, jambon, crevettes, saumon, anchois, merguez, oignons, fromage, œuf, crème fraîche', 1700),
    P('Marguerite', 'tomate, oignons, fromage, olives', 850),
    P('Marinière', 'tomate, moules, fines herbes, citron, fromage, crème fraîche', 1250),
    P('Maroni', 'tomate, poissons boucanés, oignons, fromage', 1500),
    P('Matoury', 'tomate, saucisses boucanées, chorizo, poivrons, oignons, fromage, crème fraîche', 1600),
    P('Mexicaine', 'tomate, viande hachée, poivrons, maïs, oignons, fromage', 1300),
    P('Napolitaine', 'tomate, anchois, fromage, olives', 1100),
    P('Norvégienne', 'tomate, saumon, fromage, crème fraîche', 1450),
    P('Orientale', 'tomate, merguez, oignons, fromage, olives', 1200),
    P('Paysanne', 'tomate, lardons, jambon, champignons, oignons, fromage, olives', 1300),
    P('Pêcheur', 'tomate, fruits de mer, fromage', 1200),
    P('Régina', 'tomate, jambon, champignons, fromage', 1150),
    P('Saint Laurentaise', 'tomate, poulet boucané, merguez, lardons, oignons, fromage, œuf, crème fraîche', 1900),
    P('Santa', 'tomate, thon, fromage, crème fraîche, olives', 1200),
    P('Végétarienne', 'tomate, champignons, poivrons, oignons, fromage, olives', 1200)
  ];
  pizzas.forEach(function (p) { p.nom = 'Pizza ' + p.nom; });
  var allasani = { nom: 'Pizza Allasani', ing: '8 ingrédients au choix', prix: 2000, allasani: true };

  /* Recettes aux noms du pays, pour la galerie de l'accueil. */
  var pays = ['Pizza Créole', 'Pizza Saint Laurentaise', 'Pizza Maroni', 'Pizza Matoury', 'Pizza Cayennaise', 'Pizza Kouroucienne', 'Pizza Mananaise'];

  /* Ingrédients proposés dans le composeur Allasani : ceux de la carte. Liste exacte à confirmer. */
  var allasaniIngredients = ['jambon', 'lardons', 'chorizo', 'merguez', 'viande hachée', 'poulet fumé', 'poulet boucané', 'saucisse fumée', 'thon', 'crevettes', 'saumon', 'anchois', 'champignons', 'oignons', 'poivrons', 'olives', 'ananas', 'maïs', 'pomme de terre', 'œuf', 'fromage de chèvre', 'roquefort', 'miel', 'fines herbes'];

  var I = function (nom, desc, prix, extra) { var o = { nom: nom, desc: desc || '', prix: prix }; if (extra) for (var k in extra) o[k] = extra[k]; return o; };

  var categories = [
    {
      id: 'pizzas', titre: 'Pizzas', accroche: 'Pâte et sauce tomate maison.',
      photo: { base: 'pizza-olives-granit', w: [640, 1107], alt: 'Pizza gratinée aux olives noires, photo Pizza Lyght' },
      items: pizzas.concat([allasani]), pizza: true
    },
    {
      id: 'salades', titre: 'Salades', accroche: 'Préparées à la commande avec des produits frais.',
      photo: { base: 'salade-saumon-bol', w: [640, 1125], alt: 'Salade au saumon dans un bol, photo Pizza Lyght' },
      items: [
        I('Salade choux carottes', 'choux, carottes', 390),
        I('Salade couac', 'couac, tomates, maïs, concombres, persil, oignons', 1090),
        I('Salade feta', 'pastèque, concombres, feta, olives noires, échalotes, persil, menthe', 990),
        I('Salade de pâtes italienne', 'pâtes, tomates, poulet, parmesan, basilic', 1090),
        I('Salade pomme de terre', 'pomme de terre, carottes, œuf, oignons, cornichons', 890),
        I('Salade poulet', 'laitue, tomates, concombres, maïs, poulet, avocat, persil, oignons', 1290),
        I('Salade quinoa', 'quinoa, tomates, concombres, ananas, menthe, oignons', 890),
        I('Salade riz', 'riz, tomates, maïs, thon, olives, échalotes', 1090),
        I('Salade saumon', 'laitue, tomates, carottes, concombres, maïs, saumon, mangue', 1290),
        I('Taboulé', 'semoule, concombre, poivrons, tomates, oignons, persil, raisins, menthe', 1190)
      ]
    },
    {
      id: 'salades-a-composer', titre: 'Salades à composer', accroche: 'Une base, des crudités, des protéines, des toppings.',
      photo: { base: 'grok/g-legumes-frais-16x9', w: [640, 1168], alt: 'Laitue, tomates, avocat, mangue et maïs frais (illustration)' },
      items: [
        I('Petite salade 1', '1 base, 3 crudités au choix', 990),
        I('Grande salade 1', '1 base, 5 crudités au choix', 1190),
        I('Petite salade 2', '1 base, 2 crudités, 1 protéine, 1 topping', 1290),
        I('Grande salade 2', '1 base, 4 crudités, 2 protéines, 2 toppings', 1490),
        I('Petite salade 3', '1 base, 2 crudités, 1 protéine, 1 topping (différence avec la salade 2 à préciser)', 1590),
        I('Grande salade 3', '1 base, 4 crudités, 2 protéines, 2 toppings (différence avec la salade 2 à préciser)', 1790)
      ]
    },
    {
      id: 'pates', titre: 'Pâtes', accroche: 'Préparées à la commande.',
      photo: { base: 'grok/g-pates-seches-16x9', w: [640, 1168], alt: 'Nids de tagliatelles et semoule (illustration)' },
      items: [
        I('Lasagnes', 'recette ' + A_COMPLETER, 1590),
        I('Tagliatelles', 'recette ' + A_COMPLETER, 1190)
      ]
    },
    {
      id: 'paninis', titre: 'Paninis', accroche: 'Au fromage, avec son pain maison.',
      photo: { base: 'panini-grille', w: [640, 1280], alt: 'Panini grillé garni' },
      items: [
        I('Panini Aveyron', 'chèvre, miel, tomate, basilic, emmental', 650),
        I('Panini Bayonne', 'jambon cru, tomates, salade, emmental', 650),
        I('Panini British', 'bacon, jambon, tomates, salade, emmental, cheddar', 700),
        I('Panini Chicken', 'poulet fumé, tomates, concombre, vinaigrette, emmental', 700),
        I('Panini Créole', 'poulet boucané, tomate, salade, vinaigrette, emmental', 800),
        I('Panini Gourmande', 'Nutella, noix de coco ou banane', 500),
        I('Panini Italia', 'tomate, mozzarella, basilic', 500),
        I('Panini Nordique', 'saumon, concombre, carottes, emmental', 750),
        I('Panini Omelette', 'omelette, mayonnaise, tomate, emmental', 550),
        I('Panini Parisien', 'jambon, tomate, salade, emmental', 550),
        I('Panini Texan', 'viande hachée, ketchup, tomate, salade, emmental', 700),
        I('Panini Tuna', 'thon, œuf dur, tomate, carottes, emmental', 650),
        I('Panini Omelette Lardons', 'omelette, lardons, mayonnaise, tomate, emmental', 750),
        I('Panini Crevettes', 'crevettes, mayonnaise, tomate, salade, emmental', 850)
      ]
    },
    {
      id: 'soupes', titre: 'Soupes', accroche: 'Légumes du marché et viande bouchère.',
      photo: { base: 'veloute-croutons', w: [640, 1125], alt: 'Velouté avec crème, fromage râpé et croûtons' },
      items: [
        I('Velouté de légumes', 'avec sa crème, son fromage et ses croûtons', 850),
        I('Soupe créole', 'légumes et viande de bœuf', 1200),
        I('Soupe végétarienne', 'épinards, concombres piquants, calou', 850),
        I('Velouté de courgettes', 'avec sa crème, son fromage et ses croûtons', 850),
        I('Velouté de patate douce', 'avec sa crème, son fromage et ses croûtons', 850)
      ]
    },
    {
      id: 'desserts', titre: 'Desserts', accroche: 'Desserts gourmands.',
      photo: { base: 'gateau-ananas', w: [640, 1200], alt: 'Gâteau à l’ananas, photo Pizza Lyght' },
      items: [
        I('Crème brûlée', '', 350),
        I('Crème de cupuacu', '', 350),
        I('Crème de maracudja', '', 350),
        I('Gâteau à l’ananas', '', 390),
        I('Moelleux chocolat Nutella noix de pécan', '', 390),
        I('Panna cotta', '', 350),
        I('Pudding', '', 350),
        I('Riz au lait', '', 350),
        I('Salade de fruits frais', '', 450),
        I('Tiramisu', '', 450)
      ]
    },
    {
      id: 'formules', titre: 'Formules', accroche: 'Le repas complet.',
      photo: { base: 'pizza-planche-part', w: [640, 1000, 1488], alt: 'Pizza sur une planche, une part soulevée, photo Pizza Lyght' },
      items: [
        I('Formule pizza', '1 pizza individuelle, 1 salade laitue, 3 crudités', 1190, { groupe: 'Pizza', palier: 1 }),
        I('Formule pizza + boisson ou dessert', '1 pizza individuelle, 1 salade laitue, 3 crudités, 1 jus au choix (canette 33 cl ou petit jus local) ou 1 dessert', 1490, { groupe: 'Pizza', palier: 2 }),
        I('Formule pizza complète', '1 pizza individuelle, 1 salade laitue, 3 crudités, 1 dessert, 1 jus au choix (canette 33 cl ou petit jus local)', 1600, { groupe: 'Pizza', palier: 3 }),
        I('Formule petite salade', 'riz, pâtes, quinoa ou pomme de terre, 1 jus au choix (canette 33 cl ou petit jus local), 1 dessert', 1290, { groupe: 'Salade', palier: 1 }),
        I('Formule grande salade', 'riz, pâtes, quinoa ou pomme de terre, 1 jus au choix (canette 33 cl ou petit jus local), 1 dessert', 1590, { groupe: 'Salade', palier: 2 }),
        I('Formule tagliatelles', 'bolognaise, carbonara, crevettes ou saumon, 1 jus au choix (canette 33 cl ou petit jus local), 1 dessert', 1590, { groupe: 'Pâtes', palier: 1 }),
        I('Formule lasagnes', 'bolognaise ou saumon, 1 jus au choix (canette 33 cl ou petit jus local), 1 dessert', 1690, { groupe: 'Pâtes', palier: 2 })
      ]
    },
    {
      id: 'boissons', titre: 'Boissons', accroche: 'Dont des jus locaux préparés sur place avec des fruits frais.',
      photo: { base: 'grok/g-fruits-locaux-16x10', w: [640, 784], alt: 'Fruits de la passion et ananas (illustration)' },
      items: [
        I('Jus local', 'préparé sur place avec des fruits frais', null, { prixNote: 'prix ' + A_COMPLETER }),
        I('Coca', '', 200),
        I('Fanta', 'canette 33 cl', 200),
        I('Sprite', 'canette 33 cl', 200),
        I('Orangina', '', 200),
        I('Guarana', '', 200),
        I('Liptonic', 'canette 33 cl', 200),
        I('Lipton pêche', '', 200),
        I('Perrier', 'canette 33 cl', 200),
        I('Schweppes', 'canette 33 cl', 250),
        I('Minute Maid', 'canette 33 cl', 250),
        I('Red Bull', 'canette 33 cl', 250),
        I('Tropi', 'bouteille 50 cl', 250),
        I('Vita Malt', 'bouteille 33 cl', 250),
        I('Eau', '', 150),
        I('Eau gazeuse Dilo', '1 L', 300),
        I('Boissons chaudes', '', 200),
        I('Bières', '', 200, { alcool: true }),
        I('Vins', '', 490, { alcool: true })
      ]
    }
  ];

  /* Identifiants stables. */
  var slug = function (s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  categories.forEach(function (c) {
    c.items.forEach(function (it) { it.id = c.id + '--' + slug(it.nom); it.cat = c.id; });
  });

  /* Images Grok déjà livrées (nom de fichier sans extension). Vide tant qu'elles ne sont pas arrivées :
     les emplacements gardent leur visuel provisoire dessiné en code. Nom du fichier -> largeurs disponibles. */
  var grok = {
    'g-hero-braises-16x9': [800, 1168], 'g-hero-braises-9x16': [657],
    'g-fumee-boucan-16x9': [800, 1168], 'g-fumee-noir-9x16': [657],
    'g-farine-texture-16x9': [1168],
    'g-route-nuit-16x9': [800, 1168],
    'g-bokeh-chaud-16x9': [800, 1168], 'g-bokeh-chaud-9x16': [657],
    'g-pelle-bois-1x1': [702]
  };

  window.PL = window.PL || {};
  window.PL.data = {
    restaurants: restaurants,
    services: services,
    categories: categories,
    pays: pays,
    allasaniIngredients: allasaniIngredients,
    grok: grok,
    commandeReelle: 'https://www.pizzalyght.fr/online-ordering',
    mentions: 'https://www.pizzalyght.fr/mentions-legales',
    cgv: 'https://www.pizzalyght.fr/cgv',
    fuseau: 'America/Cayenne',
    slug: slug,
    A_COMPLETER: A_COMPLETER
  };
})();
