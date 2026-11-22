# The legal pages — what does not fit the product today (2026-11-22)

The owner, 2026-11-22: « French legal pages are good, just report what you think is not right. » So the three pages of
the old French site — `apps/web/src/pages/legal/MentionsLegales.jsx`, `CGU.jsx`, `Confidentialite.jsx`, versions
`2026-09-12` — were restored WORD FOR WORD (two are byte-identical to `main`; in the CGU one dead link to a pricing
page became plain text). **Nothing below was changed in the pages.** This is the list of where their text and the
product disagree, for the owner to decide.

How to read it: **certain** = the text and the code plainly disagree; **likely**; **ask a lawyer** = a point of
French or European law that this review does not settle. Nothing here is legal advice. No personal detail of the
publisher is quoted.

These pages were written for the old site: one student, one account, one Stripe subscription. The product is now a
different one — teachers, classes, schools, parents, photos of answers, games — and it is free. Most findings follow
from that.

## The five that matter most

| # | The pages say | The product does | |
|---|---|---|---|
| 1 | CGU §5–§7: one paid offer, Premium at 35 € per year through Stripe, renewal, cancellation, the 14-day withdrawal | Payment is CLOSED (`PaymentGate`); nothing is sold or priced; every account has full access. The pages are the only place of the site that shows a price | certain |
| 2 | Privacy §2: results « ne sont communiqués à aucun établissement scolaire »; §6bis: no parent address, no « représentant légal » account. CGU §4bis: no parental dashboard, no supervised account | A teacher sees each student's progress, answers, notebook and answer photos; a school's director sees student files and reports; a parent link (a private link and a 4-digit code, which a teacher can print with no gesture from the student) and a parent account with a weekly e-mail show time spent, answers and mastery | certain |
| 3 | CGU §4: « L'élève crée lui-même son compte ». CGU §4bis: under 15, registration is made or authorised by the legal representative | A school creates student accounts from a roster (first name, last name, date of birth) with a generated login and password; a teacher re-issues and prints passwords; such an account records no acceptance of the terms, and no parent is asked | certain on the code — the legal basis for school-created accounts: ask a lawyer |
| 4 | Privacy §6bis: « Aucune date de naissance n'est demandée »; §2: first and last name « facultatifs » | The school roster stores a date of birth; first and last name are required at registration | certain |
| 5 | CGU §2, §4bis, §5: collège and lycée, « de la 6e à la Terminale », interactive lessons, diagnostic sessions | 6e to 3e only; 59 lessons are announced and none exists yet; the diagnostic is switched off | certain |

## Conditions générales d'utilisation — the rest

- **§3 and privacy §7: « La réinitialisation autonome du mot de passe n'est pas disponible »** — it is: the forgotten-password and reset pages exist. *certain*
- **§9 and the mentions légales: « Chaque leçon comporte un bouton Signaler »** — no lesson exists, reporting is now reserved to the administrator and ambassadors, and a report may store a screenshot the text does not mention. *certain*
- **§12: deleting an account is not self-service** — true; but the administrator can now delete a student's or a teacher's account, which the text does not describe, and parent and school accounts are not covered. *likely incomplete*
- **§13: the consumer mediator « sera publié dès sa désignation »** — whether a free service needs one, and what is required before selling. *ask a lawyer*
- **§7: the right of withdrawal** — does not apply while nothing is sold; what is required the day payment opens. *ask a lawyer*
- **Not described anywhere**: teacher accounts, school accounts, the games space and its class leaderboards, the math lab, class sessions, activation codes, subscription requests handled by hand.
- **§1: the site's address** — the pages say `smarter-academy.fr`; this application's `sitemap.xml` and `robots.txt` still carry the Algerian domain, and the footer shows a personal e-mail address at a public mail provider instead of the contact address the pages give. *certain — these are defects of the application, to fix in step 1D, not of the pages*

## Politique de confidentialité — the rest

**Data the product collects that the table of §2 does not list** (*certain*): class membership and its consent dates;
the school, its roster and its report snapshots; generated student logins; parent links and parent accounts; study
time per day (active, idle, away, page exits); photos of handwritten answers with the teacher's annotations and
comments; math-lab files and documents; game runs, scores and answers; report screenshots; activation codes and
payment requests; the contact form's extra fields (phone, class, city, goal); the first and last name read from
Google at sign-in.

**Recipients and processors not named** (*certain they are missing*): teachers, schools and parents; the mail
provider; Google Fonts, loaded on every page (the visitor's IP address reaches Google — whether that needs a mention
or consent: *ask a lawyer*).

**Retention, §6** — the table has no row for answer photos (purged automatically after 12 months, while the text says
no automatic purge exists), games, study time, school snapshots, parent links, math-lab files, report screenshots; its
« compte gratuit / Premium » rows assume tiers that do not apply. *certain*

**§2: « La plateforme n'enregistre pas votre identifiant de navigateur complet »** — the push subscription of an
administrator stores it. *certain for that case*

**§5, cookies and local storage** — broadly right; not mentioned: the parent's pass kept 30 days on the parent's
device, notebook drafts, the queue of answers waiting to be sent, a pending class-join token. Stripe's cookies are
described though no Stripe flow can start. *likely*

**§6bis and §7, minors** — the page relies on « exécution du contrat » for users of 11 to 15; whether that basis
holds for a minor, and what applies when a school creates the account. *ask a lawyer*

**§4, §9: the host's server name, region and backup location** — cannot be checked from this repository. *to check
with the host*

## Mentions légales — the rest

- **The publisher's identity is written in four places**: the mentions légales, CGU §1 and §14, the privacy policy
  §1 and §11, and `apps/api/config/legal.php`. They agree today. A test now locks the mentions légales to
  `config/legal.php`; the two other pages are not locked and could drift. *certain*
- **The address published is a personal one.** Whether an individual entrepreneur may publish a domiciliation address
  instead. *ask a lawyer*
- **« La création d'un compte, gratuit ou Premium »**, « offres, abonnement, résiliation » — Premium and the
  subscription do not exist today. *certain*

## Checked and found correct

The versions (`config/legal.php` 2026-09-12 = « 12 septembre 2026 » on the pages; the server writes the version, the
browser only ticks a box); no card number is ever stored; no Google token is kept; the address is verified by a
signed, expiring link; no analytics, no advertising tracker, no AI provider in the API; answer photos lose their EXIF
and GPS data and are stored privately; the contact form exists and the four routes resolve; no date of birth is asked
when a student registers himself.

## What kind of change would settle it

The pages need a new version (a new date in `config/legal.php` and on the pages, together — the consent already
recorded keeps its old version): a free-service wording with the paid clauses kept for the day the switch opens; the
service described as it is (6e–3e, teachers, schools, parents); the privacy table, recipients and retention completed;
the clauses on accounts created by a school or a teacher. The two points on minors and on school-created accounts are
the ones to put to a lawyer before registration opens.

Not verified: what the production environment really sets (mailer, sessions); the host's details; the publisher's
registration numbers (taken as written); the data facts on parent links, games and retention were read in the code
by an agent and re-checked by hand only in part.
