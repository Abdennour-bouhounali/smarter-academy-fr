{{--
    « إعادة تعيين كلمة المرور » — voir ResetPasswordNotification.
    Variables : $firstName (peut être vide), $url, $minutes.
--}}
@extends('emails.layouts.brand', [
    'title' => 'إعادة تعيين كلمة المرور',
    'preheader' => 'اختر كلمة مرور جديدة لحسابك في Smarter Academy — الرابط صالح لمدة '.$minutes.' دقيقة.',
])

@php
    $font = "'Cairo', Tahoma, Arial, sans-serif";
    $serif = "'Amiri', 'Times New Roman', serif";
@endphp

@section('content')
        {{-- Titre --}}
        <tr>
            <td class="pad" align="center" style="padding:16px 40px 4px; font-family:{!! $serif !!}; font-size:30px; line-height:44px; font-weight:700; color:#0B2A6F;">
                إعادة تعيين كلمة المرور
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
            <td class="pad" align="right" dir="rtl" style="padding:28px 40px 0; font-family:{!! $font !!}; font-size:17px; line-height:30px; color:#1E293B; text-align:right;">
                <strong style="color:#0B2A6F;">السلام عليكم{{ $firstName !== '' ? ' '.$firstName : '' }}،</strong>
                <br>
                تلقّينا طلبًا لإعادة تعيين كلمة مرور حسابك في Smarter Academy. اضغط على الزرّ لاختيار كلمة مرور جديدة.
            </td>
        </tr>

        {{-- Bouton --}}
        <tr>
            <td align="center" style="padding:32px 40px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" bgcolor="#3B82F6" style="border-radius:14px; background-color:#3B82F6; background-image:linear-gradient(135deg,#3B82F6,#8B5CF6); box-shadow:0 6px 18px rgba(59,130,246,0.35);">
                            <a href="{{ $url }}" target="_blank" style="display:inline-block; padding:15px 44px; font-family:{!! $font !!}; font-size:18px; line-height:26px; font-weight:700; color:#FFFFFF; text-decoration:none; border-radius:14px;">
                                اختيار كلمة مرور جديدة
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Validité --}}
        <tr>
            <td class="pad" style="padding:24px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl">
                    <tr>
                        <td dir="rtl" style="padding:14px 18px; background-color:#EEF2FF; border-right:4px solid #4F46E5; border-radius:10px; font-family:{!! $font !!}; font-size:15px; line-height:26px; color:#0F5F57; text-align:right;">
                            ⏳ هذا الرابط صالح لمدة <strong>{{ $minutes }} دقيقة</strong> ويُستعمل مرة واحدة. بعدها، اطلب رابطًا جديدًا من صفحة تسجيل الدخول.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Lien de secours --}}
        <tr>
            <td class="pad" dir="rtl" style="padding:24px 40px 0; font-family:{!! $font !!}; font-size:14px; line-height:24px; color:#64748B; text-align:right;">
                لم يعمل الزرّ؟ انسخ هذا الرابط والصقه في متصفّحك:
            </td>
        </tr>
        <tr>
            <td class="pad" style="padding:8px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td dir="ltr" style="padding:12px 14px; background-color:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; font-family:Consolas, 'Courier New', monospace; font-size:12px; line-height:19px; text-align:left; word-break:break-all;">
                            <a href="{{ $url }}" target="_blank" style="color:#3B82F6; text-decoration:none; word-break:break-all;">{{ $url }}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        {{-- Sécurité --}}
        <tr>
            <td class="pad" dir="rtl" style="padding:24px 40px 28px; font-family:{!! $font !!}; font-size:14px; line-height:24px; color:#64748B; text-align:right;">
                لم تطلب هذا؟ تجاهل هذه الرسالة ببساطة: تبقى كلمة مرورك كما هي ولن يتغيّر شيء.
                <br>
                <span style="color:#0B2A6F; font-weight:600;">إلى اللقاء قريبًا، فريق Smarter Academy</span>
            </td>
        </tr>
@endsection
