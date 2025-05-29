import React from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";

function AgendaTimeline({ groups, items }) {
  // Convertir les dates ISO en objets Date pour la timeline
  const parsedItems = items.map(item => ({
    ...item,
    start_time: new Date(item.start_time),
    end_time: new Date(item.end_time)
  }));

  // Optionnel : définir les bornes de la timeline (sinon, il affiche automatiquement)
  const defaultTimeStart = parsedItems.length > 0 ? parsedItems[0].start_time : new Date();
  const defaultTimeEnd = parsedItems.length > 0 ? parsedItems[0].end_time : new Date();

  return (
    <Timeline
      groups={groups}
      items={parsedItems}
      defaultTimeStart={defaultTimeStart}
      defaultTimeEnd={defaultTimeEnd}
      canMove={false}
      canResize={false}
      itemTouchSendsClick={false}
      stackItems
      itemHeightRatio={0.75}
      sidebarWidth={180}
      lineHeight={45}
    />
  );
}

export default AgendaTimeline;

