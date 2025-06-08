import { useState } from "react";
import styles from "./FMSLotsChargementHeuristiqueForm.module.css";

export default function FMSLotsChargementHeuristiqueForm() {
  // Configuration système
  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("420");
  const [uniteTemps, setUniteTemps] = useState("minutes");
  const [devise, setDevise] = useState("CAD");
  
  // État des machines avec données par défaut
  const [machines, setMachines] = useState([
    { 
      nom: "Machine A", 
      nombre: 2, 
      capaciteTemps: 800, 
      capaciteOutils: 3,
      outilsDisponibles: ["A1", "A2", "A3"],
      espaceOutils: [1, 2, 1]
    },
    { 
      nom: "Machine B", 
      nombre: 2, 
      capaciteTemps: 800, 
      capaciteOutils: 1,
      outilsDisponibles: ["B1", "B2"],
      espaceOutils: [1, 2]
    },
    { 
      nom: "Machine C", 
      nombre: 1, 
      capaciteTemps: 800, 
      capaciteOutils: 4,
      outilsDisponibles: ["C1"],
      espaceOutils: [1]
    }
  ]);

  // État des opérations (résultats de phase 1 FMS)
  const [operations, setOperations] = useState([
    { 
      nom: "o11", 
      piece: "P1", 
      operation: "1",
      machine: 0, // index de machine
      temps: 480, 
      outilsRequis: ["A1"], // Peut contenir plusieurs outils
      demande: 10 // Quantité demandée
    },
    { 
      nom: "o12", 
      piece: "P1", 
      operation: "2",
      machine: 1, 
      temps: 200, 
      outilsRequis: ["B1"],
      demande: 10
    },
    { 
      nom: "o21", 
      piece: "P2", 
      operation: "1",
      machine: 1, 
      temps: 600, 
      outilsRequis: ["B2"],
      demande: 15
    },
    { 
      nom: "o22", 
      piece: "P2", 
      operation: "2",
      machine: 0, 
      temps: 200, 
      outilsRequis: ["A2"],
      demande: 15
    },
    { 
      nom: "o23", 
      piece: "P2", 
      operation: "3",
      machine: 0, 
      temps: 500, 
      outilsRequis: ["A3"],
      demande: 15
    },
    { 
      nom: "o31", 
      piece: "P3", 
      operation: "1",
      machine: 1, 
      temps: 560, 
      outilsRequis: ["B1"],
      demande: 8
    },
    { 
      nom: "o33", 
      piece: "P3", 
      operation: "3",
      machine: 2, 
      temps: 400, 
      outilsRequis: ["C1"],
      demande: 8
    }
  ]);
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "/api";

  const devises = {
    "CAD": { symbole: "$", nom: "Dollar Canadien" },
    "USD": { symbole: "$", nom: "Dollar Américain" },
    "EUR": { symbole: "€", nom: "Euro" },
    "GBP": { symbole: "£", nom: "Livre Sterling" },
    "JPY": { symbole: "¥", nom: "Yen Japonais" }
  };

  // Fonctions pour gérer les machines
  const addMachine = () => {
    const nouveauNom = `Machine ${String.fromCharCode(68 + machines.length - 3)}`; // D, E, F...
    const nouvelleMachine = { 
      nom: nouveauNom, 
      nombre: 1, 
      capaciteTemps: 800, 
      capaciteOutils: 3,
      outilsDisponibles: [`${nouveauNom.slice(-1)}1`],
      espaceOutils: [1]
    };
    setMachines([...machines, nouvelleMachine]);
  };

  const removeMachine = () => {
    if (machines.length > 1) {
      const machineIndexToRemove = machines.length - 1;
      setMachines(machines.slice(0, -1));
      
      // Supprimer les opérations liées à cette machine
      setOperations(operations.filter(op => op.machine !== machineIndexToRemove));
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

  // Fonctions pour gérer les outils de machines
  const addOutilToMachine = (machineIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    const nouveauNom = `${machine.nom.slice(-1)}${machine.outilsDisponibles.length + 1}`;
    machine.outilsDisponibles.push(nouveauNom);
    machine.espaceOutils.push(1);
    setMachines(nouvellesMachines);
  };

  const removeOutilFromMachine = (machineIndex, outilIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    if (machine.outilsDisponibles.length > 1) {
      const outilASupprimer = machine.outilsDisponibles[outilIndex];
      machine.outilsDisponibles.splice(outilIndex, 1);
      machine.espaceOutils.splice(outilIndex, 1);
      setMachines(nouvellesMachines);
      
      // Nettoyer les références à cet outil dans les opérations
      const nouvellesOperations = operations.map(op => ({
        ...op,
        outilsRequis: op.outilsRequis.filter(outil => outil !== outilASupprimer)
      }));
      setOperations(nouvellesOperations);
    }
  };

  const updateOutilNom = (machineIndex, outilIndex, nouveauNom) => {
    const nouvellesMachines = [...machines];
    const ancienNom = nouvellesMachines[machineIndex].outilsDisponibles[outilIndex];
    nouvellesMachines[machineIndex].outilsDisponibles[outilIndex] = nouveauNom;
    setMachines(nouvellesMachines);
    
    // Mettre à jour les références dans les opérations
    const nouvellesOperations = operations.map(op => ({
      ...op,
      outilsRequis: op.outilsRequis.map(outil => outil === ancienNom ? nouveauNom : outil)
    }));
    setOperations(nouvellesOperations);
  };

  const updateOutilEspace = (machineIndex, outilIndex, nouvelEspace) => {
    const nouvellesMachines = [...machines];
    nouvellesMachines[machineIndex].espaceOutils[outilIndex] = parseInt(nouvelEspace) || 1;
    setMachines(nouvellesMachines);
  };

  // Fonctions pour gérer les opérations
  const addOperation = () => {
    const nouvellePiece = `P${Math.max(...operations.map(op => parseInt(op.piece.slice(1)) || 0)) + 1}`;
    const nouvelleOperation = { 
      nom: `o${operations.length + 1}1`, 
      piece: nouvellePiece,
      operation: "1",
      machine: 0, 
      temps: 300, 
      outilsRequis: [machines[0]?.outilsDisponibles[0] || "A1"],
      demande: 10
    };
    setOperations([...operations, nouvelleOperation]);
  };

  const removeOperation = (index) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  const handleOperationChange = (index, field, value) => {
    const nouvellesOperations = [...operations];
    if (field === 'machine') {
      nouvellesOperations[index][field] = parseInt(value) || 0;
      // Réinitialiser les outils requis quand on change de machine
      nouvellesOperations[index].outilsRequis = [];
    } else if (field === 'temps' || field === 'demande') {
      nouvellesOperations[index][field] = parseInt(value) || 0;
    } else {
      nouvellesOperations[index][field] = value;
    }
    setOperations(nouvellesOperations);
  };

  const handleOutilSelection = (operationIndex, outil) => {
    const nouvellesOperations = [...operations];
    const outilsActuels = nouvellesOperations[operationIndex].outilsRequis || [];
    
    if (outilsActuels.includes(outil)) {
      // Désélectionner l'outil
      nouvellesOperations[operationIndex].outilsRequis = outilsActuels.filter(o => o !== outil);
    } else {
      // Sélectionner l'outil
      nouvellesOperations[operationIndex].outilsRequis = [...outilsActuels, outil];
    }
    
    setOperations(nouvellesOperations);
  };

  // Calculs d'assistance
  const getOperationsParMachine = (machineIndex) => {
    return operations.filter(op => op.machine === machineIndex);
  };

  const getTempsTotal = (machineIndex) => {
    return getOperationsParMachine(machineIndex).reduce((total, op) => total + (op.temps * op.demande), 0);
  };

  const getCapaciteUtilisee = (machineIndex) => {
    const tempsTotal = getTempsTotal(machineIndex);
    const capaciteMax = machines[machineIndex].capaciteTemps * machines[machineIndex].nombre;
    return capaciteMax > 0 ? ((tempsTotal / capaciteMax) * 100).toFixed(1) : 0;
  };

  const getValidationIcon = (machineIndex) => {
    const utilisation = parseFloat(getCapaciteUtilisee(machineIndex));
    if (utilisation <= 100) return { icon: "✓", color: "#10b981" };
    return { icon: "⚠", color: "#f59e0b" };
  };

  const getOutilsEspace = () => {
    const outilsEspace = {};
    machines.forEach(machine => {
      machine.outilsDisponibles.forEach((outil, index) => {
        outilsEspace[outil] = machine.espaceOutils[index] || 1;
      });
    });
    return outilsEspace;
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      if (machines.length === 0) {
        setError("Au moins une machine est requise.");
        setIsLoading(false);
        return;
      }

      if (operations.length === 0) {
        setError("Au moins une opération est requise.");
        setIsLoading(false);
        return;
      }

      // Validation des machines
      for (let i = 0; i < machines.length; i++) {
        const m = machines[i];
        if (m.nombre <= 0 || m.capaciteTemps <= 0 || m.capaciteOutils <= 0) {
          setError(`Machine ${m.nom}: Toutes les capacités doivent être positives.`);
          setIsLoading(false);
          return;
        }
        
        if (m.outilsDisponibles.length === 0) {
          setError(`Machine ${m.nom}: Au moins un outil est requis.`);
          setIsLoading(false);
          return;
        }
      }

      // Validation des opérations
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        if (!op.nom || !op.piece || op.temps <= 0 || op.demande <= 0) {
          setError(`Opération ${i + 1}: Nom, pièce, temps positif et demande positive sont requis.`);
          setIsLoading(false);
          return;
        }

        if (op.machine < 0 || op.machine >= machines.length) {
          setError(`Opération ${op.nom}: Machine invalide sélectionnée.`);
          setIsLoading(false);
          return;
        }

        if (op.outilsRequis.length === 0) {
          setError(`Opération ${op.nom}: Au moins un outil doit être sélectionné.`);
          setIsLoading(false);
          return;
        }
      }

      // Préparer les données selon le format attendu par le backend
      const operations_machines = machines.map((machine, machineIndex) => {
        const operationsPourCetteMachine = operations
          .filter(op => op.machine === machineIndex)
          .map(op => {
            // Dupliquer l'opération selon la demande et créer une entrée par outil requis
            const operationsAvecDemande = [];
            for (let d = 0; d < op.demande; d++) {
              // Pour chaque outil requis, créer une opération
              op.outilsRequis.forEach(outil => {
                operationsAvecDemande.push([
                  `${op.nom}_${op.piece}_op${op.operation}_dem${d + 1}`, 
                  op.temps, 
                  outil
                ]);
              });
            }
            return operationsAvecDemande;
          })
          .flat();
        
        return operationsPourCetteMachine;
      });

      const requestData = {
        operations_machines: operations_machines,
        outils_espace: getOutilsEspace(),
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

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>FMS - Lots de Chargement (Heuristique)</h1>
        <p className={styles.subtitle}>
          Algorithme heuristique en 3 étapes pour optimiser les lots de chargement dans un système FMS
        </p>
      </div>

      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      {/* Configuration système */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Paramètres Système</h2>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Temps disponible par jour</label>
            <input
              type="number"
              min="1"
              value={tempsDisponibleJour}
              onChange={(e) => setTempsDisponibleJour(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Unité de temps</label>
            <select value={uniteTemps} onChange={(e) => setUniteTemps(e.target.value)} className={styles.select}>
              <option value="minutes">minutes</option>
              <option value="heures">heures</option>
              <option value="jours">jours</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Devise</label>
            <select value={devise} onChange={(e) => setDevise(e.target.value)} className={styles.select}>
              {Object.entries(devises).map(([code, info]) => (
                <option key={code} value={code}>{info.symbole} {info.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.addButton} onClick={addMachine}>
            + Ajouter une machine
          </button>
          <button className={styles.addButton} onClick={removeMachine} disabled={machines.length <= 1}>
            - Supprimer une machine
          </button>
          <button className={styles.addButton} onClick={addOperation}>
            + Ajouter une opération
          </button>
        </div>
      </div>

      {/* Configuration des machines */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Machines et Outils</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom de la Machine</th>
                <th>Nombre d'Unités</th>
                <th>Capacité Temps<br/>({uniteTemps})</th>
                <th>Capacité Outils<br/><small>(espace max)</small></th>
                <th>Outils Disponibles</th>
                <th>Actions</th>
                <th>Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, machineIndex) => {
                const validation = getValidationIcon(machineIndex);
                const operationsPourCetteMachine = getOperationsParMachine(machineIndex);
                const maxEspaceOutil = machine.espaceOutils ? Math.max(...machine.espaceOutils) : 0;
                const isEspaceValid = maxEspaceOutil <= machine.capaciteOutils;
                
                return (
                  <tr key={machineIndex}>
                    <td>
                      <input
                        type="text"
                        value={machine.nom}
                        onChange={(e) => handleMachineChange(machineIndex, "nom", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={machine.nombre}
                        onChange={(e) => handleMachineChange(machineIndex, "nombre", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={machine.capaciteTemps}
                        onChange={(e) => handleMachineChange(machineIndex, "capaciteTemps", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={machine.capaciteOutils}
                        onChange={(e) => handleMachineChange(machineIndex, "capaciteOutils", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <div className={styles.outilsCompact}>
                        {machine.outilsDisponibles.map((outil, outilIndex) => (
                          <div key={outilIndex} className={styles.outilCompact}>
                            <div className={styles.outilNumber}>{outilIndex + 1}</div>
                            <input
                              type="text"
                              value={outil}
                              onChange={(e) => updateOutilNom(machineIndex, outilIndex, e.target.value)}
                              className={styles.compactInput}
                              placeholder={`${machine.nom.slice(-1)}${outilIndex + 1}`}
                              title={`Nom de l'outil ${outilIndex + 1}`}
                            />
                            <input
                              type="number"
                              value={machine.espaceOutils[outilIndex]}
                              onChange={(e) => updateOutilEspace(machineIndex, outilIndex, e.target.value)}
                              className={styles.compactNumberInput}
                              min="1"
                              placeholder="1"
                              title={`Espace requis (unités)`}
                            />
                            <button
                              onClick={() => removeOutilFromMachine(machineIndex, outilIndex)}
                              disabled={machine.outilsDisponibles.length <= 1}
                              className={styles.miniButton}
                              type="button"
                              title="Supprimer cet outil"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles.machineActionsCompact}>
                        <button
                          onClick={() => addOutilToMachine(machineIndex)}
                          className={styles.miniButton}
                          type="button"
                          title="Ajouter un outil"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.metricCell} style={{ 
                        color: validation.color,
                        fontWeight: "bold",
                        fontSize: "0.8rem"
                      }}>
                        {validation.icon} {getCapaciteUtilisee(machineIndex)}%
                        <br/>
                        {operationsPourCetteMachine.length} ops
                        <br/>
                        Esp: {maxEspaceOutil}/{machine.capaciteOutils}
                        <br/>
                        {isEspaceValid ? "✓ OK" : "⚠️ Outil trop gros"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration des opérations */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Opérations FMS (Résultats Phase 1)</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Pièce</th>
                <th>N° Op</th>
                <th>Machine</th>
                <th>Temps<br/>({uniteTemps})</th>
                <th>Demande</th>
                <th>Outils Requis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operation, operationIndex) => (
                <tr key={operationIndex}>
                  <td>
                    <input
                      type="text"
                      value={operation.nom}
                      onChange={(e) => handleOperationChange(operationIndex, "nom", e.target.value)}
                      className={styles.input}
                      placeholder="ex: o11"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={operation.piece}
                      onChange={(e) => handleOperationChange(operationIndex, "piece", e.target.value)}
                      className={styles.input}
                      placeholder="ex: P1"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={operation.operation}
                      onChange={(e) => handleOperationChange(operationIndex, "operation", e.target.value)}
                      className={styles.input}
                      placeholder="1"
                    />
                  </td>
                  <td>
                    <select
                      value={operation.machine}
                      onChange={(e) => handleOperationChange(operationIndex, "machine", e.target.value)}
                      className={styles.select}
                    >
                      {machines.map((machine, index) => (
                        <option key={index} value={index}>{machine.nom}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={operation.temps}
                      onChange={(e) => handleOperationChange(operationIndex, "temps", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={operation.demande}
                      onChange={(e) => handleOperationChange(operationIndex, "demande", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <div className={styles.outilsSelection}>
                      {operation.machine >= 0 && operation.machine < machines.length && 
                       machines[operation.machine].outilsDisponibles.map(outil => {
                         const isSelected = operation.outilsRequis.includes(outil);
                         const espaceIndex = machines[operation.machine].outilsDisponibles.indexOf(outil);
                         const espace = machines[operation.machine].espaceOutils[espaceIndex];
                         return (
                           <label key={outil} className={styles.checkboxLabel}>
                             <input
                               type="checkbox"
                               checked={isSelected}
                               onChange={() => handleOutilSelection(operationIndex, outil)}
                               className={styles.checkbox}
                             />
                             <span>{outil}({espace})</span>
                           </label>
                         );
                       })}
                      {operation.outilsRequis.length > 0 && (
                        <div className={styles.selectedOutils}>
                          <strong>→ {operation.outilsRequis.join(", ")}</strong>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <button 
                      className={styles.miniButton}
                      onClick={() => removeOperation(operationIndex)}
                      title="Supprimer opération"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className={styles.calculateButton}
      >
        {isLoading ? "Analyse en cours..." : "Résoudre avec l'heuristique"}
      </button>

      {result && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Résultats de l'algorithme heuristique - Lots de chargement</h3>
          
          {/* Métriques principales */}
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ 
                color: result.status === 'Optimal' ? '#10b981' : 
                       result.status === 'Infaisable' ? '#ef4444' : '#f59e0b' 
              }}>
                {result.status}
              </div>
              <div className={styles.metricLabel}>Statut</div>
              {result.status === 'Infaisable' && (
                <div className={styles.errorDetails}>
                  <small>{result.message}</small>
                </div>
              )}
            </div>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>{result.nb_operations_total}</div>
              <div className={styles.metricLabel}>Opérations totales</div>
            </div>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>{result.nb_clusters_total}</div>
              <div className={styles.metricLabel}>Clusters formés</div>
            </div>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>{result.nb_groupes_total}</div>
              <div className={styles.metricLabel}>Groupes créés</div>
            </div>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ color: result.efficacite_globale >= 80 ? '#10b981' : result.efficacite_globale >= 60 ? '#f59e0b' : '#ef4444' }}>
                {result.efficacite_globale}%
              </div>
              <div className={styles.metricLabel}>Efficacité globale</div>
            </div>
          </div>

          {/* Algorithme utilisé */}
          <div className={styles.algorithmDetails}>
            <h4>Méthode: {result.methode}</h4>
            {result.critere_selection && <p><strong>Critère:</strong> {result.critere_selection}</p>}
            {result.nb_etapes && <p><strong>Étapes:</strong> {result.nb_etapes} (Clustering → Groupes → Assignation LPT)</p>}
            {result.validation && <p><strong>Validation:</strong> {result.validation}</p>}
          </div>

          {/* Résultats par machine */}
          {result.status === 'Optimal' && (
            <div className={styles.machineResults}>
              <h4>Performance par machine</h4>
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
                        <span>{nb_operations} ops → {nb_clusters} clusters → {nb_groupes} groupes</span>
                      </div>
                      <div className={styles.utilisationBar}>
                        <div 
                          className={styles.utilisationFill}
                          style={{ 
                            width: `${Math.min(utilisation, 100)}%`,
                            backgroundColor: utilisation <= 100 ? '#3b82f6' : '#ef4444'
                          }}
                        ></div>
                        <span className={styles.utilisationText}>{utilisation}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Détails des étapes */}
          {result.status === 'Optimal' && result.clusters && result.clusters.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>Étape 1 - Formation des clusters</h4>
              {result.clusters.map((machineCluster, index) => (
                <div key={index} className={styles.stepDetails}>
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

          {result.status === 'Optimal' && result.groupes && result.groupes.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>Étape 2 - Formation des groupes</h4>
              {result.groupes.map((machineGroupe, index) => (
                <div key={index} className={styles.stepDetails}>
                  <h5>{machineGroupe.machine} - {machineGroupe.nb_groupes} groupe(s)</h5>
                  <div className={styles.groupesGrid}>
                    {machineGroupe.groupes.map((groupe, groupeIndex) => (
                      <div key={groupeIndex} className={styles.groupeCard}>
                        Groupe {groupe.numero}: {groupe.nb_machines} machine(s)
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.status === 'Optimal' && result.assignations && result.assignations.length > 0 && (
            <div className={styles.stepsSection}>
              <h4>Étape 3 - Assignations LPT</h4>
              {result.assignations.map((machineAssign, index) => (
                <div key={index} className={styles.stepDetails}>
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
            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h3>Analyse graphique</h3>
              </div>
              <div className={styles.chartContainer}>
                <img 
                  src={chartUrl} 
                  alt="Graphiques FMS Lots de Chargement Heuristique" 
                  className={styles.chart}
                />
              </div>
              <button 
                onClick={handleDownloadChart}
                className={styles.downloadButton}
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