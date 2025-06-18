import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function ExcelImportSectionLigneAssemblageMixte({ 
  onImportSuccess, 
  API_URL = "/api",
  algorithmName = "Ligne d'assemblage mixte",
  algorithmEndpoint = "ligne_assemblage_mixte/goulot"
}) {
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [importError, setImportError] = useState(null);

  const handleDownloadTemplate = (downloadType) => {
    try {
      let fileName;
      const isGoulot = algorithmEndpoint.includes("goulot");
      
      if (downloadType === 'exemple') {
        fileName = isGoulot ? 'Template-LAMVariation_Exemple.xlsx' : 'Template-LAM_Exemple.xlsx';
      } else {
        fileName = isGoulot ? 'Template-LAMVariation_Vide.xlsx' : 'Template-LAM_Vide.xlsx';
      }
      
      const link = document.createElement('a');
      link.href = `/${fileName}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur téléchargement template:', error);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setImportError("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }

    setIsImporting(true);
    setImportSuccess(null);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format_type', algorithmEndpoint.includes("goulot") ? 'ligne_assemblage_mixte_goulot' : 'ligne_assemblage_mixte_equilibrage');

      console.log(`Importing ${algorithmName} file:`, file.name);

      const response = await fetch(`${API_URL}/${algorithmEndpoint}/import-excel`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'import');
      }

      const data = await response.json();
      console.log("Données importées:", data);

      // Vérifier que nous avons les données attendues
      if (!data.products_data || !Array.isArray(data.products_data) || 
          !data.tasks_data || !Array.isArray(data.tasks_data)) {
        throw new Error("Format de données invalide reçu du serveur");
      }

      // Appeler la fonction de callback avec les données importées
      if (onImportSuccess) {
        onImportSuccess(data);
      }

      setImportSuccess(`✅ Import ${algorithmName} réussi ! ${data.products_data.length} produit(s) et ${data.tasks_data.length} tâche(s) importé(s).`);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setImportSuccess(null), 3000);

    } catch (error) {
      console.error(`Erreur import Excel ${algorithmName}:`, error);
      setImportError(error.message);
      
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setImportError(null), 5000);
    } finally {
      setIsImporting(false);
      // Réinitialiser l'input file
      event.target.value = '';
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>📊 Import depuis Excel</h3>
      
      <div className={styles.importToggle}>
        <label className={styles.toggleLabel}>
          <input 
            type="checkbox" 
            checked={showImportOptions} 
            onChange={() => setShowImportOptions(!showImportOptions)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxCustom}></span>
          Activer l'import depuis Excel
        </label>
      </div>

      {showImportOptions && (
        <div className={styles.importSection}>
          <div className={styles.importInfo}>
            <p className={styles.importDescription}>
              Importez vos données de produits et tâches depuis un fichier Excel pour un traitement automatique avec l'algorithme {algorithmName}.
              Format attendu : Produits avec demandes, Tâches avec temps de traitement par produit.
              Téléchargez d'abord un template pour voir la structure exacte.
            </p>
          </div>
          
          <div className={styles.importActions}>
            <div className={styles.templateButtons}>
              <button 
                className={styles.templateButton}
                onClick={() => handleDownloadTemplate('exemple')}
                type="button"
              >
                📄 Template avec exemple
              </button>
              <button 
                className={styles.templateButton}
                onClick={() => handleDownloadTemplate('vide')}
                type="button"
              >
                📄 Template vide
              </button>
            </div>
            
            <div className={styles.importUpload}>
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className={styles.fileInput}
                  disabled={isImporting}
                />
                <span className={styles.uploadButton}>
                  {isImporting ? '⏳ Import en cours...' : '📥 Importer fichier Excel'}
                </span>
              </label>
            </div>
          </div>
          
          {importSuccess && (
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              {importSuccess}
            </div>
          )}
          
          {importError && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>❌</span>
              {importError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExcelImportSectionLigneAssemblageMixte; 