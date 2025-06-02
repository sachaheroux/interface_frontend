import { useState } from "react";
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
import JobshopSPTForm from "./components/JobshopSPTForm";
import JobshopSPTInfo from "./components/JobshopSPTInfo";
import JobshopEDDForm from "./components/JobshopEDDForm";
import JobshopEDDInfo from "./components/JobshopEDDInfo";
import JobshopContraintesForm from "./components/JobshopContraintesForm";
import JobshopContraintesInfo from "./components/JobshopContraintesInfo";

function App() {
  const [systeme, setSysteme] = useState("");
  const [algorithme, setAlgorithme] = useState("");

  const systemes = {
    "Flowshop": ["SPT", "EDD", "Johnson", "Johnson modifié", "Contraintes", "Smith"],
    "Jobshop": ["SPT", "EDD", "Contraintes"],
    "Ligne d'assemblage": ["COMSOAL", "LPT", "PL"],
    "Ligne de transfert": ["Markov", "LIBA"],
    "FMS": ["Sac à dos", "Glouton", "Lots de chargement"]
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#eef2f8", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Menu gauche */}
      <div style={{
        width: "300px",
        background: "#ffffff",
        padding: "2rem",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src="/logo.png" alt="Logo" style={{ width: "180px", marginBottom: "1.5rem" }} />
          <h1 style={{ fontSize: "1.4rem", color: "#1e3a8a", margin: 0 }}>Planification</h1>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.5rem", display: "block" }}>
            Système de production
          </label>
          <select
            value={systeme}
            onChange={(e) => {
              setSysteme(e.target.value);
              setAlgorithme("");
            }}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #ccc",
              background: "#f9f9f9"
            }}
          >
            <option value="">-- Choisir un système --</option>
            {Object.keys(systemes).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {systeme && (
          <div>
            <label style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.5rem", display: "block" }}>
              Algorithme
            </label>
            <select
              value={algorithme}
              onChange={(e) => setAlgorithme(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #ccc",
                background: "#f9f9f9"
              }}
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
      <div style={{ flex: 1, display: "flex", padding: "2rem", background: "#f9fafc" }}>
        {/* Partie principale */}
        <div style={{
          flex: 1,
          background: "#fff",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          {!systeme && !algorithme && <WelcomeView />}
          {systeme && !algorithme && <SystemDescription system={systeme} />}
          {systeme === "Flowshop" && algorithme === "SPT" && <FlowshopSPTForm />}
          {systeme === "Flowshop" && algorithme === "EDD" && <FlowshopEDDForm />}
          {systeme === "Flowshop" && algorithme === "Johnson" && <FlowshopJohnsonForm />}
          {systeme === "Flowshop" && algorithme === "Johnson modifié" && <FlowshopJohnsonModifieForm />}
          {systeme === "Flowshop" && algorithme === "Smith" && <FlowshopSmithForm />}
          {systeme === "Flowshop" && algorithme === "Contraintes" && <FlowshopContraintesForm />}
          {systeme === "Jobshop" && algorithme === "SPT" && <JobshopSPTForm />}
          {systeme === "Jobshop" && algorithme === "EDD" && <JobshopEDDForm />}
          {systeme === "Jobshop" && algorithme === "Contraintes" && <JobshopContraintesForm />}
          {algorithme && !(systeme === "Flowshop") && !(systeme === "Jobshop" && (algorithme === "SPT" || algorithme === "EDD" || algorithme === "Contraintes")) && (
            <AlgorithmFormAndResult algorithm={algorithme} />
          )}
        </div>

        {/* Info à droite */}
        {(systeme === "Flowshop" || systeme === "Jobshop") && (
          <div style={{ marginLeft: "2rem", minWidth: "400px" }}>
            {systeme === "Flowshop" && (
              <>
                {algorithme === "SPT" && <FlowshopSPTInfo />}
                {algorithme === "EDD" && <FlowshopEDDInfo />}
                {algorithme === "Johnson" && <FlowshopJohnsonInfo />}
                {algorithme === "Johnson modifié" && <FlowshopJohnsonModifieInfo />}
                {algorithme === "Smith" && <FlowshopSmithInfo />}
                {algorithme === "Contraintes" && <FlowshopContraintesInfo />}
              </>
            )}
            {systeme === "Jobshop" && algorithme === "SPT" && <JobshopSPTInfo />}
            {systeme === "Jobshop" && algorithme === "EDD" && <JobshopEDDInfo />}
            {systeme === "Jobshop" && algorithme === "Contraintes" && <JobshopContraintesInfo />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;







