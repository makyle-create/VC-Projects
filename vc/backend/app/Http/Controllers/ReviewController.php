<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\Review;
use App\Models\Signup;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Opportunity $opportunity)
    {
        $rows = Review::with('user:id,name')
            ->where('opportunity_id', $opportunity->id)
            ->latest()
            ->get();

        return [
            'data' => $rows,
            'average' => round((float) $rows->avg('rating'), 1),
            'count' => $rows->count(),
        ];
    }

    public function store(Request $request, Opportunity $opportunity)
    {
        $user = $request->user();
        abort_unless($user->role === 'volunteer', 403, 'Only volunteers can leave feedback.');

        abort_unless(
            Signup::where('user_id', $user->id)
                ->where('opportunity_id', $opportunity->id)
                ->where('status', 'completed')
                ->exists(),
            403,
            'You can leave feedback once the organization has verified your attendance.'
        );

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1500',
        ]);

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'opportunity_id' => $opportunity->id],
            $data
        );

        return response()->json($review->load('user:id,name'), 201);
    }
}
