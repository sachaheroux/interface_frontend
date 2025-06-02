function LigneAssemblageMixteGoulotInfo() {
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
      <h3 style={{ marginTop: 0, color: "#1e40af", fontSize: "1.2rem" }}>Variation du goulot</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme optimise la <strong>séquence de production mixte</strong> pour minimiser la 
          <strong> variation du temps cumulé au poste goulot</strong>. Il vise un lissage optimal 
          de la charge de travail entre différents modèles.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Contexte ligne mixte</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Production mixte :</strong> Plusieurs modèles sur la même ligne</li>
          <li><strong>Poste goulot :</strong> Station limitante de la capacité</li>
          <li><strong>Demandes différentes :</strong> Quantités variables par modèle</li>
          <li><strong>Temps variables :</strong> Durées différentes selon le modèle</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Modélisation mathématique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variables binaires :</strong> x[j,n] = 1 si modèle j en position n</li>
          <li><strong>Fonction objective :</strong> Minimiser δ (variation maximale)</li>
          <li><strong>PGCD :</strong> Calcul du cycle de production minimal</li>
          <li><strong>Contraintes de lissage :</strong> Paramètres s1, s2</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres d'entrée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Demandes :</strong> Nombre d'unités par modèle (ex: [4, 6])</li>
          <li><strong>Temps goulot :</strong> Matrice temps par tâche/modèle</li>
          <li><strong>s1 :</strong> Tolérance lissage des modèles (défaut: 0.5)</li>
          <li><strong>s2 :</strong> Tolérance lissage de la capacité (défaut: 0.5)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes optimisées</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Production complète :</strong> Nombre exact de chaque modèle</li>
          <li><strong>Lissage modèles :</strong> Répartition régulière dans la séquence</li>
          <li><strong>Capacité goulot :</strong> Respect des limites de temps</li>
          <li><strong>Variation minimale :</strong> Écart minimal au temps idéal</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques de performance</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Variation maximale :</strong> Écart maximal au temps idéal</li>
          <li><strong>Temps cycle goulot :</strong> Temps moyen par unité</li>
          <li><strong>Déviation moyenne :</strong> Écart moyen au lissage parfait</li>
          <li><strong>Efficacité lissage :</strong> Qualité de la régularité</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimisation rigoureuse :</strong> Solution mathématiquement optimale</li>
          <li><strong>Lissage de charge :</strong> Évite les pics et creux</li>
          <li><strong>Flexibilité :</strong> Adapté à tout nombre de modèles</li>
          <li><strong>Contrôle fin :</strong> Paramètres s1, s2 ajustables</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Applications pratiques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Automobile : Séquençage véhicules de modèles différents</li>
          <li>Électronique : Production de variantes de produits</li>
          <li>Textile : Alternance de modèles/couleurs</li>
          <li>Alimentaire : Production de formats différents</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres de lissage</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>s1 (lissage modèles) :</strong>
            <br />• Plus petit → répartition plus régulière
            <br />• Plus grand → plus de flexibilité de séquence
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>s2 (lissage capacité) :</strong>
            <br />• Plus petit → respect strict du temps de cycle
            <br />• Plus grand → tolérance aux dépassements
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Interprétation des résultats</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Séquence :</strong> Ordre optimal de production (M1, M2, ...)</li>
          <li><strong>Graphique 1 :</strong> Visualisation de la séquence par couleurs</li>
          <li><strong>Graphique 2 :</strong> Évolution du temps cumulé vs idéal</li>
          <li><strong>Zone de variation :</strong> Amplitude des écarts tolérés</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#1e40af", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Commencez avec s1=s2=0.5 puis ajustez</li>
          <li>Analysez la régularité de la séquence obtenue</li>
          <li>Vérifiez que la variation reste acceptable</li>
          <li>Adaptez aux contraintes pratiques de production</li>
          <li>Testez différents paramétrages pour optimiser</li>
        </ul>
      </div>
    </div>
  );
}

export default LigneAssemblageMixteGoulotInfo; 