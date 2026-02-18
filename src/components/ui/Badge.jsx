import { STATUS_CONFIG } from '../../utils/constants';

export default function Badge({ status, className = '' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${config.bgColor} ${config.color} ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
