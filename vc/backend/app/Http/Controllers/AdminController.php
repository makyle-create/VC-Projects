<?php
namespace App\Http\Controllers;
use App\Models\User; use App\Models\Opportunity; use Illuminate\Http\Request;
class AdminController extends Controller {
 private function guard(Request $r){abort_unless($r->user()->role==='admin',403,'Administrator access required.');}
 public function summary(Request $r){$this->guard($r);return ['users'=>User::count(),'volunteers'=>User::where('role','volunteer')->count(),'organizations'=>User::where('role','organization')->count(),'opportunities'=>Opportunity::count(),'active_opportunities'=>Opportunity::where('status','active')->count()];}
 public function users(Request $r){$this->guard($r);return User::select('id','name','email','role','created_at')->latest()->paginate(25);}
 public function opportunities(Request $r){$this->guard($r);return Opportunity::with('organization:id,name')->withCount('signups')->latest()->paginate(25);}
 public function removeOpportunity(Request $r,Opportunity $opportunity){$this->guard($r);$opportunity->delete();return response()->noContent();}
 public function setOpportunityStatus(Request $r,Opportunity $opportunity){$this->guard($r);$data=$r->validate(['status'=>'required|in:active,draft']);$opportunity->update($data);return $opportunity;}
}
