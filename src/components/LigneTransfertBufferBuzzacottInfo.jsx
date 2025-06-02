export default function LigneTransfertBufferBuzzacottInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #dc2626",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h3 style={{ marginTop: 0, color: "#dc2626", fontSize: "1.2rem" }}>Buffer Buzzacott - Ligne de Transfert</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme de <strong>Buzzacott</strong> évalue l'impact d'un <strong>buffer intermédiaire</strong> 
          sur l'efficacité d'une ligne de transfert à deux stations. Il calcule le gain de productivité 
          et le retour sur investissement du buffer.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Contexte ligne de transfert</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>2 stations séquentielles :</strong> Station 1 → Buffer → Station 2</li>
          <li><strong>Pannes aléatoires :</strong> Chaque station peut tomber en panne</li>
          <li><strong>Temps de réparation :</strong> Durée fixe pour remettre en service</li>
          <li><strong>Buffer intermédiaire :</strong> Stockage entre les stations</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres d'entrée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>α₁, α₂ :</strong> Taux de panne des stations 1 et 2</li>
          <li><strong>b₁⁻¹, b₂⁻¹ :</strong> Temps moyen de réparation (cycles)</li>
          <li><strong>Z :</strong> Capacité du buffer (nombre de pièces)</li>
          <li><strong>Production :</strong> Cadence nominale (pièces/jour)</li>
          <li><strong>Coûts :</strong> Jours travaillés, profit unitaire</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Modèle mathématique</h4>
        <div style={{ backgroundColor: "#fee2e2", padding: "0.75rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>x₁ = α₁ × b₁⁻¹</div>
          <div style={{ marginBottom: "0.5rem" }}>x₂ = α₂ × b₂⁻¹</div>
          <div style={{ marginBottom: "0.5rem" }}>s = x₂ / x₁</div>
          <div style={{ marginBottom: "0.5rem" }}>r = α₂ / α₁</div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul d'efficacité</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>E(0) :</strong> Efficacité sans buffer</li>
          <li><strong>E(Z) :</strong> Efficacité avec buffer de taille Z</li>
          <li><strong>Gain :</strong> Production supplémentaire par année</li>
          <li><strong>ROI :</strong> Retour sur investissement du buffer</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas particulier s = 1</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Quand <strong>s = 1</strong> (x₁ = x₂), le modèle utilise une formule spéciale 
          pour éviter la division par zéro dans les calculs d'efficacité.
        </p>
      </div>

      <div>
        <h4 style={{ color: "#dc2626", marginBottom: "0.5rem", fontSize: "1rem" }}>Applications</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Dimensionnement :</strong> Taille optimale du buffer</li>
          <li><strong>Investissement :</strong> Justification économique</li>
          <li><strong>Maintenance :</strong> Impact des politiques de réparation</li>
          <li><strong>Comparaison :</strong> Scénarios avec/sans buffer</li>
        </ul>
      </div>
    </div>
  );
} 