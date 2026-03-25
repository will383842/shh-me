<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shh_photos', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('shh_id');
            $table->string('original_path', 500);
            $table->jsonb('blur_paths')->nullable();
            $table->boolean('blur_levels_generated')->default(false);
            $table->timestamp('created_at');

            $table->foreign('shh_id')->references('id')->on('shh')->cascadeOnDelete();
            $table->index('shh_id', 'idx_shh_photos_shh_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shh_photos');
    }
};
