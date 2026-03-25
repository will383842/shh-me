<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function getConnection(): string
    {
        return 'vault';
    }

    public function up(): void
    {
        Schema::connection('vault')->create('vault_shh_links', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->binary('sender_encrypted');
            $table->binary('receiver_encrypted');
            $table->binary('salt');
            $table->enum('status', ['active', 'expired', 'revealed'])->default('active');
            $table->smallInteger('harassment_counter')->default(0);
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::connection('vault')->dropIfExists('vault_shh_links');
    }
};
