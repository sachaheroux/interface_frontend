function FlowshopSPTInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme SPT</h4>
      <p>
        SPT (Shortest Processing Time) est une règle de tri qui exécute en priorité les jobs avec la durée totale la plus courte.
        Cela permet de minimiser le temps moyen de passage (flowtime) et de réduire les délais dans les ateliers Flowshop.
      </p>
      <p>
        Dans un flowshop, tous les jobs passent dans les machines dans le même ordre. Le SPT est une méthode simple mais souvent très efficace.
      </p>
    </div>
  );
}

export default FlowshopSPTInfo;