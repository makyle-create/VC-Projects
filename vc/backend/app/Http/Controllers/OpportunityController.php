<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\Signup;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OpportunityController extends Controller
{
    private const CATEGORIES = [
        'Community Service',
        'Education',
        'Health & Wellness',
        'Environment',
        'Animal Care',
        'Food Assistance',
    ];

    private function rules(): array
    {
        return [
            'title' => 'required|string|min:3|max:150',
            'category' => 'required|in:' . implode(',', self::CATEGORIES),
            'date' => 'required|date',
            // Accept "09:00" (HTML time input) and "09:00:00" (what the database returns).
            'start_time' => 'required|date_format:H:i,H:i:s',
            'end_time' => 'required|date_format:H:i,H:i:s',
            'location' => 'required|string|max:255',
            'slots' => 'required|integer|min:1|max:10000',
            'description' => 'required|string|min:10',
            // These three were sent by the form but missing here, so Laravel
            // silently discarded them (skills/requirements never saved and
            // "Save as draft" always published the opportunity).
            'skills' => 'nullable|string|max:255',
            'requirements' => 'nullable|string|max:2000',
            'status' => 'sometimes|in:active,draft',
        ];
    }

    private function orgOnly(Request $request): void
    {
        abort_unless(
            $request->user() && $request->user()->isOrganization(),
            403,
            'Only organizations can do this.'
        );
    }

    private function owns(Request $request, Opportunity $opportunity): void
    {
        $this->orgOnly($request);

        abort_unless($opportunity->user_id === $request->user()->id, 404);
    }

    private function validatedOpportunity(Request $request): array
    {
        $data = $request->validate($this->rules());

        $start = strtotime($data['start_time']);
        $end = strtotime($data['end_time']);

        if ($end <= $start) {
            throw ValidationException::withMessages([
                'end_time' => ['The end time must be later than the start time.'],
            ]);
        }

        // Estimated hours are always derived from the times, rounded up.
        $data['hours'] = (int) ceil((($end - $start) / 60) / 60);

        // Store times as H:i regardless of what was submitted.
        $data['start_time'] = date('H:i', $start);
        $data['end_time'] = date('H:i', $end);

        return $data;
    }

    /**
     * Public: search, filter, sort, and paginate opportunities.
     */
    public function index(Request $request)
    {
        $query = Opportunity::with('organization:id,name')
            ->withCount('signups')
            ->where('status', 'active');

        $search = strtolower(trim((string) $request->query('q', '')));

        if ($search !== '') {
            // Escape LIKE wildcards so searching for "50%" or "_" behaves literally.
            $like = '%' . addcslashes($search, '%_\\') . '%';

            $query->where(function ($where) use ($like) {
                $where->whereRaw('LOWER(title) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(description) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(location) LIKE ?', [$like]);
            });
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', '>=', $date);
        }

        switch ($request->query('sort')) {
            case 'title':
                $query->orderBy('title');
                break;
            case 'newest':
                $query->latest()->orderByDesc('id');
                break;
            default:
                $query->orderBy('date')->orderBy('id');
                break;
        }

        return $query->paginate(6);
    }

    /**
     * Show one opportunity. Drafts are only visible to their owner and admins.
     */
    public function show(Request $request, Opportunity $opportunity)
    {
        if ($opportunity->status !== 'active') {
            // This route is public, so look up the bearer token ourselves.
            $viewer = $request->user('sanctum');

            abort_unless(
                $viewer && ($viewer->role === 'admin' || $viewer->id === $opportunity->user_id),
                404
            );
        }

        return $opportunity
            ->load('organization:id,name')
            ->loadCount('signups');
    }

    /**
     * Organization: retrieve its opportunities, sign-ups, and dashboard totals.
     */
    public function mine(Request $request)
    {
        $this->orgOnly($request);

        $opportunities = Opportunity::where('user_id', $request->user()->id)
            ->withCount('signups')
            ->latest()
            ->get();

        $signups = Signup::whereIn('opportunity_id', $opportunities->pluck('id'))
            ->with(['user:id,name', 'opportunity:id,title'])
            ->latest()
            ->get();

        return [
            'opportunities' => $opportunities,
            'signups' => $signups,
            // The dashboard and profile pages read these four numbers.
            'totals' => [
                'posted' => $opportunities->count(),
                'volunteers' => $signups->pluck('user_id')->unique()->count(),
                'hours' => (int) $signups->where('status', 'completed')->sum('hours'),
                'pending' => $signups->where('status', 'joined')->count(),
            ],
        ];
    }

    /**
     * Create an opportunity.
     */
    public function store(Request $request)
    {
        $this->orgOnly($request);

        $data = $this->validatedOpportunity($request);
        $data['status'] = $data['status'] ?? 'active';

        $opportunity = $request->user()->opportunities()->create($data);

        return response()->json($opportunity->fresh(), 201);
    }

    /**
     * Update an opportunity owned by the organization.
     */
    public function update(Request $request, Opportunity $opportunity)
    {
        $this->owns($request, $opportunity);

        $opportunity->update($this->validatedOpportunity($request));

        return $opportunity->fresh();
    }

    /**
     * Delete an opportunity owned by the organization.
     */
    public function destroy(Request $request, Opportunity $opportunity)
    {
        $this->owns($request, $opportunity);

        $opportunity->delete();

        return response()->noContent();
    }
}
