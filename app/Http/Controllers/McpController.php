<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class McpController extends Controller
{
    /**
     * Handle incoming MCP (Model Context Protocol) JSON-RPC requests.
     */
    public function handle(Request $request)
    {
        $token = $request->bearerToken();
        if ($token !== env('MCP_TOKEN', 'mcp-secret-lab-token')) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => ['code' => -32099, 'message' => 'Unauthorized']
            ], 401);
        }

        // Log the incoming request metadata for debugging in CloudWatch
        Log::info('MCP Request Received', [
            'method' => $request->input('method'),
            'id' => $request->input('id')
        ]);

        $method = $request->input('method');
        $params = $request->input('params', []);
        $id = $request->input('id');

        // Basic routing based on MCP methods
        $result = match ($method) {
            'tools/list' => $this->listTools(),
            'tools/call' => $this->callTool($params),
            'resources/list' => $this->listResources(),
            'resources/read' => $this->readResource($params),
            default => null,
        };

        if ($result === null) {
            return response()->json([
                'jsonrpc' => '2.0',
                'id' => $id,
                'error' => [
                    'code' => -32601,
                    'message' => "Method not found: {$method}"
                ]
            ], 404);
        }

        return response()->json([
            'jsonrpc' => '2.0',
            'id' => $id,
            'result' => $result,
        ]);
    }

    private function listTools()
    {
        return [
            'tools' => [
                [
                    'name' => 'hello_world',
                    'description' => 'A simple hello world tool for testing the MCP lab.',
                    'inputSchema' => [
                        'type' => 'object',
                        'properties' => [
                            'name' => [
                                'type' => 'string',
                                'description' => 'The name to say hello to',
                            ]
                        ],
                        'required' => ['name'],
                    ]
                ]
            ]
        ];
    }

    private function callTool($params)
    {
        $toolName = $params['name'] ?? '';
        $args = $params['arguments'] ?? [];

        if ($toolName === 'hello_world') {
            $name = $args['name'] ?? 'World';
            return [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => "Hello, {$name}! Welcome to the AWS Serverless MCP Lab."
                    ]
                ]
            ];
        }

        throw new \Exception("Tool {$toolName} not implemented");
    }

    private function listResources()
    {
        return [
            'resources' => []
        ];
    }

    private function readResource($params)
    {
        return [
            'contents' => []
        ];
    }
}
