<?php
namespace App\Http\Controllers;
use App\Models\Notification; use Illuminate\Http\Request;
class NotificationController extends Controller {
 public function index(Request $r){$items=Notification::where('user_id',$r->user()->id)->latest()->limit(100)->get();return ['data'=>$items,'unread'=>$items->whereNull('read_at')->count()];}
 public function read(Request $r,Notification $notification){abort_unless($notification->user_id===$r->user()->id,404);$notification->update(['read_at'=>now()]);return $notification;}
 public function readAll(Request $r){Notification::where('user_id',$r->user()->id)->whereNull('read_at')->update(['read_at'=>now()]);return ['message'=>'All notifications marked as read.'];}
}
