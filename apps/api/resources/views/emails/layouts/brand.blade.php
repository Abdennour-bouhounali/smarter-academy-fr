{{--
    LE GABARIT DES COURRIELS DE LA PLATEFORME — arabe, RTL, aux couleurs du logo.

    Écrit pour les clients de messagerie, pas pour un navigateur :
      - mise en page en TABLEAUX et styles EN LIGNE (Gmail ignore une partie
        de <style>, Outlook ignore flex et grid) ;
      - Cairo (texte) et Amiri (titre) via Google Fonts : Apple Mail, iOS et
        Thunderbird les chargent ; Gmail les ignore et retombe sur Tahoma /
        Arial, deux polices arabes présentes partout ;
      - le logo est un PNG servi par le frontend (`/email/logo.png`, généré par
        scripts/brand/build-logo.py) : Gmail n'affiche ni SVG ni WebP ;
      - le dégradé du bouton a une couleur pleine de repli (Outlook).

    Couleurs (docs/architecture/BRAND.md) : marine #0B2A6F et indigo #4F46E5
    (l'anneau et le cube du logo), bleu #3B82F6 → violet #8B5CF6 (l'accent
    élève de l'interface), cyan #22D3EE (la face haute du cube).

    Variables : $preheader, $title ; sections : content.
--}}
@php
    $font = "'Cairo', Tahoma, Arial, sans-serif";
    $serif = "'Amiri', 'Times New Roman', serif";
    $site = rtrim((string) config('app.frontend_url'), '/');
@endphp
<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>{{ $title }}</title>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;600;700&display=swap');
    body { margin: 0; padding: 0; }
    a { color: #3B82F6; }
    @media only screen and (max-width: 620px) {
        .card { width: 100% !important; border-radius: 0 !important; }
        .pad { padding-left: 24px !important; padding-right: 24px !important; }
    }
</style>
</head>
<body dir="rtl" style="margin:0; padding:0; background-color:#EEF2F7; font-family:{!! $font !!};">

{{-- Le texte d'aperçu, affiché par la boîte de réception à côté du sujet. --}}
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">{{ $preheader }}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="background-color:#EEF2F7;">
<tr>
<td align="center" style="padding:32px 12px;">

    <table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:600px; max-width:600px; background-color:#FFFFFF; border-radius:20px; overflow:hidden; box-shadow:0 8px 30px rgba(2,38,96,0.08);">

        {{-- Bande d'accent : bleu → violet, comme l'interface élève. --}}
        <tr>
            <td height="6" style="height:6px; line-height:6px; font-size:0; background-color:#3B82F6; background-image:linear-gradient(90deg,#3B82F6,#8B5CF6);">&nbsp;</td>
        </tr>

        {{-- Logo --}}
        <tr>
            <td align="center" style="padding:32px 40px 8px;">
                <a href="{{ $site }}" target="_blank" style="text-decoration:none;">
                    <img src="{{ $site }}/email/logo.png" width="200" alt="Smarter Academy" style="display:block; width:200px; max-width:200px; height:auto; border:0;">
                </a>
            </td>
        </tr>

        @yield('content')

        {{-- Pied de carte --}}
        <tr>
            <td class="pad" style="padding:0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="border-top:1px solid #E2E8F0; font-size:0; line-height:0;">&nbsp;</td></tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="pad" align="center" style="padding:20px 40px 32px; font-family:{!! $font !!}; font-size:13px; line-height:22px; color:#64748B;">
                <span style="color:#0B2A6F; font-weight:700;">Smarter Academy</span>
                — الرياضيات وفق البرنامج الرسمي الجزائري
                <br>
                سؤال؟ اكتب إلينا على
                <a href="mailto:contact@smarter-academy.com" style="color:#4F46E5; text-decoration:none; font-weight:600;">contact@smarter-academy.com</a>
            </td>
        </tr>
    </table>

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="card" style="width:600px; max-width:600px;">
        <tr>
            <td align="center" style="padding:20px 24px 0; font-family:{!! $font !!}; font-size:12px; line-height:20px; color:#94A3B8;">
                © {{ date('Y') }} Smarter Academy. جميع الحقوق محفوظة.
                <br>
                <a href="{{ $site }}" target="_blank" style="color:#94A3B8; text-decoration:underline;">smarter-academy.com</a>
            </td>
        </tr>
    </table>

</td>
</tr>
</table>
</body>
</html>
