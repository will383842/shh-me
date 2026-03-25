<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_contacts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('user_id');
            $table->string('contact_identifier', 255);
            $table->string('contact_name', 255)->nullable();
            $table->timestamp('created_at');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('user_id', 'idx_user_contacts_user_id');
            $table->index('contact_identifier', 'idx_user_contacts_identifier');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_contacts');
    }
};
