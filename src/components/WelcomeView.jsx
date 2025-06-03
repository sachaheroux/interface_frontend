export default function WelcomeView() {
  return (
    <div
      style={{
        backgroundImage: "url('/fond.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "3rem",
        height: "100%",
        minHeight: "600px",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",       // positionne le bloc en haut
        paddingTop: "6rem",             // espace vertical au-dessus
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          backgroundColor: "rgba(0, 0, 0, 0.6)", // voile sombre
          padding: "2.5rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
          Bienvenue dans l'interface de modélisation des systèmes industriels
        </h2>

        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "1rem" }}>
          Cet outil interactif est conçu pour accompagner les ingénieurs et les planificateurs dans
          l'analyse, la modélisation et l'ordonnancement des systèmes de production industriels.
          Il permet d'exécuter automatiquement des algorithmes reconnus afin d'optimiser la performance
          des ateliers selon leur structure (flowshop, jobshop, ligne d'assemblage, etc.).
        </p>

        <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "1rem" }}>
          Grâce à une interface simple et modulaire, vous pouvez :
        </p>

        <ul style={{ marginLeft: "1.5rem", fontSize: "1.05rem", lineHeight: "1.8" }}>
          <li>🧭 Sélectionner un type de système de production</li>
          <li>⚙️ Choisir un algorithme adapté au contexte</li>
          <li>📝 Saisir les données de production (opérations, durées, ressources…)</li>
          <li>📊 Visualiser les résultats sous forme de textes et graphiques</li>
        </ul>

        <p style={{ fontSize: "1.05rem", lineHeight: "1.6", marginTop: "1.5rem" }}>
          Cet outil a été développé pour favoriser une prise de décision rapide et éclairée,
          que ce soit dans un cadre académique, industriel ou en simulation de scénarios.
        </p>
      </div>
    </div>
  );
}
