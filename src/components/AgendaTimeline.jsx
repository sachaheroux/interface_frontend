import React from "react";
import Timeline from "react-calendar-timeline";
import moment from "moment";
import "react-calendar-timeline/lib/Timeline.css";

function AgendaTimeline({ agendaData }) {
  // Sécurité : évite crash si agendaData ou ses props sont absents/mal formés
  if (
    !agendaData ||
    !Array.isArray(agendaData.groups) ||
    !Array.isArray(agendaData.items)
  ) {
    return (
      <div style={{ color: "#ef4444", margin: "1em" }}>
        <b>Agenda non disponible ou données incorrectes</b>
        <pre style={{
          background: "#f9fafb",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "0.5em",
          fontSize: "0.95em",
          marginTop: "0.5em"
        }}>
          {JSON.stringify(agendaData, null, 2)}
        </pre>
      </div>
    );
  }

  const { groups, items } = agendaData;

  // Dates pour centrer la timeline sur la période couverte (optionnel, améliore UX)
  const starts = items.map(i => moment(i.start_time));
  const ends = items.map(i => moment(i.end_time));
  const defaultTimeStart =
    starts.length > 0 ? moment.min(starts).clone().subtract(1, "hour") : moment().startOf("day").add(7, "hours");
  const defaultTimeEnd =
    ends.length > 0 ? moment.max(ends).clone().add(1, "hour") : moment().startOf("day").add(18, "hours");

  // Formatage items pour react-calendar-timeline (dates en objects moment)
  const formattedItems = items.map(item => ({
    ...item,
    start_time: moment(item.start_time),
    end_time: moment(item.end_time),
    itemProps: {
      style: {
        background: "#4f46e5",
        color: "white",
        borderRadius: "4px",
        textAlign: "center",
      },
    },
  }));

  return (
    <div>
      <h3>Agenda réel des machines</h3>
      <Timeline
        groups={groups}
        items={formattedItems}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        lineHeight={60}
        sidebarWidth={180}
        stackItems
        itemHeightRatio={0.75}
      />
    </div>
  );
}

export default AgendaTimeline;
