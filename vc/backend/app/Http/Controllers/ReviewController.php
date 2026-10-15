<?php
namespace App\Http\Controllers;
use App\Models\Review; use App\Models\Signup; use Illuminate\Http\Request;
class ReviewController extends Controller {
 public function index($opportunity){$rows=Review::with('user:id,name')->where('opportunity_id',$opportunity)->latest()->get();return ['data'=>$rows,'average'=>round((float)$rows->avg('rating'),1),'count'=>$rows->count()];}
 public function store(Request $r,$opportunity){abort_unless($r->user()->role==='volunteer',403,'Only volunteers can leave feedback.');$signup=Signup::where('user_id',$r->user()->id)->where('opportunity_id',$opportunity)->where('status','completed')->firstOrFail();$data=$r->validate(['rating'=>'required|integer|min:1|max:5','comment'=>'nullable|string|max:1500']);$review=Review::updateOrCreate(['user_id'=>$r->user()->id,'opportunity_id'=>$opportunity],$data);return response()->json($review->load('user:id,name'),201);}
}
