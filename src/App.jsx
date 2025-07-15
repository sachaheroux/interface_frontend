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
  const [systeme, setSysteme] = useState("");
  const [algorithme, setAlgorithme] = useState("");
  const [showDecisionTree, setShowDecisionTree] = useState(false);

  const systemes = {
    "Flowshop": ["SPT", "EDD", "Johnson", "Johnson modifié", "Contraintes", "Machines multiples", "Smith", "Comparer les algos"],
    "Jobshop": ["SPT", "EDD", "Contraintes", "Comparer les algos"],
    "Ligne d'assemblage": ["Précédence", "COMSOAL", "LPT", "PL", "Comparer les algos"],
    "Ligne d'assemblage mixte": ["Variation du goulot", "Équilibrage ligne mixte", "Équilibrage ++"],
    "Ligne de transfert": ["Buffer Buzzacott"],
    "FMS": ["Sac à dos (Prog. Dynamique)", "Sac à dos (Prog. Linéaire)", "Sac à dos (Algorithme Glouton)", "Lots de production (Glouton)", "Lots de production (MIP)", "Lots de chargement (Heuristique)"]
  };

  const handleSystemRecommendation = (recommendedSystem) => {
    setShowDecisionTree(false);
    setSysteme(recommendedSystem);
    setAlgorithme("");
  };

  return (
    <div className="appContainer">
      {/* Menu gauche */}
      <div className="sidebar">
        <div className="sidebarHeader">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h1 className="appTitle">Modélisation des systèmes industriels</h1>
        </div>

        {/* Bouton Aide à la décision */}
        <div className="selectGroup">
          <button
            className={`decision-tree-btn ${showDecisionTree ? 'active' : ''}`}
            onClick={() => {
              setShowDecisionTree(!showDecisionTree);
              if (!showDecisionTree) {
                setSysteme("");
                setAlgorithme("");
              }
            }}
          >
            🔒 Aide à la Décision
          </button>
        </div>

        <div className="selectGroup">
          <label className="selectLabel">
            Système de production
          </label>
          <select
            value={systeme}
            onChange={(e) => {
              setSysteme(e.target.value);
              setAlgorithme("");
              setShowDecisionTree(false);
            }}
            className="select"
          >
            <option value="">-- Choisir un système --</option>
            {Object.keys(systemes).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {systeme && (
          <div className="selectGroup">
            <label className="selectLabel">
              Algorithme
            </label>
            <select
              value={algorithme}
              onChange={(e) => setAlgorithme(e.target.value)}
              className="select"
            >
              <option value="">-- Choisir un algorithme --</option>
              {systemes[systeme].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contenu principal + Info */}
      <div className="mainContent">
        {/* Partie principale */}
        <div className={
          (systeme === "Flowshop" || systeme === "Jobshop" || systeme === "Ligne d'assemblage" || systeme === "Ligne d'assemblage mixte" || systeme === "Ligne de transfert" || systeme === "FMS") && algorithme
            ? "contentArea" 
            : "contentAreaFullWidth"
        }>
          {/* Arbre de décision */}
          {showDecisionTree && (
            <DecisionTree onSystemRecommendation={handleSystemRecommendation} />
          )}
          
          {/* Vues existantes */}
          {!showDecisionTree && !systeme && !algorithme && (
            <WelcomeView 
              onNavigateToDecisionTree={() => {
                setShowDecisionTree(true);
                setSysteme("");
                setAlgorithme("");
              }}
              onNavigateToSystems={() => {
                setShowDecisionTree(false);
                setSysteme("Flowshop"); // Démarre avec Flowshop par défaut
                setAlgorithme("");
              }}
            />
          )}
          {!showDecisionTree && systeme && !algorithme && <SystemDescription system={systeme} />}
          
          {/* Formulaires d'algorithmes existants */}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "SPT" && <FlowshopSPTForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "EDD" && <FlowshopEDDForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Johnson" && <FlowshopJohnsonForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Johnson modifié" && <FlowshopJohnsonModifieForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Smith" && <FlowshopSmithForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Contraintes" && <FlowshopContraintesForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Machines multiples" && <FlowshopMachinesMultiplesForm />}
          {!showDecisionTree && systeme === "Flowshop" && algorithme === "Comparer les algos" && <FlowshopCompareForm />}
          {!showDecisionTree && systeme === "Jobshop" && algorithme === "SPT" && <JobshopSPTForm />}
          {!showDecisionTree && systeme === "Jobshop" && algorithme === "EDD" && <JobshopEDDForm />}
          {!showDecisionTree && systeme === "Jobshop" && algorithme === "Contraintes" && <JobshopContraintesForm />}
          {!showDecisionTree && systeme === "Jobshop" && algorithme === "Comparer les algos" && <JobshopCompareForm />}
          {!showDecisionTree && systeme === "Ligne d'assemblage" && algorithme === "Précédence" && <LigneAssemblagePrecedenceForm />}
          {!showDecisionTree && systeme === "Ligne d'assemblage" && algorithme === "COMSOAL" && (
            <div className="algorithmContent">
              <LigneAssemblageCOMSOALForm />
            </div>
          )}
          {!showDecisionTree && systeme === "Ligne d'assemblage" && algorithme === "LPT" && (
            <div className="algorithmContent">
              <LigneAssemblageLPTForm />
            </div>
          )}
          {!showDecisionTree && systeme === "Ligne d'assemblage" && algorithme === "PL" && (
            <div className="algorithmContent">
              <LigneAssemblagePLForm />
            </div>
          )}
          {!showDecisionTree && systeme === "Ligne d'assemblage" && algorithme === "Comparer les algos" && (
            <div className="algorithmContent">
              <LigneAssemblageCompareForm />
            </div>
          )}
          {!showDecisionTree && systeme === "Ligne d'assemblage mixte" && algorithme === "Variation du goulot" && <LigneAssemblageMixteGoulotForm />}
          {!showDecisionTree && systeme === "Ligne d'assemblage mixte" && algorithme === "Équilibrage ligne mixte" && <LigneAssemblageMixteEquilibrageForm />}
          {!showDecisionTree && systeme === "Ligne d'assemblage mixte" && algorithme === "Équilibrage ++" && <LigneAssemblageMixteEquilibragePlusPlusForm />}
          {!showDecisionTree && systeme === "Ligne de transfert" && algorithme === "Buffer Buzzacott" && <LigneTransfertBufferBuzzacottForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Sac à dos (Prog. Dynamique)" && <FMSSacADosForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Sac à dos (Prog. Linéaire)" && <FMSSacADosPLForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Sac à dos (Algorithme Glouton)" && <FMSSacADosGloutonForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Lots de production (Glouton)" && <FMSLotsProductionGloutonForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Lots de production (MIP)" && <FMSLotsProductionMIPForm />}
          {!showDecisionTree && systeme === "FMS" && algorithme === "Lots de chargement (Heuristique)" && <FMSLotsChargementHeuristiqueForm />}
          {!showDecisionTree && algorithme && !(systeme === "Flowshop") && !(systeme === "Jobshop" && (algorithme === "SPT" || algorithme === "EDD" || algorithme === "Contraintes" || algorithme === "Comparer les algos")) && !(systeme === "Ligne d'assemblage" && (algorithme === "Précédence" || algorithme === "COMSOAL" || algorithme === "LPT" || algorithme === "PL" || algorithme === "Comparer les algos")) && !(systeme === "Ligne d'assemblage mixte" && (algorithme === "Variation du goulot" || algorithme === "Équilibrage ligne mixte" || algorithme === "Équilibrage ++")) && !(systeme === "Ligne de transfert" && algorithme === "Buffer Buzzacott") && !(systeme === "FMS" && (algorithme === "Sac à dos (Prog. Dynamique)" || algorithme === "Sac à dos (Prog. Linéaire)" || algorithme === "Sac à dos (Algorithme Glouton)" || algorithme === "Lots de production (Glouton)" || algorithme === "Lots de production (MIP)" || algorithme === "Lots de chargement (Heuristique)")) && (
            <AlgorithmFormAndResult algorithm={algorithme} />
          )}
        </div>

        {/* Info à droite */}
        {!showDecisionTree && (systeme === "Flowshop" || systeme === "Jobshop" || systeme === "Ligne d'assemblage" || systeme === "Ligne d'assemblage mixte" || systeme === "Ligne de transfert" || systeme === "FMS") && algorithme && (
          <div className="infoPanel">
            {systeme === "Flowshop" && (
              <>
                {algorithme === "SPT" && <FlowshopSPTInfo />}
                {algorithme === "EDD" && <FlowshopEDDInfo />}
                {algorithme === "Johnson" && <FlowshopJohnsonInfo />}
                {algorithme === "Johnson modifié" && <FlowshopJohnsonModifieInfo />}
                {algorithme === "Smith" && <FlowshopSmithInfo />}
                {algorithme === "Contraintes" && <FlowshopContraintesInfo />}
                {algorithme === "Machines multiples" && <FlowshopMachinesMultiplesInfo />}
                {algorithme === "Comparer les algos" && <FlowshopCompareInfo />}
              </>
            )}
            {systeme === "Jobshop" && algorithme === "SPT" && <JobshopSPTInfo />}
            {systeme === "Jobshop" && algorithme === "EDD" && <JobshopEDDInfo />}
            {systeme === "Jobshop" && algorithme === "Contraintes" && <JobshopContraintesInfo />}
            {systeme === "Jobshop" && algorithme === "Comparer les algos" && <JobshopCompareInfo />}
            {systeme === "Ligne d'assemblage" && algorithme === "Précédence" && <LigneAssemblagePrecedenceInfo />}
            {systeme === "Ligne d'assemblage" && algorithme === "COMSOAL" && <LigneAssemblageCOMSOALInfo />}
            {systeme === "Ligne d'assemblage" && algorithme === "LPT" && <LigneAssemblageLPTInfo />}
            {systeme === "Ligne d'assemblage" && algorithme === "PL" && <LigneAssemblagePLInfo />}
            {systeme === "Ligne d'assemblage" && algorithme === "Comparer les algos" && <LigneAssemblageCompareInfo />}
            {systeme === "Ligne d'assemblage mixte" && algorithme === "Variation du goulot" && <LigneAssemblageMixteGoulotInfo />}
            {systeme === "Ligne d'assemblage mixte" && algorithme === "Équilibrage ligne mixte" && <LigneAssemblageMixteEquilibrageInfo />}
            {systeme === "Ligne d'assemblage mixte" && algorithme === "Équilibrage ++" && <LigneAssemblageMixteEquilibragePlusPlusInfo />}
            {systeme === "Ligne de transfert" && algorithme === "Buffer Buzzacott" && <LigneTransfertBufferBuzzacottInfo />}
            {systeme === "FMS" && algorithme === "Sac à dos (Prog. Dynamique)" && <FMSSacADosInfo />}
            {systeme === "FMS" && algorithme === "Sac à dos (Prog. Linéaire)" && <FMSSacADosPLInfo />}
            {systeme === "FMS" && algorithme === "Sac à dos (Algorithme Glouton)" && <FMSSacADosGloutonInfo />}
            {systeme === "FMS" && algorithme === "Lots de production (Glouton)" && <FMSLotsProductionGloutonInfo />}
            {systeme === "FMS" && algorithme === "Lots de production (MIP)" && <FMSLotsProductionMIPInfo />}
            {systeme === "FMS" && algorithme === "Lots de chargement (Heuristique)" && <FMSLotsChargementHeuristiqueInfo />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;







