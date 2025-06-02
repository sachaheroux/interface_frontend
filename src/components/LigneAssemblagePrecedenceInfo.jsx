function LigneAssemblagePrecedenceInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos du Diagramme de Précédence</h4>
      
      <p>
        Le diagramme de précédence est un outil fondamental pour l'analyse des lignes d'assemblage. 
        Il permet de visualiser les relations de dépendance entre les tâches et d'identifier le chemin critique.
      </p>

      <h5 style={{ color: "#1d4ed8", marginTop: "1rem" }}>Fonctionnalités :</h5>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li><strong>Visualisation :</strong> Représentation graphique hiérarchique des tâches</li>
        <li><strong>Chemin critique :</strong> Identification du parcours le plus long</li>
        <li><strong>Métriques :</strong> Calcul des durées, niveaux et parallélisme</li>
        <li><strong>Validation :</strong> Vérification automatique de la cohérence</li>
      </ul>

      <h5 style={{ color: "#1d4ed8", marginTop: "1rem" }}>Données d'entrée :</h5>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li><strong>Tâche :</strong> Identifiant unique (numéro)</li>
        <li><strong>Prédécesseurs :</strong> Tâches qui doivent être terminées avant</li>
        <li><strong>Durée :</strong> Temps nécessaire pour réaliser la tâche</li>
      </ul>

      <p style={{ fontSize: "0.9rem", fontStyle: "italic", marginTop: "1rem" }}>
        <strong>Conseil :</strong> Utilisez l'exemple par défaut pour comprendre le fonctionnement, 
        puis adaptez selon vos besoins spécifiques.
      </p>
    </div>
  );
}

export default LigneAssemblagePrecedenceInfo; 