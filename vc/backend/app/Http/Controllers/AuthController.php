<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2|max:120',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:volunteer,organization',
        ]);
        $user = User::create($data);
        return response()->json(['user' => $user, 'token' => $user->createToken('web')->plainTextToken], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }
        return ['user' => $user, 'token' => $user->createToken('web')->plainTextToken];
    }

    public function me(Request $request) { return $request->user(); }

        public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2|max:120',
            'phone' => 'nullable|string|max:30',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);
        $request->user()->update($data);
        return $request->user()->fresh();
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate(['current_password' => 'required', 'password' => 'required|min:8|confirmed']);
        if (!Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages(['current_password' => 'Your current password is incorrect.']);
        }
        $request->user()->update(['password' => $data['password']]);
        return response()->json(['message' => 'Password updated.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }
}
