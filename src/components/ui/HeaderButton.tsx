import { forwardRef } from 'react';

interface HeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ active, className = '', ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={`rounded-lg border transition-colors ${
        active
          ? 'border-white/60 bg-white/5'
          : 'border-white/30 hover:border-white/60 hover:bg-white/5'
      } disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    />
  )
);

HeaderButton.displayName = 'HeaderButton';
