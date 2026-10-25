/* Donnees de la maquette Gwenanou Print.
   Tout vient du site actuel et de la boutique SumUp (releve du 19/10/2026).
   null = information absente du site, affichee « a completer ». */
(function () {
  const BOUTIQUE = "https://gwenanou-print.sumupstore.com";
  const p = (slug) => `${BOUTIQUE}/article/${slug}`;
  /* Photo reelle du site associee a chaque article (en attendant les photos SumUp). */
  const PHOTOS = {"arbres-de-vie-base-3-prenoms-1": "arbre-de-vie", "ardoise-personnalisee": "ardoise-croix-camarguaise", "boucle-oreille": "boucles-oreilles-filigrane", "boule-de-noel-cerf": "boule-noel-cerf", "cadre-de-naissance": "cadre-de-naissance", "dame-chinoise": "dame-chinoise", "gravure-miroir-10x10": "miroir-cheval", "jeu-de-toc": "jeu-de-toc-6", "maison-bougie-grande": "maison-bougie", "maison-bougie-petit": "maison-bougie", "medaille-animaux-personnalisee": "medaille-naia", "porte-cle-bois-personnalisee": "porte-cles-bois-grave", "sapin-spiral": "sapin-spirale", "spatule": "spatules-prenoms", "support-pour-carte": "support-pour-cartes"};

  const GW = (window.GW = {
    contact: {
      nom: "Gwenanou Print",
      email: "gwenanou.print@gmail.com",
      tel: "06 14 61 38 36",
      telHref: "+33614613836",
      instagram: "https://instagram.com/gwenanou_print",
      instagramNom: "@gwenanou_print",
      facebook: "https://www.facebook.com/profile.php?id=100088041895204",
      linkedin: "https://www.linkedin.com/company/gwenanou-print/",
      boutique: BOUTIQUE,
      adresse: null,
      zone: null,
      siret: null,
      delais: null,
      livraison: null
    },

    /* Matieres : textes repris des pages du site actuel. */
    matieres: [
      {
        id: "bois", nom: "Bois", page: "bois", sombre: false,
        texte: "Décorations, panneaux, cadeaux, objets artisanaux ou signalétiques : la découpe laser permet des formes détaillées et des finitions soignées qui mettent en valeur l’aspect naturel du bois.",
        des: "dès 1,50\u00A0€", photo: "site/deco-murale-elephants", photoAlt: "Décoration murale en bois découpée au laser : éléphants",
        encre: "bois"
      },
      {
        id: "metal", nom: "Métal", page: null, sombre: false,
        texte: "Porte-clés, médailles pour chien, plaques de boîte aux lettres ou objets professionnels : une gravure précise, élégante et résistante dans le temps.",
        des: "dès 4,00\u00A0€", photo: "site/medaille-naia", photoAlt: "Médaille pour chien gravée au prénom Naïa",
        encre: "metal"
      },
      {
        id: "verre", nom: "Verre", page: null, sombre: false,
        texte: "Verres, bouteilles, vases et carafes gravés d’un prénom, d’un logo, d’une date ou d’un message, avec une finition fine et raffinée.",
        des: "sur devis", photo: "site/verre-prenoms-date", photoAlt: "Verre gravé de deux prénoms et d’une date",
        encre: "verre"
      },
      {
        id: "ardoise", nom: "Ardoise", page: null, sombre: true,
        texte: "Dessous de verre, plaques décoratives, panneaux ou cadeaux : la gravure révèle un contraste élégant sur un rendu naturel et authentique.",
        des: "dès 30,00\u00A0€", photo: "site/ardoise-tete-de-mort-fleurie", photoAlt: "Ardoise gravée d’une tête de mort fleurie",
        encre: "ardoise"
      },
      {
        id: "cuir", nom: "Cuir", page: null, sombre: true,
        texte: "Portefeuilles, porte-clés, bracelets, étiquettes : un texte, un logo ou un motif pour une finition haut de gamme et authentique.",
        des: "sur devis", photo: "site/dessous-de-verre-cuir", photoAlt: "Dessous de verre en cuir gravé d’une tête de mort mexicaine",
        encre: "cuir"
      },
      {
        id: "miroir", nom: "Miroir", page: null, sombre: false,
        texte: "Prénom, photo, texte ou logo : un miroir gravé sur mesure pour vos cadeaux et vos événements.",
        des: "dès 10,00\u00A0€", photo: "site/miroir-cheval", photoAlt: "Miroir gravé d’un cheval au galop",
        encre: "miroir"
      }
    ],

    /* Occasions mises en avant (photos reelles du site). */
    occasions: [
      { id: "naissance", filtre: "naissance", nom: "Naissance", ligne: "Cadres, prénoms et arbres de vie pour accueillir un nouveau prénom.", photo: "site/cadre-de-naissance", alt: "Cadre de naissance en bois gravé" },
      { id: "fetes", filtre: "fetes", nom: "Mariage et fêtes", ligne: "Marque-places et objets personnalisés pour anniversaires, mariages et baptêmes.", photo: "site/fer-a-cheval-anniversaire", alt: "Fer à cheval en bois gravé pour un anniversaire" },
      { id: "famille", filtre: "naissance", nom: "Famille", ligne: "L’arbre de vie, de 3 à 10 prénoms gravés.", photo: "site/arbre-de-vie", alt: "Arbre de vie en bois avec prénoms gravés" },
      { id: "noel", filtre: "noel", nom: "Noël", ligne: "Boules, couronnes, sapins et maisons bougies en bois.", photo: "site/sapin-spirale", alt: "Sapin spirale en bois découpé au laser" },
      { id: "animaux", filtre: "animaux", nom: "Animaux", ligne: "Médailles gravées au prénom de votre compagnon, avec ou sans numéro.", photo: "site/medaille-arlo", alt: "Médaille pour chien gravée au prénom Arlo" },
      { id: "jeux", filtre: "jeux", nom: "Jeux", ligne: "Dames chinoises, jeu de toc, memory et plateaux en bois.", photo: "site/dame-chinoise", alt: "Plateau de dames chinoises en bois" },
      { id: "goodies", filtre: "goodies", nom: "Goodies", ligne: "Porte-clés et objets à votre nom ou à votre logo.", photo: "site/porte-cles-gwenanou", alt: "Porte-clés en bois gravé Gwenanou Print" }
    ],

    filtres: [
      { id: "tout", nom: "Tout" },
      { id: "noel", nom: "Noël" },
      { id: "naissance", nom: "Naissance et famille" },
      { id: "fetes", nom: "Mariage et fêtes" },
      { id: "jeux", nom: "Jeux" },
      { id: "animaux", nom: "Animaux" },
      { id: "bijoux", nom: "Bijoux" },
      { id: "maison", nom: "Maison et déco" },
      { id: "goodies", nom: "Goodies" }
    ],

    /* 34 articles de la boutique SumUp. Orthographe corrigee, prix exacts. */
    produits: [
      { id: "arbres-de-vie-base-3-prenoms-1", nom: "Arbre de vie", detail: "Base + 3 prénoms", prix: 15, variantes: true, occ: ["naissance"], page: "arbre-de-vie", selection: 1 },
      { id: "ardoise-personnalisee", nom: "Ardoise personnalisée", prix: 30, occ: ["maison"], selection: 6 },
      { id: "attrape-reve", nom: "Attrape-rêve", prix: 12, occ: ["maison"] },
      { id: "boucle-oreille", nom: "Boucles d’oreilles", prix: 5, variantes: true, occ: ["bijoux"] },
      { id: "boule-de-noel-bonhomme-de-neige", nom: "Boule de Noël « Bonhomme de neige »", prix: 2.5, variantes: true, occ: ["noel"], boule: true },
      { id: "boule-de-noel-cerf", nom: "Boule de Noël « Cerf »", prix: 2.5, variantes: true, occ: ["noel"], boule: true, selection: 7 },
      { id: "boule-de-noel-foret", nom: "Boule de Noël « Forêt »", prix: 2.5, variantes: true, occ: ["noel"], boule: true },
      { id: "boule-de-noel-joyeu-noel", nom: "Boule de Noël « Joyeux Noël »", prix: 2.5, variantes: true, occ: ["noel"], boule: true },
      { id: "boule-de-noel-sapin", nom: "Boule de Noël « Sapin »", prix: 2.5, variantes: true, occ: ["noel"], boule: true },
      { id: "cadre-de-naissance", nom: "Cadre de naissance", prix: 35, occ: ["naissance"], selection: 3 },
      { id: "calendrier-calendrier-avec-20-pastilles", nom: "Calendrier", detail: "Avec 20 pastilles", prix: 17, occ: ["maison"] },
      { id: "couronne-de-noel", nom: "Couronne de Noël", prix: 15, variantes: true, occ: ["noel"] },
      { id: "dame-chinoise", nom: "Dames chinoises", prix: 40, occ: ["jeux"], selection: 4 },
      { id: "deco-murale-usa", nom: "Déco murale USA", prix: 15, occ: ["maison"] },
      { id: "dessous-de-plat", nom: "Dessous de plat", prix: 8, occ: ["maison"] },
      { id: "gravure-miroir-10x10", nom: "Gravure sur miroir", detail: "10 × 10", prix: 10, occ: ["maison"] },
      { id: "jeu-de-memorie", nom: "Jeu de memory", prix: 10, occ: ["jeux"] },
      { id: "jeu-de-toc", nom: "Jeu de toc", prix: 40, occ: ["jeux"] },
      { id: "lettre", nom: "Lettre", prix: 2, occ: ["naissance", "fetes"] },
      { id: "maison-bougie-grande", nom: "Maison bougie", detail: "Grande", prix: 15, occ: ["noel"] },
      { id: "maison-bougie-petit", nom: "Maison bougie", detail: "Petite", prix: 7.5, occ: ["noel"] },
      { id: "marque-place", nom: "Marque-place", prix: 1.5, occ: ["fetes"], selection: 5 },
      { id: "medaille-animaux-personnalisee", nom: "Médaille animaux personnalisée", prix: 4, variantes: true, options: ["Prénom", "Prénom + numéro de téléphone", "Prénom + numéro de téléphone + logo"], occ: ["animaux"], selection: 2 },
      { id: "plateau-de-jeu-recto-verso", nom: "Plateau de jeu recto verso", prix: 30, variantes: true, occ: ["jeux"] },
      { id: "plateau-jeu-de-tic-toc", nom: "Plateau jeu de tic toc", prix: 15, occ: ["jeux"] },
      { id: "plateau-tournan-40cm", nom: "Plateau tournant", detail: "40 cm", prix: 40, occ: ["maison"] },
      { id: "porte-cle-bois-personnalisee", nom: "Porte-clés bois personnalisé", prix: 5, occ: ["goodies"], selection: 8 },
      { id: "prenom-base-3-lettres", nom: "Prénom", detail: "Base + 3 lettres", prix: 10, variantes: true, occ: ["naissance"] },
      { id: "sapin-spiral", nom: "Sapin spirale", prix: 8, occ: ["noel"] },
      { id: "sous-bock-unite", nom: "Sous-bock", detail: "À l’unité", prix: 25, variantes: true, occ: ["maison"] },
      { id: "spatule", nom: "Spatule", prix: 3, occ: ["maison"] },
      { id: "support-de-boucles", nom: "Support de boucles d’oreilles", prix: 15, occ: ["bijoux"] },
      { id: "support-de-medaille", nom: "Support de médailles", prix: 15, occ: ["maison"] },
      { id: "support-pour-carte", nom: "Support pour cartes", prix: 12, occ: ["jeux"] }
    ].map((x) => ({ ...x, nom: x.nom.replace(/« /g, "«\u00A0").replace(/ »/g, "\u00A0»"), url: p(x.id), img: PHOTOS[x.id] ? `site/${PHOTOS[x.id]}` : null })),

    /* Fiche Arbre de vie : options reelles de la boutique, prix des options absents du site. */
    arbre: {
      id: "arbres-de-vie-base-3-prenoms-1",
      options: [3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ n, prix: n === 3 ? 15 : null })),
      connexes: ["ardoise-personnalisee", "boule-de-noel-joyeu-noel", "boule-de-noel-cerf", "dame-chinoise"]
    }
  });

  /* Prix au format francais ; l'espace fine insecable est remplacee par une insecable presente dans les polices */
  const FORMAT = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
  GW.prix = (v) => (v == null ? "Prix à compléter" : FORMAT.format(v).replace(/\u202F/g, "\u00A0"));
  GW.produit = (id) => GW.produits.find((x) => x.id === id);
  GW.src = (name, w) => `assets/img/${name}-${w}.webp`;
  GW.srcset = (name, ws) => ws.map((w) => `assets/img/${name}-${w}.webp ${w}w`).join(", ");
})();
