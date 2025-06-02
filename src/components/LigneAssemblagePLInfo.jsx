function LigneAssemblagePLInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #10b981",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h3 style={{ marginTop: 0, color: "#059669", fontSize: "1.2rem" }}>PL - Programmation Linéaire</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme PL utilise la <strong>programmation linéaire en nombres entiers</strong> pour 
          trouver la solution <strong>mathématiquement optimale</strong> à l'équilibrage de ligne d'assemblage. 
          Il garantit le minimum de stations nécessaires.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Modélisation mathématique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variables binaires :</strong> y[i,j] = 1 si tâche i assignée à station j</li>
          <li><strong>Fonction objective :</strong> Minimiser le nombre de stations</li>
          <li><strong>Contraintes :</strong> Précédence, temps de cycle, assignation unique</li>
          <li><strong>Solveur :</strong> CBC (Coin-or Branch and Cut)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Fonctionnement</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Formuler le problème comme un programme linéaire en nombres entiers</li>
          <li>Définir les variables binaires d'assignation</li>
          <li>Ajouter toutes les contraintes (précédence, capacité)</li>
          <li>Résoudre avec l'algorithme Branch & Bound</li>
          <li>Extraire la solution optimale</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages majeurs</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité garantie :</strong> Solution mathématiquement optimale</li>
          <li><strong>Nombre minimal de stations :</strong> Pas de gaspillage</li>
          <li><strong>Respect strict des contraintes :</strong> Précédence et temps de cycle</li>
          <li><strong>Reproductibilité :</strong> Résultat identique à chaque exécution</li>
          <li><strong>Statut de solution :</strong> Confirmation de l'optimalité</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes modélisées</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Assignation unique :</strong> Chaque tâche dans une seule station</li>
          <li><strong>Temps de cycle :</strong> Somme des temps ≤ temps de cycle</li>
          <li><strong>Précédence :</strong> Prédécesseurs dans stations antérieures</li>
          <li><strong>Binaire :</strong> Variables 0 ou 1 (assigné ou non)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques avancées</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Efficacité :</strong> Utilisation réelle vs théorique</li>
          <li><strong>Écart à l'optimal :</strong> Distance du minimum théorique</li>
          <li><strong>Statut d'optimisation :</strong> Optimal, Infaisable, etc.</li>
          <li><strong>Taux d'équilibrage :</strong> Qualité de la répartition</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Inconvénients</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Temps de calcul :</strong> Plus long que les heuristiques</li>
          <li><strong>Complexité :</strong> Exponentielle avec le nombre de tâches</li>
          <li><strong>Dépendances :</strong> Nécessite un solveur (PuLP/CBC)</li>
          <li><strong>Mémoire :</strong> Variables nombreuses pour gros problèmes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Comparaison avec les heuristiques</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>PL vs COMSOAL :</strong>
            <br />• PL : Optimal garanti vs Aléatoire exploratoire
            <br />• PL : Plus lent vs Rapide avec graine
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>PL vs LPT :</strong>
            <br />• PL : Optimal vs Heuristique déterministe
            <br />• PL : Considère toutes possibilités vs Stratégie locale
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'utilisation idéaux</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Ligne d'assemblage à fort enjeu économique</li>
          <li>Besoin de garantie d'optimalité</li>
          <li>Validation de solutions heuristiques</li>
          <li>Benchmark pour comparer algorithmes</li>
          <li>Problèmes de taille modérée (&lt; 50 tâches)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#059669", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Utilisez pour valider et comparer avec COMSOAL/LPT</li>
          <li>Surveillez le statut d'optimisation (Optimal/Feasible)</li>
          <li>Analysez l'écart à l'optimal théorique</li>
          <li>Pour gros problèmes, testez d'abord les heuristiques</li>
          <li>Solution de référence pour évaluer la qualité</li>
        </ul>
      </div>
    </div>
  );
}

export default LigneAssemblagePLInfo; 