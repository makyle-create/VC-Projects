<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'phone', 'location', 'website', 'bio'];
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function opportunities() { return $this->hasMany(Opportunity::class); }
    public function signups() { return $this->hasMany(Signup::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function isOrganization(): bool { return $this->role === 'organization'; }
}
