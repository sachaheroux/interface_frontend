function FlowshopSmithInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme de Smith</h4>
      <p>
        L'algorithme de Smith est une méthode d'ordonnancement à une seule machine basée sur les dates d’échéance.
        Il sélectionne les jobs admissibles dont la date d’échéance est postérieure au temps total restant,
        puis les ordonne en plaçant les plus longs en premier.
      </p>
      <p>
        Cette approche permet de minimiser le retard cumulé tout en offrant une séquence performante sur le flowtime
        et le nombre moyen de jobs dans le système.
      </p>
      <p>
        C’est une méthode utile pour les environnements où les ressources sont limitées à une machine et où les
        priorités de livraison sont importantes.
      </p>
    </div>
  );
}

export default FlowshopSmithInfo;