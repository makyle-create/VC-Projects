<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('opportunities', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete(); // the organization
            $t->string('title');
            $t->string('category');
            $t->date('date');
            $t->unsignedSmallInteger('hours');
            $t->string('location');
            $t->unsignedSmallInteger('slots');
            $t->text('description');
            $t->text('requirements')->nullable();
            $t->string('skills')->nullable();
            $t->string('status')->default('active'); // active | draft
            $t->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('opportunities'); }
};
