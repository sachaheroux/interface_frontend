export default function LigneAssemblageMixteEquilibragePlusPlusInfo() {
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
      <h3 style={{ marginTop: 0, color: "#3b82f6", fontSize: "1.2rem" }}>Équilibrage de Ligne Mixte ++</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme ++</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'équilibrage de ligne mixte ++ utilise une version <strong>améliorée</strong> de la 
          programmation linéaire pour optimiser l'assignation des tâches aux stations pour 
          <strong>plusieurs modèles</strong> de produits différents avec des <strong>algorithmes 
          d'optimisation avancés</strong>.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Spécificités ligne mixte</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Plusieurs modèles :</strong> Chaque tâche a des temps différents par modèle</li>
          <li><strong>Demandes variables :</strong> Chaque modèle a sa propre demande pour la période</li>
          <li><strong>Temps pondérés :</strong> Calcul basé sur la proportion de chaque modèle</li>
          <li><strong>Précédences mixtes :</strong> Prédécesseurs peuvent varier par modèle</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul des temps pondérés</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Pour chaque tâche, le temps est pondéré par la demande pour la période :
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
          <li><strong>Contraintes :</strong> Durée de la période, précédence, assignation unique</li>
          <li><strong>Solveur :</strong> CBC avec PuLP</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes principales</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Assignation unique :</strong> Chaque tâche dans une seule station</li>
          <li><strong>Durée de la période :</strong> Charge station ≤ durée de la période</li>
          <li><strong>Précédence :</strong> Ordre des tâches respecté pour tous modèles</li>
          <li><strong>Capacité :</strong> Stations limitées en nombre</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages de la version ++</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité améliorée :</strong> Algorithmes d'optimisation avancés</li>
          <li><strong>Performance :</strong> Temps de calcul optimisé pour gros problèmes</li>
          <li><strong>Multi-modèles :</strong> Prise en compte simultanée de tous modèles</li>
          <li><strong>Flexibilité :</strong> Gestion demandes variables pour la période</li>
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
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Améliorations par rapport à la version standard</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Algorithmes optimisés :</strong> Heuristiques avancées pour gros problèmes</li>
          <li><strong>Capacité étendue :</strong> Gestion de &gt; 100 tâches et &gt; 10 modèles</li>
          <li><strong>Préprocessing :</strong> Réduction automatique de l'espace de recherche</li>
          <li><strong>Parallélisation :</strong> Calculs multi-threads pour performance</li>
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
        <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation ++</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Idéal pour problèmes complexes (nombreuses tâches/modèles)</li>
          <li>Vérifiez la cohérence des demandes pour la période (proportions réalistes)</li>
          <li>Profitez des performances améliorées pour gros problèmes</li>
          <li>Comparez avec la version standard pour valider les gains</li>
          <li>Utilisez pour optimiser les lignes industrielles existantes</li>
        </ul>
      </div>
    </div>
  );
} 