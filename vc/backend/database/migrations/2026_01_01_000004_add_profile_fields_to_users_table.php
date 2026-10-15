<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $t) {
            $t->string('phone', 30)->nullable()->after('role');
            $t->string('location')->nullable()->after('phone');
            $t->string('website')->nullable()->after('location');
            $t->text('bio')->nullable()->after('website');
        });
    }
    public function down(): void {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['phone', 'location', 'website', 'bio']));
    }
};