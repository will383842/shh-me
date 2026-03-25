<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('shh:expire')->everyFiveMinutes();
Schedule::command('purge:gps-data')->dailyAt('03:00');
