function FlowshopCompareInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de la comparaison d'algorithmes Flowshop</h4>
      <p>
        Cette fonctionnalité permet de comparer automatiquement tous les algorithmes 
        flowshop compatibles avec vos données pour identifier la meilleure solution 
        selon différents critères de performance.
      </p>
      <p>
        <strong>Algorithmes supportés :</strong>
      </p>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li><strong>SPT</strong> : Shortest Processing Time</li>
        <li><strong>EDD</strong> : Earliest Due Date</li>
        <li><strong>Contraintes</strong> : Solveur OR-Tools CP-SAT</li>
        <li><strong>Johnson</strong> : Optimal pour 2 machines exactement</li>
        <li><strong>Johnson modifié</strong> : Extension pour 3+ machines</li>
        <li><strong>Smith</strong> : Optimisation pour 1 machine</li>
      </ul>
      <p>
        Le système détecte automatiquement les algorithmes compatibles selon le nombre 
        de machines et affiche un tableau comparatif avec makespan, flowtime moyen, 
        et retard cumulé pour vous aider à choisir la meilleure stratégie.
      </p>
    </div>
  );
}

export default FlowshopCompareInfo; 