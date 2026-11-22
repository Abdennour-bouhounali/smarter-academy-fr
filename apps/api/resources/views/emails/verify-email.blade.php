{{--
    « Confirmez votre adresse e-mail » — voir VerifyEmailAddress.
    Variables : $firstName (peut être vide), $url, $hours.
--}}
@extends('emails.layouts.brand', [
    'title' => 'Confirmez votre adresse e-mail',
    'preheader' => 'Dernière étape pour activer votre compte '.config('app.name').' : ce lien est valable '.$hours.' h.',
])

@php
    $font = "'Inter', Helvetica, Arial, sans-serif";
    $display = "'Space Grotesk', 'Inter', Helvetica, Arial, sans-serif";
@endphp

@section('content')
        {{-- Titre --}}
        <tr>
            <td class="pad" align="center" style="padding:16px 40px 4px; font-family:{!! $display !!}; font-size:28px; line-height:38px; font-weight:700; color:#0B2A6F;">
                Confirmez votre adresse e-mail
            </td>
        </tr>
        <tr>
            <td align="center" style="padding:4px 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td width="48" height="3" style="width:48px; height:3px; line-height:3px; font-size:0; background-color:#22D3EE; border-radius:3px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Message --}}
        <tr>
            <td class="pad" align="left" style="padding:28px 40px 0; font-family:{!! $font !!}; font-size:16px; line-height:28px; color:#1E293B; text-align:left;">
                <strong style="color:#0B2A6F;">Bonjour{{ $firstName !== '' ? ' '.$firstName : '' }},</strong>
                <br>
                Bienvenue sur {{ config('app.name') }}. Pour activer votre compte, il reste à confirmer que cette adresse est bien la vôtre.
            </td>
        </tr>

        {{-- Bouton --}}
        <tr>
            <td align="center" style="padding:32px 40px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" bgcolor="#3B82F6" style="border-radius:14px; background-color:#3B82F6; background-image:linear-gradient(135deg,#3B82F6,#8B5CF6); box-shadow:0 6px 18px rgba(59,130,246,0.35);">
                            <a href="{{ $url }}" target="_blank" style="display:inline-block; padding:15px 44px; font-family:{!! $font !!}; font-size:17px; line-height:26px; font-weight:700; color:#FFFFFF; text-decoration:none; border-radius:14px;">
                                Confirmer mon adresse
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Validité --}}
        <tr>
            <td class="pad" style="padding:24px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding:14px 18px; background-color:#EEF2FF; border-left:4px solid #4F46E5; border-radius:10px; font-family:{!! $font !!}; font-size:15px; line-height:26px; color:#0F5F57; text-align:left;">
                            Ce lien est valable <strong>{{ $hours }} h</strong>. Passé ce délai, demandez-en un nouveau depuis la page de confirmation.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Lien de secours --}}
        <tr>
            <td class="pad" style="padding:24px 40px 0; font-family:{!! $font !!}; font-size:14px; line-height:24px; color:#64748B; text-align:left;">
                Le bouton ne fonctionne pas ? Copiez ce lien et collez-le dans votre navigateur :
            </td>
        </tr>
        <tr>
            <td class="pad" style="padding:8px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding:12px 14px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; font-family:Consolas, 'Courier New', monospace; font-size:12px; line-height:19px; text-align:left; word-break:break-all;">
                            <a href="{{ $url }}" target="_blank" style="color:#3B82F6; text-decoration:none; word-break:break-all;">{{ $url }}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Sécurité --}}
        <tr>
            <td class="pad" style="padding:24px 40px 28px; font-family:{!! $font !!}; font-size:14px; line-height:24px; color:#64748B; text-align:left;">
                Vous n’êtes pas à l’origine de cette inscription ? Ignorez ce message : aucun compte n’est activé sans cette confirmation.
                <br>
                <span style="color:#0B2A6F; font-weight:600;">L’équipe {{ config('app.name') }}</span>
            </td>
        </tr>
@endsection
