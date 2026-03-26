<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_connects', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->timestamp('sender_connected_at')->nullable();
            $table->timestamp('receiver_connected_at')->nullable();
            $table->timestamp('mutual_at')->nullable();
            $table->string('sender_phone', 20)->nullable();
            $table->string('receiver_phone', 20)->nullable();
            $table->string('video_path', 500)->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('created_at');

            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
            $table->unique('shh_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_connects');
    }
};
