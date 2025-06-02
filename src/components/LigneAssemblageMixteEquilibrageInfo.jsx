export default function LigneAssemblageMixteEquilibrageInfo() {
  const containerStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    padding: "2rem",
    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    border: "1px solid #e2e8f0"
  };

  const titleStyle = {
    fontSize: "1.8rem",
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "1rem",
    borderBottom: "3px solid #8b5cf6",
    paddingBottom: "0.5rem",
    fontWeight: "700",
    textAlign: "center"
  };

  const sectionStyle = {
    marginBottom: "2rem",
    background: "linear-gradient(145deg, #fefefe 0%, #f4f6f8 100%)",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform 0.2s, box-shadow 0.2s"
  };

  const sectionTitleStyle = {
    fontSize: "1.3rem",
    color: "#1e40af",
    marginBottom: "0.75rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  };

  const listStyle = {
    marginLeft: "1.5rem",
    marginBottom: "1rem"
  };

  const listItemStyle = {
    marginBottom: "0.75rem",
    lineHeight: "1.7",
    color: "#374151"
  };

  const formulaStyle = {
    background: "linear-gradient(145deg, #e0f2fe 0%, #b3e5fc 100%)",
    padding: "1.25rem",
    borderRadius: "10px",
    fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    fontSize: "0.95rem",
    border: "1px solid #0891b2",
    margin: "1.25rem 0",
    boxShadow: "0 2px 8px rgba(8, 145, 178, 0.1)",
    position: "relative",
    overflow: "hidden"
  };

  const highlightStyle = {
    background: "linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #f59e0b",
    marginBottom: "1rem",
    borderLeft: "4px solid #d97706",
    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.1)"
  };

  const iconMap = {
    "🎯": { color: "#8b5cf6", shadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
    "🔢": { color: "#3b82f6", shadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
    "⚖️": { color: "#10b981", shadow: "0 0 20px rgba(16, 185, 129, 0.3)" },
    "📊": { color: "#f59e0b", shadow: "0 0 20px rgba(245, 158, 11, 0.3)" },
    "🔧": { color: "#ef4444", shadow: "0 0 20px rgba(239, 68, 68, 0.3)" },
    "⚡": { color: "#8b5cf6", shadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
    "🎯": { color: "#06b6d4", shadow: "0 0 20px rgba(6, 182, 212, 0.3)" }
  };

  const createSectionTitle = (icon, text) => (
    <h3 style={{
      ...sectionTitleStyle,
      textShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      <span style={{
        fontSize: "1.4rem",
        filter: `drop-shadow(${iconMap[icon]?.shadow || "0 0 10px rgba(0,0,0,0.3)"})`
      }}>
        {icon}
      </span>
      {text}
    </h3>
  );

  const advantageStyle = {
    padding: "1.25rem",
    background: "linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)",
    borderRadius: "10px",
    border: "1px solid #0284c7",
    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.1)"
  };

  const limitStyle = {
    padding: "1.25rem",
    background: "linear-gradient(145deg, #fef7ff 0%, #fae8ff 100%)",
    borderRadius: "10px",
    border: "1px solid #a855f7",
    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)"
  };

  const useCaseStyle = {
    background: "linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #22c55e",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.1)"
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>🏭 Équilibrage de Ligne d'Assemblage Mixte</h2>
      
      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("🎯", "Objectif de l'algorithme")}
        <p style={{ color: "#374151", lineHeight: "1.7", marginBottom: "1rem" }}>
          L'<strong style={{ color: "#8b5cf6" }}>équilibrage de ligne d'assemblage mixte</strong> utilise la <strong style={{ color: "#3b82f6" }}>programmation linéaire en nombres entiers</strong> 
          pour déterminer l'affectation optimale des tâches aux stations de travail pour plusieurs modèles de produits différents.
        </p>
        <div style={highlightStyle}>
          <strong style={{ color: "#d97706" }}>But :</strong> Minimiser le nombre de stations tout en respectant les contraintes de temps de cycle et de précédence pour tous les modèles.
        </div>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("🔢", "Modélisation mathématique")}
        
        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem", fontWeight: "600" }}>Variables de décision :</h4>
        <div style={formulaStyle}>
          y[i,j] ∈ binaire : 1 si la tâche i est assignée à la station j, 0 sinon
        </div>

        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem", fontWeight: "600" }}>Fonction objective :</h4>
        <div style={formulaStyle}>
          Minimiser : Σ(i,j) (10^j) × y[i,j]
          <br />
          <em style={{ color: "#6b7280" }}>(Favorise l'utilisation des stations avec index plus petit)</em>
        </div>

        <h4 style={{ fontSize: "1.1rem", color: "#1e40af", marginTop: "1rem", fontWeight: "600" }}>Contraintes principales :</h4>
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong style={{ color: "#8b5cf6" }}>Affectation unique :</strong> Chaque tâche doit être assignée à exactement une station
            <div style={formulaStyle}>Σ(j) y[i,j] = 1, ∀ tâche i</div>
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: "#10b981" }}>Temps de cycle :</strong> La charge de chaque station ne doit pas dépasser le temps de cycle
            <div style={formulaStyle}>Σ(i) (temps_pondéré[i] × y[i,j]) ≤ temps_de_cycle, ∀ station j</div>
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: "#f59e0b" }}>Précédence :</strong> Une tâche ne peut être assignée qu'à une station égale ou supérieure à ses prédécesseurs
            <div style={formulaStyle}>Σ(j) (j × y[i,j]) ≥ Σ(j) (j × y[p,j]), ∀ prédécesseur p de i</div>
          </li>
        </ul>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("⚖️", "Temps pondérés")}
        <p style={{ color: "#374151", lineHeight: "1.7" }}>
          Pour chaque tâche, le temps de traitement est <strong style={{ color: "#10b981" }}>pondéré par la demande</strong> de chaque modèle :
        </p>
        <div style={formulaStyle}>
          temps_pondéré[tâche] = Σ(modèles) (demande[modèle] × temps[tâche,modèle])
        </div>
        <p style={{ color: "#6b7280", fontStyle: "italic" }}>
          Cette pondération permet de tenir compte de la proportion de chaque modèle dans la production.
        </p>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("📊", "Métriques d'évaluation")}
        <ul style={listStyle}>
          <li style={listItemStyle}>
            <strong style={{ color: "#8b5cf6" }}>Efficacité :</strong> (Minimum théorique / Stations utilisées) × 100%
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: "#3b82f6" }}>Utilisation moyenne :</strong> Charge moyenne des stations / Temps de cycle
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: "#10b981" }}>Variance d'utilisation :</strong> Mesure de l'équilibre entre les stations
          </li>
          <li style={listItemStyle}>
            <strong style={{ color: "#f59e0b" }}>Statut d'optimisation :</strong> Optimal, Infaisable, ou Non borné
          </li>
        </ul>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("🔧", "Solveur utilisé")}
        <p style={{ color: "#374151", lineHeight: "1.7" }}>
          L'algorithme utilise le solveur <strong style={{ color: "#ef4444" }}>CBC (Coin-or Branch and Cut)</strong> de PuLP pour résoudre 
          le problème de programmation linéaire en nombres entiers.
        </p>
        <ul style={listStyle}>
          <li style={listItemStyle}><strong style={{ color: "#10b981" }}>Avantage :</strong> Garantit une solution optimale si elle existe</li>
          <li style={listItemStyle}><strong style={{ color: "#f59e0b" }}>Complexité :</strong> Temps exponentiel dans le pire cas</li>
          <li style={listItemStyle}><strong style={{ color: "#3b82f6" }}>Pratique :</strong> Efficace pour des problèmes de taille raisonnable (&lt;50 tâches)</li>
        </ul>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("⚡", "Comparaison avec les heuristiques")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
          <div style={advantageStyle}>
            <h4 style={{ color: "#0369a1", marginBottom: "0.75rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>✅</span> Avantages PL
            </h4>
            <ul style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#374151" }}>
              <li style={{ marginBottom: "0.5rem" }}>Solution optimale garantie</li>
              <li style={{ marginBottom: "0.5rem" }}>Respect strict des contraintes</li>
              <li>Validation mathématique</li>
            </ul>
          </div>
          <div style={limitStyle}>
            <h4 style={{ color: "#7c2d12", marginBottom: "0.75rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>⚠️</span> Limites
            </h4>
            <ul style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#374151" }}>
              <li style={{ marginBottom: "0.5rem" }}>Temps de calcul plus long</li>
              <li style={{ marginBottom: "0.5rem" }}>Complexité exponentielle</li>
              <li>Moins adapté aux gros problèmes</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={sectionStyle} onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      }} onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}>
        {createSectionTitle("🎯", "Cas d'usage typiques")}
        <div style={useCaseStyle}>
          <h4 style={{ color: "#16a34a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🚗</span> Automobile
          </h4>
          <p style={{ color: "#374151", margin: 0, fontSize: "0.95rem" }}>Production de plusieurs modèles de véhicules sur la même ligne</p>
        </div>
        <div style={useCaseStyle}>
          <h4 style={{ color: "#16a34a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>💻</span> Électronique
          </h4>
          <p style={{ color: "#374151", margin: 0, fontSize: "0.95rem" }}>Assemblage de variantes de produits électroniques</p>
        </div>
        <div style={useCaseStyle}>
          <h4 style={{ color: "#16a34a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🥫</span> Agroalimentaire
          </h4>
          <p style={{ color: "#374151", margin: 0, fontSize: "0.95rem" }}>Conditionnement de différents formats sur une ligne</p>
        </div>
        <div style={useCaseStyle}>
          <h4 style={{ color: "#16a34a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🏭</span> Design industriel
          </h4>
          <p style={{ color: "#374151", margin: 0, fontSize: "0.95rem" }}>Validation d'équilibrage avant investissement</p>
        </div>
      </div>
    </div>
  );
} 