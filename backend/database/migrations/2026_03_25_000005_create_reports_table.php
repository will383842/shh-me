<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('reporter_id');
            $table->string('target_type', 50);
            $table->ulid('target_id');
            $table->string('reason', 500);
            $table->enum('status', ['pending', 'reviewed', 'actioned'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamp('created_at');

            $table->foreign('reporter_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('status', 'idx_reports_status');
            $table->index(['target_type', 'target_id'], 'idx_reports_target');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
