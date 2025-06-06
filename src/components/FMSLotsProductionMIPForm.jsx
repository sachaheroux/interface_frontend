import React, { useState } from "react";
import styles from "./FMSSacADosForm.module.css";
import config from "../config.js";

export default function FMSLotsProductionMIPForm() {
  // Configuration système
  const [tempsDisponibleJour, setTempsDisponibleJour] = useState("420");
  const [uniteTemps, setUniteTemps] = useState("minutes");
  const [devise, setDevise] = useState("CAD");
  
  // État des machines avec données par défaut du collègue (avec gestion d'espace)
  const [machines, setMachines] = useState([
    { nom: "Machine A", nombre: 1, capaciteOutils: 5, outilsDisponibles: ["A1", "A2", "A3"], espaceOutils: [1, 2, 3] },
    { nom: "Machine B", nombre: 1, capaciteOutils: 4, outilsDisponibles: ["B1", "B2"], espaceOutils: [2, 2] }
  ]);

  const [produits, setProduits] = useState([
    { 
      nom: "Produit 1", 
      grandeurCommande: 60, 
      tempsOperations: [5, 1], 
      outils: [["A1"], ["B1"]], // Maintenant un tableau de tableaux pour permettre plusieurs outils
      dateDue: 3,
      coutInventaire: 100
    },
    { 
      nom: "Produit 2", 
      grandeurCommande: 175, 
      tempsOperations: [2, 2.5], 
      outils: [["A2"], ["B1"]], 
      dateDue: 2,
      coutInventaire: 50
    },
    { 
      nom: "Produit 3", 
      grandeurCommande: 45, 
      tempsOperations: [2.5, 2.5], 
      outils: [["A3"], ["B2"]], 
      dateDue: 2,
      coutInventaire: 150
    }
  ]);
  
  const [result, setResult] = useState(null);
  const [chartUrl, setChartUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const devises = {
    "CAD": { symbole: "$", nom: "Dollar Canadien" },
    "USD": { symbole: "$", nom: "Dollar Américain" },
    "EUR": { symbole: "€", nom: "Euro" },
    "GBP": { symbole: "£", nom: "Livre Sterling" },
    "JPY": { symbole: "¥", nom: "Yen Japonais" }
  };

  // Fonctions pour gérer les machines
  const addMachine = () => {
    const nouveauNom = `Machine ${String.fromCharCode(65 + machines.length)}`; // A, B, C, D...
    const nouvelleMachine = { 
      nom: nouveauNom, 
      nombre: 1, 
      capaciteOutils: 5, 
      outilsDisponibles: [`${nouveauNom.slice(-1)}1`, `${nouveauNom.slice(-1)}2`], 
      espaceOutils: [2, 2] 
    };
    setMachines([...machines, nouvelleMachine]);
    
    // Ajouter une colonne à tous les produits
    const nouveauxProduits = produits.map(p => ({
      ...p,
      tempsOperations: [...p.tempsOperations, 1.0],
      outils: [...p.outils, [(nouvelleMachine.outilsDisponibles || [])[0] || ""]]
    }));
    setProduits(nouveauxProduits);
  };

  const removeMachine = () => {
    if (machines.length > 1) {
      setMachines(machines.slice(0, -1));
      
      // Supprimer la dernière colonne de tous les produits
      const nouveauxProduits = produits.map(p => ({
        ...p,
        tempsOperations: p.tempsOperations.slice(0, -1),
        outils: p.outils.slice(0, -1)
      }));
      setProduits(nouveauxProduits);
    }
  };

  const handleMachineChange = (index, field, value) => {
    const nouvellesMachines = [...machines];
    if (field === 'nom') {
      nouvellesMachines[index][field] = value;
    } else if (field === 'outilsDisponibles') {
      nouvellesMachines[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
    } else if (field === 'espaceOutils') {
      nouvellesMachines[index][field] = value.split(',').map(s => parseInt(s.trim()) || 1);
    } else {
      nouvellesMachines[index][field] = parseInt(value) || 0;
    }
    setMachines(nouvellesMachines);
  };

  // Fonctions pour gérer les produits
  const addProduit = () => {
    const nouveauProduit = { 
      nom: `Produit ${produits.length + 1}`, 
      grandeurCommande: 50, 
      tempsOperations: new Array(machines.length).fill(2.0), 
      outils: machines.map((machine, index) => [(machine.outilsDisponibles || [])[0] || ""]), 
      dateDue: 2,
      coutInventaire: 100
    };
    setProduits([...produits, nouveauProduit]);
  };

  const removeProduit = () => {
    if (produits.length > 1) {
      setProduits(produits.slice(0, -1));
    }
  };

  const handleProduitChange = (produitIndex, field, value, machineIndex = null) => {
    const nouveauxProduits = [...produits];
    
    if (field === 'tempsOperation') {
      nouveauxProduits[produitIndex].tempsOperations[machineIndex] = parseFloat(value) || 0;
    } else if (field === 'outil') {
      // Gestion de la sélection multiple d'outils
      const outilsActuels = nouveauxProduits[produitIndex].outils[machineIndex] || [];
      if (outilsActuels.includes(value)) {
        // Désélectionner l'outil
        nouveauxProduits[produitIndex].outils[machineIndex] = outilsActuels.filter(o => o !== value);
      } else {
        // Sélectionner l'outil
        nouveauxProduits[produitIndex].outils[machineIndex] = [...outilsActuels, value];
      }
    } else if (field === 'nom') {
      nouveauxProduits[produitIndex][field] = value;
    } else if (field === 'coutInventaire') {
      nouveauxProduits[produitIndex][field] = parseFloat(value) || 0;
    } else {
      nouveauxProduits[produitIndex][field] = parseFloat(value) || 0;
    }
    
    setProduits(nouveauxProduits);
  };

  const calculateCapaciteTotale = (machineIndex) => {
    return parseFloat(tempsDisponibleJour || 0) * machines[machineIndex].nombre;
  };

  const calculateTempsRequisProduit = (produit) => {
    return produit.tempsOperations.reduce((total, temps, index) => 
      total + (temps * produit.grandeurCommande), 0
    );
  };

  // Fonctions pour gérer les outils de machines (style JobShop)
  const addOutilToMachine = (machineIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    const nouveauNom = `${machine.nom.slice(-1)}${(machine.outilsDisponibles.length + 1)}`;
    machine.outilsDisponibles.push(nouveauNom);
    machine.espaceOutils.push(1);
    setMachines(nouvellesMachines);
  };

  const removeOutilFromMachine = (machineIndex, outilIndex) => {
    const nouvellesMachines = [...machines];
    const machine = nouvellesMachines[machineIndex];
    if (machine.outilsDisponibles.length > 1) {
      machine.outilsDisponibles.splice(outilIndex, 1);
      machine.espaceOutils.splice(outilIndex, 1);
      setMachines(nouvellesMachines);
      
      // Nettoyer les références à cet outil dans les produits
      const nouveauxProduits = produits.map(p => ({
        ...p,
        outils: p.outils.map((outilsListe, index) => 
          index === machineIndex ? outilsListe.filter(outil => machine.outilsDisponibles.includes(outil)) : outilsListe
        )
      }));
      setProduits(nouveauxProduits);
    }
  };

  const updateOutilNom = (machineIndex, outilIndex, nouveauNom) => {
    const nouvellesMachines = [...machines];
    const ancienNom = nouvellesMachines[machineIndex].outilsDisponibles[outilIndex];
    nouvellesMachines[machineIndex].outilsDisponibles[outilIndex] = nouveauNom;
    setMachines(nouvellesMachines);
    
    // Mettre à jour les références dans les produits
    const nouveauxProduits = produits.map(p => ({
      ...p,
      outils: p.outils.map((outilsListe, index) => 
        index === machineIndex ? outilsListe.map(outil => outil === ancienNom ? nouveauNom : outil) : outilsListe
      )
    }));
    setProduits(nouveauxProduits);
  };

  const updateOutilEspace = (machineIndex, outilIndex, nouvelEspace) => {
    const nouvellesMachines = [...machines];
    nouvellesMachines[machineIndex].espaceOutils[outilIndex] = parseInt(nouvelEspace) || 1;
    setMachines(nouvellesMachines);
  };

  const handleSubmit = () => {
    setError(null);
    setChartUrl(null);
    setIsLoading(true);

    try {
      // Validation
      const tempsValue = parseFloat(tempsDisponibleJour);

      if (isNaN(tempsValue) || tempsValue <= 0) {
        setError("Le temps disponible par jour doit être un nombre positif.");
        setIsLoading(false);
        return;
      }

      // Validation des machines
      for (let i = 0; i < machines.length; i++) {
        const m = machines[i];
        if (m.nombre <= 0 || m.capaciteOutils <= 0) {
          setError(`Machine ${m.nom}: Le nombre de machines et la capacité d'outils doivent être positifs.`);
          setIsLoading(false);
          return;
        }
        if (!m.outilsDisponibles || m.outilsDisponibles.length === 0) {
          setError(`Machine ${m.nom}: Au moins un outil doit être disponible.`);
          setIsLoading(false);
          return;
        }
        if (m.espaceOutils.length !== m.outilsDisponibles.length) {
          setError(`Machine ${m.nom}: Le nombre d'espaces outils doit correspondre au nombre d'outils.`);
          setIsLoading(false);
          return;
        }
        // Validation : vérifier que chaque outil individuel ne dépasse pas la capacité
        for (let j = 0; j < m.espaceOutils.length; j++) {
          if (m.espaceOutils[j] > m.capaciteOutils) {
            setError(`Machine ${m.nom}: L'outil "${m.outilsDisponibles[j]}" (espace: ${m.espaceOutils[j]}) dépasse la capacité de la machine (${m.capaciteOutils}).`);
            setIsLoading(false);
            return;
          }
        }
      }

      // Validation des produits
      for (let i = 0; i < produits.length; i++) {
        const p = produits[i];
        if (p.grandeurCommande <= 0 || p.dateDue <= 0 || p.coutInventaire < 0) {
          setError(`Produit ${i + 1}: Les valeurs doivent être positives (coût inventaire peut être nul).`);
          setIsLoading(false);
          return;
        }
        
        for (let j = 0; j < p.tempsOperations.length; j++) {
          if (p.tempsOperations[j] < 0) {
            setError(`Produit ${i + 1}, ${machines[j].nom}: Le temps d'opération doit être positif ou nul.`);
            setIsLoading(false);
            return;
          }
        }
      }

      const requestData = {
        noms_produits: produits.map(p => p.nom),
        grandeurs_commande: produits.map(p => p.grandeurCommande),
        temps_operation_machines: produits.map(p => p.tempsOperations),
        outils_machines: produits.map(p => p.outils.map(outilsListe => outilsListe || [])),
        dates_dues: produits.map(p => p.dateDue),
        couts_inventaire: produits.map(p => p.coutInventaire),
        temps_disponible_jour: tempsValue,
        noms_machines: machines.map(m => m.nom),
        nb_machines: machines.map(m => m.nombre),
        capacite_outils: machines.map(m => m.capaciteOutils),
        outils_disponibles: machines.map(m => m.outilsDisponibles),
        espace_outils: machines.map(m => m.espaceOutils),
        unite_temps: uniteTemps
      };

      console.log("Données envoyées au backend:", requestData);

      // Appel API pour les résultats
      fetch(`${config.API_URL}/fms/lots_production_mip`, {
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
          console.log("Résultats reçus:", data);
          console.log("Structure des données:", {
            produits_assignes: data.produits_assignes,
            produits_non_assignes: data.produits_non_assignes,
            nombre_produits_assignes: data.nombre_produits_assignes,
            nombre_produits_rejetes: data.nombre_produits_rejetes,
            efficacite_globale: data.efficacite_globale,
            planification_periodes: data.planification_periodes,
            utilisation_machines: {
              machine_a: data.utilisation_machine_a,
              machine_b: data.utilisation_machine_b
            }
          });
          setResult(data);
          // Récupérer le graphique
          return fetch(`${config.API_URL}/fms/lots_production_mip/chart`, {
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

  const renderResultsForMachine = (nom_machine, result) => {
    const machine_key = nom_machine.toLowerCase().replace(' ', '_');
    const temps_utilise_total = result[`temps_utilise_${machine_key}`] || 0;
    const temps_total = result[`temps_disponible_total_${machine_key}`] || 0;
    const temps_par_periode = result[`temps_disponible_par_periode_${machine_key}`] || 0;
    const utilisation_max = result[`utilisation_${machine_key}`] || 0;
    
    // Calculate the consistent percentage for total usage
    const utilisation_totale = temps_total > 0 ? ((temps_utilise_total / temps_total) * 100).toFixed(1) : 0;
    
    return (
      <div>
        <div><strong>Utilisation totale:</strong> {temps_utilise_total.toFixed(1)}{uniteTemps} / {temps_total.toFixed(1)}{uniteTemps} ({utilisation_totale}%)</div>
        <div><strong>Pic d'utilisation:</strong> {utilisation_max.toFixed(1)}% ({temps_par_periode.toFixed(1)}{uniteTemps} max/période)</div>
      </div>
    );
  };

  const renderProduitsAssignes = (produits_assignes) => {
    if (!produits_assignes || produits_assignes.length === 0) {
      return <p style={{ color: "#6b7280", fontStyle: "italic" }}>Aucun produit assigné</p>;
    }
    
    return produits_assignes.map((produit, index) => (
      <div key={index} className={styles.solutionDetails} style={{ marginBottom: "1rem" }}>
        <strong>{produit.nom}</strong> (Date due: Jour {produit.date_due || produit.dateDue})
        <br />
        Quantité assignée : {produit.quantite_assignee || produit.quantiteAssignee || produit.grandeurCommande}/{produit.quantite_totale || produit.grandeurCommande} unités
        {produit.pourcentage_assigne && <span> ({produit.pourcentage_assigne}%)</span>}
        <br />
        Coût d'inventaire : {devises[devise].symbole}{produit.cout_inventaire_total || produit.coutInventaire || 0}
        <br />
        {machines.map((machine, machineIndex) => {
          const machine_key = machine.nom.toLowerCase().replace(' ', '_');
          const temps = produit[`temps_${machine_key}`] || produit.tempsOperations?.[machineIndex] || 0;
          const outil = produit[`outil_${machine_key}`] || produit.outils?.[machineIndex] || '';
          return (
            <span key={machineIndex}>
              {machine.nom}: {temps}{uniteTemps}{outil ? ` (${outil})` : ''} | 
            </span>
          );
        })}
        <br />
        <small style={{ color: "#6b7280", fontStyle: "italic" }}>
          Temps de traitement par machine {outil ? 'et outils utilisés' : ''}
        </small>
      </div>
    ));
  };

  return (
    <div className={styles.algorithmContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>FMS - Lots de Production avec Programmation Linéaire Mixte (MIP)</h1>
        <p className={styles.subtitle}>
          Optimisation exacte par programmation mathématique avec contraintes d'outils et d'inventaire
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

      <div className={`${styles.section} ${styles.configSection}`}>
        <h2 className={styles.sectionTitle}>Paramètres du Système</h2>
        
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label>Unité de temps</label>
            <select
              value={uniteTemps}
              onChange={(e) => setUniteTemps(e.target.value)}
              className={styles.select}
            >
              <option value="minutes">Minutes</option>
              <option value="heures">Heures</option>
              <option value="jours">Jours</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Temps disponible/jour<br/><span style={{fontSize: "0.8em", color: "#6b7280"}}>({uniteTemps})</span></label>
            <input
              type="number"
              step="1"
              min="0"
              value={tempsDisponibleJour}
              onChange={e => setTempsDisponibleJour(e.target.value)}
              className={styles.input}
              placeholder="420"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Devise</label>
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className={styles.select}
            >
              {Object.entries(devises).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.symbole} {info.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.addButton} onClick={addMachine}>
            + Ajouter une machine
          </button>
          <button className={styles.removeButton} onClick={removeMachine} disabled={machines.length <= 1}>
            - Supprimer une machine
          </button>
          <button className={styles.addButton} onClick={addProduit}>
            + Ajouter un produit
          </button>
          <button className={styles.removeButton} onClick={removeProduit} disabled={produits.length <= 1}>
            - Supprimer un produit
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Machines</h2>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom de la Machine</th>
                <th>Nombre d'Unités</th>
                <th>Capacité Espace<br/><small>(unités d'espace)</small></th>
                <th>Outils Disponibles</th>
                <th>Actions</th>
                <th>Capacité Temps<br/>({uniteTemps})</th>
                <th>Validation Espace</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine, index) => {
                const espaceTotal = machine.espaceOutils ? machine.espaceOutils.reduce((sum, espace) => sum + espace, 0) : 0;
                const maxEspaceOutil = machine.espaceOutils ? Math.max(...machine.espaceOutils) : 0;
                const isEspaceValid = maxEspaceOutil <= machine.capaciteOutils;
                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={machine.nom}
                        onChange={(e) => handleMachineChange(index, "nom", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={machine.nombre}
                        onChange={(e) => handleMachineChange(index, "nombre", e.target.value)}
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={machine.capaciteOutils}
                        onChange={(e) => handleMachineChange(index, "capaciteOutils", e.target.value)}
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
                              onChange={(e) => updateOutilNom(index, outilIndex, e.target.value)}
                              className={styles.compactInput}
                              placeholder={`${machine.nom.slice(-1)}${outilIndex + 1}`}
                              title={`Nom de l'outil ${outilIndex + 1}`}
                            />
                            <input
                              type="number"
                              value={machine.espaceOutils[outilIndex]}
                              onChange={(e) => updateOutilEspace(index, outilIndex, e.target.value)}
                              className={styles.compactNumberInput}
                              min="1"
                              placeholder="1"
                              title={`Espace requis (unités)`}
                            />
                            <button
                              onClick={() => removeOutilFromMachine(index, outilIndex)}
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
                          onClick={() => addOutilToMachine(index)}
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
                        color: "#2563eb",
                        fontWeight: "bold"
                      }}>
                        {calculateCapaciteTotale(index).toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.metricCell} style={{ 
                        color: isEspaceValid ? "#10b981" : "#ef4444",
                        fontWeight: "bold",
                        fontSize: "0.8rem"
                      }}>
                        Max: {maxEspaceOutil}/{machine.capaciteOutils}
                        <br/>
                        Total: {espaceTotal}
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

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Configuration des Produits</h2>
        
        <div className={styles.tableContainer} style={{ overflowX: "auto", maxWidth: "100%" }}>
          <table className={styles.table} style={{ minWidth: `${600 + (machines.length * 300)}px` }}>
            <thead>
              <tr>
                <th>Nom du Produit</th>
                <th>Grandeur Commande<br/>(unités)</th>
                <th>Date d'Échéance<br/>(jours)</th>
                <th>Coût Inventaire<br/>({devises[devise].symbole}/unité)</th>
                {machines.map((machine, index) => (
                  <th key={index} colSpan="2" style={{ backgroundColor: "#1e40af", minWidth: "250px" }}>
                    {machine.nom}
                    <br/>
                    <small style={{ fontWeight: "normal", opacity: "0.9" }}>
                      Temps ({uniteTemps}/u) | Outils requis
                    </small>
                  </th>
                ))}
                <th style={{ minWidth: "120px", backgroundColor: "#10b981" }}>Temps Total<br/>({uniteTemps})</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit, produitIndex) => (
                <tr key={produitIndex}>
                  <td>
                    <input
                      type="text"
                      value={produit.nom}
                      onChange={(e) => handleProduitChange(produitIndex, "nom", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={produit.grandeurCommande}
                      onChange={(e) => handleProduitChange(produitIndex, "grandeurCommande", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={produit.dateDue}
                      onChange={(e) => handleProduitChange(produitIndex, "dateDue", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={produit.coutInventaire}
                      onChange={(e) => handleProduitChange(produitIndex, "coutInventaire", e.target.value)}
                      className={styles.input}
                    />
                  </td>
                  {machines.map((machine, machineIndex) => (
                    <React.Fragment key={machineIndex}>
                      <td style={{ backgroundColor: "#f8fafc", minWidth: "100px" }}>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={produit.tempsOperations[machineIndex] || 0}
                          onChange={(e) => handleProduitChange(produitIndex, "tempsOperation", e.target.value, machineIndex)}
                          className={styles.input}
                          placeholder="0.0"
                          style={{ minWidth: "80px", width: "100%" }}
                        />
                      </td>
                      <td style={{ backgroundColor: "#f1f5f9", minWidth: "150px", padding: "8px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {machine.outilsDisponibles.map((outil, outilIndex) => {
                            const espaceOutil = machine.espaceOutils[outilIndex] || 1;
                            const isSelected = (produit.outils[machineIndex] || []).includes(outil);
                            return (
                              <label key={outilIndex} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "6px",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                padding: "2px 4px",
                                borderRadius: "3px",
                                backgroundColor: isSelected ? "#e0f2fe" : "transparent"
                              }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleProduitChange(produitIndex, "outil", outil, machineIndex)}
                                  style={{ margin: "0" }}
                                />
                                <span style={{ 
                                  color: isSelected ? "#0369a1" : "#374151",
                                  fontWeight: isSelected ? "600" : "normal"
                                }}>
                                  {outil} ({espaceOutil})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <small style={{ 
                          display: "block", 
                          fontSize: "0.7rem", 
                          color: "#6b7280", 
                          marginTop: "4px",
                          textAlign: "center",
                          fontWeight: "500"
                        }}>
                          {(produit.outils[machineIndex] || []).length > 0 
                            ? `✓ ${(produit.outils[machineIndex] || []).length} outil(s)` 
                            : 'Aucun outil sélectionné'}
                        </small>
                      </td>
                    </React.Fragment>
                  ))}
                  <td style={{ minWidth: "120px", backgroundColor: "#f0fdf4" }}>
                    <div className={styles.metricCell} style={{ 
                      color: "#10b981",
                      fontWeight: "bold"
                    }}>
                      {calculateTempsRequisProduit(produit).toFixed(2)}
                    </div>
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
        {isLoading ? "Optimisation en cours..." : "Optimiser avec Programmation Linéaire Mixte"}
      </button>

      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ 
                color: result.status === 'Optimal' ? '#10b981' : '#f59e0b' 
              }}>
                {result.status || 'Non défini'}
              </div>
              <div className={styles.metricLabel}>Statut de la Solution</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {devises[devise].symbole}{result.cout_total_inventaire || 0}
              </div>
              <div className={styles.metricLabel}>Coût Total d'Inventaire</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue}>
                {Math.round((result.efficacite_globale || 0) * 100) / 100}%
              </div>
              <div className={styles.metricLabel}>Efficacité Globale</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ color: '#10b981' }}>
                {result.nombre_produits || produits.length}
              </div>
              <div className={styles.metricLabel}>Produits Planifiés</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ color: '#2563eb' }}>
                {result.nombre_periodes || result.horizon_planification || 3}
              </div>
              <div className={styles.metricLabel}>Périodes de Planning</div>
            </div>
            
            <div className={styles.resultMetric}>
              <div className={styles.metricValue} style={{ color: '#059669' }}>
                {result.total_produits_par_periode ? 
                 result.total_produits_par_periode.reduce((a, b) => a + b, 0) : 0}
              </div>
              <div className={styles.metricLabel}>Total Unités Produites</div>
            </div>
          </div>

          {/* Alerte de surcharge */}
          {(() => {
            const hasOverload = machines.some(machine => {
              const machine_suffix = machine.nom.toLowerCase().replace(' ', '_');
              const utilisation = result[`utilisation_${machine_suffix}`] || 0;
              return utilisation > 100;
            });
            
            return hasOverload ? (
              <div className={styles.solutionDetails} style={{ 
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)", 
                border: "2px solid #fca5a5",
                marginBottom: "1rem"
              }}>
                <h3 style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  ⚠️ Alerte : Machines en Surcharge
                </h3>
                <div style={{ color: "#7f1d1d", lineHeight: "1.6" }}>
                  <p><strong>Problème détecté :</strong> Certaines machines dépassent 100% d'utilisation, ce qui indique :</p>
                  <ul style={{ marginLeft: "1.5rem" }}>
                    <li>Soit un problème dans l'algorithme MIP (contraintes de capacité non respectées)</li>
                    <li>Soit des données incohérentes (temps requis supérieur au temps disponible)</li>
                    <li>Soit l'algorithme accepte des contraintes "souples" avec pénalités</li>
                  </ul>
                  <p><strong>Recommandation :</strong> Vérifiez les paramètres de temps et la logique de l'algorithme backend.</p>
                </div>
              </div>
            ) : null;
          })()}

          <div className={styles.solutionDetails}>
            <h3>Utilisation des machines</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Utilisation Totale</th>
                    <th>Pic d'Utilisation</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, index) => {
                    // Clés réelles du backend MIP
                    const machine_suffix = machine.nom.toLowerCase().replace(' ', '_');
                    const temps_utilise_total = result[`temps_utilise_${machine_suffix}`] || 0;
                    const temps_total = result[`temps_disponible_total_${machine_suffix}`] || 0;
                    const temps_par_periode = result[`temps_disponible_par_periode_${machine_suffix}`] || 0;
                    const utilisation_pic = result[`utilisation_${machine_suffix}`] || 0;
                    
                    // Calculate total utilization percentage
                    const utilisation_totale = temps_total > 0 ? ((temps_utilise_total / temps_total) * 100) : 0;
                    
                    return (
                      <tr key={index}>
                        <td><strong>{machine.nom}</strong></td>
                        <td>
                          {temps_utilise_total.toFixed(1)}{uniteTemps} / {temps_total.toFixed(1)}{uniteTemps}
                          <br/>
                          <small style={{ color: "#6b7280" }}>({utilisation_totale.toFixed(1)}% sur toutes les périodes)</small>
                        </td>
                        <td style={{ 
                          color: utilisation_pic >= 100 ? "#ef4444" : utilisation_pic >= 80 ? "#f59e0b" : "#10b981",
                          fontWeight: "bold"
                        }}>
                          {utilisation_pic.toFixed(1)}% max
                          <br/>
                          <small style={{ color: "#6b7280" }}>({temps_par_periode.toFixed(1)}{uniteTemps}/période)</small>
                        </td>
                        <td style={{ 
                          color: utilisation_pic >= 100 ? "#ef4444" : "#10b981",
                          fontWeight: "bold"
                        }}>
                          {utilisation_pic >= 100 ? (
                            <>⚠️ Surcharge<br/><small>Contrainte violée</small></>
                          ) : (
                            <>✅ Conforme<br/><small>Respect contraintes</small></>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {result.produits_assignes && result.produits_assignes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits assignés pour la production</h3>
              {renderProduitsAssignes(result.produits_assignes)}
            </div>
          )}

          {result.produits_non_assignes && result.produits_non_assignes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Produits non assignés</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Commande (unités)</th>
                      <th>Date Due (jours)</th>
                      <th>Coût Inventaire ({devises[devise].symbole})</th>
                      <th>Raison d'exclusion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.produits_non_assignes.map((produit, index) => (
                      <tr key={index}>
                        <td><strong>{produit.nom}</strong></td>
                        <td>{produit.grandeur_commande}</td>
                        <td>{produit.date_due}</td>
                        <td>{devises[devise].symbole}{produit.cout_inventaire}</td>
                        <td style={{ color: "#6b7280", fontStyle: "italic" }}>
                          {produit.raison}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {result.planification_periodes && result.planification_periodes.length > 0 && (
            <div className={styles.solutionDetails}>
              <h3>Planification par Périodes</h3>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th>Total Unités</th>
                      <th>Répartition par Produit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planification_periodes.map((periode, index) => (
                      <tr key={index}>
                        <td><strong>Période {index + 1}</strong></td>
                        <td style={{ color: "#059669", fontWeight: "bold" }}>
                          {result.total_produits_par_periode ? result.total_produits_par_periode[index] : 0} unités
                        </td>
                        <td>
                          {produits.map((produit, produitIndex) => {
                            const quantite = periode[`produit_${produitIndex + 1}`] || 
                                           periode[produit.nom.toLowerCase().replace(' ', '_')] || 
                                           periode[`Produit ${produitIndex + 1}`] || 0;
                            return quantite > 0 ? (
                              <div key={produitIndex} style={{ 
                                fontSize: "0.85rem", 
                                marginBottom: "0.25rem",
                                color: "#374151"
                              }}>
                                <strong>{produit.nom}:</strong> {quantite} unités
                              </div>
                            ) : null;
                          })}
                          {Object.keys(periode).length === 0 && (
                            <span style={{ color: "#6b7280", fontStyle: "italic" }}>Aucune production</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {chartUrl && (
            <div className={styles.solutionDetails}>
              <h3>Analyse graphique</h3>
              <div className={styles.chartContainer}>
                <img 
                  src={chartUrl} 
                  alt="Graphique d'analyse FMS Lots de Production MIP" 
                  style={{ width: "100%", height: "auto", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 