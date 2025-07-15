import { useState } from "react";
import "./App.css";
import TopNavigation from "./components/TopNavigation";
import CompactSidebar from "./components/CompactSidebar";
import WelcomeView from "./components/WelcomeView";
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
import FMSLotsChargementHeuristiqueInfo from "./components/FMSLotsChargementHeuristiqueInfo";
import DecisionTree from "./components/DecisionTree";

function App() {
  // Nouveau state management pour la navigation moderne
  const [currentMode, setCurrentMode] = useState("welcome"); // welcome, decision, systems
  const [selectedSystem, setSelectedSystem] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");

  // Configuration des systèmes et algorithmes
  const systemsConfig = {
    "Flowshop": ["SPT", "EDD", "Johnson", "Johnson modifié", "Contraintes", "Machines multiples", "Smith", "Comparer les algos"],
    "Jobshop": ["SPT", "EDD", "Contraintes", "Comparer les algos"],
    "Ligne d'assemblage": ["Précédence", "COMSOAL", "LPT", "PL", "Comparer les algos"],
    "Ligne d'assemblage mixte": ["Variation du goulot", "Équilibrage ligne mixte", "Équilibrage ++"],
    "Ligne de transfert": ["Buffer Buzzacott"],
    "FMS": ["Sac à dos (Prog. Dynamique)", "Sac à dos (Prog. Linéaire)", "Sac à dos (Algorithme Glouton)", "Lots de production (Glouton)", "Lots de production (MIP)", "Lots de chargement (Heuristique)"]
  };

  // Handlers pour la navigation
  const handleModeChange = (mode) => {
    setCurrentMode(mode);
    
    if (mode === "welcome") {
      setSelectedSystem("");
      setSelectedAlgorithm("");
    } else if (mode === "decision") {
      setSelectedSystem("");
      setSelectedAlgorithm("");
    }
  };

  const handleSystemChange = (system) => {
    setSelectedSystem(system);
    setSelectedAlgorithm(""); // Reset algorithm when system changes
    if (system) {
      setCurrentMode("systems");
    }
  };

  const handleAlgorithmChange = (algorithm) => {
    setSelectedAlgorithm(algorithm);
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

  // Determine si on affiche l'InfoPanel
  const shouldShowInfoPanel = currentMode === "systems" && selectedSystem && selectedAlgorithm;
  const algorithms = selectedSystem ? systemsConfig[selectedSystem] || [] : [];

  return (
    <div className="modern-app-container">
      {/* Top Navigation */}
      <TopNavigation
        currentMode={currentMode}
        onModeChange={handleModeChange}
        currentSystem={selectedSystem}
        onSystemChange={handleSystemChange}
      />

      {/* Main Layout */}
      <div className="modern-main-layout">
        {/* Compact Sidebar - Conditionnelle */}
        {currentMode === "systems" && selectedSystem && (
          <CompactSidebar
            system={selectedSystem}
            algorithms={algorithms}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={handleAlgorithmChange}
            onClose={handleCloseSidebar}
          />
        )}

        {/* Content Area */}
        <div className={`modern-content-area ${shouldShowInfoPanel ? 'with-info-panel' : 'full-width'}`}>
          {/* Welcome View - affichée par défaut et quand aucun système sélectionné */}
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

          {/* System Description */}
          {currentMode === "systems" && selectedSystem && !selectedAlgorithm && (
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







