Bonjour{{ $firstName !== '' ? ' '.$firstName : '' }},

Bienvenue sur {{ config('app.name') }}. Pour activer votre compte, il reste à confirmer que cette adresse est bien la vôtre.

Ouvrez ce lien pour confirmer votre adresse :
{{ $url }}

Ce lien est valable {{ $hours }} h.

Vous n’êtes pas à l’origine de cette inscription ? Ignorez ce message : aucun compte n’est activé sans cette confirmation.

L’équipe {{ config('app.name') }}
{{ config('mail.contact_address') }}
