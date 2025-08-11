import React, { useState, useEffect } from 'react';
import TopNavigation from './components/TopNavigation';
import CompactSidebar from './components/CompactSidebar';
import CoursesSidebar from './components/CoursesSidebar';
import WelcomeView from './components/WelcomeView';
import DecisionTree from './components/DecisionTree';
import JobshopInteractiveSimulation from './components/JobshopInteractiveSimulation';
import FlowshopInteractiveSimulation from './components/FlowshopInteractiveSimulation';
import LigneAssemblageMixteSimulation from './components/LigneAssemblageMixteSimulation';
import LigneAssemblageStandardSimulation from './components/LigneAssemblageStandardSimulation';
import LigneTransfertSimulation from './components/LigneTransfertSimulation';
import { Users, Factory, BookOpen, Brain } from 'lucide-react';
import './App.css';
import SystemDescription from "./components/SystemDescription";
import AlgorithmFormAndResult from "./components/AlgorithmFormAndResult";
import FlowshopSPTForm from "./components/FlowshopSPTForm";
import FlowshopSPTInfo from "./components/FlowshopSPTInfo";
import FlowshopEDDForm from "./components/FlowshopEDDForm";
import FlowshopEDDInfo from "./components/FlowshopEDDInfo";
import FlowshopJohnsonForm from "./components/FlowshopJohnsonForm";
import FlowshopJohnsonInfo from "./components/FlowshopJohnsonInfo";
import FlowshopJohnsonModifieForm from "./components/FlowshopJohnsonModifieForm";
import FlowshopJohnsonModifieInfo from "./components/FlowshopJohnsonModifieInfo";
import FlowshopSmithForm from "./components/FlowshopSmithForm";
import FlowshopSmithInfo from "./components/FlowshopSmithInfo";
import FlowshopContraintesForm from "./components/FlowshopContraintesForm";
import FlowshopContraintesInfo from "./components/FlowshopContraintesInfo";
import FlowshopCompareForm from "./components/FlowshopCompareForm";
import FlowshopCompareInfo from "./components/FlowshopCompareInfo";
import FlowshopMachinesMultiplesForm from "./components/FlowshopMachinesMultiplesForm";
import FlowshopMachinesMultiplesInfo from "./components/FlowshopMachinesMultiplesInfo";
import JobshopSPTForm from "./components/JobshopSPTForm";
import JobshopSPTInfo from "./components/JobshopSPTInfo";
import JobshopEDDForm from "./components/JobshopEDDForm";
import JobshopEDDInfo from "./components/JobshopEDDInfo";
import JobshopContraintesForm from "./components/JobshopContraintesForm";
import JobshopContraintesInfo from "./components/JobshopContraintesInfo";
import JobshopCompareForm from "./components/JobshopCompareForm";
import JobshopCompareInfo from "./components/JobshopCompareInfo";
import LigneAssemblagePrecedenceForm from "./components/LigneAssemblagePrecedenceForm";
import LigneAssemblagePrecedenceInfo from "./components/LigneAssemblagePrecedenceInfo";
import LigneAssemblageCOMSOALForm from "./components/LigneAssemblageCOMSOALForm";
import LigneAssemblageCOMSOALInfo from "./components/LigneAssemblageCOMSOALInfo";
import LigneAssemblageLPTForm from "./components/LigneAssemblageLPTForm";
import LigneAssemblageLPTInfo from "./components/LigneAssemblageLPTInfo";
import LigneAssemblagePLForm from "./components/LigneAssemblagePLForm";
import LigneAssemblagePLInfo from "./components/LigneAssemblagePLInfo";
import LigneAssemblageCompareForm from "./components/LigneAssemblageCompareForm";
import LigneAssemblageCompareInfo from "./components/LigneAssemblageCompareInfo";
import LigneAssemblageMixteGoulotForm from "./components/LigneAssemblageMixteGoulotForm";
import LigneAssemblageMixteGoulotInfo from "./components/LigneAssemblageMixteGoulotInfo";
import LigneAssemblageMixteEquilibrageForm from "./components/LigneAssemblageMixteEquilibrageForm";
import LigneAssemblageMixteEquilibrageInfo from "./components/LigneAssemblageMixteEquilibrageInfo";
import LigneAssemblageMixteEquilibragePlusPlusForm from "./components/LigneAssemblageMixteEquilibragePlusPlusForm";
import LigneAssemblageMixteEquilibragePlusPlusInfo from "./components/LigneAssemblageMixteEquilibragePlusPlusInfo";
import LigneTransfertBufferBuzzacottForm from "./components/LigneTransfertBufferBuzzacottForm";
import LigneTransfertBufferBuzzacottInfo from "./components/LigneTransfertBufferBuzzacottInfo";
import FMSSacADosForm from "./components/FMSSacADosForm";
import FMSSacADosInfo from "./components/FMSSacADosInfo";
import FMSSacADosPLForm from "./components/FMSSacADosPLForm";
import FMSSacADosPLInfo from "./components/FMSSacADosPLInfo";
import FMSSacADosGloutonForm from "./components/FMSSacADosGloutonForm";
import FMSSacADosGloutonInfo from "./components/FMSSacADosGloutonInfo";
import FMSLotsProductionGloutonForm from "./components/FMSLotsProductionGloutonForm";
import FMSLotsProductionGloutonInfo from "./components/FMSLotsProductionGloutonInfo";
import FMSLotsProductionMIPForm from "./components/FMSLotsProductionMIPForm";
import FMSLotsProductionMIPInfo from "./components/FMSLotsProductionMIPInfo";
import FMSLotsChargementHeuristiqueForm from "./components/FMSLotsChargementHeuristiqueForm";
import JobshopSetupAssignment from "./components/JobshopSetupAssignment";
import FMSLotsChargementHeuristiqueInfo from "./components/FMSLotsChargementHeuristiqueInfo";


