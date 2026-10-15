<?php
namespace Database\Seeders;

use App\Models\{Signup, User};
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $org = User::create(['name' => 'Green Earth Foundation', 'email' => 'org@demo.com', 'password' => 'password123', 'role' => 'organization']);
        $vol = User::create(['name' => 'Maria Santos', 'email' => 'volunteer@demo.com', 'password' => 'password123', 'role' => 'volunteer']);

        $rows = [
            ['Beach Clean-Up Drive', 'Environment', '2026-10-24', 4, 'Manila Bay, Roxas Blvd., Manila', 50, 'Help keep our coastline clean and document the impact.'],
            ['Tree Planting Activity', 'Environment', '2026-11-14', 4, 'Rizal Park, Manila', 30, 'Plant native saplings for a greener city.'],
            ['After School Tutoring', 'Education', '2026-11-21', 2, 'Brgy. San Andres, Manila', 25, 'Help elementary students with reading and math.'],
            ['Feeding Program', 'Food Assistance', '2026-11-07', 3, 'Tondo, Manila', 40, 'Prepare and serve hot meals to families in need.'],
            ['Health Screening Event', 'Health & Wellness', '2026-09-12', 4, 'Maple Grove Park, Manila', 20, 'Assist with registration and wellness education.'],
        ];
        foreach ($rows as [$t, $c, $d, $h, $l, $s, $desc]) {
            $org->opportunities()->create(['title' => $t, 'category' => $c, 'date' => $d, 'hours' => $h, 'location' => $l, 'slots' => $s, 'description' => $desc, 'skills' => 'Teamwork']);
        }
        Signup::create(['user_id' => $vol->id, 'opportunity_id' => 5, 'status' => 'completed', 'hours' => 4]);
        Signup::create(['user_id' => $vol->id, 'opportunity_id' => 1]);
    }
}
