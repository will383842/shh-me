<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('apple_id', 255)->nullable()->unique();
            $table->string('google_id', 255)->nullable()->unique();
            $table->string('email', 255)->nullable();
            $table->smallInteger('birth_year');
            $table->string('city', 100)->nullable();
            $table->char('country_code', 2)->nullable();
            $table->string('preferred_locale', 5)->default('en');
            $table->string('timezone', 50)->default('UTC');
            $table->string('device_token', 255)->nullable();
            $table->boolean('onboarding_completed')->default(false);
            $table->string('referrer_code', 20)->unique();
            $table->ulid('referred_by')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->integer('total_shh_received')->default(0);
            $table->integer('total_reveals')->default(0);
            $table->boolean('shh_ghost_enabled')->default(false);
            $table->timestamp('accepted_terms_at')->nullable();
            $table->timestamp('paused_until')->nullable();
            // Future MVP columns (exist but NOT used in MVP1)
            $table->integer('shh_score')->default(0);
            $table->boolean('is_premium')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('apple_id', 'idx_users_apple_id');
            $table->index('google_id', 'idx_users_google_id');
            $table->index('country_code', 'idx_users_country_code');
            $table->index('last_active_at', 'idx_users_last_active');
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('users');
    }
};