function App() {
  // États pour la navigation des systèmes de production
  const [currentMode, setCurrentMode] = useState("welcome");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  // États pour la navigation des cours (indépendants)
  const [selectedCourseCategory, setSelectedCourseCategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Configuration des systèmes et algorithmes
  const systemsConfig = {
    "Flowshop": ["SPT", "EDD", "Johnson", "Johnson modifié", "Contraintes", "Machines multiples", "Smith"],
    "Jobshop": ["SPT", "EDD", "Contraintes"],
    "Ligne d'assemblage": ["Précédence", "COMSOAL", "LPT", "PL"],
    "Ligne d'assemblage mixte": ["Variation du goulot", "Équilibrage ligne mixte", "Équilibrage ++"],
    "Ligne de transfert": ["Buffer Buzzacott"],
    "FMS": ["Sac à dos (Prog. Dynamique)", "Sac à dos (Prog. Linéaire)", "Sac à dos (Algorithme Glouton)", "Lots de production (Glouton)", "Lots de production (MIP)", "Lots de chargement (Heuristique)"]
  };

  // Configuration des cours
  const coursesConfig = {
    "Cours Théoriques": ["Introduction aux systèmes", "Ordonnancement de base", "Algorithmes avancés"],
    "Simulations Interactives": ["Flowshop", "Jobshop", "Ligne d'assemblage", "Ligne d'assemblage mixte", "Ligne de transfert"],
    "Exercices Pratiques": ["Cas d'étude 1", "Cas d'étude 2", "Projet final"]
  };

  // Handlers pour la navigation
  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    // Reset navigation systèmes seulement si on quitte le mode systems
    if (["welcome", "decision", "courses", "assignments"].includes(mode)) {
      setSelectedSystem("");
      setSelectedAlgorithm("");
      setShowSystemInfo(false);
    }
    // Reset navigation cours si on change d'onglet
    if (mode !== "courses") {
      setSelectedCourseCategory("");
      setSelectedCourse("");
    }
  };

  const handleSystemChange = (system) => {
    setSelectedSystem(system);
    setSelectedAlgorithm(""); // Reset algorithm when system changes
    setShowSystemInfo(false); // Reset system info when system changes
    if (system) {
      setCurrentMode("systems");
    }
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    setShowSystemInfo(false); // Hide system info when selecting an algorithm
  };

  const handleCloseSidebar = () => {
    setSelectedSystem("");
    setSelectedAlgorithm("");
  };

  const handleSystemRecommendation = (recommendedSystem) => {
    setCurrentMode("systems");
    setSelectedSystem(recommendedSystem);
    setSelectedAlgorithm("");
  };

  // Navigation depuis WelcomeView
  const handleNavigateToDecisionTree = () => {
    setCurrentMode("decision");
    setSelectedSystem("");
    setSelectedAlgorithm("");
  };

  const handleNavigateToSystems = () => {
    setCurrentMode("systems");
    setSelectedSystem(""); // Laisse l'utilisateur choisir dans le dropdown
    setSelectedAlgorithm("");
  };

  const handleSystemInfo = (system) => {
    setShowSystemInfo(true);
    setSelectedAlgorithm(""); // Reset algorithm when showing system info
  };

  // Handlers pour la navigation des cours
  const handleCourseCategoryChange = (category) => {
    setSelectedCourseCategory(category);
    setSelectedCourse("");
  };
  const handleCourseChange = (course) => {
    setSelectedCourse(course);
  };

  // Determine si on affiche l'InfoPanel
  const shouldShowInfoPanel = (currentMode === "systems" && selectedSystem && selectedAlgorithm);
  const algorithms = selectedSystem ? 
    (currentMode === "systems" ? systemsConfig[selectedSystem] || [] : []) : [];

  const hasSidebar = (currentMode === "systems" && selectedSystem) || currentMode === "courses";

  return (
    <div className="modern-app-container">
      {/* Top Navigation */}
      <TopNavigation
        currentMode={currentMode}
        onModeChange={handleModeChange}
        currentSystem={selectedSystem}
        onSystemChange={setSelectedSystem}
      />

      {/* Main Layout */}
      <div className={`modern-main-layout${hasSidebar ? ' with-sidebar' : ''}`}>
        {/* Sidebar systèmes de production */}
        {hasSidebar && currentMode === "systems" && selectedSystem && (
          <CompactSidebar
            system={selectedSystem}
            algorithms={algorithms}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            onSystemInfo={handleSystemInfo}
            onClose={handleCloseSidebar}
          />
        )}
        {/* Sidebar cours indépendante */}
        {hasSidebar && currentMode === "courses" && (
          <CoursesSidebar
            selectedCategory={selectedCourseCategory}
            selectedCourse={selectedCourse}
            onCategoryChange={handleCourseCategoryChange}
            onCourseChange={handleCourseChange}
            coursesConfig={coursesConfig}
          />
        )}

        {/* Content Area */}
        <div className={`modern-content-area${hasSidebar ? ' with-sidebar' : ''}${shouldShowInfoPanel ? ' with-info-panel' : ''}`}>
          {/* Welcome View */}
          {(currentMode === "welcome" || (currentMode === "systems" && !selectedSystem)) && (
            <WelcomeView 
              onNavigateToDecisionTree={handleNavigateToDecisionTree}
              onNavigateToSystems={handleNavigateToSystems}
            />
          )}

          {/* Decision Tree */}
          {currentMode === "decision" && (
            <DecisionTree onSystemRecommendation={handleSystemRecommendation} />
          )}

          {/* Cours - Mode éducatif */}
          {currentMode === "courses" && !selectedCourse && (
            <div className="courses-content">
              <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', margin: '2rem' }}>
                <div style={{ marginBottom: '2rem', color: '#6b7280' }}><Users size={48} /></div>
                <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Section Cours</h2>
                <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
                  Sélectionnez une catégorie et un cours dans la barre latérale pour commencer.
                </p>
              </div>
            </div>
          )}

          {/* Cours - Contenu spécifique */}
          {currentMode === "courses" && selectedCourse && (
            <div className="algorithm-content">
              {/* Simulations Interactives */}
              {selectedCourse === "Jobshop" && (
                <JobshopInteractiveSimulation />
              )}
              {selectedCourse === "Flowshop" && (
                <FlowshopInteractiveSimulation />
              )}

              {/* Cours Théoriques */}
              {selectedCourse === "Introduction aux systèmes" && (
                <div style={{ padding: '2rem' }}>
                  <h2>Introduction aux systèmes de production</h2>
                  <p>Contenu théorique à venir...</p>
                </div>
              )}
              {/* Exercices Pratiques */}
              {selectedCourse === "Cas d'étude 1" && (
                <div style={{ padding: '2rem' }}>
                  <h2>Cas d'étude 1</h2>
                  <p>Exercice pratique à venir...</p>
                </div>
              )}
              {/* Ligne d'assemblage - Équilibrage (Partie 1) */}
              {selectedCourse === "Ligne d'assemblage" && (
                <LigneAssemblageStandardSimulation />
              )}
              {/* Ligne d'assemblage mixte - Séquençage (Partie 2) */}
              {selectedCourse === "Ligne d'assemblage mixte" && (
                <LigneAssemblageMixteSimulation />
              )}
              {/* Ligne de transfert - Simulation interactive */}
              {selectedCourse === "Ligne de transfert" && (
                <LigneTransfertSimulation />
              )}
              

            </div>
          )}

          {/* Devoirs - Mode éducatif */}
          {currentMode === "assignments" && (
            <div className="assignments-content">
              <JobshopSetupAssignment />
            </div>
          )}

          {/* System Description */}
          {currentMode === "systems" && selectedSystem && (!selectedAlgorithm || showSystemInfo) && (
            <SystemDescription system={selectedSystem} />
          )}

          {/* Algorithm Forms */}
          {currentMode === "systems" && selectedSystem && selectedAlgorithm && (
            <div className="algorithm-content">
              {/* Flowshop Algorithms */}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "SPT" && <FlowshopSPTForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "EDD" && <FlowshopEDDForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Johnson" && <FlowshopJohnsonForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Johnson modifié" && <FlowshopJohnsonModifieForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Smith" && <FlowshopSmithForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Contraintes" && <FlowshopContraintesForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Machines multiples" && <FlowshopMachinesMultiplesForm />}
              {selectedSystem === "Flowshop" && selectedAlgorithm === "Comparer les algos" && <FlowshopCompareForm />}
              {/* Jobshop Algorithms */}
              {selectedSystem === "Jobshop" && selectedAlgorithm === "SPT" && <JobshopSPTForm />}
              {selectedSystem === "Jobshop" && selectedAlgorithm === "EDD" && <JobshopEDDForm />}
              {selectedSystem === "Jobshop" && selectedAlgorithm === "Contraintes" && <JobshopContraintesForm />}
              {selectedSystem === "Jobshop" && selectedAlgorithm === "Comparer les algos" && <JobshopCompareForm />}
              {/* Ligne d'assemblage Algorithms */}
              {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "Précédence" && <LigneAssemblagePrecedenceForm />}
              {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "COMSOAL" && <LigneAssemblageCOMSOALForm />}
              {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "LPT" && <LigneAssemblageLPTForm />}
              {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "PL" && <LigneAssemblagePLForm />}
              {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "Comparer les algos" && <LigneAssemblageCompareForm />}
              {/* Ligne d'assemblage mixte Algorithms */}
              {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Variation du goulot" && <LigneAssemblageMixteGoulotForm />}
              {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Équilibrage ligne mixte" && <LigneAssemblageMixteEquilibrageForm />}
              {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Équilibrage ++" && <LigneAssemblageMixteEquilibragePlusPlusForm />}
              {/* Ligne de transfert Algorithms */}
              {selectedSystem === "Ligne de transfert" && selectedAlgorithm === "Buffer Buzzacott" && <LigneTransfertBufferBuzzacottForm />}
              {/* FMS Algorithms */}
              {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Prog. Dynamique)" && <FMSSacADosForm />}
              {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Prog. Linéaire)" && <FMSSacADosPLForm />}
              {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Algorithme Glouton)" && <FMSSacADosGloutonForm />}
              {selectedSystem === "FMS" && selectedAlgorithm === "Lots de production (Glouton)" && <FMSLotsProductionGloutonForm />}
              {selectedSystem === "FMS" && selectedAlgorithm === "Lots de production (MIP)" && <FMSLotsProductionMIPForm />}
              {selectedSystem === "FMS" && selectedAlgorithm === "Lots de chargement (Heuristique)" && <FMSLotsChargementHeuristiqueForm />}
              {/* Fallback pour algorithmes non mappés */}
              {!["Flowshop", "Jobshop", "Ligne d'assemblage", "Ligne d'assemblage mixte", "Ligne de transfert", "FMS"].includes(selectedSystem) && (
                <AlgorithmFormAndResult algorithm={selectedAlgorithm} />
              )}
            </div>
          )}
        </div>

        {/* Info Panel - Conditionnelle */}
        {shouldShowInfoPanel && (
          <div className="modern-info-panel">
            {/* Flowshop Info */}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "SPT" && <FlowshopSPTInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "EDD" && <FlowshopEDDInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Johnson" && <FlowshopJohnsonInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Johnson modifié" && <FlowshopJohnsonModifieInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Smith" && <FlowshopSmithInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Contraintes" && <FlowshopContraintesInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Machines multiples" && <FlowshopMachinesMultiplesInfo />}
            {selectedSystem === "Flowshop" && selectedAlgorithm === "Comparer les algos" && <FlowshopCompareInfo />}
            
            {/* Jobshop Info */}
            {selectedSystem === "Jobshop" && selectedAlgorithm === "SPT" && <JobshopSPTInfo />}
            {selectedSystem === "Jobshop" && selectedAlgorithm === "EDD" && <JobshopEDDInfo />}
            {selectedSystem === "Jobshop" && selectedAlgorithm === "Contraintes" && <JobshopContraintesInfo />}
            {selectedSystem === "Jobshop" && selectedAlgorithm === "Comparer les algos" && <JobshopCompareInfo />}
            
            {/* Ligne d'assemblage Info */}
            {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "Précédence" && <LigneAssemblagePrecedenceInfo />}
            {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "COMSOAL" && <LigneAssemblageCOMSOALInfo />}
            {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "LPT" && <LigneAssemblageLPTInfo />}
            {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "PL" && <LigneAssemblagePLInfo />}
            {selectedSystem === "Ligne d'assemblage" && selectedAlgorithm === "Comparer les algos" && <LigneAssemblageCompareInfo />}
            
            {/* Ligne d'assemblage mixte Info */}
            {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Variation du goulot" && <LigneAssemblageMixteGoulotInfo />}
            {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Équilibrage ligne mixte" && <LigneAssemblageMixteEquilibrageInfo />}
            {selectedSystem === "Ligne d'assemblage mixte" && selectedAlgorithm === "Équilibrage ++" && <LigneAssemblageMixteEquilibragePlusPlusInfo />}
            
            {/* Ligne de transfert Info */}
            {selectedSystem === "Ligne de transfert" && selectedAlgorithm === "Buffer Buzzacott" && <LigneTransfertBufferBuzzacottInfo />}
            
            {/* FMS Info */}
            {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Prog. Dynamique)" && <FMSSacADosInfo />}
            {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Prog. Linéaire)" && <FMSSacADosPLInfo />}
            {selectedSystem === "FMS" && selectedAlgorithm === "Sac à dos (Algorithme Glouton)" && <FMSSacADosGloutonInfo />}
            {selectedSystem === "FMS" && selectedAlgorithm === "Lots de production (Glouton)" && <FMSLotsProductionGloutonInfo />}
            {selectedSystem === "FMS" && selectedAlgorithm === "Lots de production (MIP)" && <FMSLotsProductionMIPInfo />}
            {selectedSystem === "FMS" && selectedAlgorithm === "Lots de chargement (Heuristique)" && <FMSLotsChargementHeuristiqueInfo />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;







