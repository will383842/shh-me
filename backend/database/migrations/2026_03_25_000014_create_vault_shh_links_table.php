<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function getConnection(): ?string
    {
        return app()->environment('testing') ? null : 'vault';
    }

    public function up(): void
    {
        $connection = $this->getConnection();

        Schema::connection($connection)->create('vault_shh_links', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->binary('sender_encrypted');
            $table->binary('receiver_encrypted');
            $table->binary('salt');
            $table->string('status', 20)->default('active');
            $table->smallInteger('harassment_counter')->default(0);
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        $connection = $this->getConnection();

        Schema::connection($connection)->dropIfExists('vault_shh_links');
    }
};
