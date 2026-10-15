<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Opportunity extends Model
{
    protected $fillable = ['title', 'category', 'date', 'hours', 'location', 'slots', 'description', 'requirements', 'skills', 'status'];
    protected $casts = ['date' => 'date:Y-m-d'];

    public function organization() { return $this->belongsTo(User::class, 'user_id'); }
    public function signups() { return $this->hasMany(Signup::class); }
}
