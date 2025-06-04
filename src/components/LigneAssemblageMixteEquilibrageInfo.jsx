export default function LigneAssemblageMixteEquilibrageInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #3b82f6",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h3 style={{ marginTop: 0, color: "#3b82f6", fontSize: "1.2rem" }}>Équilibrage de Ligne Mixte</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'équilibrage de ligne mixte utilise la <strong>programmation linéaire</strong> pour 
          optimiser l'assignation des tâches aux stations pour <strong>plusieurs modèles</strong> 
          de produits différents sur la même ligne d'assemblage.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Spécificités ligne mixte</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Plusieurs modèles :</strong> Chaque tâche a des temps différents par modèle</li>
          <li><strong>Demandes variables :</strong> Chaque modèle a sa propre demande</li>
          <li><strong>Temps pondérés :</strong> Calcul basé sur la proportion de chaque modèle</li>
          <li><strong>Précédences mixtes :</strong> Prédécesseurs peuvent varier par modèle</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul des temps pondérés</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Pour chaque tâche, le temps est pondéré par la demande :
        </p>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          temps_pondéré = Σ(demande[modèle] × temps[tâche,modèle])
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Modélisation mathématique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variables :</strong> y[i,j] = 1 si tâche i assignée à station j</li>
          <li><strong>Objectif :</strong> Minimiser nombre de stations</li>
          <li><strong>Contraintes :</strong> Temps de cycle, précédence, assignation unique</li>
          <li><strong>Solveur :</strong> CBC avec PuLP</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes principales</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Assignation unique :</strong> Chaque tâche dans une seule station</li>
          <li><strong>Temps de cycle :</strong> Charge station ≤ temps de cycle</li>
          <li><strong>Précédence :</strong> Ordre des tâches respecté pour tous modèles</li>
          <li><strong>Capacité :</strong> Stations limitées en nombre</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité :</strong> Solution mathématiquement optimale</li>
          <li><strong>Multi-modèles :</strong> Prise en compte simultanée de tous modèles</li>
          <li><strong>Flexibilité :</strong> Gestion demandes variables</li>
          <li><strong>Reproductibilité :</strong> Résultat identique à chaque fois</li>
          <li><strong>Métriques complètes :</strong> Efficacité, variance, utilisation</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques d'évaluation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Efficacité :</strong> (Min théorique / Stations utilisées) × 100%</li>
          <li><strong>Utilisation moyenne :</strong> Charge moyenne des stations</li>
          <li><strong>Variance :</strong> Mesure d'équilibrage entre stations</li>
          <li><strong>Statut :</strong> Optimal, Faisable, Infaisable</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Complexité :</strong> Temps de calcul croît exponentiellement</li>
          <li><strong>Taille :</strong> Difficile pour &gt; 50 tâches ou &gt; 5 modèles</li>
          <li><strong>Dépendances :</strong> Nécessite solveur PuLP/CBC</li>
          <li><strong>Mémoire :</strong> Variables nombreuses (tâches × stations)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'usage typiques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Automobile :</strong> Variantes d'un même véhicule</li>
          <li><strong>Électronique :</strong> Différentes configurations de produits</li>
          <li><strong>Agroalimentaire :</strong> Formats et conditionnements multiples</li>
          <li><strong>Textile :</strong> Tailles et coloris différents</li>
          <li><strong>Design industriel :</strong> Validation avant investissement</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Différences avec ligne simple</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Ligne simple :</strong> Un seul produit, temps fixes
            <br />
            <strong>Ligne mixte :</strong> Plusieurs produits, temps variables
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Ligne simple :</strong> Précédences identiques
            <br />
            <strong>Ligne mixte :</strong> Précédences peuvent différer
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Commencez avec 2-3 modèles pour tester</li>
          <li>Vérifiez la cohérence des demandes (proportions réalistes)</li>
          <li>Surveillez le temps de calcul pour problèmes complexes</li>
          <li>Comparez avec les algorithmes de ligne simple</li>
          <li>Utilisez pour valider les décisions d'investissement</li>
        </ul>
      </div>
    </div>
  );
} 