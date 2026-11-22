/**
 * Les textes du panneau « Notifications » (BOOKS_STORE.md §6quater). Module local (pas un
 * namespace i18n) : il ne sert qu'au tableau de bord, chargé paresseusement.
 */
export const P = {
  title: 'Notifications sur votre téléphone',
  off: 'Activez-les pour recevoir un message sur cet appareil à chaque nouveauté de la plateforme, même site fermé.',
  on: 'Activées sur cet appareil. Choisissez ce que vous recevez :',
  enable: 'Activer les notifications',
  disable: 'Désactiver sur cet appareil',
  test: 'Envoyer une notification de test',
  testSent: 'Notification de test envoyée : elle doit apparaître d’ici quelques secondes.',
  saved: 'Votre choix est enregistré.',
  denied: 'Le navigateur bloque les notifications pour ce site. Ouvrez les paramètres du site (le cadenas à côté de l’adresse), autorisez les notifications, puis réessayez.',
  failed: 'Impossible d’activer les notifications sur cet appareil. Vérifiez la connexion à Internet et utilisez Chrome, puis réessayez.',
  unsupported: 'Ce navigateur ne prend pas en charge les notifications. Sur téléphone, utilisez Chrome (Android).',
  iosInstall: 'Sur iPhone : ajoutez d’abord le site à l’écran d’accueil (bouton Partager, puis « Sur l’écran d’accueil »), ouvrez-le depuis l’icône et activez les notifications depuis là.',
  notConfigured: 'Les notifications ne sont pas encore activées sur le serveur (clés VAPID absentes).',
  install: 'Pour ajouter le site à l’écran d’accueil : dans Chrome, touchez ⋮ puis « Ajouter à l’écran d’accueil » ou « Installer l’application ».',
  installButton: 'Ajouter à l’écran d’accueil',
  devices: (n) => (n === 1 ? '1 appareil activé pour votre compte' : `${n} appareils activés pour votre compte`),
  // Un libellé par sujet du serveur (AdminPush::TOPICS) ; un sujet inconnu garde sa clé.
  topics: {
    book_order: 'Commandes de livres',
    book_message: 'Messages de la page des livres',
    new_student: 'Inscription d’un élève',
    new_teacher: 'Inscription d’un professeur',
    contact_message: 'Messages « Nous contacter »',
    student_report: 'Signalements',
    subscription_request: 'Demandes d’abonnement',
  },
};
