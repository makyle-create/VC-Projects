<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('signups', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();        // volunteer
            $t->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $t->string('status')->default('joined');                           // joined | completed
            $t->unsignedSmallInteger('hours')->default(0);                     // Volunteer Hours
            $t->timestamps();
            $t->unique(['user_id', 'opportunity_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('signups'); }
};
