<?php

/**
 * Les réglages TECHNIQUES de « فضاء الإدارة » (docs/architecture/SCHOOL_ADMIN_SPACE.md).
 */
return [
    // Le domaine des « معرّف الدخول » que l'établissement génère pour un élève
    // sans adresse (s12.k7q2mx@eleve.smarter-academy.com). Aucun courriel n'y
    // part jamais (User::routeNotificationForMail).
    'student_login_domain' => env('SCHOOL_STUDENT_LOGIN_DOMAIN', 'eleve.smarter-academy.com'),

    // Lignes au plus par import (une liste de classe, avec de la marge).
    'roster_max_rows' => 60,
];
