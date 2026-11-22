<?php

/**
 * LES INSCRIPTIONS — ouvertes ou fermées (propriétaire, 2026-11-20 : « stop the register and display a message that
 * says the platform is under test, enter your phone number to contact you when we open it »).
 *
 * `open` = false : aucun compte ne naît par l'inscription publique (formulaire, Google). La page d'inscription montre
 * le message et recueille un numéro de téléphone (POST /waitlist → `contacts`, lu dans « رسائل التواصل » de l'admin).
 * Les comptes existants se connectent comme avant. `class_links` : un élève invité par le LIEN de la classe de son
 * enseignant (jeton valide, classe qui accepte encore des membres) peut toujours créer son compte — c'est le chemin des
 * élèves qui essaient la plateforme pendant le test. Mettre REGISTRATION_CLASS_LINKS=false le ferme aussi.
 *
 * Ces deux valeurs d'environnement ne sont plus que les DÉFAUTS (propriétaire, 2026-11-21) : dès que l'administrateur
 * règle l'interrupteur dans « التسجيل » du tableau de bord (PATCH /admin/registration), la ligne `registration` de
 * `platform_settings` l'emporte. Le seul lecteur de ce fichier est App\Domain\Registration\RegistrationGate.
 */
return [
    'open' => (bool) env('REGISTRATION_OPEN', false),
    'class_links' => (bool) env('REGISTRATION_CLASS_LINKS', true),
];
