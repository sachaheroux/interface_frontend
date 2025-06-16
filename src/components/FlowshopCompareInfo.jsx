function FlowshopCompareInfo() {
  return (
    <div className="info-container">
      <h3>🔄 Comparaison des algorithmes Flowshop</h3>
      
      <div className="info-section">
        <h4>📋 Objectif</h4>
        <p>
          Cette fonctionnalité permet de comparer automatiquement tous les algorithmes 
          flowshop compatibles avec vos données pour trouver la meilleure solution 
          selon différents critères.
        </p>
      </div>

      <div className="info-section">
        <h4>🎯 Algorithmes supportés</h4>
        <ul>
          <li><strong>SPT</strong> : Shortest Processing Time (toutes configurations)</li>
          <li><strong>EDD</strong> : Earliest Due Date (toutes configurations)</li>
          <li><strong>Contraintes</strong> : Solveur OR-Tools CP-SAT (toutes configurations)</li>
          <li><strong>Johnson</strong> : Algorithme optimal pour exactement 2 machines</li>
          <li><strong>Johnson modifié</strong> : Extension pour 3 machines minimum</li>
          <li><strong>Smith</strong> : Optimisation pondérée pour 1 machine exactement</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>⚡ Sélection automatique</h4>
        <p>
          Le système détecte automatiquement le nombre de machines dans vos données 
          et n'exécute que les algorithmes compatibles. Les algorithmes incompatibles 
          sont signalés avec une explication claire.
        </p>
      </div>

      <div className="info-section">
        <h4>📊 Critères de comparaison</h4>
        <ul>
          <li><strong>Makespan</strong> : Temps total de production</li>
          <li><strong>Flowtime moyen</strong> : Temps de séjour moyen des jobs</li>
          <li><strong>Retard cumulé</strong> : Somme des retards par rapport aux dates dues</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>🏆 Résultats</h4>
        <ul>
          <li>Tableau comparatif avec toutes les métriques</li>
          <li>Identification du meilleur algorithme par critère</li>
          <li>Diagrammes de Gantt pour chaque algorithme</li>
          <li>Export Excel des résultats</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>💡 Conseils d'utilisation</h4>
        <ul>
          <li>Utilisez l'import Excel pour traiter rapidement vos données réelles</li>
          <li>Le choix du "meilleur" algorithme dépend de votre priorité (temps vs retards)</li>
          <li>Johnson est optimal pour 2 machines si applicable à votre contexte</li>
          <li>OR-Tools Contraintes offre la meilleure qualité mais peut être plus lent</li>
        </ul>
      </div>
    </div>
  );
}

export default FlowshopCompareInfo; 