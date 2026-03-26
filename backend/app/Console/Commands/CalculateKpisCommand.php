<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\AdminConfig;
use App\Models\Shh;
use App\Models\ShhClue;
use App\Models\ShhConnect;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CalculateKpisCommand extends Command
{
    protected $signature = 'analytics:calculate-kpis';

    protected $description = 'Calculate daily KPI metrics and store them in admin_configs';

    public function handle(): int
    {
        $now = now();
        $todayStart = $now->copy()->startOfDay();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sevenDaysAgo = $now->copy()->subDays(7);

        // DAU — users active today
        $dau = User::where('last_active_at', '>=', $todayStart)->count();

        // MAU — users active in last 30 days
        $mau = User::where('last_active_at', '>=', $thirtyDaysAgo)->count();

        // Total shh sent (all time)
        $totalShhSent = Shh::count();

        // Total reveals (all time) — connects represent reveals
        $totalReveals = ShhConnect::count();

        // K-factor (7-day rolling): referred users / total users
        $totalUsersLast7d = User::where('created_at', '>=', $sevenDaysAgo)->count();
        $referredUsersLast7d = User::where('created_at', '>=', $sevenDaysAgo)
            ->whereNotNull('referred_by')
            ->count();
        $kFactor = $totalUsersLast7d > 0
            ? round($referredUsersLast7d / $totalUsersLast7d, 4)
            : 0;

        // Audio send rate: shh with at least one audio / total shh
        $shhWithAudio = DB::table('shh_audio')
            ->distinct('shh_id')
            ->count('shh_id');
        $audioSendRate = $totalShhSent > 0
            ? round($shhWithAudio / $totalShhSent, 4)
            : 0;

        // Question answer rate: answered clues / sent clues
        $totalCluesSent = ShhClue::whereNotNull('question_sent_at')->count();
        $totalCluesAnswered = ShhClue::whereNotNull('answer_received_at')->count();
        $questionAnswerRate = $totalCluesSent > 0
            ? round($totalCluesAnswered / $totalCluesSent, 4)
            : 0;

        // Fallback rate: clues where source != 'ai' / total clues with a source
        $totalCluesWithSource = ShhClue::whereNotNull('clue_source')->count();
        $fallbackClues = ShhClue::whereNotNull('clue_source')
            ->where('clue_source', '!=', 'ai')
            ->count();
        $fallbackRate = $totalCluesWithSource > 0
            ? round($fallbackClues / $totalCluesWithSource, 4)
            : 0;

        $kpis = [
            'dau' => $dau,
            'mau' => $mau,
            'total_shh_sent' => $totalShhSent,
            'total_reveals' => $totalReveals,
            'k_factor' => $kFactor,
            'audio_send_rate' => $audioSendRate,
            'question_answer_rate' => $questionAnswerRate,
            'fallback_rate' => $fallbackRate,
            'calculated_at' => $now->toIso8601String(),
        ];

        AdminConfig::updateOrCreate(
            ['key' => 'kpis'],
            [
                'value' => $kpis,
                'description' => 'Daily KPI metrics (auto-calculated)',
            ],
        );

        $this->info('KPIs calculated and stored.');
        $this->table(
            ['Metric', 'Value'],
            collect($kpis)->map(fn ($value, $key) => [$key, (string) $value])->values()->toArray(),
        );

        Log::info('CalculateKpisCommand: Complete', $kpis);

        return self::SUCCESS;
    }
}
