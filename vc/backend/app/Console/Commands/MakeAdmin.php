<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    protected $signature = 'app:make-admin {email : Email of an existing account}';

    protected $description = 'Grant the administrator role to an existing user';

    public function handle(): int
    {
        $user = User::whereRaw('LOWER(email) = ?', [strtolower($this->argument('email'))])->first();

        if (!$user) {
            $this->error('No user with that email. Register the account first, then run this again.');
            return self::FAILURE;
        }

        $user->forceFill(['role' => 'admin'])->save();
        $this->info("{$user->email} is now an administrator. Log in and open /admin.");

        return self::SUCCESS;
    }
}
