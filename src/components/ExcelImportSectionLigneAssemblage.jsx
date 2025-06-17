import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function ExcelImportSectionLigneAssemblage({ 
  onImport, 
  isImporting, 
  importSuccess, 
  error, 
  algorithmName = "ligne d'assemblage",
  API_URL = "/api"
}) {
  const [showImportOptions, setShowImportOptions] = useState(false);

  const handleDownloadTemplate = (downloadType) => {
    try {
      let fileName;
      if (downloadType === 'exemple') {
        fileName = 'Template-LigneAssemblage_Exemple.xlsx';
      } else {
        fileName = 'Template-LigneAssemblage_Vide.xlsx';
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

    try {
      const formData = new FormData();
      formData.append('file', file);

      await onImport(formData, file.name);
    } catch (error) {
      console.error('Erreur import:', error);
    } finally {
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
              Importez vos données de tâches depuis un fichier Excel pour un traitement automatique avec l'algorithme {algorithmName}.
              Format attendu : Colonne C = Tâche, Colonne D = Durée, Colonne E = Prédécesseurs (à partir de la ligne 7).
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
          
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>❌</span>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExcelImportSectionLigneAssemblage; 