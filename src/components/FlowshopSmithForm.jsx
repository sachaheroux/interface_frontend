import React, { useState } from 'react';
import styles from './FlowshopSmithForm.module.css';
import ExcelImportSection from './ExcelImportSection';
import ExcelExportSection from './ExcelExportSection';

const FlowshopSmithForm = () => {
  const [jobs, setJobs] = useState([
    { name: 'Job 1', duration: 10, dueDate: 25 },
    { name: 'Job 2', duration: 8, dueDate: 20 }
  ]);
  const [timeUnit, setTimeUnit] = useState('heures');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [ganttUrl, setGanttUrl] = useState(null);
  
  // États pour l'import Excel
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const addJob = () => {
    const newJobNumber = jobs.length + 1;
    setJobs([...jobs, {
      name: `Job ${newJobNumber}`,
      duration: 1,
      dueDate: 10
    }]);
  };

  const removeJob = () => {
    if (jobs.length > 1) {
      setJobs(jobs.slice(0, -1));
    }
  };

  const updateJob = (index, field, value) => {
    const newJobs = [...jobs];
    if (field === 'name') {
      newJobs[index][field] = value;
    } else {
      newJobs[index][field] = parseFloat(value) || 0;
    }
    setJobs(newJobs);
  };

  const calculateOptimization = async () => {
    setIsCalculating(true);
    setError('');
    setResult(null);
    setGanttUrl(null);

    try {
      const formattedJobs = jobs.map(job => [
        parseFloat(job.duration) || 0,
        parseFloat(job.dueDate) || 0
      ]);

      const requestData = {
        jobs: formattedJobs,
        job_names: jobs.map(job => job.name),
        unite: timeUnit
      };

      console.log("Données envoyées:", requestData);

      const response = await fetch(`${API_URL}/smith`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Données reçues:", data);
      console.log("completion_times:", data.completion_times);
      console.log("planification:", data.planification);
      
      // Si l'API ne fournit pas de temps de complétion ou planification, on les simule
      if (!data.completion_times && data.sequence) {
        const simulatedCompletionTimes = {};
        const simulatedPlanification = {
          "Machine 0": []
        };
        
        let currentTime = 0;
        data.sequence.forEach((jobNumber, index) => {
          // Convertir le numéro de job (1-based) en index (0-based)
          const jobIndex = jobNumber - 1;
          const duration = parseFloat(jobs[jobIndex]?.duration) || 0;
          const jobName = jobs[jobIndex]?.name || `Job ${jobNumber}`;
          
          simulatedCompletionTimes[jobName] = currentTime + duration;
          simulatedPlanification["Machine 0"].push({
            job: jobIndex,
            start: currentTime,
            duration: duration
          });
          
          currentTime += duration;
        });
        
        data.completion_times = simulatedCompletionTimes;
        data.planification = simulatedPlanification;
      }
      
      setResult(data);

      // Récupération du diagramme de Gantt
      try {
        const ganttResponse = await fetch(`${API_URL}/smith/gantt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (ganttResponse.ok) {
          const blob = await ganttResponse.blob();
          const url = URL.createObjectURL(blob);
          setGanttUrl(url);
        }
      } catch (ganttError) {
        console.log("Pas de diagramme de Gantt disponible");
      }

    } catch (err) {
      console.error('Erreur:', err);
      setError(`Erreur lors du calcul: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const downloadGanttChart = () => {
    if (ganttUrl) {
      const link = document.createElement('a');
      link.href = ganttUrl;
      link.download = 'diagramme_gantt_smith.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Fonction d'import Excel
  const handleExcelImport = async (formData, fileName) => {
    setIsImporting(true);
    setError('');
    setImportSuccess(null);
    setResult(null);
    setGanttUrl(null);

    try {
      const response = await fetch(`${API_URL}/smith/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      
      // Mettre à jour les données du formulaire avec les données importées
      if (data.imported_data) {
        const importedData = data.imported_data;
        // Convertir les données Smith au format du composant
        const newJobs = importedData.job_names.map((name, index) => ({
          name: name,
          duration: importedData.jobs_data[index][0], // Durée (premier élément)
          dueDate: importedData.jobs_data[index][1] || importedData.due_dates[index] || 10 // Date due (deuxième élément ou depuis due_dates)
        }));
        setJobs(newJobs);
        setTimeUnit(importedData.unite);
      }
      
      // Afficher les résultats
      setResult(data.results);
      setImportSuccess(`Fichier "${fileName}" importé et traité avec succès ! ${data.imported_data.jobs_count} jobs détectés.`);
      
      // Générer le diagramme de Gantt directement depuis l'import Excel
      const ganttResponse = await fetch(`${API_URL}/smith/import-excel-gantt`, {
        method: "POST",
        body: formData  // Réutiliser le même fichier Excel
      });

      if (ganttResponse.ok) {
        const blob = await ganttResponse.blob();
        const url = URL.createObjectURL(blob);
        setGanttUrl(url);
      }

    } catch (error) {
      console.error('Erreur import Excel:', error);
      setError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={styles.algorithmContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Algorithme de Smith</h1>
        <p className={styles.subtitle}>
          Minimisation du nombre moyen de jobs dans le système pour une machine unique
        </p>
      </div>

      {/* Export Excel - Placé tout en haut */}
      <ExcelExportSection
        jobs={jobs.map(job => [job.duration])} // Format adapté pour Smith (une seule machine)
        dueDates={jobs.map(job => job.dueDate)}
        jobNames={jobs.map(job => job.name)}
        machineNames={["Machine 0"]} // Smith = une seule machine
        unite={timeUnit}
        algorithmName="Smith"
        API_URL={API_URL}
        algorithmEndpoint="smith"
      />

      {/* Import Excel */}
      <ExcelImportSection
        onImport={handleExcelImport}
        isImporting={isImporting}
        importSuccess={importSuccess}
        error={error}
        algorithmName="Smith"
        API_URL={API_URL}
      />

      {/* Configuration */}
      <div className={`${styles.section} ${styles.configSection}`}>
        <h2 className={styles.sectionTitle}>Configuration</h2>
        <div className={styles.configRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="timeUnit">Unité de temps</label>
            <select
              id="timeUnit"
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className={styles.select}
            >
              <option value="heures">Heures</option>
              <option value="minutes">Minutes</option>
              <option value="jours">Jours</option>
            </select>
          </div>
          
          <div className={styles.actionButtons}>
            <button
              onClick={addJob}
              className={styles.addButton}
              type="button"
            >
              + Ajouter un job
            </button>
            
            <button
              onClick={removeJob}
              disabled={jobs.length <= 1}
              className={styles.removeButton}
              type="button"
            >
              - Supprimer un job
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des données */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Jobs à ordonnancer</h2>
        <div className={styles.dataTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.jobNameHeader}>Job</th>
                <th className={styles.durationHeader}>Durée ({timeUnit})</th>
                <th className={styles.dueDateHeader}>Date due ({timeUnit})</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, jobIndex) => (
                <tr key={jobIndex} className={styles.jobRow}>
                  <td className={styles.jobNameCell}>
                    <input
                      type="text"
                      value={job.name}
                      onChange={(e) => updateJob(jobIndex, 'name', e.target.value)}
                      className={styles.jobNameInput}
                      placeholder={`Job ${jobIndex + 1}`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={job.duration}
                      onChange={(e) => updateJob(jobIndex, 'duration', e.target.value)}
                      className={styles.durationInput}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </td>
                  <td className={styles.dueDateCell}>
                    <input
                      type="number"
                      value={job.dueDate}
                      onChange={(e) => updateJob(jobIndex, 'dueDate', e.target.value)}
                      className={styles.dueDateInput}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gestion d'erreur */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        </div>
      )}

      {/* Bouton de calcul */}
      <button
        onClick={calculateOptimization}
        disabled={isCalculating}
        className={styles.calculateButton}
        type="button"
      >
        {isCalculating ? 'Calcul en cours...' : 'Calculer l\'optimisation'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`${styles.section} ${styles.resultsSection}`}>
          <h2 className={styles.resultsTitle}>Résultats de l'optimisation</h2>

          {/* Séquence calculée */}
          <div className={styles.sequenceSection}>
            <h3 className={styles.sequenceTitle}>Séquence optimale calculée</h3>
            <div className={styles.sequenceValue}>
              {result.sequence ? result.sequence.join(' → ') : 'Non disponible'}
            </div>
          </div>

          {/* Métriques */}
          <div className={styles.metricsGrid}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.flowtime || 0}
              </div>
              <div className={styles.metricLabel}>
                Flowtime ({timeUnit})
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.N ? result.N.toFixed(2) : '0.00'}
              </div>
              <div className={styles.metricLabel}>
                Nombre moyen de jobs (N)
              </div>
            </div>
            
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                {result.cumulative_delay || 0}
              </div>
              <div className={styles.metricLabel}>
                Retard cumulé ({timeUnit})
              </div>
            </div>
          </div>

          {/* Détails de planification */}
          <div className={styles.planificationDetails}>
            <h4>Temps de complétion</h4>
            <div className={styles.tasksList}>
              {result.completion_times && Object.entries(result.completion_times).map(([job, time]) => (
                <div key={job} className={styles.taskBadge}>
                  {job}: {time} {timeUnit}
                </div>
              ))}
            </div>

            <h4 style={{ marginTop: '1.5rem' }}>Planification détaillée</h4>
            {result.planification && Object.entries(result.planification).map(([machine, tasks]) => (
              <div key={machine} className={styles.machineDetail}>
                <strong>{machine}</strong>
                <div className={styles.tasksList}>
                  {tasks.map((t, i) => (
                    <div key={i} className={styles.taskBadge}>
                      {jobs[t.job]?.name || `Job ${t.job}`}: {t.start} → {t.start + t.duration}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagramme de Gantt */}
      {ganttUrl && (
        <div className={`${styles.section} ${styles.chartSection}`}>
          <div className={styles.chartHeader}>
            <h3>Diagramme de Gantt</h3>
          </div>
          <div className={styles.chartContainer}>
            <img
              src={ganttUrl}
              alt="Diagramme de Gantt"
              className={styles.chart}
            />
            <button
              onClick={downloadGanttChart}
              className={styles.downloadButton}
              type="button"
            >
              Télécharger le diagramme
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowshopSmithForm;








