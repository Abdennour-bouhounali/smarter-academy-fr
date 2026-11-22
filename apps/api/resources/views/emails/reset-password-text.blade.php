Bonjour{{ $firstName !== '' ? ' '.$firstName : '' }},

Nous avons reçu une demande de réinitialisation du mot de passe de votre compte {{ config('app.name') }}.

Ouvrez ce lien pour choisir un nouveau mot de passe :
{{ $url }}

Ce lien est valable {{ $minutes }} minutes et ne sert qu’une fois.

Vous n’avez rien demandé ? Ignorez ce message : votre mot de passe reste le même.

L’équipe {{ config('app.name') }}
{{ config('mail.contact_address') }}
