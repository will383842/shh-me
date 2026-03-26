<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ab_tests', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->jsonb('variants');
            $table->jsonb('weights');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ab_assignments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id');
            $table->string('test_name', 100);
            $table->string('variant', 50);
            $table->boolean('converted')->default(false);
            $table->timestamp('created_at');

            $table->unique(['user_id', 'test_name'], 'idx_ab_assignments_user_test');
            $table->index('test_name', 'idx_ab_assignments_test_name');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ab_assignments');
        Schema::dropIfExists('ab_tests');
    }
};
