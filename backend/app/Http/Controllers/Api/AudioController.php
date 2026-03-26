<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateAudioTeaser;
use App\Jobs\ProcessAudioFilter;
use App\Jobs\SendPushNotification;
use App\Models\Shh;
use App\Models\ShhAudio;
use App\Models\User;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AudioController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
    ) {}

    /**
     * Upload a voice note for a shh.
     */
    public function store(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        if ($shh->status !== 'active') {
            return response()->json([
                'error' => ['code' => 'SHH_INACTIVE', 'message' => __('messages.shh.inactive'), 'status' => 422],
            ], 422);
        }

        $request->validate([
            'audio' => ['required', 'file', 'mimetypes:audio/wav,audio/x-wav,audio/wave', 'max:2048'],
        ]);

        /** @var UploadedFile $audioFile */
        $audioFile = $request->file('audio');

        // Validate duration (max 30 seconds) — read WAV header
        $duration = $this->getWavDuration($audioFile->getRealPath());
        if ($duration === null || $duration > 30) {
            return response()->json([
                'error' => ['code' => 'AUDIO_TOO_LONG', 'message' => __('messages.audio.too_long'), 'status' => 422],
            ], 422);
        }

        $path = $audioFile->store("shh/{$shh->id}/audio/original", 'r2');

        $audio = ShhAudio::create([
            'shh_id' => $shh->id,
            'original_path' => $path,
            'duration_seconds' => (int) $duration,
            'sender_role' => $role,
            'moderation_status' => 'pending',
            'validated_by_sender' => false,
        ]);

        ProcessAudioFilter::dispatch($audio->id);

        return response()->json([
            'data' => [
                'id' => $audio->id,
                'duration_seconds' => $audio->duration_seconds,
                'moderation_status' => $audio->moderation_status,
                'validated_by_sender' => $audio->validated_by_sender,
                'created_at' => $audio->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Sender validates the audio after re-listening (mandatory step before send).
     */
    public function send(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        $request->validate([
            'audio_id' => ['required', 'string'],
        ]);

        $audio = ShhAudio::where('id', $request->input('audio_id'))
            ->where('shh_id', $shh->id)
            ->where('sender_role', $role)
            ->first();

        if (! $audio) {
            return response()->json([
                'error' => ['code' => 'AUDIO_NOT_FOUND', 'message' => __('messages.error.not_found'), 'status' => 404],
            ], 404);
        }

        if ($audio->validated_by_sender) {
            return response()->json([
                'data' => ['message' => __('messages.audio.sent')],
            ]);
        }

        if ($audio->moderation_status === 'blocked') {
            return response()->json([
                'error' => ['code' => 'AUDIO_BLOCKED', 'message' => __('messages.moderation.audio_blocked'), 'status' => 422],
            ], 422);
        }

        $audio->update(['validated_by_sender' => true]);

        // Dispatch push notification to the other participant
        $participants = $this->vaultService->getParticipantIds($shh->vault_ref);
        $receiverId = $role === 'sender' ? ($participants['receiverId'] ?? null) : ($participants['senderId'] ?? null);

        if ($receiverId) {
            SendPushNotification::dispatch(
                $receiverId,
                'Shh Me',
                __('messages.notification.audio_received'),
                'audio_received',
            );

            // Generate teaser for web preview
            if ($audio->filtered_path) {
                GenerateAudioTeaser::dispatch($audio->id);
            }
        }

        return response()->json([
            'data' => ['message' => __('messages.audio.sent')],
        ]);
    }

    /**
     * List audios for a shh. Only returns signed URLs for filtered audio (NEVER original).
     */
    public function index(Request $request, Shh $shh): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $role = $this->vaultService->getRole($shh->vault_ref, $user);

        if ($role === 'none') {
            return response()->json([
                'error' => ['code' => 'NOT_PARTICIPANT', 'message' => __('messages.shh.not_participant'), 'status' => 403],
            ], 403);
        }

        $audios = ShhAudio::where('shh_id', $shh->id)
            ->where('validated_by_sender', true)
            ->where('moderation_status', '!=', 'blocked')
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(20);

        $data = $audios->through(function (ShhAudio $audio) {
            $url = $audio->filtered_path
                ? Storage::disk('r2')->temporaryUrl($audio->filtered_path, now()->addMinutes(15))
                : null;

            return [
                'id' => $audio->id,
                'sender_role' => $audio->sender_role,
                'duration_seconds' => $audio->duration_seconds,
                'moderation_status' => $audio->moderation_status,
                'audio_url' => $url,
                'created_at' => $audio->created_at->toIso8601String(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Parse WAV header to get duration in seconds.
     */
    private function getWavDuration(string $filePath): ?float
    {
        try {
            $handle = fopen($filePath, 'rb');
            if (! $handle) {
                return null;
            }

            // Read WAV header (44 bytes minimum)
            $header = fread($handle, 44);
            fclose($handle);

            if (strlen($header) < 44) {
                return null;
            }

            // Byte rate is at offset 28 (4 bytes, little-endian)
            $byteRate = unpack('V', substr($header, 28, 4))[1];
            // Data size is at offset 40 (4 bytes, little-endian)
            $dataSize = unpack('V', substr($header, 40, 4))[1];

            if ($byteRate === 0) {
                return null;
            }

            return $dataSize / $byteRate;
        } catch (\Throwable) {
            return null;
        }
    }
}
