import { Component } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

/**
 * A crash of ONE part of the student's space never blanks the page. Without a boundary React unmounts the whole tree
 * on a render error: the student saw a white page (2026-11-23, the home's year strip on an empty calendar). Placed
 * twice: around the page in StudentLayout (the bar and the doors stay, `resetKey` = the address, so another page
 * opens normally) and around each section of the home that reads data it does not own.
 *
 * The error is not swallowed: React still reports it in the console (and to any reporter listening there); the
 * student reads a calm sentence and a « Réessayer » that renders the part again.
 */
export default class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    // A new address (or any new resetKey) is a new page: it renders, whatever the previous one did.
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    return null;
  }

  render() {
    if (this.state.error) {
      return <SectionErrorNotice scope={this.props.scope} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

/** `scope`: 'page' (the whole page under the bar) or 'section' (one block of a page). */
function SectionErrorNotice({ scope = 'section', onRetry }) {
  const { t } = useTranslation('student');
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-5 ${scope === 'page' ? 'sa-page my-8' : ''}`}
      data-section-error={scope}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle size={22} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-bold text-rose-900">
            {t(scope === 'page' ? 'sectionError.pageTitle' : 'sectionError.title')}
          </p>
          <p className="mt-0.5 text-sm text-rose-900/80">{t('sectionError.body')}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[44px] rounded-xl border-2 border-rose-200 bg-white px-4 text-sm font-bold text-rose-800 hover:border-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        {t('sectionError.retry')}
      </button>
    </div>
  );
}
