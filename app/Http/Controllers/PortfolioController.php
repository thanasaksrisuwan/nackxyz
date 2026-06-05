<?php

namespace App\Http\Controllers;

use App\Jobs\SendContactEmail;
use App\Models\Contact;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    /**
     * Display the landing page with cached projects.
     */
    public function index()
    {
        // Cache projects for 1 hour. If cached, fetch from Redis; otherwise, query RDS and save cache.
        $projects = Cache::remember('portfolio_projects', 3600, function () {
            return Project::orderBy('id', 'desc')->get();
        });

        return view('portfolio', compact('projects'));
    }

    /**
     * Handle the contact form submission.
     */
    public function contact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        // Save to Database
        $contact = Contact::create($validated);

        // Queue the email sending job (processed asynchronously via Redis queue)
        SendContactEmail::dispatch($contact);

        return response()->json([
            'success' => true,
            'message' => 'Your message has been sent! We will get back to you shortly.',
        ]);
    }

    /**
     * Display the admin page to manage projects.
     */
    public function admin()
    {
        $projects = Project::orderBy('id', 'desc')->get();
        return view('admin', compact('projects'));
    }

    /**
     * Store a newly created project in storage.
     */
    public function storeProject(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'required|string', // Comma separated tags: e.g. "Laravel, S3, RDS"
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Max 5MB
            'project_url' => 'nullable|url:http,https|max:255',
            'github_url' => 'nullable|url:http,https|max:255',
        ]);

        // Process tags: split comma string into array
        $tagsArray = array_map('trim', explode(',', $validated['tags']));
        $tagsArray = array_filter($tagsArray); // remove empty values

        // Handle Image Upload (AWS S3 with Local fallback)
        $imageUrl = null;
        if ($request->hasFile('image')) {
            // Determine disk based on AWS keys availability
            $disk = config('filesystems.disks.s3.key') || env('AWS_ACCESS_KEY_ID') ? 's3' : 'public';
            
            // Upload file with public visibility
            $path = $request->file('image')->store('projects', $disk);
            $imageUrl = Storage::disk($disk)->url($path);
        }

        // Create Project in Database
        Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'tags' => $tagsArray,
            'image_url' => $imageUrl,
            'project_url' => $validated['project_url'],
            'github_url' => $validated['github_url'],
        ]);

        // Invalidate Cache so the landing page reflects the new project instantly
        Cache::forget('portfolio_projects');

        return redirect()->route('admin')->with('success', 'Project added successfully and cache cleared!');
    }

    /**
     * Remove the specified project from storage.
     */
    public function deleteProject(Project $project)
    {
        // Try to delete image from S3 or local disk if we can parse the path
        if ($project->image_url) {
            $disk = config('filesystems.disks.s3.key') || env('AWS_ACCESS_KEY_ID') ? 's3' : 'public';
            $path = parse_url($project->image_url, PHP_URL_PATH);
            
            // Remove storage prefix if it is local public
            if ($disk === 'public') {
                $path = 'projects/' . basename($path);
            } else {
                // For S3, clean leading slash if present
                $path = ltrim($path, '/');
                // S3 URL might have bucket name in host or path, get filename
                $path = 'projects/' . basename($path);
            }
            
            if (Storage::disk($disk)->exists($path)) {
                Storage::disk($disk)->delete($path);
            }
        }

        $project->delete();

        // Invalidate Cache
        Cache::forget('portfolio_projects');

        return redirect()->route('admin')->with('success', 'Project deleted successfully and cache cleared!');
    }
}
