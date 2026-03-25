<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShhVaultService
{
    private const CIPHER = 'aes-256-gcm';

    private const TAG_LENGTH = 16;

    private string $key;

    public function __construct()
    {
        $this->key = base64_decode((string) config('shhme.vault_encryption_key', ''));
    }

    public function createLink(User $sender, string $receiverIdentifier): string
    {
        $vaultRef = (string) Str::ulid();

        $encryptedSender = $this->encrypt((string) $sender->id);
        $encryptedReceiver = $this->encrypt($receiverIdentifier);

        DB::connection('vault')->table('vault_shh_links')->insert([
            'id' => $vaultRef,
            'encrypted_sender' => $encryptedSender,
            'encrypted_receiver' => $encryptedReceiver,
            'harassment_counter' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $vaultRef;
    }

    public function canSendShh(User $sender, string $receiverIdentifier): bool
    {
        $links = DB::connection('vault')->table('vault_shh_links')->get();

        foreach ($links as $link) {
            $decryptedSender = $this->decrypt($link->encrypted_sender);
            $decryptedReceiver = $this->decrypt($link->encrypted_receiver);

            if ($decryptedSender === (string) $sender->id && $decryptedReceiver === $receiverIdentifier) {
                if ($link->harassment_counter >= 3) {
                    return false;
                }
            }
        }

        return true;
    }

    public function getRole(string $vaultRef, User $user): string
    {
        $link = DB::connection('vault')->table('vault_shh_links')->find($vaultRef);

        if (! $link) {
            return 'none';
        }

        /** @var \stdClass $link */
        $senderId = $this->decrypt($link->encrypted_sender);
        $receiverId = $this->decrypt($link->encrypted_receiver);

        if ($senderId === (string) $user->id) {
            return 'sender';
        }

        if ($receiverId === (string) $user->id) {
            return 'receiver';
        }

        return 'none';
    }

    /**
     * @return array{senderId?: string, receiverId?: string}
     */
    public function getParticipantIds(string $vaultRef): array
    {
        $link = DB::connection('vault')->table('vault_shh_links')->find($vaultRef);

        if (! $link) {
            return [];
        }

        /** @var \stdClass $link */
        return [
            'senderId' => $this->decrypt($link->encrypted_sender),
            'receiverId' => $this->decrypt($link->encrypted_receiver),
        ];
    }

    public function incrementHarassmentCounter(string $vaultRef): void
    {
        DB::connection('vault')->table('vault_shh_links')
            ->where('id', $vaultRef)
            ->increment('harassment_counter');
    }

    public function deleteLink(string $vaultRef): void
    {
        DB::connection('vault')->table('vault_shh_links')
            ->where('id', $vaultRef)
            ->delete();
    }

    public function deleteAllLinks(string $userId): void
    {
        $links = DB::connection('vault')->table('vault_shh_links')->get();

        $idsToDelete = [];

        foreach ($links as $link) {
            $senderId = $this->decrypt($link->encrypted_sender);
            $receiverId = $this->decrypt($link->encrypted_receiver);

            if ($senderId === (string) $userId || $receiverId === (string) $userId) {
                $idsToDelete[] = $link->id;
            }
        }

        if (! empty($idsToDelete)) {
            DB::connection('vault')->table('vault_shh_links')
                ->whereIn('id', $idsToDelete)
                ->delete();
        }
    }

    private function encrypt(string $plaintext): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = random_bytes($ivLength);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_LENGTH
        );

        return $iv.$tag.$ciphertext;
    }

    private function decrypt(string $payload): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = substr($payload, 0, $ivLength);
        $tag = substr($payload, $ivLength, self::TAG_LENGTH);
        $ciphertext = substr($payload, $ivLength + self::TAG_LENGTH);

        $plaintext = openssl_decrypt(
            $ciphertext,
            self::CIPHER,
            $this->key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new \RuntimeException('Vault decryption failed');
        }

        return $plaintext;
    }
}
