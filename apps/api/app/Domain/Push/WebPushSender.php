<?php

namespace App\Domain\Push;

use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

/**
 * L'envoi réel (protocole Web Push chiffré, clés VAPID de `config/services.php › webpush`).
 * Une panne d'envoi n'interrompt JAMAIS une commande : elle est journalisée.
 */
class WebPushSender implements PushSender
{
    public function enabled(): bool
    {
        return filled(config('services.webpush.public_key')) && filled(config('services.webpush.private_key'));
    }

    public function publicKey(): ?string
    {
        return $this->enabled() ? config('services.webpush.public_key') : null;
    }

    public function send(iterable $subscriptions, array $payload): array
    {
        if (! $this->enabled()) {
            return [];
        }

        $expired = [];
        try {
            $webPush = new WebPush(['VAPID' => [
                'subject' => config('services.webpush.subject') ?: config('app.url'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ]], ['TTL' => 3600, 'urgency' => 'high']);

            $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            foreach ($subscriptions as $sub) {
                $webPush->queueNotification(Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => 'aes128gcm',
                ]), $json);
            }

            foreach ($webPush->flush() as $report) {
                if ($report->isSubscriptionExpired()) {
                    $expired[] = $report->getEndpoint();
                } elseif (! $report->isSuccess()) {
                    Log::warning('webpush.failed', ['reason' => $report->getReason()]);
                }
            }
        } catch (Throwable $e) {
            Log::warning('webpush.error', ['message' => $e->getMessage()]);
        }

        return $expired;
    }
}
