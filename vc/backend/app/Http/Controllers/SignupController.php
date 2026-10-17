<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Opportunity;
use App\Models\Signup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SignupController extends Controller
{
    // Volunteer joins an opportunity
    public function store(Request $request, Opportunity $opportunity)
    {
        $user = $request->user();
        abort_unless($user->role === 'volunteer', 403, 'Only volunteers can sign up.');
        abort_unless($opportunity->status === 'active', 404);

        // Lock the opportunity row so two people can't grab the last slot at once.
        $signup = DB::transaction(function () use ($user, $opportunity) {
            Opportunity::whereKey($opportunity->id)->lockForUpdate()->first();

            abort_if(
                Signup::where('user_id', $user->id)->where('opportunity_id', $opportunity->id)->exists(),
                409,
                'You already signed up for this opportunity.'
            );
            abort_if($opportunity->signups()->count() >= $opportunity->slots, 409, 'No slots left.');

            $signup = Signup::create(['user_id' => $user->id, 'opportunity_id' => $opportunity->id]);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Signup confirmed',
                'message' => 'You joined: ' . $opportunity->title,
                'link' => '/activities',
            ]);
            Notification::create([
                'user_id' => $opportunity->user_id,
                'title' => 'New volunteer signup',
                'message' => $user->name . ' joined ' . $opportunity->title,
                'link' => '/',
            ]);

            return $signup;
        });

        return response()->json($signup, 201);
    }

    // Volunteer's activities and totals
    public function mine(Request $request)
    {
        abort_unless($request->user()->role === 'volunteer', 403);

        $list = Signup::where('user_id', $request->user()->id)
            ->with('opportunity.organization:id,name')
            ->latest()
            ->get();

        return [
            'data' => $list,
            'totals' => [
                'hours' => (int) $list->sum('hours'),
                'completed' => $list->where('status', 'completed')->count(),
                'upcoming' => $list->where('status', 'joined')->count(),
            ],
        ];
    }

    // Organization confirms attendance, which credits the volunteer hours
    public function complete(Request $request, Signup $signup)
    {
        $opp = $signup->opportunity;
        abort_unless($request->user()->isOrganization() && $opp->user_id === $request->user()->id, 404);

        // Already verified: don't credit hours or notify the volunteer a second time.
        if ($signup->status === 'completed') {
            return $signup;
        }

        $signup->update(['status' => 'completed', 'hours' => $opp->hours]);

        Notification::create([
            'user_id' => $signup->user_id,
            'title' => 'Volunteer hours verified',
            'message' => 'Your attendance for ' . $opp->title . ' was confirmed. ' . $opp->hours . ' hour(s) credited.',
            'link' => '/activities',
        ]);

        return $signup;
    }
}
