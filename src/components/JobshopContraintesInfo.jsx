import React from 'react';

function JobshopContraintesInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>À propos de la Programmation par Contraintes en Jobshop</h4>
      <p>
        La <strong>programmation par contraintes (CP)</strong> est une approche puissante pour résoudre le problème d'ordonnancement Jobshop. 
        Elle modélise le problème comme un ensemble de variables, domaines et contraintes à satisfaire.
      </p>
      
      <h5 style={{ color: "#1d4ed8", marginBottom: "0.5rem" }}>Principe de fonctionnement :</h5>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li><strong>Variables :</strong> temps de début et fin de chaque opération</li>
        <li><strong>Contraintes :</strong> précédence des tâches, non-chevauchement sur machines</li>
        <li><strong>Objectif :</strong> minimiser le makespan (temps total de production)</li>
      </ul>

      <h5 style={{ color: "#1d4ed8", marginBottom: "0.5rem" }}>Avantages :</h5>
      <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
        <li>Solutions <strong>optimales</strong> ou proches de l'optimum</li>
        <li>Gestion naturelle des <strong>contraintes complexes</strong></li>
        <li>Flexibilité pour différents <strong>objectifs</strong></li>
      </ul>

      <p>
        Utilise le solveur <strong>OR-Tools CP-SAT</strong> de Google pour une résolution efficace 
        des problèmes d'ordonnancement de taille moyenne.
      </p>
    </div>
  );
}

export default JobshopContraintesInfo; 