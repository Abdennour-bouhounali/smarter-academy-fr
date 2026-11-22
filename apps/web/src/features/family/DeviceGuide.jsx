import { useTranslation } from 'react-i18next';
import { Apple, Heart, Monitor, Router, ShieldCheck, Smartphone } from 'lucide-react';

/**
 * Les adresses à autoriser quand le parent restreint le navigateur à la
 * plateforme. `smarter-academy.com` porte le site ET l'API (/api/v1) ; les
 * polices viennent de Google Fonts (index.html) ; Google seulement pour la
 * connexion Google. À tenir à jour si un domaine est ajouté (PARENT_SPACE.md §6).
 */
const ALLOWED_HOSTS = [
  { host: 'smarter-academy.com', key: 'allowMain' },
  { host: 'fonts.googleapis.com, fonts.gstatic.com', key: 'allowFonts' },
  { host: 'accounts.google.com', key: 'allowGoogle' },
];

/** Cloudflare for Families — filtre les logiciels malveillants ET les contenus pour adultes. */
const FAMILY_DNS = ['1.1.1.3', '1.0.0.3'];

const DEVICES = [
  { id: 'windows', icon: Monitor, steps: ['s1', 's2', 's3', 's4', 's5', 's6'] },
  { id: 'android', icon: Smartphone, steps: ['s1', 's2', 's3', 's4'] },
  { id: 'ipad', icon: Apple, steps: ['s1', 's2', 's3', 's4'] },
  { id: 'router', icon: Router, steps: ['s1', 's2', 's3'] },
];

/**
 * « اجعل الجهاز للدراسة فقط » — le guide de verrouillage de l'APPAREIL
 * (PARENT_SPACE.md §6). Une page web ne peut pas empêcher un autre onglet :
 * la protection réelle se règle dans le système (Family Safety, Family Link,
 * Screen Time, DNS familial). Aucun lien sortant : les adresses sont du texte
 * que le parent recopie (la plateforme reste un jardin clos).
 */
export default function DeviceGuide() {
  const { t } = useTranslation('family');

  return (
    <div className="space-y-6" data-device-guide>
      <div className="rounded-2xl border border-indigo-200 bg-nav-accent-soft p-4 sm:p-5">
        <p className="flex items-start gap-3 font-inter text-sm leading-relaxed text-indigo-950">
          <ShieldCheck size={22} className="mt-0.5 flex-shrink-0 text-nav-accent" aria-hidden="true" />
          {t('guide.intro')}
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="mb-3 font-space text-lg font-bold text-slate-900">{t('guide.allowTitle')}</h2>
        <ul className="space-y-2">
          {ALLOWED_HOSTS.map((a) => (
            <li key={a.host} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <code dir="ltr" className="break-all rounded-lg bg-slate-100 px-2 py-1 font-mono text-sm text-slate-900 select-all">{a.host}</code>
              <span className="font-inter text-sm text-slate-600">{t(`guide.${a.key}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {DEVICES.map(({ id, icon: Icon, steps }) => (
          <section key={id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-guide-device={id}>
            <h2 className="flex items-center gap-2 font-space text-lg font-bold text-slate-900">
              <Icon size={20} className="text-nav-accent" aria-hidden="true" />
              {t(`guide.${id}.title`)}
            </h2>
            <p className="mb-3 font-inter text-xs font-semibold text-nav-accent">{t(`guide.${id}.tool`)}</p>
            <ol className="list-decimal space-y-2 ps-5 font-inter text-sm leading-relaxed text-slate-700">
              {steps.map((s) => <li key={s}>{t(`guide.${id}.${s}`)}</li>)}
            </ol>
            {id === 'router' && (
              <p className="mt-3 flex gap-2">
                {FAMILY_DNS.map((ip) => (
                  <code key={ip} dir="ltr" className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-sm text-slate-900 select-all">{ip}</code>
                ))}
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-space text-lg font-bold text-emerald-950">
          <Heart size={20} className="text-emerald-600" aria-hidden="true" />
          {t('guide.habitsTitle')}
        </h2>
        <ul className="list-disc space-y-1.5 ps-5 font-inter text-sm leading-relaxed text-emerald-950">
          <li>{t('guide.habit1')}</li>
          <li>{t('guide.habit2')}</li>
          <li>{t('guide.habit3')}</li>
        </ul>
      </section>
    </div>
  );
}
