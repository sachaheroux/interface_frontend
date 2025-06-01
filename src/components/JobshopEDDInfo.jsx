function JobshopEDDInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme EDD en Jobshop</h4>
      <p>
        L'algorithme EDD (Earliest Due Date) en Jobshop est une règle de priorité qui ordonnance les opérations en fonction des dates dues des jobs auxquels elles appartiennent.
      </p>
      <p>
        Dans un environnement Jobshop, l'EDD fonctionne de la manière suivante :
      </p>
      <ul style={{ paddingLeft: "1.5rem" }}>
        <li>Parmi les opérations disponibles, priorité aux jobs ayant la date due la plus proche</li>
        <li>Respect des contraintes de précédence entre les opérations</li>
        <li>Prise en compte des routages différents pour chaque job</li>
      </ul>
      <p>
        Cette règle est particulièrement efficace pour minimiser le retard maximum et le nombre de jobs en retard, ce qui est crucial dans les environnements où le respect des délais est primordial.
      </p>
    </div>
  );
}

export default JobshopEDDInfo; 