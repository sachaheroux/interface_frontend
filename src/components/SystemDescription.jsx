export default function SystemDescription({ system }) {
  const baseStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "2rem"
  };

  const backgrounds = {
    Flowshop: "/Flowshop1.jpg",
    Jobshop: "/Jobshop.jpg",
    "Ligne d'assemblage": "/Ligneassemblage.jpg",
    "Ligne d'assemblage mixte": "/lignedassemblagemixte.png",
    "Ligne de transfert": "/Lignetransfert.jpg",
    FMS: "/FMS.jpg"
  };

  const renderTitle = (title) => (
    <h1 style={{ 
      fontSize: "clamp(1.2rem, 4vw, 3.5rem)",
      fontWeight: "700",
      marginBottom: "clamp(0.3rem, 1.5vw, 1.5rem)",
      lineHeight: "1.3",
      background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)"
    }}>{title}</h1>
  );

  const sectionTitle = (text) => (
    <h3 style={{ 
      fontSize: "clamp(0.9rem, 2.5vw, 1.8rem)", 
      marginTop: "clamp(0.8rem, 2vw, 2.5rem)", 
      marginBottom: "clamp(0.3rem, 1.5vw, 1.2rem)", 
      color: "#ffffff",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
      fontWeight: "600"
    }}>{text}</h3>
  );

  const text = (html) => (
    <p style={{ 
      fontSize: "clamp(0.75rem, 2vw, 1.3rem)", 
      lineHeight: "clamp(1.3, 0.1vw + 1.2, 1.7)", 
      color: "#f8fafc",
      textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
      marginBottom: "clamp(0.5rem, 1.5vw, 1.5rem)",
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
          gap: "clamp(0.2rem, 0.8vw, 0.8rem)",
          fontSize: "clamp(0.7rem, 1.8vw, 1.2rem)",
          color: "#f8fafc",
          textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
          opacity: "0.95",
          marginBottom: "clamp(0.5rem, 1.5vw, 1.5rem)"
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(0.2rem, 0.8vw, 0.6rem)" }}>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s*/, '') }}></span>
              {i < items.length - 1 && (
                <span style={{ 
                  color: "#93c5fd", 
                  fontSize: "clamp(1em, 1.2vw, 1.4em)",
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
        marginLeft: "clamp(0.8rem, 1.5vw, 2rem)", 
        fontSize: "clamp(0.75rem, 2vw, 1.3rem)", 
        lineHeight: "clamp(1.3, 0.1vw + 1.2, 1.7)", 
        color: "#f8fafc",
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.4)",
        opacity: "0.95"
      }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: "clamp(0.2rem, 0.8vw, 0.8rem)" }} dangerouslySetInnerHTML={{ __html: item }}></li>)}
      </ul>
    );
  };

  const content = {
    Flowshop: [
      "Flowshop (atelier à flux linéaire)",
      [
        ["Définition", "Le <strong>Flowshop</strong> est un système où toutes les tâches suivent le même ordre de passage sur les machines. Chaque produit effectue les étapes dans un <strong>ordonnancement fixe</strong>, sans retour en arrière."],
        ["", "Utilisé dans des environnements <strong>standardisés</strong> comme la cosmétique, l'alimentaire ou l'électronique."],
        ["Cas d'usage", "Exemple : petite chaîne de production de parfums artisanaux. Chaque flacon passe par :"],
        ["", [
          "1. <strong>Préparation de la fragrance</strong>",
          "2. <strong>Remplissage des flacons</strong>",
          "3. <strong>Pose du bouchon</strong>",
          "4. <strong>Étiquetage et emballage</strong>"
        ]],
        ["", "Chaque parfum suit exactement le même itinéraire dans le même ordre : c'est typiquement un Flowshop."],
        ["Avantages", [
          "<strong>Simplicité de planification</strong>",
          "<strong>Réduction des transitions</strong>",
          "<strong>Facilité d'automatisation</strong>",
          "<strong>Visibilité claire du flux</strong>",
          "<strong>Qualité constante</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Peu flexible</strong> pour produits variés",
          "<strong>Goulots d'étranglement</strong> possibles",
          "<strong>Temps d'attente</strong> entre postes",
          "<strong>Dépendance à la séquence</strong>"
        ]]
      ]
    ],
    Jobshop: [
      "Jobshop (atelier à gamme variable)",
      [
        ["Définition", "Le <strong>Jobshop</strong> est un système où chaque produit suit un <strong>ordre spécifique de passage</strong> sur les machines. Il n'y a pas de séquence uniforme."],
        ["", "Utilisé pour la <strong>production artisanale</strong>, les <strong>petites séries</strong> et la <strong>fabrication sur mesure</strong>."],
        ["Cas d'usage", "Exemple : atelier de couture. Chaque commande suit un parcours personnalisé :"],
        ["", [
          "1. <strong>Coupe du tissu</strong>",
          "2. <strong>Assemblage des pièces</strong>",
          "3. <strong>Surfilage des bords</strong>",
          "4. <strong>Finitions et repassage</strong>"
        ]],
        ["", "Une robe suit : Coupe → Assemblage → Surfilage → Finitions, tandis qu'un pantalon pourrait suivre : Coupe → Surfilage → Assemblage → Finitions."],
        ["Avantages", [
          "<strong>Grande flexibilité</strong> pour pièces uniques",
          "<strong>Adapté aux commandes sur mesure</strong>",
          "<strong>Postes de travail polyvalents</strong>",
          "<strong>Qualité artisanale élevée</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Planification complexe</strong>",
          "<strong>Temps de changement</strong> fréquents",
          "<strong>Files d'attente</strong> aux postes populaires",
          "<strong>Coordination difficile</strong>"
        ]]
      ]
    ],
    "Ligne d'assemblage": [
      "Ligne d'assemblage",
      [
        ["Définition", "La <strong>ligne d'assemblage</strong> est un système <strong>séquentiel</strong> où un produit progresse d'un poste à l'autre. Chaque poste effectue une tâche spécifique."],
        ["", "Utilisée dans les industries <strong>automobile</strong> et <strong>électroménager</strong>."],
        ["Cas d'usage", "Exemple : chaîne de montage automobile. Étapes :"],
        ["", [
          "1. <strong>Soudage de la carrosserie</strong>",
          "2. <strong>Peinture et séchage</strong>",
          "3. <strong>Montage du moteur</strong>",
          "4. <strong>Assemblage final et tests</strong>"
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
        ["Définition", "La <strong>ligne de transfert</strong> est un système entièrement automatisé où les pièces se déplacent automatiquement entre stations fixes. Chaque poste effectue une opération spécialisée."],
        ["", "Utilisée pour la <strong>production de masse</strong> avec des volumes très élevés et une standardisation totale."],
        ["Cas d'usage", "Exemple : ligne de production de sodas automatisée. Étapes typiques :"],
        ["", [
          "1. <strong>Alimentation des bouteilles vides</strong>",
          "2. <strong>Remplissage automatique</strong>",
          "3. <strong>Capsulage robotisé</strong>",
          "4. <strong>Étiquetage et contrôle qualité</strong>"
        ]],
        ["", "Chaque bouteille suit exactement le même parcours avec des temps de cycle précis et une synchronisation parfaite."],
        ["Avantages", [
          "<strong>Cadence très élevée</strong> et constante",
          "<strong>Automatisation complète</strong>",
          "<strong>Qualité standardisée</strong>",
          "<strong>Coûts unitaires faibles</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Flexibilité nulle</strong> - un seul produit",
          "<strong>Investissement initial énorme</strong>",
          "<strong>Arrêt total</strong> si panne d'un poste"
        ]]
      ]
    ],
    FMS: [
      "FMS – Flexible Manufacturing System",
      [
        ["Définition", "Le <strong>FMS</strong> est un système <strong>hautement flexible</strong> combinant machines automatisées, robots et <strong>pilotage informatique avancé</strong>."],
        ["", "Permet de produire <strong>plusieurs types de pièces différentes</strong> sans reconfiguration manuelle lourde grâce à un contrôle numérique centralisé."],
        ["Cas d'usage", "Exemple : atelier intelligent piloté par logiciel avec machines CNC, robots et AGV :"],
        ["", [
          "1. <strong>Réception de l'ordre de fabrication</strong>",
          "2. <strong>Transport automatique des pièces</strong>",
          "3. <strong>Usinage CNC adaptatif</strong>",
          "4. <strong>Contrôle qualité automatisé</strong>"
        ]],
        ["", "Le système s'adapte automatiquement selon le produit : une pièce simple utilise une machine, une pièce complexe mobilise plusieurs postes."],
        ["Avantages", [
          "<strong>Grande flexibilité</strong> de production",
          "<strong>Réduction des temps morts</strong>",
          "<strong>Utilisation optimale</strong> des ressources",
          "<strong>Adaptabilité</strong> aux demandes variées",
          "<strong>Qualité constante</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Investissement initial énorme</strong>",
          "<strong>Complexité de programmation</strong>",
          "<strong>Maintenance haute technologie</strong>",
          "<strong>Dépendance totale</strong> au système informatique"
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
        height: "100vh",
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
          paddingTop: "clamp(0.5rem, 2vh, 1rem)",
          paddingBottom: "clamp(1rem, 3vh, 2rem)",
          paddingLeft: "clamp(0.5rem, 2vw, 1rem)",
          paddingRight: "clamp(0.5rem, 2vw, 1rem)",
          overflowY: "auto"
        }}
      >
        {/* Contenu du texte - structure identique au hero-content */}
        <div
          style={{
            textAlign: "center",
            color: "var(--welcome-text-light, #ffffff)",
            maxWidth: "clamp(95vw, 90vw, 1200px)",
            padding: "clamp(0.5rem, 3vw, 2rem)",
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

