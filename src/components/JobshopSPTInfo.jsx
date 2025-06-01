function JobshopSPTInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme SPT en Jobshop</h4>
      <p>
        Dans un environnement Jobshop, l'algorithme SPT (Shortest Processing Time) priorise les opérations ayant le temps de traitement le plus court parmi les opérations disponibles à chaque instant.
      </p>
      <p>
        Contrairement au Flowshop, dans un Jobshop chaque job peut avoir un routage différent à travers les machines. L'algorithme SPT s'adapte en :
      </p>
      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Identifiant les opérations disponibles à chaque instant</li>
        <li>Sélectionnant l'opération avec le plus petit temps de traitement</li>
        <li>Respectant les contraintes de précédence entre les opérations d'un même job</li>
      </ul>
      <p>
        Cette règle est particulièrement efficace pour minimiser le temps moyen d'écoulement (flowtime) et réduire l'encours de production.
      </p>
    </div>
  );
}

export default JobshopSPTInfo; 