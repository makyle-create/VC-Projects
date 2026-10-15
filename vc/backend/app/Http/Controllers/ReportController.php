<?php
namespace App\Http\Controllers;

use App\Models\Signup;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $u = $request->user();
        $q = Signup::with('opportunity:id,category');
        $u->isOrganization()
            ? $q->whereHas('opportunity', fn ($w) => $w->where('user_id', $u->id))
            : $q->where('user_id', $u->id);
        $list = $q->get();
        return [
            'generated_at' => now()->toIso8601String(),
            'role' => $u->role,
            'total_activities' => $list->count(),
            'completed' => $list->where('status', 'completed')->count(),
            'total_hours' => $list->sum('hours'),
            'hours_by_category' => $list->where('status', 'completed')
                ->groupBy(fn ($s) => $s->opportunity->category)->map->sum('hours'),
        ];
    }
}
