export default function FMSLotsProductionMIPInfo() {
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
      <h3 style={{ marginTop: 0, color: "#8b5cf6", fontSize: "1.2rem" }}>FMS - Lots de Production MIP</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme MIP (Mixed Integer Programming) résout de manière <strong>optimale</strong> 
          le problème de planification des lots de production en <strong>minimisant le coût d'inventaire</strong> 
          tout en respectant les contraintes de capacité machines et d'outils.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Modélisation mathématique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variables continues :</strong> Quantités produites par période</li>
          <li><strong>Variables binaires :</strong> Utilisation des outils par période</li>
          <li><strong>Horizon temporel :</strong> Basé sur la date due maximale</li>
          <li><strong>Optimisation exacte :</strong> Solution optimale garantie</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Variables de décision</h4>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          x[i][t] : Quantité du produit i produite à la période t<br />
          y[j][l][t] : Variable binaire = 1 si l'outil l de la machine j<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;est utilisé à la période t, 0 sinon
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Fonction objectif</h4>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Minimiser : Σ coût_inventaire[i] × Σ stock_cumulé[i][t]<br />
          <br />
          stock_cumulé[i][t] = Σ production[i][r] - demande_due[i][t]<br />
          (pour r de 1 à t)
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes principales</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Demande :</strong> Satisfaire les commandes avant les dates dues</li>
          <li><strong>Capacité machines :</strong> Temps total ≤ temps disponible</li>
          <li><strong>Liaison outil-production :</strong> Production → outil activé</li>
          <li><strong>Capacité outils :</strong> Espace total ≤ capacité machine</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes détaillées</h4>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          <strong>Demande :</strong><br />
          Σ x[i][r] ≥ demande_cumulée[i][t] ∀i,t<br />
          <br />
          <strong>Capacité :</strong><br />
          Σ temps_op[i][j] × x[i][t] ≤ temps_max[j] ∀j,t<br />
          <br />
          <strong>Liaison :</strong><br />
          x[i][t] ≤ M × y[j][l][t] si produit i utilise outil l<br />
          <br />
          <strong>Outils :</strong><br />
          Σ espace[j][l] × y[j][l][t] ≤ capacité_max[j] ∀j,t
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages du MIP</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité :</strong> Solution optimale globale garantie</li>
          <li><strong>Flexibilité :</strong> Gestion complexe des contraintes</li>
          <li><strong>Précision :</strong> Modélisation exacte du problème</li>
          <li><strong>Robustesse :</strong> Gestion des variables binaires</li>
          <li><strong>Planification :</strong> Vision multi-périodes optimale</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Structure temporelle</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Horizon :</strong> T = max(dates_dues) périodes</li>
          <li><strong>Granularité :</strong> Une période = un jour</li>
          <li><strong>Stock :</strong> Accumulation possible entre périodes</li>
          <li><strong>Production :</strong> Fractionnement autorisé par période</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres système</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>M (Big-M) :</strong> Grande constante pour contraintes logiques</li>
          <li><strong>Solveur :</strong> PuLP avec solveur par défaut (CBC)</li>
          <li><strong>Unités :</strong> Temps en minutes, quantités en unités</li>
          <li><strong>Précision :</strong> Variables continues pour la production</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Configuration machines avancée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Outils multiples :</strong> Liste d'outils disponibles par machine</li>
          <li><strong>Espace variable :</strong> Chaque outil occupe un espace configurable</li>
          <li><strong>Capacité flexible :</strong> Contrainte d'espace total par machine</li>
          <li><strong>Machines parallèles :</strong> Plusieurs machines du même type</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques de performance</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Coût total :</strong> Coût d'inventaire minimal optimal</li>
          <li><strong>Utilisation machines :</strong> Pourcentage par type de machine</li>
          <li><strong>Planification :</strong> Répartition optimale par période</li>
          <li><strong>Statut :</strong> Optimal, Non-optimal, ou Infaisable</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations fournies</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Utilisation machines :</strong> Pourcentage et temps par type</li>
          <li><strong>Statut optimisation :</strong> Résultat et coût total</li>
          <li><strong>Production périodique :</strong> Barres par période</li>
          <li><strong>Gantt planning :</strong> Répartition produits/périodes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Différences avec Glouton</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Optimalité :</strong> MIP garantit l'optimum vs heuristique glouton
            <br />
            <strong>Temps calcul :</strong> MIP plus lent vs glouton instantané
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Complexité :</strong> MIP gère contraintes complexes vs simple priorité
            <br />
            <strong>Planification :</strong> Multi-périodes vs assignation directe
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'usage recommandés</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Planification stratégique :</strong> Décisions importantes</li>
          <li><strong>Ressources contraintes :</strong> Optimisation critique</li>
          <li><strong>Coûts élevés :</strong> Justification du temps de calcul</li>
          <li><strong>Planning détaillé :</strong> Répartition temporelle précise</li>
          <li><strong>Validation :</strong> Comparaison avec méthodes heuristiques</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Limitations techniques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Temps calcul :</strong> Croît exponentiellement avec la taille</li>
          <li><strong>Mémoire :</strong> Variables nombreuses pour grandes instances</li>
          <li><strong>Solveur :</strong> Dépendant de la qualité du solveur MIP</li>
          <li><strong>Modélisation :</strong> Complexité des contraintes réelles</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres de configuration</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Produits :</strong> Nom, commande, temps machines, outils, date, coût</li>
          <li><strong>Machines :</strong> Nom, nombre, capacité, outils, espaces</li>
          <li><strong>Temps :</strong> Disponibilité journalière par machine</li>
          <li><strong>Coûts :</strong> Inventaire par produit (objectif à minimiser)</li>
        </ol>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Vérifiez la cohérence des outils entre machines et produits</li>
          <li>Ajustez les coûts d'inventaire selon l'importance stratégique</li>
          <li>Surveillez le temps de calcul pour les grandes instances</li>
          <li>Comparez avec la solution glouton pour validation</li>
          <li>Utilisez pour planification détaillée et optimisation fine</li>
        </ul>
      </div>
    </div>
  );
} 