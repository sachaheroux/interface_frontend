function FlowshopJohnsonModifieInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de l'algorithme Johnson modifié</h4>
      <p>
        Johnson modifié est une extension de l’algorithme de Johnson classique qui permet de traiter
        les ateliers avec plus de deux machines. Il regroupe les machines en deux pseudo-machines afin de retrouver
        les conditions de Johnson classique.
      </p>
      <p>
        Plusieurs sous-problèmes sont générés à partir des regroupements possibles, puis évalués.
        Le meilleur ordonnancement global est sélectionné en minimisant le makespan parmi toutes les solutions candidates.
      </p>
      <p>
        Cette méthode conserve la rapidité de Johnson tout en permettant de l’utiliser dans des contextes plus complexes.
      </p>
    </div>
  );
}

export default FlowshopJohnsonModifieInfo;