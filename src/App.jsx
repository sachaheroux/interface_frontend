import { useState } from "react";
import "./App.css";
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
  // State management pour l'interface professionnelle
  const [currentView, setCurrentView] = useState("welcome"); // welcome, decision, system, algorithm
  const [selectedSystem, setSelectedSystem] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Configuration des systèmes et algorithmes
  const systemsConfig = {
    "Flowshop": ["SPT", "EDD", "Johnson", "Johnson modifié", "Contraintes", "Machines multiples", "Smith", "Comparer les algos"],
    "Jobshop": ["SPT", "EDD", "Contraintes", "Comparer les algos"],
    "Ligne d'assemblage": ["Précédence", "COMSOAL", "LPT", "PL", "Comparer les algos"],
    "Ligne d'assemblage mixte": ["Variation du goulot", "Équilibrage ligne mixte", "Équilibrage ++"],
    "Ligne de transfert": ["Buffer Buzzacott"],
    "FMS": ["Sac à dos (Prog. Dynamique)", "Sac à dos (Prog. Linéaire)", "Sac à dos (Algorithme Glouton)", "Lots de production (Glouton)", "Lots de production (MIP)", "Lots de chargement (Heuristique)"]
  };

  // Navigation handlers
  const handleNavigation = (view, system = "", algorithm = "") => {
    setCurrentView(view);
    if (system) setSelectedSystem(system);
    if (algorithm) setSelectedAlgorithm(algorithm);
    if (view === "welcome") {
      setSelectedSystem("");
      setSelectedAlgorithm("");
    }
  };

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
    setSelectedAlgorithm("");
    setCurrentView("system");
  };

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
    setCurrentView("algorithm");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Obtenir le titre et sous-titre de la page
  const getPageInfo = () => {
    switch (currentView) {
      case "welcome":
        return {
          title: "Accueil",
          subtitle: "Plateforme d'optimisation et de modélisation industrielle"
        };
      case "decision":
        return {
          title: "Aide à la Décision",
          subtitle: "Trouvez le système de production adapté à vos besoins"
        };
      case "system":
        return {
          title: selectedSystem,
          subtitle: `Système de production ${selectedSystem.toLowerCase()}`
        };
      case "algorithm":
        return {
          title: `${selectedSystem} - ${selectedAlgorithm}`,
          subtitle: `Algorithme ${selectedAlgorithm} pour ${selectedSystem.toLowerCase()}`
        };
      default:
        return {
          title: "Systèmes Industriels",
          subtitle: "Optimisation & Modélisation"
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="professional-app">
      {/* Sidebar Professionnelle */}
      <aside className={`professional-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header de la sidebar */}
        <div className="sidebar-header">
          <a href="#" className="sidebar-logo" onClick={() => handleNavigation("welcome")}>
            <img src="/logo.png" alt="Logo" className="sidebar-logo-img" />
            <div className="sidebar-logo-text">
              <span className="sidebar-title">Systèmes Industriels</span>
              <span className="sidebar-subtitle">Optimisation & Modélisation</span>
            </div>
          </a>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Section Navigation principale */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Navigation</h3>
            
                            <button 
                  className={`sidebar-item ${currentView === 'welcome' ? 'active' : ''}`}
                  onClick={() => handleNavigation("welcome")}
                >
                  <span className="sidebar-icon">⌂</span>
                  <span className="sidebar-label">Accueil</span>
                </button>

                <button 
                  className={`sidebar-item ${currentView === 'decision' ? 'active' : ''}`}
                  onClick={() => handleNavigation("decision")}
                >
                  <span className="sidebar-icon">◈</span>
                  <span className="sidebar-label">Aide à la Décision</span>
                </button>
          </div>

          {/* Section Systèmes de Production */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Systèmes de Production</h3>
            
            {Object.entries(systemsConfig).map(([system, algorithms]) => (
              <div key={system}>
                <button 
                  className={`sidebar-item ${selectedSystem === system && currentView === 'system' ? 'active' : ''}`}
                  onClick={() => handleSystemSelect(system)}
                >
                  <span className="sidebar-icon">▣</span>
                  <span className="sidebar-label">{system}</span>
                  <span className="sidebar-badge">{algorithms.length}</span>
                </button>

                {/* Sous-menu des algorithmes */}
                {selectedSystem === system && (
                  <div className="sidebar-dropdown">
                    {algorithms.map((algorithm) => (
                      <button
                        key={algorithm}
                        className={`sidebar-item ${selectedAlgorithm === algorithm && currentView === 'algorithm' ? 'active' : ''}`}
                        onClick={() => handleAlgorithmSelect(algorithm)}
                      >
                        <span className="sidebar-icon">◦</span>
                        <span className="sidebar-label">{algorithm}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* Contenu Principal */}
      <main className="professional-main">
        {/* Header du contenu */}
        <header className="content-header">
          <div className="content-header-top">
            <div>
              <h1 className="content-title">{pageInfo.title}</h1>
              <p className="content-subtitle">{pageInfo.subtitle}</p>
            </div>
            <div className="content-actions">
              {currentView === "algorithm" && (
                <button className="btn btn-secondary">
                  <span>▤</span>
                  Informations
                </button>
              )}
              <button className="btn btn-ghost" onClick={toggleSidebar}>
                <span>☰</span>
              </button>
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <div className="content-area">
          {/* Welcome View */}
          {currentView === "welcome" && (
            <WelcomeView 
              onNavigateToDecisionTree={() => handleNavigation("decision")}
              onNavigateToSystems={() => handleNavigation("system")}
            />
          )}

          {/* Decision Tree */}
          {currentView === "decision" && (
            <DecisionTree onSystemRecommendation={(system) => handleSystemSelect(system)} />
          )}

          {/* System Description */}
          {currentView === "system" && selectedSystem && (
            <SystemDescription system={selectedSystem} />
          )}

          {/* Algorithm Forms */}
          {currentView === "algorithm" && selectedSystem && selectedAlgorithm && (
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;







