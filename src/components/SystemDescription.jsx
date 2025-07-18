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
    <h1 style={{ 
      fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
      fontWeight: "700",
      marginBottom: "1rem",
      lineHeight: "1.2",
      background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
    }}>{title}</h1>
  );

  const sectionTitle = (text) => (
    <h3 style={{ 
      fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)", 
      marginTop: "1.5rem", 
      marginBottom: "0.75rem", 
      color: "#ffffff",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
      fontWeight: "600",
      borderBottom: "2px solid rgba(147, 197, 253, 0.3)",
      paddingBottom: "0.5rem"
    }}>{text}</h3>
  );

  const text = (html) => (
    <p style={{ 
      fontSize: "clamp(0.9rem, 2vw, 1rem)", 
      lineHeight: "1.6", 
      color: "#f8fafc",
      textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
      marginBottom: "1rem",
      opacity: "0.95"
    }} dangerouslySetInnerHTML={{ __html: html }}></p>
  );

  const list = (items) => {
    // Détecte si c'est une liste d'étapes numérotées (contient "1.", "2.", etc.)
    const isStepList = items.some(item => /^\d+\.\s*<strong>/.test(item));
    
    if (isStepList) {
      // Format horizontal avec flèches pour les étapes
      return (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "clamp(0.85rem, 1.8vw, 0.95rem)",
          color: "#f8fafc",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
          opacity: "0.95",
          marginBottom: "1rem"
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s*/, '') }}></span>
              {i < items.length - 1 && (
                <span style={{ 
                  color: "#93c5fd", 
                  fontSize: "1.2em",
                  fontWeight: "bold"
                }}>→</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Format vertical normal pour les autres listes
    return (
      <ul style={{ 
        marginLeft: "1.5rem", 
        fontSize: "clamp(0.9rem, 2vw, 1rem)", 
        lineHeight: "1.6", 
        color: "#f8fafc",
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
        opacity: "0.95"
      }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: "0.4rem" }} dangerouslySetInnerHTML={{ __html: item }}></li>)}
      </ul>
    );
  };

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
    <section 
      style={{
        position: "relative",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%"
      }}
    >
      {/* Overlay identique à la vidéo d'accueil */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%)",
          zIndex: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "4rem",
          overflowY: "auto"
        }}
      >
        {/* Contenu du texte - structure identique au hero-content */}
        <div
          style={{
            textAlign: "center",
            color: "var(--welcome-text-light, #ffffff)",
            maxWidth: "1200px",
            padding: "clamp(1rem, 3vw, 2rem)",
            width: "100%"
          }}
        >
          {renderTitle(title)}
          <div style={{ textAlign: "left", marginTop: "2rem" }}>
            {sections.map(([subtitle, val], i) => (
              <div key={i}>
                {subtitle && sectionTitle(subtitle)}
                {Array.isArray(val) ? list(val) : text(val)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

