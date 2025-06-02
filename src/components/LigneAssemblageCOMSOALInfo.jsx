function LigneAssemblageCOMSOALInfo() {
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
      <h3 style={{ marginTop: 0, color: "#1d4ed8", fontSize: "1.2rem" }}>COMSOAL - Computer Method of Sequencing Operations for Assembly Lines</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          COMSOAL est un algorithme heuristique d'équilibrage de lignes d'assemblage qui 
          assigne les tâches aux stations de travail en respectant les contraintes de précédence 
          et le temps de cycle imposé.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Fonctionnement</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Identifier les tâches éligibles (prédécesseurs terminés + temps ≤ temps restant)</li>
          <li>Sélectionner une tâche aléatoirement parmi les éligibles</li>
          <li>Assigner la tâche à la station courante</li>
          <li>Répéter jusqu'à ce qu'aucune tâche ne soit éligible</li>
          <li>Créer une nouvelle station et recommencer</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Données d'entrée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Tâches :</strong> ID, durée, prédécesseurs immédiats</li>
          <li><strong>Temps de cycle :</strong> Temps maximum par station</li>
          <li><strong>Graine aléatoire :</strong> Pour reproduire les résultats (optionnel)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques d'analyse</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Nombre de stations :</strong> Stations créées par l'algorithme</li>
          <li><strong>Stations théoriques min :</strong> Minimum théorique (temps total / temps cycle)</li>
          <li><strong>Efficacité :</strong> (Temps total tâches / Temps total ligne) × 100</li>
          <li><strong>Utilisation moyenne :</strong> Moyenne des taux d'utilisation des stations</li>
          <li><strong>Taux d'équilibrage :</strong> (Stations min / Stations réelles) × 100</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Applicable à tous types de réseaux de précédence</li>
          <li>Génère des solutions différentes à chaque exécution</li>
          <li>Permet d'explorer l'espace des solutions</li>
          <li>Relativement simple à implémenter</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Résultats dépendants de l'aléatoire</li>
          <li>Pas de garantie d'optimalité</li>
          <li>Nécessite plusieurs exécutions pour évaluer la qualité</li>
          <li>Performance variable selon le réseau de précédence</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Interprétation des résultats</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Efficacité {'>'}90% :</strong> Excellent équilibrage</li>
          <li><strong>Efficacité 80-90% :</strong> Bon équilibrage</li>
          <li><strong>Efficacité {'<'}80% :</strong> Équilibrage à améliorer</li>
          <li><strong>Stations colorées :</strong> Vert ({'>'}80%), orange (60-80%), rouge ({'<'}60%)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Exécuter plusieurs fois avec graines différentes</li>
          <li>Ajuster le temps de cycle selon les objectifs</li>
          <li>Analyser la répartition des tâches par station</li>
          <li>Considérer l'équilibrage et l'efficacité ensemble</li>
        </ul>
      </div>
    </div>
  );
}

export default LigneAssemblageCOMSOALInfo; 