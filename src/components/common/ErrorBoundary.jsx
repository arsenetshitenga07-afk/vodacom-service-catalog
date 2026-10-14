import { Component } from 'react';
import i18n from '@/i18n';
import vodacomLogo from '@/assets/vodacom-logo.png';

/**
 * Filet de sécurité : si un composant plante, on affiche un écran d'erreur
 * aux couleurs Vodacom (au lieu d'une page blanche) avec un bouton pour recharger.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erreur inattendue dans l’interface :', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const t = i18n.t.bind(i18n);

    return (
      <div className="bg-background grid min-h-screen place-items-center px-4 text-center">
        <div className="max-w-md space-y-5">
          <img src={vodacomLogo} alt="Vodacom" className="mx-auto size-14" />
          <h1 className="text-2xl font-bold tracking-tight">{t('crash.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('crash.description')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg px-5 text-sm font-medium"
            >
              {t('crash.reload')}
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="bg-card hover:bg-accent h-10 rounded-lg border px-5 text-sm font-medium"
            >
              {t('crash.home')}
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="bg-muted text-destructive overflow-auto rounded-lg border p-3 text-left text-xs">
              {String(this.state.error?.message ?? this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
