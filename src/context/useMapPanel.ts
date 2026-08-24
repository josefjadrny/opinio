import { useContext } from 'react';
import { MapPanelContext } from './MapPanelContext';

export function useMapPanel() {
  const ctx = useContext(MapPanelContext);
  if (!ctx) throw new Error('useMapPanel must be used within MapPanelProvider');
  return ctx;
}
