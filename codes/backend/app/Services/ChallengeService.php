<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Challenge;
use App\Models\ChallengeProgressLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChallengeService
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly GamificationService $gamification,
    ) {}

    public function format(Challenge $c): array
    {
        $c->loadMissing(['student:id,name', 'parent:id,name', 'creator:id,name']);

        return [
            'id'            => $c->id,
            'type'          => $c->type,
            'title'         => $c->title,
            'description'   => $c->description,
            'category'      => $c->category,
            'target_value'  => $c->target_value,
            'current_value' => $c->current_value,
            'unit'          => $c->unit,
            'status'        => $c->status,
            'progress_pct'  => $c->progressPct(),
            'ends_at'       => $c->ends_at?->toDateString(),
            'completed_at'  => $c->completed_at?->toISOString(),
            'created_at'    => $c->created_at?->toISOString(),
            'student'       => $c->student ? ['id' => $c->student->id, 'name' => $c->student->name] : null,
            'parent'        => $c->parent ? ['id' => $c->parent->id, 'name' => $c->parent->name] : null,
            'created_by'    => $c->creator ? ['id' => $c->creator->id, 'name' => $c->creator->name] : null,
        ];
    }

    public function createIndividual(User $student, array $data): Challenge
    {
        return Challenge::create([
            'country_id'    => (int) $student->country_id,
            'type'          => 'individual',
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'category'      => $data['category'] ?? 'custom',
            'target_value'  => (int) $data['target_value'],
            'current_value' => 0,
            'unit'          => $data['unit'] ?? 'مرة',
            'status'        => 'active',
            'created_by'    => $student->id,
            'student_id'    => $student->id,
            'parent_id'     => null,
            'ends_at'       => $data['ends_at'] ?? null,
        ]);
    }

    /** طالب يقترح تحدياً عائلياً → ينتظر موافقة ولي الأمر. */
    public function createFamilyByStudent(User $student, array $data): Challenge
    {
        $parentId = $student->parent_id ? (int) $student->parent_id : null;
        if (! $parentId) {
            throw ValidationException::withMessages([
                'type' => ['لا يوجد ولي أمر مرتبط بحسابك لبدء تحدٍ عائلي.'],
            ]);
        }

        $challenge = Challenge::create([
            'country_id'    => (int) $student->country_id,
            'type'          => 'family',
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'category'      => $data['category'] ?? 'custom',
            'target_value'  => (int) $data['target_value'],
            'current_value' => 0,
            'unit'          => $data['unit'] ?? 'مرة',
            'status'        => 'pending',
            'created_by'    => $student->id,
            'student_id'    => $student->id,
            'parent_id'     => $parentId,
            'ends_at'       => $data['ends_at'] ?? null,
        ]);

        $parent = User::find($parentId);
        if ($parent) {
            $this->notifications->send(
                $parent,
                'تحدٍ عائلي جديد',
                "{$student->name} اقترح تحدياً عائلياً: {$challenge->title}",
                'challenge',
                ['challenge_id' => $challenge->id]
            );
        }

        return $challenge;
    }

    /** ولي الأمر ينشئ تحدياً عائلياً لابنه → نشط فوراً. */
    public function createFamilyByParent(User $parent, User $student, array $data): Challenge
    {
        if ((int) $student->parent_id !== (int) $parent->id || $student->role !== 'student') {
            abort(403, 'هذا الطالب غير مرتبط بحسابك.');
        }

        $challenge = Challenge::create([
            'country_id'    => (int) ($student->country_id ?: $parent->country_id),
            'type'          => 'family',
            'title'         => $data['title'],
            'description'   => $data['description'] ?? null,
            'category'      => $data['category'] ?? 'custom',
            'target_value'  => (int) $data['target_value'],
            'current_value' => 0,
            'unit'          => $data['unit'] ?? 'مرة',
            'status'        => 'active',
            'created_by'    => $parent->id,
            'student_id'    => $student->id,
            'parent_id'     => $parent->id,
            'ends_at'       => $data['ends_at'] ?? null,
        ]);

        $this->notifications->send(
            $student,
            'تحدٍ عائلي جديد',
            "ولي أمرك أطلق تحدياً: {$challenge->title}",
            'challenge',
            ['challenge_id' => $challenge->id]
        );

        return $challenge;
    }

    public function accept(Challenge $challenge, User $parent): Challenge
    {
        abort_unless($challenge->type === 'family', 422, 'ليس تحدياً عائلياً.');
        abort_unless((int) $challenge->parent_id === (int) $parent->id, 403);
        abort_unless($challenge->status === 'pending', 422, 'التحدي ليس بانتظار الموافقة.');

        $challenge->update(['status' => 'active']);

        if ($challenge->student) {
            $this->notifications->send(
                $challenge->student,
                'تمت الموافقة على التحدي',
                "وافق ولي أمرك على التحدي: {$challenge->title}",
                'challenge',
                ['challenge_id' => $challenge->id]
            );
        }

        return $challenge->fresh();
    }

    public function reject(Challenge $challenge, User $parent): Challenge
    {
        abort_unless($challenge->type === 'family', 422);
        abort_unless((int) $challenge->parent_id === (int) $parent->id, 403);
        abort_unless($challenge->status === 'pending', 422, 'التحدي ليس بانتظار الموافقة.');

        $challenge->update(['status' => 'cancelled']);

        return $challenge->fresh();
    }

    public function cancel(Challenge $challenge, User $actor): Challenge
    {
        abort_unless(in_array($challenge->status, ['pending', 'active'], true), 422, 'لا يمكن إلغاء هذا التحدي.');

        $allowed = (int) $actor->id === (int) $challenge->student_id
            || (int) $actor->id === (int) $challenge->parent_id
            || (int) $actor->id === (int) $challenge->created_by;
        abort_unless($allowed, 403);

        $challenge->update(['status' => 'cancelled']);

        return $challenge->fresh();
    }

    public function addProgress(Challenge $challenge, User $actor, int $amount, ?string $note = null): Challenge
    {
        abort_unless($challenge->status === 'active', 422, 'التحدي غير نشط.');
        abort_if($amount < 1, 422, 'الكمية يجب أن تكون 1 على الأقل.');

        $isStudent = (int) $actor->id === (int) $challenge->student_id;
        $isParent  = $challenge->type === 'family' && (int) $actor->id === (int) $challenge->parent_id;
        abort_unless($isStudent || $isParent, 403);

        return DB::transaction(function () use ($challenge, $actor, $amount, $note) {
            ChallengeProgressLog::create([
                'challenge_id' => $challenge->id,
                'user_id'      => $actor->id,
                'amount'       => $amount,
                'note'         => $note,
            ]);

            $newValue = $challenge->current_value + $amount;
            $updates  = ['current_value' => $newValue];

            if ($newValue >= $challenge->target_value) {
                $updates['status']       = 'completed';
                $updates['current_value'] = $challenge->target_value;
                $updates['completed_at'] = now();
            }

            $challenge->update($updates);
            $challenge = $challenge->fresh();

            if ($challenge->status === 'completed') {
                $this->gamification->award(
                    (int) $challenge->student_id,
                    'complete_challenge',
                    "إكمال التحدي: {$challenge->title}"
                );

                $notifyIds = array_filter([
                    (int) $challenge->student_id,
                    $challenge->parent_id ? (int) $challenge->parent_id : null,
                ]);
                foreach (array_unique($notifyIds) as $uid) {
                    if ($uid === (int) $actor->id) {
                        continue;
                    }
                    $user = User::find($uid);
                    if ($user) {
                        $this->notifications->send(
                            $user,
                            'أُكمل التحدي 🎉',
                            "تم إنجاز التحدي: {$challenge->title}",
                            'challenge',
                            ['challenge_id' => $challenge->id]
                        );
                    }
                }
            }

            return $challenge;
        });
    }
}
