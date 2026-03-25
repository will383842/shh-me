<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_views', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('viewer_id');
            $table->ulid('viewed_id');
            $table->timestamp('created_at');

            $table->foreign('viewer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('viewed_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index(['viewed_id', 'created_at'], 'idx_profile_views_viewed_id_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_views');
    }
};
