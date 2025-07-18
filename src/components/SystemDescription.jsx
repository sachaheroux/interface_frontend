export default function SystemDescription({ system }) {
  const baseStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "2rem"
  };

  const backgrounds = {
    Flowshop: "/flowshop.png",
    Jobshop: "/jobshop.png",
    "Ligne d'assemblage": "/Ligneassemblage.jpg",
    "Ligne d'assemblage mixte": "/lignedassemblagemixte.png",
    "Ligne de transfert": "/lignedetransfert.png",
    FMS: "/fms.png"
  };

  const renderTitle = (title) => (
    <h2 style={{ 
      fontSize: "2.2rem", 
      color: "#ffffff", 
      marginBottom: "1.5rem",
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
      fontWeight: "700",
      letterSpacing: "-0.02em"
    }}>{title}</h2>
  );

  const sectionTitle = (text) => (
    <h3 style={{ 
      fontSize: "1.4rem", 
      marginTop: "2rem", 
      marginBottom: "0.75rem", 
      color: "#ffffff",
      textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
      fontWeight: "600"
    }}>{text}</h3>
  );

  const text = (html) => (
    <p style={{ 
      fontSize: "1.1rem", 
      lineHeight: "1.7", 
      color: "#ffffff",
      textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
      marginBottom: "1rem"
    }} dangerouslySetInnerHTML={{ __html: html }}></p>
  );

  const list = (items) => (
    <ul style={{ 
      marginLeft: "1.5rem", 
      fontSize: "1.1rem", 
      lineHeight: "1.8", 
      color: "#ffffff",
      textShadow: "1px 1px 2px rgba(0,0,0,0.6)"
    }}>
      {items.map((item, i) => <li key={i} style={{ marginBottom: "0.3rem" }} dangerouslySetInnerHTML={{ __html: item }}></li>)}
    </ul>
  );

  const content = {
    Flowshop: [
      "Flowshop (atelier à flux linéaire)",
      [
        ["Définition", "Le <strong>Flowshop</strong> est un système où toutes les tâches suivent le même ordre de passage sur les machines. Chaque produit effectue les étapes dans un <strong>ordonnancement fixe</strong>, sans retour en arrière."],
        ["", "Utilisé dans des environnements <strong>standardisés</strong> comme l'automobile ou l'électronique."],
        ["Cas d'usage", "Exemple : fabrication de cartes électroniques. Chaque carte passe par :"],
        ["", [
          "1. <strong>Machine de gravure</strong>",
          "2. <strong>Machine de perçage</strong>",
          "3. <strong>Poste de soudure</strong>",
          "4. <strong>Contrôle qualité</strong>"
        ]],
        ["", "Chaque produit suit le même itinéraire : c'est typiquement un Flowshop."],
        ["Avantages", [
          "<strong>Simplicité de planification</strong>",
          "<strong>Réduction des transitions</strong>",
          "<strong>Facilité d'automatisation</strong>",
          "<strong>Visibilité claire du flux</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Peu flexible</strong> pour produits variés",
          "<strong>Goulots d'étranglement</strong> possibles",
          "<strong>Temps d'attente</strong> entre postes"
        ]]
      ]
    ],
    Jobshop: [
      "Jobshop (atelier à gamme variable)",
      [
        ["Définition", "Le <strong>Jobshop</strong> est un système où chaque produit suit un <strong>ordre spécifique de passage</strong> sur les machines. Il n'y a pas de séquence uniforme."],
        ["", "Utilisé pour la <strong>production unitaire</strong>, les <strong>petites séries</strong> et <strong>prototypage</strong>."],
        ["Cas d'usage", "Exemple : fabrication de pièces mécaniques. Une commande suit :"],
        ["", [
          "1. <strong>Tournage → Fraisage → Contrôle</strong>",
          "2. <strong>Perçage → Traitement thermique → Soudage</strong>"
        ]],
        ["", "Chaque produit suit un chemin personnalisé."],
        ["Avantages", [
          "<strong>Grande flexibilité</strong>",
          "<strong>Adapté aux commandes uniques</strong>",
          "<strong>Machines polyvalentes</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Planification complexe</strong>",
          "<strong>Temps de réglage fréquents</strong>",
          "<strong>Files d'attente et conflits</strong>"
        ]]
      ]
    ],
    "Ligne d'assemblage": [
      "Ligne d'assemblage",
      [
        ["Définition", "La <strong>ligne d'assemblage</strong> est un système <strong>séquentiel</strong> où un produit progresse d'un poste à l'autre. Chaque poste effectue une tâche spécifique."],
        ["", "Utilisée dans les industries <strong>automobile</strong> et <strong>électroménager</strong>."],
        ["Cas d'usage", "Exemple : chaîne de montage d'un grille-pain. Étapes :"],
        ["", [
          "1. <strong>Insertion de la résistance</strong>",
          "2. <strong>Montage du boîtier</strong>",
          "3. <strong>Installation du levier</strong>",
          "4. <strong>Contrôle final</strong>"
        ]],
        ["Avantages", [
          "<strong>Productivité élevée</strong>",
          "<strong>Cadence maîtrisée</strong>",
          "<strong>Formation simple</strong>",
          "<strong>Standardisation efficace</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Flexibilité réduite</strong>",
          "<strong>Dépendance à chaque poste</strong>",
          "<strong>Répétitivité des tâches</strong>"
        ]]
      ]
    ],
    "Ligne d'assemblage mixte": [
      "Ligne d'assemblage mixte",
      [
        ["Définition", "La <strong>ligne d'assemblage mixte</strong> est un système qui produit <strong>plusieurs modèles ou variantes</strong> sur la même ligne d'assemblage. Les produits alternent selon une séquence optimisée."],
        ["", "Utilisée dans l'<strong>automobile</strong>, l'<strong>électronique</strong> et l'<strong>agroalimentaire</strong> pour maximiser l'utilisation des équipements."],
        ["Principe clé", "Contrairement à une ligne mono-produit, elle nécessite un <strong>séquençage intelligent</strong> pour :"],
        ["", [
          "• <strong>Lisser la charge</strong> des postes critiques",
          "• <strong>Respecter les contraintes</strong> de précédence",
          "• <strong>Minimiser les variations</strong> de temps de cycle",
          "• <strong>Éviter les goulots d'étranglement</strong>"
        ]],
        ["Cas d'usage", "Exemple : ligne automobile produisant 3 modèles de véhicules :"],
        ["", [
          "• <strong>Berline (40%)</strong> - temps standard",
          "• <strong>SUV (35%)</strong> - temps plus long au poste peinture", 
          "• <strong>Coupé (25%)</strong> - temps plus long à l'assemblage"
        ]],
        ["", "Le système détermine l'ordre optimal : Berline → SUV → Berline → Coupé → Berline → SUV..."],
        ["Défis spécifiques", [
          "<strong>Équilibrage multi-modèles</strong> des postes",
          "<strong>Gestion des changements</strong> d'outillage",
          "<strong>Planification des approvisionnements</strong>",
          "<strong>Optimisation du séquençage</strong>"
        ]],
        ["Avantages", [
          "<strong>Flexibilité de production</strong>",
          "<strong>Meilleure utilisation</strong> des équipements",
          "<strong>Réponse aux variations</strong> de demande",
          "<strong>Économies d'échelle</strong> partagées"
        ]],
        ["Outils d'optimisation", [
          "<strong>Variation du goulot</strong> - minimise les écarts de charge",
          "<strong>Équilibrage ligne mixte</strong> - optimise l'affectation",
          "<strong>Programmation linéaire</strong> - solutions optimales",
          "<strong>Algorithmes de lissage</strong> - régularité de production"
        ]]
      ]
    ],
    "Ligne de transfert": [
      "Ligne de transfert (système automatisé rigide)",
      [
        ["Définition", "La <strong>ligne de transfert</strong> automatise le déplacement des pièces entre stations fixes. Chaque poste effectue une tâche unique."],
        ["", "Utilisée pour la <strong>production de masse</strong> standardisée."],
        ["Cas d'usage", "Exemple : production de boîtiers plastiques. Étapes :"],
        ["", [
          "1. <strong>Injection plastique</strong>",
          "2. <strong>Démoulage automatique</strong>",
          "3. <strong>Découpe</strong>",
          "4. <strong>Contrôle optique</strong>"
        ]],
        ["Avantages", [
          "<strong>Cadence élevée</strong>",
          "<strong>Automatisation complète</strong>",
          "<strong>Coûts réduits en main-d'œuvre</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Flexibilité nulle</strong>",
          "<strong>Investissement élevé</strong>",
          "<strong>Dépendance à chaque poste</strong>"
        ]]
      ]
    ],
    FMS: [
      "FMS – Flexible Manufacturing System",
      [
        ["Définition", "Le <strong>FMS</strong> est un système <strong>flexible</strong> combinant machines automatisées et <strong>pilotage informatique</strong>."],
        ["", "Permet de produire plusieurs types de pièces sans reconfiguration lourde."],
        ["Cas d'usage", "Exemple : atelier piloté par logiciel avec machines CNC, robots et AGV :"],
        ["", [
          "1. <strong>Réception de l'ordre de fabrication</strong>",
          "2. <strong>Chargement automatique</strong>",
          "3. <strong>Usinage CNC</strong>",
          "4. <strong>Contrôle qualité</strong>"
        ]],
        ["Avantages", [
          "<strong>Grande flexibilité</strong>",
          "<strong>Réduction des temps morts</strong>",
          "<strong>Utilisation optimale des ressources</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Coût élevé</strong> à l'installation",
          "<strong>Maintenance spécialisée</strong>",
          "<strong>Dépendance au système de pilotage</strong>"
        ]]
      ]
    ]
  };

  const block = content[system];
  const background = backgrounds[system];

  if (!block) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.6rem", color: "#1e3a8a" }}>{system}</h2>
        <p>Détails à venir pour ce système de production.</p>
      </div>
    );
  }

  const [title, sections] = block;

  return (
    <div
      style={{
        position: "relative",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "3rem 0",
        height: "100%",
        minHeight: "600px"
      }}
    >
      {/* Overlay noir sur toute l'image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 1
        }}
      />
      
      {/* Contenu du texte */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          padding: "3rem 4rem",
          backgroundColor: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(3px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        {renderTitle(title)}
        {sections.map(([subtitle, val], i) => (
          <div key={i}>
            {subtitle && sectionTitle(subtitle)}
            {Array.isArray(val) ? list(val) : text(val)}
          </div>
        ))}
      </div>
    </div>
  );
}

