export default function FMSLotsChargementHeuristiqueInfo() {
  return (
    <div style={{
      background: "#f1f5f9",
      borderLeft: "4px solid #f97316",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      marginLeft: "2rem",
      maxWidth: "400px",
      color: "#1e293b",
      fontSize: "0.95rem"
    }}>
      <h3 style={{ marginTop: 0, color: "#f97316", fontSize: "1.2rem" }}>FMS - Lots de Chargement Heuristique</h3>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Principe de l'algorithme</h4>
        <p style={{ marginBottom: "0.5rem" }}>
          L'algorithme heuristique de chargement par lots en <strong>3 étapes</strong> optimise la formation 
          de <strong>clusters d'opérations</strong>, leur regroupement en <strong>groupes de machines</strong>, 
          et leur assignation selon le critère <strong>LPT (Longest Processing Time)</strong>.
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Données d'entrée</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Opérations machines :</strong> Résultats de la phase 1 FMS</li>
          <li><strong>Format :</strong> [nom_opération, temps, outil_requis]</li>
          <li><strong>Capacités :</strong> Temps et outils par type de machine</li>
          <li><strong>Outils :</strong> Espace requis par outil disponible</li>
          <li><strong>Contraintes :</strong> Nombre de machines par type</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Étape 1 : Formation des clusters</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Tri préalable :</strong> Opérations par pièce et numéro d'opération</li>
          <li><strong>Regroupement :</strong> Opérations de même pièce prioritaires</li>
          <li><strong>Contrainte temps :</strong> Temps cluster ≤ capacité machine</li>
          <li><strong>Contrainte outils :</strong> Outils cluster ≤ capacité machine</li>
          <li><strong>Critère :</strong> Minimiser le nombre de clusters</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Algorithme de clustering</h4>
        <div style={{ backgroundColor: "#fef2e8", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Pour chaque machine j :<br />
          &nbsp;&nbsp;cluster_temps = 0, cluster_outils = ∅<br />
          &nbsp;&nbsp;piece_courante = null<br />
          &nbsp;&nbsp;Pour chaque opération (nom, temps, outil) :<br />
          &nbsp;&nbsp;&nbsp;&nbsp;Si (piece == piece_courante OU piece_courante == null)<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ET temps_cluster + temps ≤ Pj[j]<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ET |outils_cluster ∪ &#123;outil&#125;| ≤ Kj[j] :<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ajouter à cluster_courant<br />
          &nbsp;&nbsp;&nbsp;&nbsp;Sinon :<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fermer cluster_courant<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nouveau cluster avec opération
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Étape 2 : Formation des groupes</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Calcul σⱼ :</strong> Espace total outils requis par machine j</li>
          <li><strong>Groupes faisables :</strong> gⱼ = ⌈σⱼ / Kⱼ⌉</li>
          <li><strong>Contrainte machines :</strong> gⱼ ≤ mⱼ (nb machines disponibles)</li>
          <li><strong>Répartition :</strong> Machines par groupe = ⌊mⱼ / gⱼ⌋</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Calcul des groupes</h4>
        <div style={{ backgroundColor: "#fef2e8", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          σⱼ = Σ (espace_outil[l] pour tous outils l des clusters j)<br />
          gⱼ = max(1, ⌈σⱼ / Kⱼ⌉)<br />
          gⱼ = min(gⱼ, mⱼ)  // Ajustement contrainte machines<br />
          <br />
          Machines par groupe :<br />
          &nbsp;&nbsp;Groupe i: ⌊mⱼ / gⱼ⌋ + (1 si i &lt; mⱼ mod gⱼ, 0 sinon)
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Étape 3 : Assignation LPT</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Tri LPT :</strong> Clusters par temps décroissant</li>
          <li><strong>Initialisation ψ :</strong> Temps disponible par groupe</li>
          <li><strong>Assignation :</strong> Cluster → groupe avec max(ψ)</li>
          <li><strong>Mise à jour :</strong> ψ = ψ - temps_cluster</li>
          <li><strong>Objectif :</strong> Équilibrage de charge optimale</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Algorithme LPT</h4>
        <div style={{ backgroundColor: "#fef2e8", padding: "0.5rem", borderRadius: "0.375rem", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Pour chaque machine j :<br />
          &nbsp;&nbsp;Trier clusters par temps décroissant<br />
          &nbsp;&nbsp;ψ[g] = Pⱼ × (mⱼ / gⱼ) pour g = 1..gⱼ<br />
          &nbsp;&nbsp;Pour chaque cluster c :<br />
          &nbsp;&nbsp;&nbsp;&nbsp;g* = argmax(ψ[g])<br />
          &nbsp;&nbsp;&nbsp;&nbsp;Assigner c → groupe g*<br />
          &nbsp;&nbsp;&nbsp;&nbsp;ψ[g*] = ψ[g*] - temps[c]
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Contraintes du problème</h4>
        <ol style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Temps cluster :</strong> Σ temps_ops ≤ capacité_temps_machine</li>
          <li><strong>Outils cluster :</strong> |outils_cluster| ≤ capacité_outils_machine</li>
          <li><strong>Cohérence pièce :</strong> Préférence même pièce dans cluster</li>
          <li><strong>Nombre groupes :</strong> gⱼ ≤ nombre_machines_type_j</li>
          <li><strong>Espace outils :</strong> Σ espace_outils ≤ gⱼ × Kⱼ</li>
        </ol>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Avantages de l'heuristique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Rapidité :</strong> Complexité O(n log n) pour tri LPT</li>
          <li><strong>Simplicité :</strong> Algorithme facile à comprendre et implémenter</li>
          <li><strong>Flexibilité :</strong> Adapte automatiquement aux contraintes</li>
          <li><strong>Équilibrage :</strong> LPT donne un bon équilibrage de charge</li>
          <li><strong>Praticité :</strong> Solution réalisable garantie</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Métriques de performance</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Réduction :</strong> Opérations → Clusters → Groupes</li>
          <li><strong>Utilisation :</strong> Temps utilisé / Capacité totale</li>
          <li><strong>Efficacité :</strong> Moyenne des utilisations machines</li>
          <li><strong>Compacité :</strong> Ratio clusters/opérations</li>
          <li><strong>Équilibrage :</strong> Écart-type charges groupes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Structure hiérarchique</h4>
        <div style={{ backgroundColor: "#fef2e8", padding: "0.5rem", borderRadius: "0.375rem", fontSize: "0.9rem" }}>
          <strong>Niveau 1 :</strong> Opérations individuelles<br />
          ↓ (Clustering par contraintes)<br />
          <strong>Niveau 2 :</strong> Clusters d'opérations<br />
          ↓ (Formation groupes par outils)<br />
          <strong>Niveau 3 :</strong> Groupes de machines<br />
          ↓ (Assignation LPT)<br />
          <strong>Niveau 4 :</strong> Planning final optimisé
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Paramètres de configuration</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Opérations :</strong> [nom, temps, outil] par machine</li>
          <li><strong>Capacités machines :</strong> Temps et outils disponibles</li>
          <li><strong>Outils :</strong> Espace requis par type d'outil</li>
          <li><strong>Machines :</strong> Nombre par type de machine</li>
          <li><strong>Unités :</strong> Temps configurable (min/h/jours)</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Visualisations fournies</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Répartition :</strong> Opérations/Clusters/Groupes par machine</li>
          <li><strong>Utilisation :</strong> Pourcentage d'utilisation par machine</li>
          <li><strong>Temps :</strong> Utilisé vs capacité totale par machine</li>
          <li><strong>Global :</strong> Répartition totale et efficacité système</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Complexité algorithmique</h4>
        <div style={{ backgroundColor: "#fef2e8", padding: "0.5rem", borderRadius: "0.375rem", fontSize: "0.9rem" }}>
          <strong>Étape 1 (Clustering) :</strong> O(n) - parcours linéaire<br />
          <strong>Étape 2 (Groupes) :</strong> O(m) - calcul par machine<br />
          <strong>Étape 3 (LPT) :</strong> O(c log c) - tri des clusters<br />
          <br />
          <strong>Complexité totale :</strong> O(n + c log c)<br />
          où n = nb opérations, c = nb clusters, m = nb machines
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Applications pratiques</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Planification court terme :</strong> Organisation journalière</li>
          <li><strong>Affectation ressources :</strong> Machines et outils</li>
          <li><strong>Équilibrage charge :</strong> Répartition équitable</li>
          <li><strong>Optimisation flux :</strong> Minimisation attentes</li>
          <li><strong>Gestion contraintes :</strong> Capacités limitées</li>
        </ul>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Limites de l'heuristique</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li><strong>Optimalité :</strong> Pas de garantie d'optimum global</li>
          <li><strong>Ordre :</strong> Sensible à l'ordre initial des opérations</li>
          <li><strong>Contraintes :</strong> Simplification de contraintes complexes</li>
          <li><strong>Statique :</strong> Pas d'adaptation dynamique</li>
        </ul>
      </div>

      <div style={{ marginBottom: "0" }}>
        <h4 style={{ color: "#f97316", marginBottom: "0.5rem", fontSize: "1rem" }}>Conseils d'utilisation</h4>
        <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0" }}>
          <li>Préparez les données phase 1 FMS avec précision</li>
          <li>Vérifiez la cohérence des capacités machines/outils</li>
          <li>Testez différents ordres d'opérations si nécessaire</li>
          <li>Analysez l'équilibrage obtenu entre groupes</li>
          <li>Utilisez pour des plans de production court/moyen terme</li>
        </ul>
      </div>
    </div>
  );
} 