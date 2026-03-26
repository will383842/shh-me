<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('shh:expire')->everyFiveMinutes();
Schedule::command('purge:gps-data')->dailyAt('03:00');

// Sprint 3-4: Clue system crons
Schedule::command('clue:send-morning-questions')->hourly();
Schedule::command('clue:send-afternoon-clues')->everyThirtyMinutes();

// Sprint 3-4: Connect expiration
Schedule::command('connect:expire')->hourly();

// Sprint 5: Relance 11h nudge for unanswered clue questions
Schedule::command('clue:send-relance-11h')->hourly();

// Sprint 5: Daily KPI calculation
Schedule::command('analytics:calculate-kpis')->dailyAt('00:00');
