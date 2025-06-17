import React from 'react';

const LigneAssemblageCompareInfo = () => {
  return (
    <div className="infoPanel">
      <h2>Comparaison d'algorithmes - Ligne d'assemblage</h2>
      
      <div className="infoSection">
        <h3>🔍 Algorithmes comparés</h3>
        <ul>
          <li><strong>Programmation Linéaire (PL)</strong> : Solution optimale garantie</li>
          <li><strong>Longest Processing Time (LPT)</strong> : Heuristique basée sur la durée</li>
          <li><strong>COMSOAL</strong> : Méthode de génération aléatoire</li>
        </ul>
      </div>

      <div className="infoSection">
        <h3>📊 Critères de comparaison</h3>
        <ul>
          <li><strong>Nombre de stations</strong> : Objectif principal à minimiser</li>
          <li><strong>Efficacité</strong> : Utilisation optimale des ressources</li>
          <li><strong>Écart à l'optimal</strong> : Distance par rapport à la solution théorique</li>
        </ul>
      </div>

      <div className="infoSection">
        <h3>🏆 Sélection du meilleur</h3>
        <p>
          L'algorithme optimal est choisi selon cette priorité :
        </p>
        <ol>
          <li>Nombre de stations minimal</li>
          <li>Efficacité maximale</li>
          <li>Écart à l'optimal minimal</li>
        </ol>
      </div>

      <div className="infoSection">
        <h3>⚡ Avantages de la comparaison</h3>
        <ul>
          <li>Évaluation objective des performances</li>
          <li>Choix éclairé de l'algorithme optimal</li>
          <li>Analyse comparative des métriques</li>
          <li>Visualisation des résultats</li>
        </ul>
      </div>
    </div>
  );
};

export default LigneAssemblageCompareInfo; 