<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Cloud-Native Portfolio Lab</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS (Consistent Dark Theme) -->
    <style>
        :root {
            --bg-color: #080b11;
            --card-bg: rgba(17, 24, 39, 0.55);
            --card-border: rgba(255, 255, 255, 0.06);
            --primary: #6366f1;
            --secondary: #a855f7;
            --accent: #10b981; /* Green for success actions */
            --danger: #ef4444; /* Red for deletes */
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            position: relative;
        }

        /* Abstract Background Gradients */
        .bg-glow {
            position: absolute;
            top: 0;
            right: 0;
            width: 40vw;
            height: 40vw;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(0,0,0,0) 70%);
            z-index: -1;
            filter: blur(80px);
            pointer-events: none;
        }

        header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(8, 11, 17, 0.75);
            backdrop-filter: blur(12px);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 2rem;
        }

        .logo {
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-decoration: none;
        }

        .back-btn {
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: color 0.3s;
        }

        .back-btn:hover {
            color: #fff;
        }

        main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }

        @media (max-width: 1024px) {
            main {
                grid-template-columns: 1fr;
                gap: 2.5rem;
            }
        }

        h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #fff;
        }

        .panel-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 2rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            height: fit-content;
        }

        /* Alert notifications */
        .alert {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }

        /* Forms */
        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-group label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        input, textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 0.8rem 1rem;
            color: #fff;
            font-family: inherit;
            font-size: 0.95rem;
            transition: all 0.3s;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        input[type="file"] {
            padding: 0.6rem;
            cursor: pointer;
        }

        .help-text {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.35rem;
        }

        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #fff;
            border: none;
            padding: 0.9rem;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        /* Project Management list */
        .project-list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--card-border);
            border-radius: 8px;
            margin-bottom: 1rem;
            gap: 1rem;
        }

        .project-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            overflow: hidden;
        }

        .project-thumb {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            object-fit: cover;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .project-meta {
            overflow: hidden;
        }

        .project-title-mini {
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .project-tags-mini {
            font-size: 0.75rem;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn-delete {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-delete:hover {
            background: var(--danger);
            color: #fff;
            border-color: var(--danger);
        }

        .empty-state {
            text-align: center;
            color: var(--text-muted);
            padding: 2rem 0;
        }
    </style>
</head>
<body>
    <div class="bg-glow"></div>

    <header>
        <div class="nav-container">
            <a href="{{ route('portfolio') }}" class="logo">PORTFOLIO LAB</a>
            <a href="{{ route('portfolio') }}" class="back-btn">← Back to Portfolio</a>
        </div>
    </header>

    <main>
        <!-- Project Creation Panel -->
        <div>
            <h2>Add New Project</h2>
            <div class="panel-card">
                @if(session('success'))
                    <div class="alert">
                        {{ session('success') }}
                    </div>
                @endif

                @if ($errors->any())
                    <div class="alert" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #f87171;">
                        <ul style="list-style-type: none; padding: 0;">
                            @foreach ($errors->all() as $error)
                                <li>• {{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('projects.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="form-group">
                        <label for="title">Project Title</label>
                        <input type="text" id="title" name="title" required value="{{ old('title') }}" placeholder="e.g. Serverless API Endpoint">
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" required placeholder="Describe the project objective, architecture, and technology details...">{{ old('description') }}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="tags">Tags (Comma-Separated)</label>
                        <input type="text" id="tags" name="tags" required value="{{ old('tags') }}" placeholder="e.g. Laravel, AWS S3, Redis, Nginx">
                        <div class="help-text">Separate each tag with a comma.</div>
                    </div>

                    <div class="form-group">
                        <label for="image">Project Image / Screenshot</label>
                        <input type="file" id="image" name="image" required accept="image/*">
                        <div class="help-text">Image will be uploaded directly to AWS S3 (or local disk if S3 is not configured). Max 5MB.</div>
                    </div>

                    <div class="form-group">
                        <label for="project_url">Live Demo URL (Optional)</label>
                        <input type="url" id="project_url" name="project_url" value="{{ old('project_url') }}" placeholder="https://example.com">
                    </div>

                    <div class="form-group">
                        <label for="github_url">GitHub URL (Optional)</label>
                        <input type="url" id="github_url" name="github_url" value="{{ old('github_url') }}" placeholder="https://github.com/username/project">
                    </div>

                    <button type="submit" class="btn-submit">Publish Project</button>
                </form>
            </div>
        </div>

        <!-- Project List & Management Panel -->
        <div>
            <h2>Manage Existing Projects</h2>
            <div class="panel-card" style="max-height: 700px; overflow-y: auto;">
                @forelse($projects as $project)
                    <div class="project-list-item">
                        <div class="project-info">
                            @if($project->image_url)
                                <img src="{{ $project->image_url }}" alt="" class="project-thumb" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=80&q=80'">
                            @else
                                <div class="project-thumb" style="background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: var(--text-muted);">No Img</div>
                            @endif
                            <div class="project-meta">
                                <div class="project-title-mini" title="{{ $project->title }}">{{ $project->title }}</div>
                                <div class="project-tags-mini" title="{{ is_array($project->tags) ? implode(', ', $project->tags) : '' }}">
                                    {{ is_array($project->tags) ? implode(', ', $project->tags) : '' }}
                                </div>
                            </div>
                        </div>
                        
                        <form action="{{ route('projects.delete', $project->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this project? This will also delete its image file from storage.');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn-delete">Delete</button>
                        </form>
                    </div>
                @empty
                    <div class="empty-state">
                        <p>No projects registered in the database yet.</p>
                        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Use the form to add projects or run seeders.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </main>

    <footer style="margin-top: 5rem; text-align: center; padding: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.05); color: var(--text-muted); font-size: 0.9rem;">
        &copy; {{ date('Y') }} Cloud-Native Portfolio Lab - Admin panel.
    </footer>
</body>
</html>
