import { useState } from "react";
import styles from "./FMSLotsChargementHeuristiqueForm.module.css";

export default function FMSLotsChargementHeuristiqueForm() {
  // État des machines avec données par défaut du collègue
  const [machines, setMachines] = useState([
    { 
      nom: "Machine 1", 
      nombre: 2, 
      capaciteTemps: 800, 
      capaciteOutils: 3,
      operations: [
        ["o23", 500, "Y5"],
        ["o13", 400, "Y4"],
        ["o12", 200, "Y1"],
        ["o22", 200, "Y2"]
      ]
    },
    { 
      nom: "Machine 2", 
      nombre: 2, 
      capaciteTemps: 800, 
      capaciteOutils: 1,
      operations: [
        ["o31", 560, "Y2"],
        ["o21", 600, "Y3"]
      ]
    },
    { 
      nom: "Machine 3", 
      nombre: 1, 
      capaciteTemps: 800, 
      capaciteOutils: 4,
      operations: [
        ["o33", 400, "Y6"],
        ["o11", 480, "Y1"]
      ]
    }
  ]);

  // Configuration des outils avec données par défaut
  const [outilsEspace, setOutilsEspace] = useState({
    "Y1": 1,
    "Y2": 1,
    "Y3": 1,
    "Y4": 1,
    "Y5": 1,
    "Y6": 1
  });

  const [uniteTemps, setUniteTemps] = useState("minutes");
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  // Fonctions pour gérer les machines
  const addMachine = () => {
    const premierOutil = Object.keys(outilsEspace || {})[0] || "Y1";
    const nouvelleMachine = { 
      nom: `Machine ${machines.length + 1}`, 
      nombre: 1, 
      capaciteTemps: 800, 
      capaciteOutils: 2,
      operations: [
        [`o${machines.length + 1}1`, 300, premierOutil]
      ]
    };
    setMachines([...machines, nouvelleMachine]);
  };

  const removeMachine = () => {
    if (machines.length > 1) {
      setMachines(machines.slice(0, -1));
    }
  };

  const handleMachineChange = (index, field, value) => {
    const nouvellesMachines = [...machines];
    if (field === 'nom') {
      nouvellesMachines[index][field] = value;
    } else {
      nouvellesMachines[index][field] = parseInt(value) || 0;
    }
    setMachines(nouvellesMachines);
  };

  // Fonctions pour gérer les opérations
  const addOperation = (machineIndex) => {
    const nouvellesMachines = [...machines];
    const nouveauNom = `o${machineIndex + 1}${nouvellesMachines[machineIndex].operations.length + 1}`;
    const premierOutil = Object.keys(outilsEspace || {})[0] || "Y1";
    nouvellesMachines[machineIndex].operations.push([nouveauNom, 300, premierOutil]);
    setMachines(nouvellesMachines);
  };

  const removeOperation = (machineIndex, operationIndex) => {
    const nouvellesMachines = [...machines];
    if (nouvellesMachines[machineIndex].operations.length > 1) {
      nouvellesMachines[machineIndex].operations.splice(operationIndex, 1);
      setMachines(nouvellesMachines);
    }
  };

  const handleOperationChange = (machineIndex, operationIndex, field, value) => {
    const nouvellesMachines = [...machines];
    if (field === 'nom') {
      nouvellesMachines[machineIndex].operations[operationIndex][0] = value;
    } else if (field === 'temps') {
      nouvellesMachines[machineIndex].operations[operationIndex][1] = parseInt(value) || 0;
    } else if (field === 'outil') {
      nouvellesMachines[machineIndex].operations[operationIndex][2] = value;
    }
    setMachines(nouvellesMachines);
  };

  // Gestion des outils
  const handleOutilEspaceChange = (outil, espace) => {
    setOutilsEspace({
      ...outilsEspace,
      [outil]: parseInt(espace) || 1
    });
  };

  const addOutil = () => {
    const nouvelOutil = `Y${Object.keys(outilsEspace).length + 1}`;
    setOutilsEspace({
      ...outilsEspace,
      [nouvelOutil]: 1
    });
  };

  const removeOutil = (outilASupprimer) => {
    if (Object.keys(outilsEspace).length <= 1) return; // Garder au moins un outil
    
    const nouveauxOutils = { ...outilsEspace };
    delete nouveauxOutils[outilASupprimer];
    setOutilsEspace(nouveauxOutils);

    // Mettre à jour les opérations qui utilisent cet outil
    const premierOutilRestant = Object.keys(nouveauxOutils)[0] || "Y1";
    const nouvellesMachines = machines.map(machine => ({
      ...machine,
      operations: machine.operations.map(operation => 
        operation[2] === outilASupprimer 
          ? [operation[0], operation[1], premierOutilRestant]
          : operation
      )
    }));
    setMachines(nouvellesMachines);
  };

  // Calculs d'assistance
  const calculateTempsTotal = (machineIndex) => {
    return machines[machineIndex].operations.reduce((total, op) => total + op[1], 0);
  };

  const calculateCapaciteUtilisee = (machineIndex) => {
    const tempsTotal = calculateTempsTotal(machineIndex);
    const capaciteMax = machines[machineIndex].capaciteTemps * machines[machineIndex].nombre;
    return capaciteMax > 0 ? ((tempsTotal / capaciteMax) * 100).toFixed(1) : 0;
  };

  const getValidationIcon = (machineIndex) => {
    const utilisation = parseFloat(calculateCapaciteUtilisee(machineIndex));
    if (utilisation <= 100) return { icon: "✓", color: "#10b981" };
    return { icon: "⚠️", color: "#f59e0b" };
  };

  const getTotalOutilsRequisMachine = (machineIndex) => {
    const outilsUniques = new Set(machines[machineIndex].operations.map(op => op[2]));
    return outilsUniques.size;
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      for (let i = 0; i < machines.length; i++) {
        const m = machines[i];
        if (m.nombre <= 0 || m.capaciteTemps <= 0 || m.capaciteOutils <= 0) {
          setError(`Machine ${m.nom}: Toutes les capacités doivent être positives.`);
          setIsLoading(false);
          return;
        }
        
        if (m.operations.length === 0) {
          setError(`Machine ${m.nom}: Au moins une opération est requise.`);
          setIsLoading(false);
          return;
        }

        for (let j = 0; j < m.operations.length; j++) {
          const op = m.operations[j];
          if (!op[0] || op[1] <= 0 || !op[2]) {
            setError(`Machine ${m.nom}, opération ${j + 1}: Nom, temps positif et outil sont requis.`);
            setIsLoading(false);
            return;
          }
        }
      }

      // Validation des outils
      if (Object.keys(outilsEspace).length === 0) {
        setError("Au moins un outil doit être défini.");
        setIsLoading(false);
        return;
      }

      const requestData = {
        operations_machines: machines.map(m => m.operations),
        outils_espace: outilsEspace,
        noms_machines: machines.map(m => m.nom),
        nb_machines: machines.map(m => m.nombre),
        capacite_temps: machines.map(m => m.capaciteTemps),
        capacite_outils: machines.map(m => m.capaciteOutils),
        unite_temps: uniteTemps
      };

      console.log("Sending data to API:", JSON.stringify(requestData, null, 2));

      // Appel API pour les résultats
      fetch(`${API_URL}/fms/lots_chargement_heuristique`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      })
        .then(res => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            return res.text().then(text => {
              console.error("Error response:", text);
              throw new Error(`Erreur API: ${res.status} - ${text}`);
            });
          }
          return res.json();
        })
        .then(data => {
          setResult(data);
          // Récupérer le graphique
          return fetch(`${API_URL}/fms/lots_chargement_heuristique/chart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
          });
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur Graphique API");
          return res.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setChartUrl(url);
        })
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    } catch (e) {
      setError("Erreur dans les données saisies.");
      setIsLoading(false);
    }
  };

  const handleDownloadChart = () => {
    if (!chartUrl) return;
    const link = document.createElement("a");
    link.href = chartUrl;
    link.download = "fms_lots_chargement_heuristique.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderResultsForMachine = (nom_machine, result) => {
    const machine_key = nom_machine.toLowerCase().replace(' ', '_');
    const nb_operations = result[`nb_operations_${machine_key}`] || 0;
    const nb_clusters = result[`nb_clusters_${machine_key}`] || 0;
    const nb_groupes = result[`nb_groupes_${machine_key}`] || 0;
    const utilisation = result[`utilisation_${machine_key}`] || 0;
    
    return `${nb_operations} ops → ${nb_clusters} clusters → ${nb_groupes} groupes (${utilisation}%)`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>FMS - Lots de Chargement (Heuristique)</h2>
      
      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={uniteTemps} onChange={(e) => setUniteTemps(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      {/* Aperçu système */}
      <div className={styles.systemOverview}>
        <h4 className={styles.subtitle}>📊 Aperçu du système</h4>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <div className={styles.cardHeader}>🏭 Machines</div>
            <div className={styles.cardValue}>{machines.length}</div>
            <div className={styles.cardLabel}>types configurés</div>
          </div>
          <div className={styles.overviewCard}>
            <div className={styles.cardHeader}>⚙️ Opérations</div>
            <div className={styles.cardValue}>{machines.reduce((total, m) => total + m.operations.length, 0)}</div>
            <div className={styles.cardLabel}>total système</div>
          </div>
          <div className={styles.overviewCard}>
            <div className={styles.cardHeader}>🔧 Outils</div>
            <div className={styles.cardValue}>{Object.keys(outilsEspace).length}</div>
            <div className={styles.cardLabel}>types disponibles</div>
          </div>
          <div className={styles.overviewCard}>
            <div className={styles.cardHeader}>📦 Espace</div>
            <div className={styles.cardValue}>{Object.values(outilsEspace).reduce((sum, espace) => sum + espace, 0)}</div>
            <div className={styles.cardLabel}>unités total</div>
          </div>
        </div>
      </div>

      {/* Configuration des machines */}
      <div className={styles.tasksContainer}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.subtitle}>🏭 Configuration des machines</h4>
          <div className={styles.buttonGroup}>
            <button className={styles.miniButton} onClick={addMachine}>+ Machine</button>
            <button 
              className={styles.miniButton} 
              onClick={removeMachine}
              style={{ backgroundColor: "#ef4444" }}
              disabled={machines.length <= 1}
            >
              - Machine
            </button>
          </div>
        </div>

        {machines.map((machine, machineIndex) => {
          const validation = getValidationIcon(machineIndex);
          const outilsRequisUniques = getTotalOutilsRequisMachine(machineIndex);
          
          return (
            <div key={machineIndex} className={styles.machineBlock}>
              <div className={styles.machineHeader}>
                <h4 style={{ color: validation.color }}>
                  {validation.icon} {machine.nom}
                </h4>
                <div className={styles.machineStats}>
                  <span className={styles.statBadge}>
                    {calculateCapaciteUtilisee(machineIndex)}% utilisé
                  </span>
                  <span className={styles.statBadge}>
                    {outilsRequisUniques}/{machine.capaciteOutils} outils
                  </span>
                </div>
              </div>
              
              <div className={styles.machineConfig}>
                <div className={styles.configRow}>
                  <div className={styles.inputGroup}>
                    <label>Nom :</label>
                    <input
                      type="text"
                      value={machine.nom}
                      onChange={(e) => handleMachineChange(machineIndex, "nom", e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Quantité :</label>
                    <input
                      type="number"
                      min="1"
                      value={machine.nombre}
                      onChange={(e) => handleMachineChange(machineIndex, "nombre", e.target.value)}
                      className={styles.input}
                      style={{ width: "80px" }}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Capacité temps ({uniteTemps}) :</label>
                    <input
                      type="number"
                      min="1"
                      value={machine.capaciteTemps}
                      onChange={(e) => handleMachineChange(machineIndex, "capaciteTemps", e.target.value)}
                      className={styles.input}
                      style={{ width: "100px" }}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Capacité outils :</label>
                    <input
                      type="number"
                      min="1"
                      value={machine.capaciteOutils}
                      onChange={(e) => handleMachineChange(machineIndex, "capaciteOutils", e.target.value)}
                      className={styles.input}
                      style={{ width: "80px" }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.operationsSection}>
                <div className={styles.sectionHeader}>
                  <h5>🔄 Opérations (Phase 1 FMS)</h5>
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.miniButton} 
                      onClick={() => addOperation(machineIndex)}
                    >
                      + Opération
                    </button>
                  </div>
                </div>
                
                <div className={styles.operationsCompact}>
                  {machine.operations.map((operation, operationIndex) => (
                    <div key={operationIndex} className={styles.operationRow}>
                      <input
                        type="text"
                        value={operation[0]}
                        onChange={(e) => handleOperationChange(machineIndex, operationIndex, "nom", e.target.value)}
                        className={styles.inputCompact}
                        placeholder="Nom"
                        style={{ width: "100px" }}
                      />
                      <input
                        type="number"
                        min="1"
                        value={operation[1]}
                        onChange={(e) => handleOperationChange(machineIndex, operationIndex, "temps", e.target.value)}
                        className={styles.inputCompact}
                        placeholder="Temps"
                        style={{ width: "80px" }}
                      />
                      <select
                        value={operation[2]}
                        onChange={(e) => handleOperationChange(machineIndex, operationIndex, "outil", e.target.value)}
                        className={styles.selectCompact}
                        style={{ width: "80px" }}
                      >
                        {Object.keys(outilsEspace || {}).map(outil => (
                          <option key={outil} value={outil}>{outil}</option>
                        ))}
                      </select>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => removeOperation(machineIndex, operationIndex)}
                        disabled={machine.operations.length <= 1}
                        title="Supprimer l'opération"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.machineResume}>
                <span><strong>Total:</strong> {calculateTempsTotal(machineIndex)} {uniteTemps}</span>
                <span><strong>Capacité:</strong> {machine.capaciteTemps * machine.nombre} {uniteTemps}</span>
                <span><strong>Opérations:</strong> {machine.operations.length}</span>
                <span><strong>Outils uniques:</strong> {outilsRequisUniques}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration des outils */}
      <div className={styles.tasksContainer}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.subtitle}>🔧 Configuration des outils</h4>
          <button className={styles.miniButton} onClick={addOutil}>+ Outil</button>
        </div>
        
        <div className={styles.outilsCompact}>
          {Object.entries(outilsEspace || {}).map(([outil, espace]) => {
            const utilisations = machines.reduce((total, machine) => 
              total + machine.operations.filter(op => op[2] === outil).length, 0
            );
            
            return (
              <div key={outil} className={styles.outilRow}>
                <span className={styles.outilNom}>{outil}</span>
                <div className={styles.inputGroup}>
                  <label>Espace:</label>
                  <input
                    type="number"
                    min="1"
                    value={espace}
                    onChange={(e) => handleOutilEspaceChange(outil, e.target.value)}
                    className={styles.inputCompact}
                    style={{ width: "60px" }}
                  />
                </div>
                <span className={styles.outilUsage}>
                  {utilisations} utilisation{utilisations !== 1 ? 's' : ''}
                </span>
                <button 
                  className={styles.deleteButton}
                  onClick={() => removeOutil(outil)}
                  disabled={Object.keys(outilsEspace).length <= 1}
                  title="Supprimer l'outil"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "🔄 Analyse heuristique en cours..." : "🚀 Résoudre avec l'algorithme heuristique"}
      </button>

      {error && <div className={styles.error}>❌ {error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>📈 Résultats de l'algorithme heuristique - Lots de chargement</h3>
          
          {/* Métriques principales */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricValue} style={{ color: result.status === 'Optimal' ? '#10b981' : '#f59e0b' }}>
                {result.status === 'Optimal' ? '✓' : '⚠️'} {result.status}
              </div>
              <div className={styles.metricLabel}>Statut de la solution</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{result.nb_operations_total}</div>
              <div className={styles.metricLabel}>Opérations totales</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{result.nb_clusters_total}</div>
              <div className={styles.metricLabel}>Clusters formés</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>{result.nb_groupes_total}</div>
              <div className={styles.metricLabel}>Groupes créés</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue} style={{ color: result.efficacite_globale >= 80 ? '#10b981' : result.efficacite_globale >= 60 ? '#f59e0b' : '#ef4444' }}>
                {result.efficacite_globale}%
              </div>
              <div className={styles.metricLabel}>Efficacité globale</div>
            </div>
          </div>

          {/* Algorithme utilisé */}
          <div className={styles.algorithmInfo}>
            <h4>🔧 Méthode: {result.methode}</h4>
            <p><strong>Critère de sélection:</strong> {result.critere_selection}</p>
            <p><strong>Nombre d'étapes:</strong> {result.nb_etapes} (Clustering → Groupes → Assignation LPT)</p>
          </div>

          {/* Résultats par machine */}
          <div className={styles.machineResults}>
            <h4>📊 Performance par machine</h4>
            <div className={styles.machineResultsGrid}>
              {machines.map((machine, index) => {
                const machine_key = machine.nom.toLowerCase().replace(' ', '_');
                const utilisation = result[`utilisation_${machine_key}`] || 0;
                const nb_operations = result[`nb_operations_${machine_key}`] || 0;
                const nb_clusters = result[`nb_clusters_${machine_key}`] || 0;
                const nb_groupes = result[`nb_groupes_${machine_key}`] || 0;
                
                return (
                  <div key={index} className={styles.machineResultCard}>
                    <h5>{machine.nom}</h5>
                    <div className={styles.machineResultStats}>
                      <span>{nb_operations} ops</span>
                      <span>→ {nb_clusters} clusters</span>
                      <span>→ {nb_groupes} groupes</span>
                    </div>
                    <div className={styles.utilisationBar}>
                      <div 
                        className={styles.utilisationFill}
                        style={{ 
                          width: `${Math.min(utilisation, 100)}%`,
                          backgroundColor: utilisation <= 100 ? '#10b981' : '#ef4444'
                        }}
                      ></div>
                      <span className={styles.utilisationText}>{utilisation}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détails des étapes */}
          {result.clusters && result.clusters.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>🔄 Étape 1 - Formation des clusters</h4>
              {result.clusters.map((machineCluster, index) => (
                <div key={index} className={styles.stepBlock}>
                  <h5>{machineCluster.machine}</h5>
                  <div className={styles.clustersGrid}>
                    {machineCluster.clusters.map((cluster, clusterIndex) => (
                      <div key={clusterIndex} className={styles.clusterCard}>
                        <div className={styles.clusterHeader}>Cluster {cluster.numero}</div>
                        <div className={styles.clusterContent}>
                          <div><strong>Opérations:</strong> {cluster.operations.join(", ")}</div>
                          <div><strong>Temps:</strong> {cluster.temps_total} {result.unite_temps}</div>
                          <div><strong>Outils:</strong> {cluster.outils.join(", ")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.groupes && result.groupes.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>📦 Étape 2 - Formation des groupes</h4>
              {result.groupes.map((machineGroupe, index) => (
                <div key={index} className={styles.stepBlock}>
                  <h5>{machineGroupe.machine} - {machineGroupe.nb_groupes} groupe(s)</h5>
                  <div className={styles.groupesGrid}>
                    {machineGroupe.groupes.map((groupe, groupeIndex) => (
                      <div key={groupeIndex} className={styles.groupeCard}>
                        <span>Groupe {groupe.numero}: {groupe.nb_machines} machine(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.assignations && result.assignations.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>⚡ Étape 3 - Assignations LPT</h4>
              {result.assignations.map((machineAssign, index) => (
                <div key={index} className={styles.stepBlock}>
                  <h5>{machineAssign.machine}</h5>
                  <div className={styles.assignationsGrid}>
                    {machineAssign.assignations.map((assign, assignIndex) => (
                      <div key={assignIndex} className={styles.assignationCard}>
                        <div className={styles.assignationHeader}>Groupe {assign.groupe}</div>
                        <div className={styles.assignationContent}>
                          {assign.operations.length > 0 ? assign.operations.join(", ") : "Aucune opération"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>📊 Analyse graphique de l'algorithme heuristique</h4>
              <img 
                src={chartUrl} 
                alt="Graphiques FMS Lots de Chargement Heuristique" 
                className={styles.gantt}
                style={{ width: "100%", maxWidth: "800px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              />
              <button 
                onClick={handleDownloadChart}
                className={styles.button}
                style={{ marginTop: "1rem" }}
              >
                📥 Télécharger le graphique
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 