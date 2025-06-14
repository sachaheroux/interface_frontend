// Générateur de templates Excel pour Flowshop
// Utilise un format CSV propre qui s'ouvre parfaitement dans Excel

export const createFlowshopTemplate = (templateType = "exemple") => {
  const isExample = templateType === "exemple";
  
  let csvContent = "";
  
  if (isExample) {
    // Template avec exemple - Structure matrice simple et propre
    csvContent = `Job,Découpe,Assemblage,Finition,Date Due
Job_A,4,2,3,12
Job_B,3,4,2,15
Job_C,5,2,4,18
Job_D,,,
Job_E,,,
Job_F,,,
Job_G,,,
Job_H,,,
Job_I,,,
Job_J,,,
Job_K,,,
Job_L,,,
Job_M,,,
Job_N,,,
Job_O,,,`;
  } else {
    // Template vide avec structure claire
    csvContent = `Job,Machine_0,Machine_1,Machine_2,Date Due
Job_1,,,
Job_2,,,
Job_3,,,
Job_4,,,
Job_5,,,
Job_6,,,
Job_7,,,
Job_8,,,
Job_9,,,
Job_10,,,
Job_11,,,
Job_12,,,
Job_13,,,
Job_14,,,
Job_15,,,`;
  }
  
  return csvContent;
};

export const downloadTemplate = (templateType) => {
  try {
    // Utiliser directement le fichier Excel créé par l'utilisateur
    const templateFileName = 'Template-Flowshop_Vide.xlsx';
    
    // Créer le lien de téléchargement vers le fichier dans public/
    const link = document.createElement("a");
    link.href = `/${templateFileName}`;
    link.download = `Template_Flowshop_${templateType.charAt(0).toUpperCase() + templateType.slice(1)}.xlsx`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Erreur téléchargement template:', error);
    return false;
  }
};

// Créer un fichier d'instructions séparé
export const createInstructionsFile = () => {
  const instructionsContent = `INSTRUCTIONS - Template Flowshop

STRUCTURE DU FICHIER:
• Première colonne: Nom des jobs (Job_A, Job_B, etc.)
• Colonnes du milieu: Durées sur chaque machine
• Dernière colonne: Date d'échéance (Date Due)

COMMENT UTILISER:
1. Modifiez les noms des machines dans la première ligne
   (remplacez Machine_0, Machine_1, etc. par vos vrais noms)
2. Remplissez les durées pour chaque job sur chaque machine
3. Indiquez la date d'échéance dans la dernière colonne
4. Ajoutez des colonnes pour plus de machines si nécessaire
5. Ajoutez des lignes pour plus de jobs si nécessaire
6. Supprimez les lignes vides non utilisées

RÈGLES IMPORTANTES:
• Toutes les durées doivent être des nombres positifs
• Ne laissez pas de cellules vides dans les données utilisées
• Les noms de jobs doivent être uniques
• Sauvegardez au format .xlsx pour l'import dans l'application

EXEMPLE:
Job_A: 4h sur Découpe, 2h sur Assemblage, 3h sur Finition
Date d'échéance: 12 heures

CONSEILS:
• Ce template est extensible! Ajoutez autant de machines et jobs que nécessaire
• Vous pouvez copier-coller des lignes pour dupliquer la structure
• Excel ajustera automatiquement les colonnes`;

  return instructionsContent;
};

// Télécharger le fichier d'instructions
export const downloadInstructions = () => {
  try {
    const content = createInstructionsFile();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Instructions_Template_Flowshop.txt";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur téléchargement instructions:', error);
    return false;
  }
};

// Fonction utilitaire pour créer un aperçu du template (pour debug)
export const previewTemplate = (templateType) => {
  const content = createFlowshopTemplate(templateType);
  console.log("Aperçu du template:", content);
  return content;
}; 