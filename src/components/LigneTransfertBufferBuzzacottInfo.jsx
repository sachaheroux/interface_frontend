import React from "react";

export default function LigneTransfertBufferBuzzacottInfo() {
  const infoStyles = {
    container: {
      background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
      border: "2px solid #93c5fd",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#374151",
      fontSize: "0.95rem",
      fontFamily: "Inter, system-ui, sans-serif",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    title: {
      marginTop: 0,
      marginBottom: "1rem",
      color: "#3b82f6",
      fontSize: "1.3rem",
      fontWeight: "700",
      borderBottom: "2px solid #93c5fd",
      paddingBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    sectionTitle: {
      color: "#1d4ed8",
      marginBottom: "0.5rem",
      marginTop: "1rem",
      fontSize: "1rem",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    paragraph: {
      marginBottom: "0.5rem",
      lineHeight: "1.5",
    },
    list: {
      paddingLeft: "1.2rem",
      margin: "0.5rem 0",
    },
    listItem: {
      marginBottom: "0.3rem",
    },
    codeBlock: {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      border: "1px solid #93c5fd",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      fontFamily: "'Courier New', monospace",
      fontSize: "0.85rem",
      color: "#1d4ed8",
      marginBottom: "0.5rem",
    },
    highlight: {
      background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #93c5fd",
      marginBottom: "1rem",
    },
  };

  return (
    <div style={infoStyles.container}>
      <h3 style={infoStyles.title}>
        🏭 Buffer Buzzacott - Ligne de Transfert
      </h3>

      <div style={infoStyles.highlight}>
        <h4 style={infoStyles.sectionTitle}>🎯 Principe de l'algorithme</h4>
        <p style={infoStyles.paragraph}>
          L'algorithme de <strong>Buzzacott</strong> évalue l'impact d'un <strong>buffer intermédiaire</strong> 
          sur l'efficacité d'une ligne de transfert à deux stations. Il calcule le gain de productivité 
          et le retour sur investissement du buffer.
        </p>
      </div>

      <div>
        <h4 style={infoStyles.sectionTitle}>🔗 Contexte ligne de transfert</h4>
        <ul style={infoStyles.list}>
          <li style={infoStyles.listItem}><strong>2 stations séquentielles :</strong> Station 1 → Buffer → Station 2</li>
          <li style={infoStyles.listItem}><strong>Pannes aléatoires :</strong> Chaque station peut tomber en panne</li>
          <li style={infoStyles.listItem}><strong>Temps de réparation :</strong> Durée fixe pour remettre en service</li>
          <li style={infoStyles.listItem}><strong>Buffer intermédiaire :</strong> Stockage entre les stations</li>
        </ul>
      </div>

      <div>
        <h4 style={infoStyles.sectionTitle}>📊 Paramètres d'entrée</h4>
        <ul style={infoStyles.list}>
          <li style={infoStyles.listItem}><strong>α₁, α₂ :</strong> Taux de panne des stations 1 et 2</li>
          <li style={infoStyles.listItem}><strong>b₁⁻¹, b₂⁻¹ :</strong> Temps moyen de réparation (cycles)</li>
          <li style={infoStyles.listItem}><strong>Z :</strong> Capacité du buffer (nombre de pièces)</li>
          <li style={infoStyles.listItem}><strong>Production :</strong> Cadence nominale (pièces/jour)</li>
          <li style={infoStyles.listItem}><strong>Coûts :</strong> Jours travaillés, profit unitaire</li>
        </ul>
      </div>

      <div>
        <h4 style={infoStyles.sectionTitle}>🧮 Modèle mathématique</h4>
        <div style={infoStyles.codeBlock}>
          <div>x₁ = α₁ × b₁⁻¹</div>
          <div>x₂ = α₂ × b₂⁻¹</div>
          <div>s = x₂ / x₁</div>
          <div>r = α₂ / α₁</div>
        </div>
      </div>

      <div>
        <h4 style={infoStyles.sectionTitle}>📈 Calcul d'efficacité</h4>
        <ul style={infoStyles.list}>
          <li style={infoStyles.listItem}><strong>E(0) :</strong> Efficacité sans buffer</li>
          <li style={infoStyles.listItem}><strong>E(Z) :</strong> Efficacité avec buffer de taille Z</li>
          <li style={infoStyles.listItem}><strong>Gain :</strong> Production supplémentaire par année</li>
          <li style={infoStyles.listItem}><strong>ROI :</strong> Retour sur investissement du buffer</li>
        </ul>
      </div>

      <div style={infoStyles.highlight}>
        <h4 style={infoStyles.sectionTitle}>⚠️ Cas particulier s = 1</h4>
        <p style={infoStyles.paragraph}>
          Quand <strong>s = 1</strong> (x₁ = x₂), le modèle utilise une formule spéciale 
          pour éviter la division par zéro dans les calculs d'efficacité.
        </p>
      </div>

      <div>
        <h4 style={infoStyles.sectionTitle}>🎯 Applications</h4>
        <ul style={infoStyles.list}>
          <li style={infoStyles.listItem}><strong>Dimensionnement :</strong> Taille optimale du buffer</li>
          <li style={infoStyles.listItem}><strong>Investissement :</strong> Justification économique</li>
          <li style={infoStyles.listItem}><strong>Maintenance :</strong> Impact des politiques de réparation</li>
          <li style={infoStyles.listItem}><strong>Comparaison :</strong> Scénarios avec/sans buffer</li>
        </ul>
      </div>
    </div>
  );
} 