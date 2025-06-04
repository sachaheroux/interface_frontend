export default function FMSSacADosPLInfo() {
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
      <h3 style={{ marginTop: 0, color: "#2563eb", fontSize: "1.2rem" }}>FMS - Sac à Dos (Programmation Linéaire)</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Cette variante utilise la <strong>programmation linéaire</strong> avec le solveur PuLP 
          pour résoudre le problème du sac à dos FMS. Approche plus moderne et 
          <strong> robuste</strong> que la programmation dynamique.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages de la PL</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Solveur industriel :</strong> CBC/COIN-OR optimisé</li>
          <li><strong>Gestion mémoire :</strong> Pas de tableau n × capacité</li>
          <li><strong>Variables continues :</strong> Pas de discrétisation forcée</li>
          <li><strong>Extensibilité :</strong> Contraintes multiples faciles</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Formulation mathématique</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Variables binaires x[i] de valeur 0 ou 1 pour chaque produit :
        </p>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Max: Σ(profit[i] × demande[i] × x[i])
          <br />
          s.t: Σ(temps[i] × demande[i] × x[i]) ≤ Capacité
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Solveur PuLP/CBC</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Branch & Bound :</strong> Exploration intelligente de l'espace</li>
          <li><strong>Cuts :</strong> Plans de coupe pour accélérer</li>
          <li><strong>Heuristiques :</strong> Solutions initiales rapides</li>
          <li><strong>Statut :</strong> Optimal, Faisable, Infaisable, Non borné</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres identiques</h4>
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
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Processus de résolution</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Modélisation :</strong> Création du modèle PuLP</li>
          <li><strong>Variables :</strong> Définition des variables binaires</li>
          <li><strong>Contraintes :</strong> Ajout de la contrainte de capacité</li>
          <li><strong>Résolution :</strong> Appel au solveur CBC</li>
          <li><strong>Extraction :</strong> Récupération de la solution optimale</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages sur programmation dynamique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Mémoire :</strong> O(n) vs O(n × capacité)</li>
          <li><strong>Precision :</strong> Pas de discrétisation des temps</li>
          <li><strong>Extensibilité :</strong> Contraintes multiples faciles</li>
          <li><strong>Robustesse :</strong> Solveur testé industriellement</li>
          <li><strong>Performance :</strong> Optimisations avancées intégrées</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques identiques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profit maximal :</strong> Retour financier total optimisé</li>
          <li><strong>Utilisation capacité :</strong> Pourcentage de temps utilisé</li>
          <li><strong>Efficacité :</strong> Ratio profit/coût opérationnel</li>
          <li><strong>Statut de résolution :</strong> Qualité de la solution</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations enrichies</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profits par produit :</strong> Barres colorées selon sélection</li>
          <li><strong>Utilisation capacité :</strong> Camembert avec pourcentages</li>
          <li><strong>Analyse profit/temps :</strong> Scatter plot des performances</li>
          <li><strong>Métriques PL :</strong> Tableau avec statut solveur</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites de l'approche PL</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Dépendance :</strong> Nécessite PuLP et solveur CBC</li>
          <li><strong>Variables binaires :</strong> Complexité exponentielle théorique</li>
          <li><strong>Installation :</strong> Plus de dépendances que DP pure</li>
          <li><strong>Overkill :</strong> Peut être excessif pour petits problèmes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Quand utiliser chaque approche</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Programmation Dynamique :</strong> Petits problèmes, apprentissage
            <br />
            <strong>Programmation Linéaire :</strong> Problèmes industriels, extensions
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>DP :</strong> Capacité entière, mémoire limitée
            <br />
            <strong>PL :</strong> Capacité continue, contraintes multiples
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Extensions possibles</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Multi-périodes :</strong> Planification sur plusieurs horizons</li>
          <li><strong>Multi-ressources :</strong> Plusieurs contraintes de capacité</li>
          <li><strong>Coûts fixes :</strong> Coûts de mise en route par produit</li>
          <li><strong>Interdépendances :</strong> Contraintes entre produits</li>
          <li><strong>Incertitude :</strong> Programmation stochastique</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#2563eb", marginBottom: "0.5rem", fontSize: "1rem" }}>Recommandations d'usage</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Utilisez PL pour les applications industrielles réelles</li>
          <li>Comparez les deux approches pour valider les résultats</li>
          <li>PL permet d'ajouter facilement de nouvelles contraintes</li>
          <li>Surveillez le temps de résolution pour très gros problèmes</li>
          <li>Exploitez le statut de résolution pour diagnostiquer</li>
        </ul>
      </div>
    </div>
  );
} 