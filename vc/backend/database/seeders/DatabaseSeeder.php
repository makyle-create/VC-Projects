<?php

namespace Database\Seeders;

use App\Models\Opportunity;
use App\Models\Signup;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Demo data. Safe to run more than once: every record is looked up first, so
 * re-running `php artisan db:seed` will not crash or create duplicates.
 *
 * Demo logins (password: password123)
 *   org@demo.com        organization
 *   volunteer@demo.com  volunteer
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $org = User::firstOrCreate(
            ['email' => 'org@demo.com'],
            ['name' => 'Green Earth Foundation', 'password' => 'password123', 'role' => 'organization',
             'location' => 'Manila, Philippines',
             'bio' => 'We organize community clean-ups, tree planting, and outreach across Metro Manila.']
        );
        $vol = User::firstOrCreate(
            ['email' => 'volunteer@demo.com'],
            ['name' => 'Maria Santos', 'password' => 'password123', 'role' => 'volunteer']
        );

        // title, category, date, start, end, hours, location, slots, description, requirements
        $rows = [
            ['Beach Clean-Up Drive', 'Environment', '2026-10-24', '07:00', '11:00', 4, 'Manila Bay, Roxas Blvd., Manila', 50, 'Help keep our coastline clean and document the impact.', "Wear closed shoes\nBring a water bottle"],
            ['Tree Planting Activity', 'Environment', '2026-11-14', '07:00', '11:00', 4, 'Rizal Park, Manila', 30, 'Plant native saplings for a greener city.', "Wear a cap or hat\nBring gloves if you have them"],
            ['After School Tutoring', 'Education', '2026-11-21', '15:00', '17:00', 2, 'Brgy. San Andres, Manila', 25, 'Help elementary students with reading and math.', null],
            ['Feeding Program', 'Food Assistance', '2026-11-07', '09:00', '12:00', 3, 'Tondo, Manila', 40, 'Prepare and serve hot meals to families in need.', "Hair net and apron provided"],
            ['Health Screening Event', 'Health & Wellness', '2026-09-12', '08:00', '12:00', 4, 'Maple Grove Park, Manila', 20, 'Assist with registration and wellness education.', null],
        ];

        $made = [];
        foreach ($rows as [$title, $cat, $date, $start, $end, $hours, $loc, $slots, $desc, $req]) {
            $made[$title] = Opportunity::firstOrCreate(
                ['user_id' => $org->id, 'title' => $title],
                ['category' => $cat, 'date' => $date, 'start_time' => $start, 'end_time' => $end,
                 'hours' => $hours, 'location' => $loc, 'slots' => $slots, 'description' => $desc,
                 'requirements' => $req, 'skills' => 'Teamwork', 'status' => 'active']
            );
        }

        // Look the opportunities up by title instead of hard-coding ids 1 and 5,
        // which only worked on a brand-new, empty database.
        Signup::firstOrCreate(
            ['user_id' => $vol->id, 'opportunity_id' => $made['Health Screening Event']->id],
            ['status' => 'completed', 'hours' => 4]
        );
        Signup::firstOrCreate(
            ['user_id' => $vol->id, 'opportunity_id' => $made['Beach Clean-Up Drive']->id],
            ['status' => 'joined', 'hours' => 0]
        );
    }
}
