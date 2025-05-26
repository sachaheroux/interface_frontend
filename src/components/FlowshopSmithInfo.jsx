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
        L'algorithme de Smith est une méthode d'ordonnancement appliquée à un ensemble de jobs caractérisés par leur temps de traitement et leur date due. Il vise à déterminer une séquence optimale qui minimise le flowtime, le nombre moyen de jobs en cours, et le retard cumulé.
      </p>
      <p>
        <strong>Contraintes importantes :</strong><br/>
        Smith ne sélectionne que les jobs dits "admissibles", c'est-à-dire ceux dont la date due est supérieure ou égale au temps total restant à traiter (τ). Si aucun job ne respecte cette contrainte, l'algorithme ne peut générer de séquence valide, et un message explicite est retourné.
      </p>
      <p>
        Cette contrainte reflète une réalité de planification stricte : certains jobs sont écartés si leur échéance est trop courte pour être atteinte même avec un traitement immédiat.
      </p>
    </div>
  );
}

export default FlowshopSmithInfo;