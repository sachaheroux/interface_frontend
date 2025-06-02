import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

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
    const nouvelleMachine = { 
      nom: `Machine ${machines.length + 1}`, 
      nombre: 1, 
      capaciteTemps: 800, 
      capaciteOutils: 2,
      operations: [
        [`o${machines.length + 1}1`, 300, "Y1"]
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
    nouvellesMachines[machineIndex].operations.push([nouveauNom, 300, "Y1"]);
    setMachines(nouvellesMachines);
  };

  const removeOperation = (machineIndex) => {
    const nouvellesMachines = [...machines];
    if (nouvellesMachines[machineIndex].operations.length > 1) {
      nouvellesMachines[machineIndex].operations.pop();
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
    const nouveauxOutils = { ...outilsEspace };
    delete nouveauxOutils[outilASupprimer];
    setOutilsEspace(nouveauxOutils);
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

  const calculateTempsTotal = (machineIndex) => {
    return machines[machineIndex].operations.reduce((total, op) => total + op[1], 0);
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

      {/* Configuration des outils */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des outils</h4>
        
        <div className={styles.jobBlock}>
          <h4>Outils disponibles</h4>
          
          {Object.entries(outilsEspace).map(([outil, espace]) => (
            <div key={outil} className={styles.taskRow}>
              <label>Outil {outil} - Espace requis :</label>
              <input
                type="number"
                min="1"
                value={espace}
                onChange={(e) => handleOutilEspaceChange(outil, e.target.value)}
                className={styles.input}
                style={{ width: "80px", marginRight: "10px" }}
              />
              <button 
                className={styles.button}
                onClick={() => removeOutil(outil)}
                style={{ backgroundColor: "#ef4444", padding: "0.3rem 0.8rem" }}
              >
                Supprimer
              </button>
            </div>
          ))}

          <button className={styles.button} onClick={addOutil}>+ Ajouter un outil</button>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={addMachine}>+ Ajouter un type de machine</button>
        <button className={styles.button} onClick={removeMachine}>- Supprimer un type de machine</button>
      </div>

      {/* Configuration des machines */}
      <div className={styles.tasksContainer}>
        <h4 className={styles.subtitle}>Configuration des machines et opérations</h4>
        
        {machines.map((machine, machineIndex) => (
          <div key={machineIndex} className={styles.jobBlock}>
            <h4>{machine.nom}</h4>
            
            <div className={styles.taskRow}>
              <label>Nom de la machine :</label>
              <input
                type="text"
                value={machine.nom}
                onChange={(e) => handleMachineChange(machineIndex, "nom", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Nombre de machines :</label>
              <input
                type="number"
                min="1"
                value={machine.nombre}
                onChange={(e) => handleMachineChange(machineIndex, "nombre", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Capacité de temps ({uniteTemps}) :</label>
              <input
                type="number"
                min="1"
                value={machine.capaciteTemps}
                onChange={(e) => handleMachineChange(machineIndex, "capaciteTemps", e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.taskRow}>
              <label>Capacité d'outils :</label>
              <input
                type="number"
                min="1"
                value={machine.capaciteOutils}
                onChange={(e) => handleMachineChange(machineIndex, "capaciteOutils", e.target.value)}
                className={styles.input}
              />
            </div>

            <h5 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Opérations (Résultats phase 1 FMS)</h5>
            
            {machine.operations.map((operation, operationIndex) => (
              <div key={operationIndex} style={{ marginLeft: "1rem", marginBottom: "0.5rem" }}>
                <div className={styles.taskRow}>
                  <label>Nom opération :</label>
                  <input
                    type="text"
                    value={operation[0]}
                    onChange={(e) => handleOperationChange(machineIndex, operationIndex, "nom", e.target.value)}
                    className={styles.input}
                    style={{ width: "120px", marginRight: "10px" }}
                  />
                  
                  <label>Temps :</label>
                  <input
                    type="number"
                    min="1"
                    value={operation[1]}
                    onChange={(e) => handleOperationChange(machineIndex, operationIndex, "temps", e.target.value)}
                    className={styles.input}
                    style={{ width: "80px", marginRight: "10px" }}
                  />
                  
                  <label>Outil :</label>
                  <select
                    value={operation[2]}
                    onChange={(e) => handleOperationChange(machineIndex, operationIndex, "outil", e.target.value)}
                    className={styles.select}
                    style={{ width: "100px" }}
                  >
                    {Object.keys(outilsEspace).map(outil => (
                      <option key={outil} value={outil}>{outil}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <div className={styles.buttonGroup} style={{ marginTop: "0.5rem" }}>
              <button 
                className={styles.button} 
                onClick={() => addOperation(machineIndex)}
                style={{ padding: "0.3rem 0.8rem" }}
              >
                + Opération
              </button>
              <button 
                className={styles.button} 
                onClick={() => removeOperation(machineIndex)}
                style={{ backgroundColor: "#ef4444", padding: "0.3rem 0.8rem" }}
              >
                - Opération
              </button>
            </div>

            <small className={styles.helpText}>
              <strong>Temps total :</strong> {calculateTempsTotal(machineIndex)} {uniteTemps} | 
              <strong> Capacité totale :</strong> {machine.capaciteTemps * machine.nombre} {uniteTemps} | 
              <strong> Opérations :</strong> {machine.operations.length}
            </small>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? "Analyse heuristique en cours..." : "Résoudre avec l'algorithme heuristique"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <h3>Résultats de l'algorithme heuristique - Lots de chargement</h3>
          
          <div className={styles.metricsGrid}>
            <div>
              <strong>Statut :</strong> 
              <span style={{ color: '#10b981' }}>{result.status}</span>
            </div>
            <div>
              <strong>Méthode :</strong> {result.methode}
            </div>
            <div>
              <strong>Critère :</strong> {result.critere_selection}
            </div>
            <div>
              <strong>Nombre d'étapes :</strong> {result.nb_etapes}
            </div>
            <div>
              <strong>Opérations totales :</strong> {result.nb_operations_total}
            </div>
            <div>
              <strong>Clusters totaux :</strong> {result.nb_clusters_total}
            </div>
            <div>
              <strong>Groupes totaux :</strong> {result.nb_groupes_total}
            </div>
            {machines.map((machine, index) => (
              <div key={index}>
                <strong>{machine.nom} :</strong> {renderResultsForMachine(machine.nom, result)}
              </div>
            ))}
            <div>
              <strong>Efficacité globale :</strong> {result.efficacite_globale}%
            </div>
          </div>

          {/* Clusters */}
          {result.clusters && result.clusters.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Étape 1 - Clusters d'opérations :</h4>
              {result.clusters.map((machineCluster, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>{machineCluster.machine}</strong>
                  {machineCluster.clusters.map((cluster, clusterIndex) => (
                    <div key={clusterIndex} style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                      <strong>Cluster {cluster.numero}:</strong> {cluster.operations.join(", ")} 
                      <br />
                      <span style={{ marginLeft: "1rem", color: "#6b7280" }}>
                        Temps: {cluster.temps_total} {result.unite_temps} | 
                        Outils: {cluster.outils.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Groupes */}
          {result.groupes && result.groupes.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Étape 2 - Formation des groupes :</h4>
              {result.groupes.map((machineGroupe, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>{machineGroupe.machine}</strong> - {machineGroupe.nb_groupes} groupe(s)
                  {machineGroupe.groupes.map((groupe, groupeIndex) => (
                    <div key={groupeIndex} style={{ marginLeft: "1rem", marginTop: "0.3rem" }}>
                      Groupe {groupe.numero}: {groupe.nb_machines} machine(s)
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Assignations */}
          {result.assignations && result.assignations.length > 0 && (
            <div className={styles.stationsSection}>
              <h4>Étape 3 - Assignations LPT :</h4>
              {result.assignations.map((machineAssign, index) => (
                <div key={index} className={styles.stationBlock}>
                  <strong>{machineAssign.machine}</strong>
                  {machineAssign.assignations.map((assign, assignIndex) => (
                    <div key={assignIndex} style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                      <strong>Groupe {assign.groupe}:</strong> {assign.operations.length > 0 ? assign.operations.join(", ") : "Aucune opération"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {chartUrl && (
            <div className={styles.ganttContainer}>
              <h4>Analyse graphique de l'algorithme heuristique</h4>
              <img 
                src={chartUrl} 
                alt="Graphiques FMS Lots de Chargement Heuristique" 
                className={styles.gantt}
                style={{ width: "100%", maxWidth: "800px" }}
              />
              <button 
                onClick={handleDownloadChart}
                className={styles.button}
                style={{ marginTop: "1rem" }}
              >
                Télécharger le graphique
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 