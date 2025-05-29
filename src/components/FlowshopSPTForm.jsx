import { useState } from "react";
import styles from "./FlowshopSPTForm.module.css";

function FlowshopSPTForm() {
  const [jobs, setJobs] = useState([
    [{ machine: "0", duration: "3" }, { machine: "1", duration: "2" }],
    [{ machine: "0", duration: "2" }, { machine: "1", duration: "4" }]
  ]);
  const [jobNames, setJobNames] = useState(["Job 0", "Job 1"]);
  const [machineNames, setMachineNames] = useState(["Machine 0", "Machine 1"]);
  const [dueDates, setDueDates] = useState(["10", "9"]);
  const [unite, setUnite] = useState("heures");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedJobs, setAdvancedJobs] = useState([...jobs]);
  const [dueDateTimes, setDueDateTimes] = useState(["", ""]);
  const [startDateTime, setStartDateTime] = useState("");
  const [openingHours, setOpeningHours] = useState({ start: "08:00", end: "17:00" });
  const [weekendDays, setWeekendDays] = useState({ samedi: false, dimanche: false });
  const [feries, setFeries] = useState([""]);

  const API_URL = "https://interface-backend-1jgi.onrender.com";

  const handleSubmit = () => {
    const formattedJobs = (showAdvanced ? advancedJobs : jobs).map(job =>
      job.map(op => [parseInt(op.machine, 10), parseFloat(op.duration.replace(",", "."))])
    );
    const payload = {
      jobs_data: formattedJobs,
      due_dates: showAdvanced ? dueDates.map(() => 9999) : dueDates.map(d => parseFloat(d.replace(",", "."))),
      unite,
      job_names: jobNames,
      machine_names: machineNames,
      agenda_start_datetime: startDateTime,
      opening_hours: openingHours,
      weekend_days: Object.entries(weekendDays).filter(([_, v]) => v).map(([k]) => k),
      jours_feries: feries.filter(f => f),
      due_date_times: dueDateTimes
    };
    // ...fetch logic...
  };

  const handleChangeJobName = (index, value) => {
    const updated = [...jobNames];
    updated[index] = value;
    setJobNames(updated);
  };

  const handleChangeMachineName = (index, value) => {
    const updated = [...machineNames];
    updated[index] = value;
    setMachineNames(updated);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Planification Flowshop - SPT</h2>

      <div className={styles.unitSelector}>
        <label>Unité de temps :</label>
        <select value={unite} onChange={(e) => setUnite(e.target.value)} className={styles.select}>
          <option value="minutes">minutes</option>
          <option value="heures">heures</option>
          <option value="jours">jours</option>
        </select>
      </div>

      <h4 className={styles.subtitle}>Noms des machines</h4>
      {machineNames.map((name, i) => (
        <div key={i} className={styles.taskRow}>
          Machine {i} :
          <input type="text" value={name} onChange={e => handleChangeMachineName(i, e.target.value)} />
        </div>
      ))}

      <h4 className={styles.subtitle}>Noms des jobs</h4>
      {jobNames.map((name, i) => (
        <div key={i} className={styles.taskRow}>
          Job {i} :
          <input type="text" value={name} onChange={e => handleChangeJobName(i, e.target.value)} />
        </div>
      ))}

      <div className={styles.advancedToggle}>
        <label>
          <input type="checkbox" checked={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)} />
          Saisies avancées
        </label>
      </div>

      {!showAdvanced && (
        <>
          <h4 className={styles.subtitle}>Tâches et durées</h4>
          {/* ancienne saisie jobs */}
          {/* ancienne saisie dueDates */}
        </>
      )}

      {showAdvanced && (
        <>
          <h4 className={styles.subtitle}>Tâches (saisie avancée)</h4>
          {advancedJobs.map((job, jobIdx) => (
            <div key={jobIdx} className={styles.jobBlock}>
              <h4>{jobNames[jobIdx]}</h4>
              {job.map((op, opIdx) => (
                <div key={opIdx} className={styles.taskRow}>
                  Machine :
                  <input
                    type="number"
                    value={op.machine}
                    onChange={e => {
                      const newJobs = [...advancedJobs];
                      newJobs[jobIdx][opIdx].machine = e.target.value;
                      setAdvancedJobs(newJobs);
                    }}
                  />
                  Durée ({unite}) :
                  <input
                    type="text"
                    value={op.duration}
                    onChange={e => {
                      const newJobs = [...advancedJobs];
                      newJobs[jobIdx][opIdx].duration = e.target.value;
                      setAdvancedJobs(newJobs);
                    }}
                  />
                </div>
              ))}
            </div>
          ))}

          <h4 className={styles.subtitle}>Horaire réel de l’usine</h4>
          <div className={styles.taskRow}>
            Début de l’agenda :
            <input type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} />
          </div>
          <div className={styles.taskRow}>
            Heures d’ouverture :
            <input type="time" value={openingHours.start} onChange={e => setOpeningHours({ ...openingHours, start: e.target.value })} />
            à
            <input type="time" value={openingHours.end} onChange={e => setOpeningHours({ ...openingHours, end: e.target.value })} />
          </div>
          <div className={styles.taskRow}>
            Jours de congé :
            {["samedi", "dimanche"].map(day => (
              <label key={day}>
                <input type="checkbox" checked={weekendDays[day]} onChange={() => setWeekendDays({ ...weekendDays, [day]: !weekendDays[day] })} />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
          <div className={styles.taskRow}>
            Jours fériés :
            {feries.map((date, i) => (
              <input
                key={i}
                type="date"
                value={date}
                onChange={e => {
                  const updated = [...feries];
                  updated[i] = e.target.value;
                  setFeries(updated);
                }}
              />
            ))}
            <button className={styles.button} onClick={() => setFeries([...feries, ""])}>+ Ajouter un jour férié</button>
          </div>

          <h4 className={styles.subtitle}>Dates dues avec heure</h4>
          {jobNames.map((name, idx) => (
            <div key={idx} className={styles.taskRow}>
              {name} :
              <input type="datetime-local" value={dueDateTimes[idx]} onChange={e => {
                const updated = [...dueDateTimes];
                updated[idx] = e.target.value;
                setDueDateTimes(updated);
              }} />
            </div>
          ))}
        </>
      )}

      <button className={styles.submitButton} onClick={handleSubmit}>Lancer l'algorithme</button>
    </div>
  );
}

export default FlowshopSPTForm;















