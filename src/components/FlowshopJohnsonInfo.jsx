function FlowshopJohnsonInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme Johnson</h4>
      <p>
        L’algorithme de Johnson est une méthode d’ordonnancement spécifique aux ateliers à 2 machines.
        Il vise à minimiser le **makespan** (temps total de production) en déterminant une séquence optimale des jobs.
      </p>
      <p>
        Chaque job passe d’abord sur la Machine 1 puis sur la Machine 2. Johnson trie les jobs selon la plus courte
        durée entre les deux opérations, ce qui permet d’optimiser le chevauchement des tâches.
      </p>
      <p>
        Cette méthode est rapide, efficace et garantit une solution optimale dans ce contexte limité à 2 machines.
      </p>
    </div>
  );
}

export default FlowshopJohnsonInfo;
