
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
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'hours' => 'nullable|integer|min:1|max:100',
            'location' => 'required|string|max:255',
            'slots' => 'required|integer|min:1|max:10000',
            'description' => 'required|string|min:10',
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

    private function owns(
        Request $request,
        Opportunity $opportunity
    ): void {
        $this->orgOnly($request);

        abort_unless(
            $opportunity->user_id === $request->user()->id,
            404
        );
    }

    private function validatedOpportunity(Request $request): array
    {
        $data = $request->validate($this->rules());

        $start = strtotime($data['start_time']);
        $end = strtotime($data['end_time']);

        if ($end <= $start) {
            throw ValidationException::withMessages([
                'end_time' => [
                    'The end time must be later than the start time.',
                ],
            ]);
        }

        $minutes = ($end - $start) / 60;
        $hours = (int) ceil($minutes / 60);

        if ($hours > 100) {
            throw ValidationException::withMessages([
                'end_time' => [
                    'The event duration cannot exceed 100 hours.',
                ],
            ]);
        }

        $data['hours'] = $hours;

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

        $search = strtolower($request->query('q', ''));

        if ($search !== '') {
            $query->where(function ($where) use ($search) {
                $where->whereRaw(
                    'LOWER(title) LIKE ?',
                    ["%{$search}%"]
                )->orWhereRaw(
                    'LOWER(description) LIKE ?',
                    ["%{$search}%"]
                )->orWhereRaw(
                    'LOWER(location) LIKE ?',
                    ["%{$search}%"]
                );
            });
        }

        $category = $request->query('category');

        if ($category) {
            $query->where('category', $category);
        }

        $date = $request->query('date');

        if ($date) {
            $query->whereDate('date', '>=', $date);
        }

        switch ($request->query('sort')) {
            case 'title':
                $query->orderBy('title');
                break;

            case 'newest':
                $query->latest();
                break;

            default:
                $query->orderBy('date');
                break;
        }

        return $query->paginate(6);
    }

    /**
     * Show one opportunity.
     */
    public function show(Opportunity $opportunity)
    {
        return $opportunity
            ->load('organization:id,name')
            ->loadCount('signups');
    }

    /**
     * Organization: retrieve its opportunities and sign-ups.
     */
    public function mine(Request $request)
    {
        $this->orgOnly($request);

        $opportunities = Opportunity::where(
            'user_id',
            $request->user()->id
        )
            ->withCount('signups')
            ->latest()
            ->get();

        $signups = Signup::whereIn(
            'opportunity_id',
            $opportunities->pluck('id')
        )
            ->with([
                'user:id,name',
                'opportunity:id,title',
            ])
            ->latest()
            ->get();

        return [
            'opportunities' => $opportunities,
            'signups' => $signups,
        ];
    }

    /**
     * Create an opportunity.
     */
    public function store(Request $request)
    {
        $this->orgOnly($request);

        $data = $this->validatedOpportunity($request);

        $opportunity = $request->user()
            ->opportunities()
            ->create($data);

        return response()->json($opportunity, 201);
    }

    /**
     * Update an opportunity owned by the organization.
     */
    public function update(
        Request $request,
        Opportunity $opportunity
    ) {
        $this->owns($request, $opportunity);

        $data = $this->validatedOpportunity($request);

        $opportunity->update($data);

        return $opportunity->fresh();
    }

    /**
     * Delete an opportunity owned by the organization.
     */
    public function destroy(
        Request $request,
        Opportunity $opportunity
    ) {
        $this->owns($request, $opportunity);

        $opportunity->delete();

        return response()->noContent();
    }
}
