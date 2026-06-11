import type { Call, CallView } from "../types";

interface StatsCardsProps {
  calls: Call[];
  callView: CallView;
}

function StatsCards({ calls, callView }: StatsCardsProps) {
  const stats = {
    total: calls.length,
    inbound: calls.filter((call) => call.direction === "inbound").length,
    outbound: calls.filter((call) => call.direction === "outbound").length,
    answered: calls.filter((call) => call.call_type === "answered").length,
    missed: calls.filter((call) => call.call_type === "missed").length,
    voicemail: calls.filter((call) => call.call_type === "voicemail").length,
  };

  const totalLabel = callView === "active" ? "Active Calls" : "Archived Calls";

  const cards = [
    {
      key: "total",
      label: totalLabel,
      value: stats.total,
      icon: "#",
    },
    {
      key: "inbound",
      label: "Inbound",
      value: stats.inbound,
      icon: "↙",
    },
    {
      key: "outbound",
      label: "Outbound",
      value: stats.outbound,
      icon: "↘",
    },
    {
      key: "answered",
      label: "Answered",
      value: stats.answered,
      icon: "✓",
    },
    {
      key: "missed",
      label: "Missed",
      value: stats.missed,
      icon: "!",
    },
    {
      key: "voicemail",
      label: "Voicemail",
      value: stats.voicemail,
      icon: "VM",
    },
  ];

  return (
    <section className="stats-cards" aria-label="Call statistics">
      {cards.map((card) => {
        return (
          <article className={`stat-card stat-card-${card.key}`} key={card.key}>
            <span className="stat-card-icon" aria-hidden="true">
              {card.icon}
            </span>
            <span className="stat-card-label">{card.label}</span>
            <strong className="stat-card-value">{card.value}</strong>
          </article>
        );
      })}
    </section>
  );
}

export default StatsCards;
