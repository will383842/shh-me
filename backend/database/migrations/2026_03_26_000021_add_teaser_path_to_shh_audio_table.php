<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shh_audio', function (Blueprint $table) {
            $table->string('teaser_path', 500)->nullable()->after('filtered_path');
        });
    }

    public function down(): void
    {
        Schema::table('shh_audio', function (Blueprint $table) {
            $table->dropColumn('teaser_path');
        });
    }
};
