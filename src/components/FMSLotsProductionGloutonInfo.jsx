export default function FMSLotsProductionGloutonInfo() {
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
      <h3 style={{ marginTop: 0, color: "#8b5cf6", fontSize: "1.2rem" }}>FMS - Lots de Production Glouton</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme glouton des lots de production optimise l'assignation de produits 
          sur des machines multiples en tenant compte des <strong>contraintes de capacité</strong>, 
          d'<strong>outils</strong> et de <strong>dates dues</strong>.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contexte FMS multi-machines</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Machines hétérogènes :</strong> Types A et B avec capacités différentes</li>
          <li><strong>Contraintes d'outils :</strong> Limitation des outils disponibles par machine</li>
          <li><strong>Assignation partielle :</strong> Possibilité de produire une fraction des commandes</li>
          <li><strong>Priorité temporelle :</strong> Respect des dates d'échéance</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Structure des données</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          Chaque produit est défini par :
        </p>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          • Grandeur de commande (unités)<br />
          • Temps d'opération [Machine A, Machine B]<br />
          • Outils requis [Outil A, Outil B]<br />
          • Date d'échéance (jours)
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Configuration système</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Nombre de machines :</strong> Quantité par type (A et B)</li>
          <li><strong>Capacité d'outils :</strong> Nombre maximum d'outils par type de machine</li>
          <li><strong>Temps disponible :</strong> Heures de travail par jour</li>
          <li><strong>Capacité totale :</strong> Temps × Nombre de machines</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Algorithme glouton</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Tri par priorité :</strong> Produits classés par date due croissante</li>
          <li><strong>Évaluation faisabilité :</strong> Vérification contraintes temps et outils</li>
          <li><strong>Calcul de fraction :</strong> Quantité maximale assignable</li>
          <li><strong>Assignation :</strong> Attribution si contraintes respectées</li>
          <li><strong>Mise à jour :</strong> Ressources consommées décomptées</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Calculs de faisabilité</h4>
        <div style={{ backgroundColor: "#e2e8f0", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Fraction_max = min(<br />
          &nbsp;&nbsp;(Temps_disponible - Temps_utilisé) / Temps_opération,<br />
          &nbsp;&nbsp;Grandeur_commande<br />
          )
        </div>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
          Pour chaque machine, en respectant les contraintes d'outils.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes d'outils</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Limitation par machine :</strong> Capacité fixe d'outils par type</li>
          <li><strong>Exclusivité :</strong> Un outil ne peut être utilisé que par un produit</li>
          <li><strong>Vérification préalable :</strong> Disponibilité avant assignation</li>
          <li><strong>Gestion dynamique :</strong> Mise à jour en temps réel</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages de l'approche</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Simplicité :</strong> Algorithme rapide et compréhensible</li>
          <li><strong>Flexibilité :</strong> Assignation partielle des commandes</li>
          <li><strong>Réactivité :</strong> Adaptation aux contraintes en temps réel</li>
          <li><strong>Priorités :</strong> Respect naturel des dates d'échéance</li>
          <li><strong>Extensibilité :</strong> Facilement adaptable à d'autres contraintes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques d'évaluation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Utilisation machines :</strong> Pourcentage de temps utilisé par type</li>
          <li><strong>Utilisation outils :</strong> Nombre d'outils consommés/disponibles</li>
          <li><strong>Taux d'assignation :</strong> Produits assignés vs totaux</li>
          <li><strong>Efficacité globale :</strong> Performance moyenne du système</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations incluses</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Utilisation machines :</strong> Barres de capacité par type</li>
          <li><strong>Répartition produits :</strong> Camembert assignés/non-assignés</li>
          <li><strong>Utilisation outils :</strong> Comparaison utilisés/capacité</li>
          <li><strong>Planning Gantt :</strong> Chronologie des produits par date due</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres de configuration</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Produits :</strong> Nom, grandeur, temps opération, outils, échéance</li>
          <li><strong>Machines :</strong> Nombre de machines de type A et B</li>
          <li><strong>Capacités :</strong> Outils disponibles par type de machine</li>
          <li><strong>Temps :</strong> Heures de travail disponibles par jour</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Limitations</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité :</strong> Pas de garantie d'optimum global</li>
          <li><strong>Ordre fixe :</strong> Dépendant du tri par date due</li>
          <li><strong>Contraintes simples :</strong> Modèle d'outils basique</li>
          <li><strong>Assignation séquentielle :</strong> Pas de retour en arrière</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Cas d'usage industriels</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Production flexible :</strong> Ateliers multi-produits</li>
          <li><strong>Planification courte :</strong> Assignation quotidienne</li>
          <li><strong>Systèmes contraints :</strong> Ressources limitées</li>
          <li><strong>Production à la demande :</strong> Commandes variables</li>
          <li><strong>Priorisation temporelle :</strong> Respect des délais clients</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Différences avec autres approches</h4>
        <div style={{ fontSize: "0.9rem" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Sac à dos :</strong> Sélection binaire vs assignation partielle
            <br />
            <strong>Lots de production :</strong> Multi-machines vs mono-ressource
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>MIP :</strong> Rapidité vs optimalité garantie
            <br />
            <strong>Glouton :</strong> Heuristique vs programmation exacte
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#8b5cf6", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Vérifiez la cohérence des temps d'opération</li>
          <li>Adaptez les capacités d'outils selon vos contraintes réelles</li>
          <li>Surveillez les produits non-assignés pour identifier les goulots</li>
          <li>Utilisez pour des planifications rapides et fréquentes</li>
          <li>Comparez avec MIP pour valider la qualité de solution</li>
        </ul>
      </div>
    </div>
  );
} 