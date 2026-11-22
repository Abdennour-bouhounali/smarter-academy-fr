<?php

namespace App\Domain\Push;

use App\Models\PushSubscription;

/**
 * Envoie une notification Web Push à des appareils. Une interface pour que les
 * tests remplacent l'envoi réel (aucun appel réseau en test).
 */
interface PushSender
{
    /** Les clés VAPID sont-elles configurées ? Sinon rien n'est envoyé. */
    public function enabled(): bool;

    public function publicKey(): ?string;

    /**
     * @param  iterable<PushSubscription>  $subscriptions
     * @param  array{title:string, body:string, url:string, tag?:string}  $payload
     * @return array<int, string> les `endpoint` EXPIRÉS (404/410) — l'appelant les supprime
     */
    public function send(iterable $subscriptions, array $payload): array;
}
