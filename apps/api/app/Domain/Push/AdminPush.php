<?php

namespace App\Domain\Push;

use App\Models\BookMessage;
use App\Models\BookOrder;
use App\Models\Contact;
use App\Models\PushSubscription;
use App\Models\StudentReport;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Support\Carbon;
use Throwable;

/**
 * Les notifications du tableau de bord sur le téléphone (Web Push) — BOOKS_STORE.md §6quater.
 *
 * Un événement = un SUJET (`TOPICS`) avec son public : l'administrateur reçoit tout ; le
 * « مسيّر المكتبة » ne reçoit que la librairie. Chaque appareil choisit ses sujets
 * (`push_subscriptions.topics`, NULL = tous ceux de son rôle).
 *
 * Écran verrouillé : ce qui s'est passé, une catégorie, un compte, un montant — JAMAIS le nom,
 * le téléphone, l'adresse ou le message d'une personne (des élèves mineurs y figurent).
 *
 * Tout part APRÈS la réponse (`later()`) : une inscription, une commande ou un signalement ne
 * dépend jamais de l'envoi, et une panne d'envoi est absorbée.
 */
class AdminPush
{
    public const TOPICS = [
        'book_order' => [User::ROLE_ADMIN, User::ROLE_BOOK_MANAGER],
        'book_message' => [User::ROLE_ADMIN, User::ROLE_BOOK_MANAGER],
        'new_student' => [User::ROLE_ADMIN],
        'new_teacher' => [User::ROLE_ADMIN],
        'contact_message' => [User::ROLE_ADMIN],
        'student_report' => [User::ROLE_ADMIN],
        'subscription_request' => [User::ROLE_ADMIN],
    ];

    private const REPORT_LABELS = [
        StudentReport::CATEGORY_MATH_ERROR => 'خطأ رياضي',
        StudentReport::CATEGORY_MANIPULATION => 'النشاط لا يعمل',
        StudentReport::CATEGORY_UNCLEAR => 'سؤال غير واضح',
        StudentReport::CATEGORY_ANSWER => 'مشكل في الإجابة أو التصحيح',
        StudentReport::CATEGORY_DISPLAY => 'مشكل في العرض',
        StudentReport::CATEGORY_TYPO => 'خطأ في الكتابة',
        StudentReport::CATEGORY_OTHER => 'أخرى',
    ];

    private const BOOK_SUBJECTS = [
        'general' => 'سؤال عام', 'feedback' => 'ملاحظات حول الكتاب', 'support' => 'دعم تقني',
        'mentoring' => 'حصة إرشاد', 'teacher_collab' => 'تعاون مع الأساتذة',
        'bulk_purchase' => 'شراء بالجملة', 'other' => 'آخر',
    ];

    public function __construct(private PushSender $sender) {}

    /** Les sujets qu'un rôle peut recevoir. @return array<int, string> */
    public static function topicsFor(string $role): array
    {
        return array_keys(array_filter(self::TOPICS, fn (array $roles) => in_array($role, $roles, true)));
    }

    /** Programme l'envoi APRÈS la réponse. Ne lève jamais. */
    public static function later(string $topic, int $id): void
    {
        try {
            dispatch(fn () => app(self::class)->send($topic, $id))->afterResponse();
        } catch (Throwable) {
            // L'événement (inscription, commande…) prime sur sa notification.
        }
    }

    public function send(string $topic, int $id): void
    {
        if (! isset(self::TOPICS[$topic]) || ! $this->sender->enabled()) {
            return;
        }
        $payload = $this->payload($topic, $id);
        if ($payload === null) {
            return;
        }
        $this->deliver($this->recipients($topic)->get(), $payload);
    }

