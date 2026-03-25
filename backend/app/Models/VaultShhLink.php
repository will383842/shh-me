<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class VaultShhLink extends Model
{
    use HasUlids;

    const UPDATED_AT = null;

    protected $connection = 'vault';

    protected $table = 'vault_shh_links';

    protected $fillable = [
        'sender_encrypted',
        'receiver_encrypted',
        'salt',
        'status',
        'harassment_counter',
    ];
}
