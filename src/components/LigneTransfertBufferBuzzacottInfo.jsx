import React from "react";

export default function LigneTransfertBufferBuzzacottInfo() {
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
      <h4 style={{ marginTop: 0, color: "#1d4ed8" }}>Analyse Buffer Buzzacott</h4>
      
      <p>
        Le modèle de Buzzacott permet d'analyser l'efficacité d'un buffer inter-stations 
        dans une ligne de transfert à deux stations. Il calcule l'impact du buffer sur 
        la production en considérant les pannes et réparations.
      </p>

      <h5 style={{ color: "#1d4ed8", marginBottom: "0.5rem" }}>Paramètres clés</h5>
      <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
        <li><strong>α₁, α₂</strong> : Taux de panne des stations</li>
        <li><strong>b₁⁻¹, b₂⁻¹</strong> : Temps moyen avant réparation</li>
        <li><strong>Z</strong> : Taille du buffer</li>
        <li><strong>Production nominale</strong> : Capacité théorique</li>
      </ul>

      <h5 style={{ color: "#1d4ed8", marginBottom: "0.5rem" }}>Calculs effectués</h5>
      <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
        <li>Efficacité sans buffer E(0)</li>
        <li>Efficacité avec buffer E(Z)</li>
        <li>Production réelle avec/sans buffer</li>
        <li>Gain de production et impact économique</li>
      </ul>

      <p>
        <strong>Applications :</strong> Dimensionnement optimal de buffers, analyse coût-bénéfice, 
        amélioration de la productivité des lignes de transfert.
      </p>
    </div>
  );
} 