export default function FMSSacADosInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #8b5cf6",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h3 style={{ marginTop: 0, color: "#8b5cf6", fontSize: "1.2rem" }}>FMS - Algorithme du Sac à Dos</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme du sac à dos utilise la <strong>programmation dynamique</strong> pour 
          optimiser la sélection de produits à fabriquer dans un système FMS 
          sous contrainte de <strong>capacité limitée</strong>.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contexte FMS</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Flexibilité :</strong> Système de fabrication flexible</li>
          <li><strong>Multi-produits :</strong> Plusieurs produits candidats</li>
          <li><strong>Capacité limitée :</strong> Temps de production contraint</li>
          <li><strong>Optimisation profit :</strong> Maximiser le retour sur investissement</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul du profit unitaire</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Pour chaque produit, le profit est calculé comme :
        </p>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Profit = Prix_vente - (Coût_MP + Coût_opération × Temps_fabrication)
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Modélisation mathématique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variables :</strong> x[i] = 1 si produit i sélectionné, 0 sinon</li>
          <li><strong>Objectif :</strong> Maximiser Σ(profit[i] × demande[i] × x[i])</li>
          <li><strong>Contrainte :</strong> Σ(temps[i] × demande[i] × x[i]) ≤ Capacité</li>
          <li><strong>Méthode :</strong> Programmation dynamique</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres d'entrée</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Prix de vente :</strong> Revenus par unité vendue</li>
          <li><strong>Coût matière première :</strong> Coût des matériaux par unité</li>
          <li><strong>Demande :</strong> Quantité demandée par produit</li>
          <li><strong>Temps fabrication :</strong> Temps machine par unité</li>
          <li><strong>Coût d'opération :</strong> Coût machine par heure</li>
          <li><strong>Capacité maximale :</strong> Temps total disponible</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Algorithme dynamique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Tableau DP :</strong> dp[i][j] = profit maximal avec i premiers produits et capacité j</li>
          <li><strong>Récurrence :</strong> dp[i][j] = max(dp[i-1][j], profit[i] + dp[i-1][j-temps[i]])</li>
          <li><strong>Reconstruction :</strong> Remontée pour identifier les produits sélectionnés</li>
          <li><strong>Complexité :</strong> O(n × capacité)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité :</strong> Solution mathématiquement optimale garantie</li>
          <li><strong>Efficacité :</strong> Temps polynomial en capacité</li>
          <li><strong>Précision :</strong> Prise en compte de tous les coûts</li>
          <li><strong>Flexibilité :</strong> Adaptation facile à différents contextes</li>
          <li><strong>Décisionnel :</strong> Aide à la planification de production</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques d'évaluation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profit maximal :</strong> Retour financier total optimisé</li>
          <li><strong>Utilisation capacité :</strong> Pourcentage de temps utilisé</li>
          <li><strong>Efficacité :</strong> Ratio profit/coût opérationnel</li>
          <li><strong>Produits sélectionnés :</strong> Nombre et détails des choix</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations incluses</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profits par produit :</strong> Comparaison des gains sélectionnés</li>
          <li><strong>Utilisation capacité :</strong> Répartition temps utilisé/disponible</li>
          <li><strong>Analyse profit/temps :</strong> Scatter plot des performances</li>
          <li><strong>Métriques globales :</strong> Tableau de bord synthétique</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Capacité entière :</strong> Temps discrétisé en unités entières</li>
          <li><strong>Demande fixe :</strong> Pas de modulation des quantités</li>
          <li><strong>Mémoire :</strong> Tableau de taille n × capacité</li>
          <li><strong>Prérequis :</strong> Profits et temps bien définis</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'usage FMS</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Usines intelligentes :</strong> Sélection automatique de produits</li>
          <li><strong>Production à la demande :</strong> Optimisation commandes client</li>
          <li><strong>Prototypage :</strong> Choix de variants à développer</li>
          <li><strong>Planification :</strong> Allocation de ressources limitées</li>
          <li><strong>ROI :</strong> Maximisation du retour sur investissement</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Différences avec autres algorithmes</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Glouton :</strong> Rapide mais non optimal
            <br />
            <strong>Sac à dos :</strong> Optimal mais plus complexe
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Planification :</strong> Ordre des tâches
            <br />
            <strong>Sac à dos :</strong> Sélection binaire (tout ou rien)
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Vérifiez la cohérence des données de coûts</li>
          <li>Adaptez la capacité selon vos contraintes réelles</li>
          <li>Analysez les produits exclus pour comprendre pourquoi</li>
          <li>Utilisez les métriques pour valider la rentabilité</li>
          <li>Comparez avec des approches gloutones pour la rapidité</li>
        </ul>
      </div>
    </div>
  );
} 