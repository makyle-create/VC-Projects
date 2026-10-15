
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
            'requirements' => 'nullable|string',
            'skills' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,draft',
        ];
    }

    private function validatedOpportunity(Request $request): array
    {
        $data = $request->validate($this->rules());

        $start = strtotime($data['start_time']);
        $end = strtotime($data['end_time']);

        if ($end <= $start) {
            throw ValidationException::withMessages([
                'end_time' => 'The end time must be later than the start time.',
            ]);
        }

        $minutes = ($end - $start) / 60;
        $hours = (int) ceil($minutes / 60);

        if ($hours > 100) {
            throw ValidationException::withMessages([
                'end_time' => 'The event duration cannot exceed 100 hours.',
            ]);
        }

        $data['hours'] = $hours;

        return $data;
    }

    private function orgOnly(Request $request)
    {
        abort_unless(
            $request->user()->isOrganization(),
            403,
            'Only organizations can do this.'
        );
    }

    private function owns(Request $request, Opportunity $opportunity)
    {
        $this->orgOnly($request);

        abort_unless(
            $opportunity->user_id === $request->user()->id,
            404
        );
    }

    // Public: search, filter by category/date, sort, paginate
    public function index(Request $request)
    {
        $q = Opportunity::with('organization:id,name')
            ->withCount('signups')
            ->where('status', 'active');

        if ($s = strtolower($request->query('q', ''))) {
            $q->where(fn ($w) => $w
                ->whereRaw('LOWER(title) LIKE ?', ["%$s%"])
                ->orWhereRaw('LOWER(description) LIKE ?', ["%$s%"])
                ->orWhereRaw('LOWER(location) LIKE ?', ["%$s%"]));
        }

        if ($c = $request->query('category')) {
            $q->where('category', $c);
        }

        if ($d = $request->query('date')) {
            $q->whereDate('date', '>=', $d);
        }

        match ($request->query('sort')) {
            'title' => $q->orderBy('title'),
            'newest' => $q->latest(),
            default => $q->orderBy('date'),
        };

        return $q->paginate(6);
    }

    public function show(Opportunity $opportunity)
    {
        return $opportunity
            ->load('organization:id,name')
            ->loadCount('signups');
    }

    // Organization: own opportunities + sign-ups + dashboard totals
    public function mine(Request $request)
    {
        $this->orgOnly($request);

        $opps = Opportunity::where('user_id', $request->user()->id)
            ->withCount('signups')
            ->latest()
            ->get();

        $signups = Signup::whereIn('opportunity_id', $opps->pluck('id'))
            ->with(['user:id,name', 'opportunity:id,title'])
            ->latest()
            ->get();

        return [
            'opportunities' => $opps,
            'signups' => $signups,
            'totals' => [
                'posted' => $opps->count(),
                'volunteers' => $signups->pluck('user_id')->unique()->count(),
                'hours' => $signups->sum('hours'),
                'pending' => $signups->where('status', 'joined')->count(),
            ],
        ];
    }

    public function store(Request $request)
    {
        $this->orgOnly($request);

        $data = $this->validatedOpportunity($request);

        $opportunity = $request->user()
            ->opportunities()
            ->create($data);

        return response()->json($opportunity, 201);
    }

    public function update(Request $request, Opportunity $opportunity)
    {
        $this->owns($request, $opportunity);

        $data = $this->validatedOpportunity($request);

        $opportunity->update($data);

        return $opportunity;
    }

    public function destroy(Request $request, Opportunity $opportunity)
    {
        $this->owns($request, $opportunity);

        $opportunity->delete();

        return response()->noContent();
    }
}
