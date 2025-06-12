import React from 'react';

const FlowshopMachinesMultiplesInfo = () => {
  return (
    <div className="info-panel">
      <h3>🏭 Machines Multiples</h3>
      
      <div className="info-section">
        <h4>Description</h4>
        <p>
          L'algorithme Machines Multiples résout les problèmes de flowshop hybride où 
          plusieurs machines parallèles sont disponibles à chaque étape. Chaque job 
          peut être traité par n'importe quelle machine disponible dans une étape donnée.
        </p>
      </div>

      <div className="info-section">
        <h4>Fonctionnement</h4>
        <ul>
          <li><strong>Modélisation OR-Tools</strong> : Utilise la programmation par contraintes avec CP-SAT</li>
          <li><strong>Variables optionnelles</strong> : Chaque tâche peut être assignée à une machine spécifique</li>
          <li><strong>Contraintes de précédence</strong> : Respect de l'ordre des opérations dans chaque job</li>
          <li><strong>Contraintes de ressources</strong> : Une machine ne peut traiter qu'une tâche à la fois</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>Objectif</h4>
        <p>
          Minimise le makespan (temps total de production) en optimisant l'affectation 
          des tâches aux machines parallèles disponibles.
        </p>
      </div>

      <div className="info-section">
        <h4>Avantages</h4>
        <ul>
          <li>Gestion des machines parallèles</li>
          <li>Flexibilité d'affectation</li>
          <li>Solution optimale garantie</li>
          <li>Adapté aux environnements industriels réels</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>Paramètres</h4>
        <ul>
          <li><strong>Jobs</strong> : Séquence d'opérations à réaliser</li>
          <li><strong>Machines par étape</strong> : Nombre de machines parallèles disponibles</li>
          <li><strong>Durées alternatives</strong> : Temps de traitement sur chaque machine</li>
          <li><strong>Due dates</strong> : Échéances de livraison des jobs</li>
        </ul>
      </div>
    </div>
  );
};

export default FlowshopMachinesMultiplesInfo; 