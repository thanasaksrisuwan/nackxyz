<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BasicAdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Require ADMIN_PASSWORD in env. Default fallback for lab is 'admin123'
        $expectedPassword = env('ADMIN_PASSWORD', 'admin123');

        if ($request->getUser() !== 'admin' || $request->getPassword() !== $expectedPassword) {
            $headers = ['WWW-Authenticate' => 'Basic realm="Secured Admin Area"'];
            return response('Unauthorized. Secure Binance Bot Area.', 401, $headers);
        }

        return $next($request);
    }
}