    /** @return array{title:string, body:string, url:string, tag:string}|null */
    public function payload(string $topic, int $id): ?array
    {
        return match ($topic) {
            'book_order' => ($o = BookOrder::find($id)) ? self::orderPayload($o) : null,
            'book_message' => ($m = BookMessage::find($id)) ? [
                'title' => 'رسالة جديدة عن الكتب',
                'body' => 'الموضوع: '.(self::BOOK_SUBJECTS[$m->subject] ?? $m->subject),
                'url' => '/admin/livres/messages',
                'tag' => 'book-message-'.$m->id,
            ] : null,
            'new_student', 'new_teacher' => $this->signupPayload($topic, $id),
            'contact_message' => Contact::find($id) ? [
                'title' => 'رسالة جديدة',
                'body' => 'وصلت رسالة من صفحة «تواصل معنا».',
                'url' => '/admin/systeme/messages',
                'tag' => 'contact-'.$id,
            ] : null,
            'student_report' => ($r = StudentReport::find($id)) ? [
                'title' => 'بلاغ جديد',
                'body' => (self::REPORT_LABELS[$r->category] ?? $r->category).($r->lesson_code ? ' · '.$r->lesson_code : ''),
                'url' => '/admin/signalements/'.$r->id,
                'tag' => 'report-'.$r->id,
            ] : null,
            'subscription_request' => ($q = SubscriptionRequest::with('plan')->find($id)) ? [
                'title' => 'طلب اشتراك جديد',
                'body' => trim(($q->plan?->name ?? '').($q->requested_student_seats ? ' · '.$q->requested_student_seats.' مقعد' : ''), ' ·') ?: 'طلب عرض جديد',
                'url' => '/admin/offres/demandes',
                'tag' => 'subscription-request-'.$q->id,
            ] : null,
            default => null,
        };
    }

    /** @return array{title:string, body:string, url:string, tag:string} */
    public static function orderPayload(BookOrder $order): array
    {
        // « الجزائر - Alger » → « الجزائر » (le libellé enregistré garde les deux noms).
        $wilaya = trim(explode(' - ', (string) $order->wilaya)[0]);
        $copies = $order->quantity === 1 ? 'نسخة واحدة' : $order->quantity.' نسخ';
        // Argent : « دج » collé, sans espace de milliers (règle de la plateforme).
        $amount = ($order->unit_price * $order->quantity).'دج';

        return [
            'title' => 'طلب جديد · '.$order->reference,
            'body' => "{$wilaya} · {$copies} · {$amount}",
            'url' => '/admin/livres/commandes/'.$order->id,
            'tag' => 'book-order-'.$order->id,
        ];
    }

    /**
     * Inscriptions : UNE notification par type, REMPLACÉE à chaque nouvelle (même `tag`) et qui
     * compte celles du jour (heure d'Alger) — une vague d'inscriptions ne remplit pas l'écran.
     */
    private function signupPayload(string $topic, int $id): ?array
    {
        $user = User::find($id);
        $role = $topic === 'new_teacher' ? User::ROLE_TEACHER : User::ROLE_STUDENT;
        if (! $user || $user->role !== $role) {
            return null;
        }
        $today = User::where('role', $role)
            ->where('created_at', '>=', Carbon::now('Africa/Algiers')->startOfDay()->utc())
            ->count();
        $teacher = $role === User::ROLE_TEACHER;

        return [
            'title' => $teacher ? 'أستاذ جديد' : 'تلميذ جديد',
            'body' => ($teacher ? 'تسجيلات الأساتذة اليوم: ' : 'تسجيلات التلاميذ اليوم: ').$today,
            'url' => ($teacher ? '/admin/enseignants/' : '/admin/eleves/').$user->id,
            'tag' => $topic,
        ];
    }

    /** Une notification d'essai vers les appareils d'UN compte. Rend leur nombre. */
    public function test(User $user): int
    {
        $subs = PushSubscription::where('user_id', $user->id)->get();
        $this->deliver($subs, [
            'title' => 'الإشعارات تعمل',
            'body' => 'ستصلك هنا رسالة عند كل جديد في المنصّة.',
            'url' => '/admin',
            'tag' => 'push-test',
        ]);

        return $subs->count();
    }

    private function recipients(string $topic)
    {
        return PushSubscription::query()
            ->whereHas('user', fn ($q) => $q
                ->whereIn('role', self::TOPICS[$topic])
                ->where('account_status', User::STATUS_ACTIVE))
            ->where(fn ($q) => $q->whereNull('topics')->orWhereJsonContains('topics', $topic));
    }

    private function deliver($subs, array $payload): void
    {
        if ($subs->isEmpty()) {
            return;
        }
        $expired = $this->sender->send($subs, $payload);
        if ($expired) {
            PushSubscription::whereIn('endpoint_hash', array_map([PushSubscription::class, 'hashOf'], $expired))->delete();
        }
    }
}
