<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Shh;
use App\Models\ShhAudio;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class WebPreviewController extends Controller
{
    /**
     * Public web preview page for a shh (no auth required).
     * Shows ECG animation, timer, audio teaser (3s), expiration countdown, store buttons.
     */
    public function show(string $anonymousId): View
    {
        $shh = Shh::where('anonymous_id', $anonymousId)->first();

        if (! $shh) {
            abort(404);
        }

        $teaserUrl = null;

        // Find the latest validated audio with a teaser
        $audio = ShhAudio::where('shh_id', $shh->id)
            ->where('validated_by_sender', true)
            ->where('moderation_status', '!=', 'blocked')
            ->whereNotNull('teaser_path')
            ->orderBy('created_at', 'desc')
            ->first();

        if ($audio && $audio->teaser_path) {
            $teaserUrl = Storage::disk('r2')->temporaryUrl($audio->teaser_path, now()->addMinutes(30));
        }

        return view('shh.preview', [
            'shh' => $shh,
            'bpm' => $shh->bpm_symbolic,
            'expiresAt' => $shh->expires_at->toIso8601String(),
            'isExpired' => $shh->status === 'expired',
            'teaserUrl' => $teaserUrl,
        ]);
    }
}
