function FlowshopEDDInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme EDD</h4>
      <p>
        EDD (Earliest Due Date) est une règle de priorité qui trie les jobs en fonction de leur date d'échéance la plus proche.
        Cela permet de réduire le retard cumulé dans les ateliers de type Flowshop.
      </p>
      <p>
        Dans un flowshop, tous les jobs passent dans les machines dans le même ordre. L'EDD est particulièrement utile lorsque le respect des dates dues est critique.
      </p>
    </div>
  );
}

export default FlowshopEDDInfo;
