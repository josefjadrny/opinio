interface BrandNameProps {
  className?: string;
}

export function BrandName({ className = 'text-xl' }: BrandNameProps) {
  return (
    <h1 className={`font-bold text-accent tracking-tight flex items-center leading-none ${className}`}>
      {'OP'}
      <span className="inline-flex flex-col items-center justify-between" style={{ height: '0.82em', lineHeight: 1 }}>
        <span style={{ fontSize: '0.38em', color: '#22c55e', lineHeight: 1 }}>▲</span>
        <span style={{ fontSize: '0.52em', color: '#e94560', lineHeight: 1, fontWeight: 'bold' }}>I</span>
        <span style={{ fontSize: '0.38em', color: '#ef4444', lineHeight: 1 }}>▼</span>
      </span>
      {'NIO'}
    </h1>
  );
}
