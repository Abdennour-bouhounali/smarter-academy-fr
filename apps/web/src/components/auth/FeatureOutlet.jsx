import { Navigate, Outlet } from 'react-router-dom';
import { isFeatureOn } from '../../config/features';
import { usePayments } from '../../context/PaymentsContext';

/**
 * The routes of a feature that has no French content yet (`config/features.js`): off, every address under it goes
 * back to the space's home — never a blank page, never an error — and its page's lazy chunk is never asked for, so
 * nothing calls its API.
 */
export function FeatureOutlet({ feature, home }) {
  return isFeatureOn(feature) ? <Outlet /> : <Navigate to={home} replace />;
}

/**
 * The routes that sell (a plan, a subscription, an activation code): while payments are closed they go back to the
 * space's home. Nothing is drawn until the switch is known, so an open platform never bounces a direct visit.
 */
export function PaidOutlet({ home }) {
  const { paymentsOpen, loaded } = usePayments();
  if (!loaded) return null;
  return paymentsOpen ? <Outlet /> : <Navigate to={home} replace />;
}
