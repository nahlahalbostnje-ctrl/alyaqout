<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $fillable = ['role', 'screen', 'permission', 'allowed'];

    protected $casts = [
        'allowed' => 'boolean',
    ];
}
