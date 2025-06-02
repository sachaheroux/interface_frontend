export default function FMSSacADosInfo() {
  return (
    <div style={{ 
      padding: "1.5rem", 
      background: "#f8fafc", 
      borderRadius: "0.5rem", 
      fontSize: "0.9rem", 
      lineHeight: "1.6",
      border: "1px solid #e2e8f0"
    }}>
      <h3 style={{ color: "#1e40af", marginBottom: "1rem", fontSize: "1.1rem" }}>
        🎒 FMS - Algorithme du Sac à Dos
      </h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>📖 Description</h4>
        <p style={{ margin: "0.5rem 0" }}>
          L'algorithme du sac à dos appliqué aux systèmes FMS (Flexible Manufacturing System) 
          optimise la sélection de produits à fabriquer selon leur rentabilité et les contraintes 
          de capacité de production.
        </p>
        <p style={{ margin: "0.5rem 0" }}>
          Utilise la <strong>programmation dynamique</strong> pour trouver la solution optimale 
          qui maximise le profit total sous contrainte de capacité.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>🎯 Objectif</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Maximiser le profit total de production</li>
          <li>Respecter la capacité maximale de la machine</li>
          <li>Sélectionner les produits les plus rentables</li>
          <li>Optimiser l'utilisation des ressources</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>📊 Paramètres d'entrée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Prix de vente</strong> : Prix unitaire de chaque produit</li>
          <li><strong>Coût MP</strong> : Coût de la matière première par unité</li>
          <li><strong>Demande</strong> : Nombre d'unités demandées</li>
          <li><strong>Temps fabrication</strong> : Temps machine requis par unité</li>
          <li><strong>Coût opération</strong> : Coût machine par heure</li>
          <li><strong>Capacité max</strong> : Limite de temps machine disponible</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>⚡ Algorithme</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Calcul du profit unitaire par produit</li>
          <li>Calcul du temps total requis par produit</li>
          <li>Application de la programmation dynamique</li>
          <li>Construction du tableau DP (produit × capacité)</li>
          <li>Reconstruction de la solution optimale</li>
        </ol>
        <div style={{ 
          background: "#fef3c7", 
          padding: "0.8rem", 
          borderRadius: "0.375rem", 
          marginTop: "0.8rem",
          border: "1px solid #fcd34d"
        }}>
          <strong>Formule clé :</strong><br />
          Profit unitaire = Prix vente - (Coût opération × Temps fab. + Coût MP)
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>📈 Résultats</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profit maximal</strong> : Revenus optimaux possibles</li>
          <li><strong>Produits sélectionnés</strong> : Liste des produits à fabriquer</li>
          <li><strong>Utilisation capacité</strong> : Pourcentage d'utilisation machine</li>
          <li><strong>Efficacité</strong> : Ratio profit/coût de capacité</li>
          <li><strong>Analyse graphique</strong> : Visualisation des résultats</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#374151", marginBottom: "0.5rem" }}>✅ Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Solution optimale garantie</li>
          <li>Complexité raisonnable O(n×C)</li>
          <li>Applicable à tout type de produit</li>
          <li>Prise en compte des coûts réels</li>
          <li>Analyse de sensibilité possible</li>
        </ul>
      </div>

      <div style={{ 
        background: "#e0f2fe", 
        padding: "1rem", 
        borderRadius: "0.375rem", 
        marginTop: "1rem",
        border: "1px solid #81d4fa"
      }}>
        <h4 style={{ color: "#0277bd", margin: "0 0 0.5rem 0" }}>💡 Cas d'usage</h4>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Idéal pour les entreprises manufacturières qui doivent sélectionner 
          les produits les plus rentables à fabriquer avec des ressources limitées. 
          Particulièrement utile en planification de production à court terme.
        </p>
      </div>
    </div>
  );
} 