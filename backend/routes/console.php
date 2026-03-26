<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('shh:expire')->everyFiveMinutes();
Schedule::command('purge:gps-data')->dailyAt('03:00');

// Sprint 3-4: Clue system crons
Schedule::command('clue:send-morning-questions')->hourly();
Schedule::command('clue:send-afternoon-clues')->everyThirtyMinutes();

// Sprint 3-4: Connect expiration
Schedule::command('connect:expire')->hourly();
