<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BasicAdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        $expectedUsername = env('ADMIN_USERNAME', 'admin');
        $expectedPassword = env('ADMIN_PASSWORD', 'admin123');

        $user = $request->getUser();
        $password = $request->getPassword();

        // AWS API Gateway / Bref Fallback
        if (!$user && $request->hasHeader('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (stripos($authHeader, 'Basic ') === 0) {
                $decoded = base64_decode(substr($authHeader, 6));
                if (strpos($decoded, ':') !== false) {
                    list($user, $password) = explode(':', $decoded, 2);
                }
            }
        }

        if ($user !== $expectedUsername || $password !== $expectedPassword) {
            $headers = ['WWW-Authenticate' => 'Basic realm="Secured Admin Area"'];
            return response('Unauthorized. Secure Binance Bot Area.', 401, $headers);
        }

        return $next($request);
    }
}
