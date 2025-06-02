export default function LigneAssemblageMixteEquilibrageInfo() {
  const containerStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  };

  const titleStyle = {
    fontSize: "1.8rem",
    color: "#1e3a8a",
    marginBottom: "1rem",
    borderBottom: "3px solid #3b82f6",
    paddingBottom: "0.5rem"
  };

  const sectionStyle = {
    marginBottom: "1.5rem"
  };

  const sectionTitleStyle = {
    fontSize: "1.3rem",
    color: "#1e40af",
    marginBottom: "0.75rem",
    fontWeight: "600"
  };

  const listStyle = {
    marginLeft: "1.5rem",
    marginBottom: "1rem"
  };

  const listItemStyle = {
    marginBottom: "0.5rem",
    lineHeight: "1.6"
  };

  const formulaStyle = {
    backgroundColor: "#e0f2fe",
    padding: "1rem",
    borderRadius: "8px",
    fontFamily: "monospace",
    fontSize: "0.95rem",
    border: "1px solid #0891b2",
    margin: "1rem 0"
  };

  const highlightStyle = {
    backgroundColor: "#fef3c7",
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #f59e0b",
    marginBottom: "1rem"
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Équilibrage de Ligne d'Assemblage Mixte</h2>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>🎯 Objectif de l'algorithme</h3>
        <p>
          L'<strong>équilibrage de ligne d'assemblage mixte</strong> utilise la <strong>programmation linéaire en nombres entiers</strong> 
          pour déterminer l'affectation optimale des tâches aux stations de travail pour plusieurs modèles de produits différents.
        </p>
        <div style={highlightStyle}>
          <strong>But :</strong> Minimiser le nombre de stations tout en respectant les contraintes de temps de cycle et de précédence pour tous les modèles.
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>🔢 Modélisation mathématique</h3>
        
        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem" }}>Variables de décision :</h4>
        <div style={formulaStyle}>
          y[i,j] ∈ binaire : 1 si la tâche i est assignée à la station j, 0 sinon
        </div>

        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem" }}>Fonction objective :</h4>
        <div style={formulaStyle}>
          Minimiser : Σ(i,j) (10^j) × y[i,j]
          <br />
          <em>(Favorise l'utilisation des stations avec index plus petit)</em>
        </div>

        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem" }}>Contraintes principales :</h4>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Affectation unique :</strong> Chaque tâche doit être assignée à exactement une station
            <div style={formulaStyle}>Σ(j) y[i,j] = 1, ∀ tâche i</div>
          </li>
          <li style={listItemStyle}>
            <strong>Temps de cycle :</strong> La charge de chaque station ne doit pas dépasser le temps de cycle
            <div style={formulaStyle}>Σ(i) (temps_pondéré[i] × y[i,j]) ≤ temps_de_cycle, ∀ station j</div>
          </li>
          <li style={listItemStyle}>
            <strong>Précédence :</strong> Une tâche ne peut être assignée qu'à une station égale ou supérieure à ses prédécesseurs
            <div style={formulaStyle}>Σ(j) (j × y[i,j]) ≥ Σ(j) (j × y[p,j]), ∀ prédécesseur p de i</div>
          </li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>⚖️ Temps pondérés</h3>
        <p>
          Pour chaque tâche, le temps de traitement est <strong>pondéré par la demande</strong> de chaque modèle :
        </p>
        <div style={formulaStyle}>
          temps_pondéré[tâche] = Σ(modèles) (demande[modèle] × temps[tâche,modèle])
        </div>
        <p>
          Cette pondération permet de tenir compte de la proportion de chaque modèle dans la production.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>📊 Métriques d'évaluation</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Efficacité :</strong> (Minimum théorique / Stations utilisées) × 100%
          </li>
          <li style={listItemStyle}>
            <strong>Utilisation moyenne :</strong> Charge moyenne des stations / Temps de cycle
          </li>
          <li style={listItemStyle}>
            <strong>Variance d'utilisation :</strong> Mesure de l'équilibre entre les stations
          </li>
          <li style={listItemStyle}>
            <strong>Statut d'optimisation :</strong> Optimal, Infaisable, ou Non borné
          </li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>🔧 Solveur utilisé</h3>
        <p>
          L'algorithme utilise le solveur <strong>CBC (Coin-or Branch and Cut)</strong> de PuLP pour résoudre 
          le problème de programmation linéaire en nombres entiers.
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong>Avantage :</strong> Garantit une solution optimale si elle existe</li>
          <li style={listItemStyle}><strong>Complexité :</strong> Temps exponentiel dans le pire cas</li>
          <li style={listItemStyle}><strong>Pratique :</strong> Efficace pour des problèmes de taille raisonnable (&lt;50 tâches)</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>⚡ Comparaison avec les heuristiques</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "#f0f9ff", borderRadius: "8px", border: "1px solid #0284c7" }}>
            <h4 style={{ color: "#0369a1", marginBottom: "0.5rem" }}>✅ Avantages PL</h4>
            <ul style={{ marginLeft: "1rem", fontSize: "0.9rem" }}>
              <li>Solution optimale garantie</li>
              <li>Respect strict des contraintes</li>
              <li>Validation mathématique</li>
            </ul>
          </div>
          <div style={{ padding: "1rem", backgroundColor: "#fef7ff", borderRadius: "8px", border: "1px solid #a855f7" }}>
            <h4 style={{ color: "#7c2d12", marginBottom: "0.5rem" }}>⚠️ Limites</h4>
            <ul style={{ marginLeft: "1rem", fontSize: "0.9rem" }}>
              <li>Temps de calcul plus long</li>
              <li>Complexité exponentielle</li>
              <li>Moins adapté aux gros problèmes</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>🎯 Cas d'usage typiques</h3>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong>Automobile :</strong> Production de plusieurs modèles de véhicules sur la même ligne
          </li>
          <li style={listItemStyle}>
            <strong>Électronique :</strong> Assemblage de variantes de produits électroniques
          </li>
          <li style={listItemStyle}>
            <strong>Agroalimentaire :</strong> Conditionnement de différents formats sur une ligne
          </li>
          <li style={listItemStyle}>
            <strong>Design industriel :</strong> Validation d'équilibrage avant investissement
          </li>
        </ul>
      </div>
    </div>
  );
} 