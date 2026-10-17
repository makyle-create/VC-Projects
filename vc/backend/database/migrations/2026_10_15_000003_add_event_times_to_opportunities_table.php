<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('opportunities', 'start_time')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->time('start_time')->nullable();
            });
        }

        if (!Schema::hasColumn('opportunities', 'end_time')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->time('end_time')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('opportunities', 'end_time')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->dropColumn('end_time');
            });
        }

        if (Schema::hasColumn('opportunities', 'start_time')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->dropColumn('start_time');
            });
        }
    }
};
