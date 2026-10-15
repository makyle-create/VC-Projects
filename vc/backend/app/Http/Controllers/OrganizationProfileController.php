<?php
namespace App\Http\Controllers;
use App\Models\User; use Illuminate\Http\Request;
class OrganizationProfileController extends Controller {
 public function show(User $user){abort_unless($user->role==='organization',404);return ['organization'=>$user->only(['id','name','bio','location','website']),'opportunities'=>$user->opportunities()->where('status','active')->withCount('signups')->orderBy('date')->get()];}
 public function update(Request $r){abort_unless($r->user()->role==='organization',403);$data=$r->validate(['name'=>'required|string|min:2|max:120','bio'=>'nullable|string|max:2000','location'=>'nullable|string|max:255','website'=>'nullable|url|max:255','phone'=>'nullable|string|max:30']);$r->user()->update($data);return $r->user()->fresh();}
}
