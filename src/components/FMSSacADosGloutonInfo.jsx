export default function FMSSacADosGloutonInfo() {
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
      <h3 style={{ marginTop: 0, color: "#8b5cf6", fontSize: "1.2rem" }}>FMS - Sac à Dos (Algorithme Glouton)</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme <strong>glouton</strong> résout le problème du sac à dos FMS en faisant des 
          choix <strong>localement optimaux</strong> basés sur la désirabilité (ratio profit/temps).
          Approche rapide mais potentiellement sous-optimale.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Stratégie gloutonne</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Critère :</strong> Désirabilité = Profit total / Temps requis</li>
          <li><strong>Tri :</strong> Ordre décroissant de désirabilité</li>
          <li><strong>Sélection :</strong> Tant qu'il y a de la capacité disponible</li>
          <li><strong>Rapidité :</strong> Complexité O(n log n) pour le tri</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul de désirabilité</h4>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Désirabilité[i] = Profit_total[i] / Temps_requis[i]
          <br />
          Profit_total[i] = (Prix_vente[i] - Coût_total[i]) × Demande[i]
          <br />
          Temps_requis[i] = Temps_fabrication[i] × Demande[i]
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages du glouton</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Rapidité :</strong> Exécution très rapide O(n log n)</li>
          <li><strong>Simplicité :</strong> Algorithme facile à comprendre</li>
          <li><strong>Mémoire :</strong> Très faible consommation mémoire</li>
          <li><strong>Intuitivité :</strong> Logique naturelle de choix</li>
          <li><strong>Robustesse :</strong> Pas de problème de convergence</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Processus de résolution</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Calcul :</strong> Désirabilité pour chaque produit</li>
          <li><strong>Tri :</strong> Produits par désirabilité décroissante</li>
          <li><strong>Sélection :</strong> Ajout dans l'ordre tant que possible</li>
          <li><strong>Vérification :</strong> Contrainte de capacité respectée</li>
          <li><strong>Arrêt :</strong> Plus de capacité ou plus de produits</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres identiques</h4>
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
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Comparaison avec autres méthodes</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Glouton vs DP :</strong> Plus rapide mais possiblement sous-optimal
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Glouton vs PL :</strong> Plus simple mais moins précis
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Complexité :</strong> O(n log n) vs O(n×capacité) vs O(n)
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Limitations importantes</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Sous-optimalité :</strong> Solution pas forcément optimale</li>
          <li><strong>Choix local :</strong> Pas de vision globale du problème</li>
          <li><strong>Ordre fixe :</strong> Tri initial détermine tout</li>
          <li><strong>Pas de retour :</strong> Impossible de corriger les erreurs</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques calculées</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Profit total :</strong> Somme des profits des produits sélectionnés</li>
          <li><strong>Utilisation capacité :</strong> Pourcentage de temps utilisé</li>
          <li><strong>Efficacité :</strong> Ratio profit/coût opérationnel</li>
          <li><strong>Désirabilité :</strong> Profit par unité de temps</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations spécifiques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Désirabilité :</strong> Barres par produit avec sélection</li>
          <li><strong>Capacité :</strong> Camembert utilisation vs disponible</li>
          <li><strong>Ordre sélection :</strong> Chronologie des choix gloutons</li>
          <li><strong>Métriques :</strong> Performance de la solution</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'usage recommandés</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Prototypage :</strong> Solution rapide pour tests</li>
          <li><strong>Benchmark :</strong> Comparaison avec autres méthodes</li>
          <li><strong>Temps réel :</strong> Contraintes de calcul strictes</li>
          <li><strong>Exploration :</strong> Compréhension du problème</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Interprétation des résultats</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>
            La <strong>désirabilité</strong> montre l'attractivité de chaque produit. 
            Les produits avec une forte désirabilité sont prioritaires.
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            L'<strong>ordre de sélection</strong> révèle la stratégie gloutonne et 
            permet d'identifier les produits les plus rentables par unité de temps.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Recommandations d'usage</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Utilisez pour une solution rapide et approximative</li>
          <li>Comparez avec DP et PL pour valider la qualité</li>
          <li>Analysez la désirabilité pour comprendre les priorités</li>
          <li>Attention à la sous-optimalité sur gros problèmes</li>
          <li>Idéal pour démarrer l'analyse d'un nouveau problème</li>
        </ul>
      </div>
    </div>
  );
} 