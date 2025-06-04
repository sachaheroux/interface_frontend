import React from "react";

export default function FMSSacADosInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>Problème du Sac à Dos - Optimal</h4>
      
      <p>
        L'algorithme optimal utilise la <strong>programmation dynamique</strong> pour résoudre 
        le problème classique du sac à dos. Il garantit la solution optimale en explorant 
        toutes les combinaisons possibles.
      </p>

      <h5 style={{ color: "#1d4ed8" }}>Caractéristiques :</h5>
      <ul>
        <li><strong>Complexité :</strong> O(nW) où n = nombre d'objets, W = capacité</li>
        <li><strong>Optimalité :</strong> Solution garantie optimale</li>
        <li><strong>Mémoire :</strong> Nécessite une table de programmation dynamique</li>
      </ul>

      <h5 style={{ color: "#1d4ed8" }}>Applications FMS :</h5>
      <ul>
        <li>Sélection des produits les plus rentables</li>
        <li>Allocation optimale des ressources de production</li>
        <li>Optimisation du planning de production</li>
        <li>Gestion des capacités limitées</li>
      </ul>

      <h5 style={{ color: "#1d4ed8" }}>Résultats :</h5>
      <ul>
        <li>Objets sélectionnés dans la solution optimale</li>
        <li>Valeur maximale réalisable</li>
        <li>Utilisation de la capacité</li>
        <li>Ratio valeur/poids de la solution</li>
      </ul>
    </div>
  );
} 