import React from "react";
import styles from "./AgendaGrid.module.css";

function AgendaGrid({ agendaData }) {
  if (!agendaData || !agendaData.groups || !agendaData.items) return <p>Données manquantes</p>;

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.sidebar}>
        {agendaData.groups.map((g) => (
          <div key={g.id} className={styles.machineRow}>{g.title}</div>
        ))}
      </div>
      <div className={styles.timeline}>
        {agendaData.items.map((item) => {
          const start = new Date(item.start_time);
          const end = new Date(item.end_time);
          const duration = (end - start) / 60000; // minutes
          const offset = (start.getHours() * 60 + start.getMinutes()) - 480; // depuis 8:00

          return (
            <div
              key={item.id}
              className={styles.jobBlock}
              style={{
                top: `${item.group * 60}px`,
                left: `${offset}px`,
                width: `${duration}px`,
              }}
              title={`${item.title}: ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`}
            >
              {item.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AgendaGrid;

