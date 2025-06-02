function LigneAssemblageLPTInfo() {
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
      <h3 style={{ marginTop: 0, color: "#1d4ed8", fontSize: "1.2rem" }}>LPT - Longest Processing Time</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          LPT est un algorithme déterministe d'équilibrage de lignes d'assemblage qui 
          assigne en priorité les tâches ayant le **temps de traitement le plus long** 
          parmi les tâches éligibles à chaque étape.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Fonctionnement</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Identifier les tâches éligibles (prédécesseurs terminés + temps ≤ temps restant)</li>
          <li><strong>Sélectionner la tâche avec le temps le plus long</strong> parmi les éligibles</li>
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
          <li><strong>Déterminisme :</strong> Résultats identiques à chaque exécution</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Stratégie LPT</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Priorité :</strong> Tâches les plus longues d'abord</li>
          <li><strong>Objectif :</strong> Optimiser l'utilisation des stations</li>
          <li><strong>Logique :</strong> Placer les "gros morceaux" en premier</li>
          <li><strong>Résultat :</strong> Meilleur remplissage des stations</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Résultats déterministes et reproductibles</li>
          <li>Souvent plus efficace que la sélection aléatoire</li>
          <li>Logique intuitive et facile à comprendre</li>
          <li>Bonne utilisation des stations</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Peut créer des déséquilibres si tâches très différentes</li>
          <li>Pas de garantie d'optimalité globale</li>
          <li>Sensible aux contraintes de précédence</li>
          <li>Une seule solution possible (pas d'exploration)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Comparaison avec COMSOAL</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>LPT :</strong> Déterministe, tâche la plus longue</li>
          <li><strong>COMSOAL :</strong> Aléatoire, exploration multiple</li>
          <li><strong>Efficacité :</strong> LPT souvent plus stable</li>
          <li><strong>Flexibilité :</strong> COMSOAL plus exploratoire</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#1d4ed8", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Idéal quand vous voulez un résultat stable</li>
          <li>Efficace avec des tâches de durées variées</li>
          <li>Comparer avec COMSOAL pour optimiser</li>
          <li>Analyser l'équilibrage des charges par station</li>
        </ul>
      </div>
    </div>
  );
}

export default LigneAssemblageLPTInfo; 