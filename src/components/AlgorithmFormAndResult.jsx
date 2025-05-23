export default function AlgorithmFormAndResult({ algorithm }) {
  return (
    <div>
      <h2>Algorithme sélectionné : {algorithm}</h2>
      <p>Veuillez entrer les données nécessaires à l’exécution de l’algorithme.</p>
      <form>
        <label>Liste de jobs (format JSON) :</label><br />
        <textarea
          rows="6"
          cols="60"
          placeholder='[["Machine1", 5], ["Machine2", 7]]'
        ></textarea><br />
        <button type="submit">Lancer l’algorithme</button>
      </form>
      <div style={{ marginTop: "2rem" }}>
        <h3>Résultats</h3>
        <p>(Ici apparaîtront les résultats et visualisations de l’algorithme.)</p>
      </div>
    </div>
  );
}