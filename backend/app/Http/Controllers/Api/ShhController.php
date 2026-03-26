<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShhRequest;
use App\Http\Resources\ShhResource;
use App\Jobs\GenerateBlurPhotos;
use App\Models\Shh;
use App\Models\ShhMessage;
use App\Models\ShhPhoto;
use App\Models\User;
use App\Models\UserBlock;
use App\Services\BpmService;
use App\Services\ShhVaultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ShhController extends Controller
{
    public function __construct(
        private readonly ShhVaultService $vaultService,
        private readonly BpmService $bpmService,
    ) {}

    public function store(StoreShhRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $contactIdentifier = $request->validated('contact_identifier');

        // BUG 3: Prevent self-shh
        if ($contactIdentifier === (string) $user->id) {
            return response()->json([
                'error' => ['code' => 'SELF_SHH_NOT_ALLOWED', 'message' => __('messages.error.forbidden'), 'status' => 422],
            ], 422);
        }

        if (! $this->vaultService->canSendShh($user, $contactIdentifier)) {
            return response()->json([
                'error' => [
                    'code' => 'shh_blocked',
                    'message' => __('messages.shh.blocked'),
                    'status' => 403,
                ],
            ], 403);
        }

        // BUG 2: Check if either user has blocked the other
        $isBlocked = UserBlock::where(function ($q) use ($user, $contactIdentifier) {
            $q->where('blocker_id', $contactIdentifier)
                ->where('blocked_id', $user->id);
        })->orWhere(function ($q) use ($user, $contactIdentifier) {
            $q->where('blocker_id', $user->id)
                ->where('blocked_id', $contactIdentifier);
        })->exists();

        if ($isBlocked) {
            return response()->json([
                'error' => ['code' => 'USER_BLOCKED', 'message' => __('messages.error.forbidden'), 'status' => 403],
            ], 403);
        }

        // Max 10 active shh per user (check via Vault roles)
        $activeShhCount = Shh::where('status', 'active')
            ->get()
            ->filter(fn (Shh $shh) => $this->vaultService->getRole($shh->vault_ref, $user) !== 'none')
            ->count();
        if ($activeShhCount >= 10) {
            return response()->json([
                'error' => ['code' => 'MAX_ACTIVE_SHH', 'message' => __('messages.shh.max_per_day'), 'status' => 422],
            ], 422);
        }

        $shh = DB::transaction(function () use ($user, $contactIdentifier, $request) {
            $vaultRef = $this->vaultService->createLink($user, $contactIdentifier);
            $bpm = $this->bpmService->generate();
            $hour = (int) now()->format('G');

            $hasPhoto = $request->hasFile('photo');

            $shh = Shh::create([
                'vault_ref' => $vaultRef,
                'status' => 'active',
                'bpm_symbolic' => $bpm,
                'bpm_hour' => $hour,
                'exchange_count' => 0,
                'has_photo' => $hasPhoto,
                'sender_first_word' => $request->validated('sender_first_word'),
                'expires_at' => now()->addHours((int) config('shhme.shh_expiration_hours', 48)),
            ]);

            if ($hasPhoto) {
                /** @var UploadedFile $photo */
                $photo = $request->file('photo');
                $path = $photo->store("shh/{$shh->id}/original", 'r2');

                $shhPhoto = ShhPhoto::create([
                    'shh_id' => $shh->id,
                    'original_path' => $path,
                    'blur_paths' => [],
                    'blur_levels_generated' => false,
                ]);

                GenerateBlurPhotos::dispatch($shhPhoto->shh_id, $shhPhoto->original_path);
            }

            $firstMessage = $request->validated('first_message');
            if ($firstMessage) {
                ShhMessage::create([
                    'shh_id' => $shh->id,
                    'content_encrypted' => $firstMessage,
                    'sender_role' => 'sender',
                    'moderation_status' => 'pending',
                ]);

                $shh->increment('exchange_count');
            }

            return $shh;
        });

        return response()->json([
            'data' => new ShhResource($shh->load('photo')),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $shhList = Shh::query()
            ->whereIn('vault_ref', function ($query) {
                $query->select('id')
                    ->from('vault_shh_links');
                // Note: vault filtering done in-memory due to encryption
            })
            ->withCount('messages')
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(20);

        return response()->json(
            ShhResource::collection($shhList)->response()->getData(true)
        );
    }

    public function show(Request $request, Shh $shh): JsonResponse
    {
        $shh->load('photo');
        $shh->loadCount('messages');

        return response()->json([
            'data' => new ShhResource($shh),
        ]);
    }
}
