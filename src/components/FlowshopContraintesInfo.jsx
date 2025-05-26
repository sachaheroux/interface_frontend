function FlowshopContraintesInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de la programmation par contraintes (CP)</h4>
      <p>
        Cette méthode utilise un solveur de contraintes pour déterminer une planification optimale dans un système de type Flowshop. 
        Elle modélise chaque tâche par des variables de début, de fin et des intervalles, tout en imposant des contraintes de non chevauchement entre tâches sur une même machine.
      </p>
      <p>
        Le modèle cherche à minimiser le temps d’achèvement du dernier job (makespan). Il permet une flexibilité importante pour intégrer d’autres contraintes, mais peut échouer à trouver une solution si le problème est trop contraint.
      </p>
      <p style={{ fontWeight: "bold" }}>
        ⚠️ Si aucune solution n’est trouvée, l’interface l’indiquera clairement au lieu d’une erreur API.
      </p>
    </div>
  );
}

export default FlowshopContraintesInfo;