export default function SystemDescription({ system }) {
  const baseStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "2rem"
  };

  const backgrounds = {
    Flowshop: "/flowshop.png",
    Jobshop: "/jobshop.png",
    "Ligne d'assemblage": "/lignedassemblage.png",
    "Ligne de transfert": "/lignedetransfert.png",
    FMS: "/fms.png"
  };

  const renderTitle = (title) => (
    <h2 style={{ fontSize: "1.8rem", color: "#ffffff", marginBottom: "1rem" }}>{title}</h2>
  );

  const sectionTitle = (text) => (
    <h3 style={{ fontSize: "1.3rem", marginTop: "1.5rem", marginBottom: "0.5rem", color: "#ffffff" }}>{text}</h3>
  );

  const text = (html) => (
    <p style={{ fontSize: "1.05rem", lineHeight: "1.6", color: "#ffffff" }} dangerouslySetInnerHTML={{ __html: html }}></p>
  );

  const list = (items) => (
    <ul style={{ marginLeft: "1.5rem", fontSize: "1.05rem", lineHeight: "1.8", color: "#ffffff" }}>
      {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>)}
    </ul>
  );

  const content = {
    Flowshop: [
      "Flowshop (atelier à flux linéaire)",
      [
        ["Définition", "Le <strong>Flowshop</strong> est un système où toutes les tâches suivent le même ordre de passage sur les machines. Chaque produit effectue les étapes dans un <strong>ordonnancement fixe</strong>, sans retour en arrière."],
        ["", "Utilisé dans des environnements <strong>standardisés</strong> comme l’automobile ou l’électronique."],
        ["Cas d’usage", "Exemple : fabrication de cartes électroniques. Chaque carte passe par :"],
        ["", [
          "1. <strong>Machine de gravure</strong>",
          "2. <strong>Machine de perçage</strong>",
          "3. <strong>Poste de soudure</strong>",
          "4. <strong>Contrôle qualité</strong>"
        ]],
        ["", "Chaque produit suit le même itinéraire : c’est typiquement un Flowshop."],
        ["Avantages", [
          "<strong>Simplicité de planification</strong>",
          "<strong>Réduction des transitions</strong>",
          "<strong>Facilité d’automatisation</strong>",
          "<strong>Visibilité claire du flux</strong>"
        ]],
        ["Inconvénients", [
          "<strong>Peu flexible</strong> pour produits variés",
          "<strong>Goulots d’étranglement</strong> possibles",
          "<strong>Temps d’attente</strong> entre postes"
        ]]
      ]
    ],
    Jobshop: [
      "Jobshop (atelier à gamme variable)",
      [
        ["Définition", "Le <strong>Jobshop</strong> est un système où chaque produit suit un <strong>ordre spécifique de passage</strong> sur les machines. Il n’y a pas de séquence uniforme."],
        ["", "Utilisé pour la <strong>production unitaire</strong>, les <strong>petites séries</strong> et <strong>prototypage</strong>."],
        ["Cas d’usage", "Exemple : fabrication de pièces mécaniques. Une commande suit :"],
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
          "<strong>Files d’attente et conflits</strong>"
        ]]
      ]
    ],
    "Ligne d'assemblage": [
      "Ligne d’assemblage",
      [
        ["Définition", "La <strong>ligne d’assemblage</strong> est un système <strong>séquentiel</strong> où un produit progresse d’un poste à l’autre. Chaque poste effectue une tâche spécifique."],
        ["", "Utilisée dans les industries <strong>automobile</strong> et <strong>électroménager</strong>."],
        ["Cas d’usage", "Exemple : chaîne de montage d’un grille-pain. Étapes :"],
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
    "Ligne de transfert": [
      "Ligne de transfert (système automatisé rigide)",
      [
        ["Définition", "La <strong>ligne de transfert</strong> automatise le déplacement des pièces entre stations fixes. Chaque poste effectue une tâche unique."],
        ["", "Utilisée pour la <strong>production de masse</strong> standardisée."],
        ["Cas d’usage", "Exemple : production de boîtiers plastiques. Étapes :"],
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
        ["Cas d’usage", "Exemple : atelier piloté par logiciel avec machines CNC, robots et AGV :"],
        ["", [
          "1. <strong>Réception de l’ordre de fabrication</strong>",
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
          "<strong>Coût élevé</strong> à l’installation",
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
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "3rem 0",
        minHeight: "100vh"
      }}
    >
      <div
        style={{
          ...baseStyle,
          backgroundColor: "rgba(0,0,0,0.65)",
          borderRadius: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
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

