<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\Settings;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendDailyReports extends Command
{
    protected $signature   = 'yaqoot:daily-reports';
    protected $description = 'إرسال تقارير يومية لأولياء الأمور عبر الإشعارات';

    public function __construct(private NotificationService $notif)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $today = now()->toDateString();

        $parents = User::where('role', 'parent')->where('is_active', true)->get();

        foreach ($parents as $parent) {
            $children = User::where('parent_id', $parent->id)->get(['id', 'name']);
            if ($children->isEmpty()) continue;

            $lines = [];
            foreach ($children as $child) {
                $lines[] = "• {$child->name}";
            }

            $body = "تقرير اليوم {$today}:\n" . implode("\n", $lines)
                  . "\n\nتابع تقدم أبنائك عبر منصة ياقوت 📊";

            $this->notif->send(
                userId:  $parent->id,
                title:   'تقريرك اليومي من ياقوت 📋',
                body:    $body,
                type:    'daily_report',
            );
        }

        $this->info('Daily reports sent to ' . $parents->count() . ' parents.');
    }
}
