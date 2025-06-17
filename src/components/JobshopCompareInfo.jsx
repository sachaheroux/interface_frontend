function JobshopCompareInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #2563eb",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de la comparaison d'algorithmes Jobshop</h4>
      <p>
        Cette fonctionnalité permet de comparer automatiquement tous les algorithmes 
        jobshop disponibles pour identifier la meilleure solution selon différents 
        critères de performance.
      </p>
      <p>
        <strong>Algorithmes supportés :</strong>
      </p>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li><strong>SPT</strong> : Shortest Processing Time - Priorité aux tâches les plus courtes</li>
        <li><strong>EDD</strong> : Earliest Due Date - Priorité aux jobs avec dates d'échéance les plus proches</li>
        <li><strong>Contraintes</strong> : Solveur optimal OR-Tools CP-SAT</li>
      </ul>
      <p>
        <strong>Spécificités Jobshop :</strong>
      </p>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li>Chaque job a sa propre séquence de machines</li>
        <li>Les machines peuvent être visitées dans n'importe quel ordre</li>
        <li>Contraintes de précédence à l'intérieur de chaque job</li>
        <li>Partage des ressources (machines) entre tous les jobs</li>
      </ul>
      <p>
        Le système compare automatiquement tous les algorithmes et affiche un tableau 
        comparatif avec makespan, flowtime moyen, et retard cumulé pour vous aider à 
        choisir la meilleure stratégie d'ordonnancement.
      </p>
    </div>
  );
}

export default JobshopCompareInfo; 