const icons = {
  audit: "/icons/audit-report-survey-icon.svg",
  ballot: "/icons/ballot-box-vote-icon.svg",
  ban: "/icons/ban-sign-icon.svg",
  boy: "/icons/boy-icon.svg",
  check: "/icons/check-mark-circle-icon.svg",
  chart: "/icons/column-chart-icon.svg",
  envelope: "/icons/envelope-icon.svg",
  warning: "/icons/exclamation-triangle-icon.svg",
  graduation: "/icons/graduation-cap-icon.svg",
  id: "/icons/id-proof-line-icon.svg",
  link: "/icons/link-icon.svg",
  padlock: "/icons/padlock-icon.svg",
  party: "/icons/party-hat-icon.svg",
  race: "/icons/race-icon.svg",
  shield: "/icons/shield-icon.svg",
  trophy: "/icons/winning-cup-icon.svg",
};

export type AppIconName = keyof typeof icons;

export default function AppIcon({
  name,
  className = "h-5 w-5",
}: {
  name: AppIconName;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMask: `url("${icons[name]}") center / contain no-repeat`,
        mask: `url("${icons[name]}") center / contain no-repeat`,
      }}
    />
  );
}
