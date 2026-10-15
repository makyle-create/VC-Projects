<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signup extends Model
{
    protected $fillable = ['user_id', 'opportunity_id', 'status', 'hours'];

    public function user() { return $this->belongsTo(User::class); }
    public function opportunity() { return $this->belongsTo(Opportunity::class); }
}
