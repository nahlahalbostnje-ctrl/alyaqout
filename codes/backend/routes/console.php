<?php

use App\Console\Commands\SendDailyReports;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// يرسل التقارير اليومية للآباء كل يوم الساعة 8 مساءً
Schedule::command('yaqoot:daily-reports')->dailyAt('20:00');
