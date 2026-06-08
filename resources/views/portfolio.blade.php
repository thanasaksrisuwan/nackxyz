<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Cloud-Native Portfolio Lab</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS (Vanilla CSS with rich aesthetics) -->
    <style>
        :root {
            --bg-color: #080b11;
            --card-bg: rgba(17, 24, 39, 0.55);
            --card-border: rgba(255, 255, 255, 0.06);
            --card-border-hover: rgba(99, 102, 241, 0.4);
            --primary: #6366f1; /* Indigo */
            --primary-glow: rgba(99, 102, 241, 0.15);
            --secondary: #a855f7; /* Purple */
            --accent: #06b6d4; /* Cyan */
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
            overflow-x: hidden;
            position: relative;
        }

        /* Abstract Background Gradients */
        .bg-glow-1 {
            position: absolute;
            top: -10%;
            left: -10%;
            width: 50vw;
            height: 50vw;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(80px);
        }

        .bg-glow-2 {
            position: absolute;
            bottom: 20%;
            right: -10%;
            width: 40vw;
            height: 40vw;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(0,0,0,0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(80px);
        }

        /* Grid overlay background */
        .grid-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.007) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.007) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: -2;
            pointer-events: none;
        }

        header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 50;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(8, 11, 17, 0.75);
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
            letter-spacing: -0.05em;
        }

        nav a {
            color: var(--text-muted);
            text-decoration: none;
            margin-left: 2rem;
            font-size: 0.95rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        nav a:hover, nav a.active {
            color: var(--text-main);
        }

        .nav-btn {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #fff;
            padding: 0.5rem 1.25rem;
            border-radius: 9999px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .nav-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
            color: #fff;
        }

        main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 8rem 2rem 4rem;
        }

        /* Hero Section */
        .hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 4rem 0 6rem;
            position: relative;
        }

        .hero-badge {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #818cf8;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 1.5rem;
            display: inline-block;
        }

        .hero h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.03em;
            max-width: 800px;
            margin-bottom: 1.5rem;
            background: linear-gradient(to right, #ffffff, #d1d5db);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero h1 span {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            color: var(--text-muted);
            font-size: 1.15rem;
            max-width: 650px;
            line-height: 1.6;
            margin-bottom: 2.5rem;
        }

        .hero-actions {
            display: flex;
            gap: 1rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #fff;
            padding: 0.85rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px var(--primary-glow);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--text-main);
            padding: 0.85rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        /* Section Styling */
        .section-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-align: center;
            letter-spacing: -0.02em;
        }

        .section-desc {
            color: var(--text-muted);
            text-align: center;
            max-width: 600px;
            margin: 0 auto 3.5rem;
            line-height: 1.6;
        }

        /* Projects Grid */
        .projects-section {
            padding: 4rem 0;
            scroll-margin-top: 6rem;
        }

        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }

        .project-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .project-card:hover {
            transform: translateY(-8px);
            border-color: var(--card-border-hover);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.12);
        }

        .project-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-bottom: 1px solid var(--card-border);
            transition: transform 0.5s ease;
        }

        .project-card:hover .project-image {
            transform: scale(1.03);
        }

        .project-content {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .project-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .tag {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--accent);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .project-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: #fff;
        }

        .project-description {
            color: var(--text-muted);
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
            flex-grow: 1;
        }

        .project-links {
            display: flex;
            gap: 1rem;
            margin-top: auto;
        }

        .project-link {
            font-size: 0.88rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            transition: color 0.3s;
        }

        .link-demo {
            color: var(--primary);
        }

        .link-demo:hover {
            color: #818cf8;
        }

        .link-github {
            color: var(--text-muted);
        }

        .link-github:hover {
            color: var(--text-main);
        }

        /* Contact Section */
        .contact-section {
            padding: 6rem 0 4rem;
            scroll-margin-top: 6rem;
            max-width: 700px;
            margin: 0 auto;
        }

        .contact-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 2.5rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        @media (max-width: 640px) {
            .form-row {
                grid-template-columns: 1fr;
                gap: 0;
            }
        }

        label {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        input, textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 0.85rem 1rem;
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

        textarea {
            resize: vertical;
            min-height: 150px;
        }

        .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #fff;
            border: none;
            padding: 1rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }

        /* Toast notifications */
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #111827;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 100;
            transform: translateY(150%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .toast.show {
            transform: translateY(0);
        }

        .toast.success {
            border-color: #10b981;
        }

        .toast.error {
            border-color: #ef4444;
        }

        .toast-icon {
            font-size: 1.25rem;
        }

        /* Spinner for loading state */
        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
            display: none;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        footer {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            background: rgba(8, 11, 17, 0.9);
            padding: 2.5rem 2rem;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        /* Scroll top button */
        .scroll-top {
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--text-muted);
            cursor: pointer;
            z-index: 40;
            transition: all 0.3s;
            text-decoration: none;
            opacity: 0;
            pointer-events: none;
        }

        .scroll-top.visible {
            opacity: 1;
            pointer-events: auto;
        }

        .scroll-top:hover {
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
            transform: translateY(-3px);
        }
    </style>
</head>
<body>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>
    <div class="grid-overlay"></div>

    <!-- Header Navigation -->
    <header>
        <div class="nav-container">
            <div class="logo">PORTFOLIO LAB</div>
            <nav class="flex items-center">
                <a href="#" class="active">Home</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-badge">AWS Free Tier Deploy Lab</div>
            <h1>Decoupled Architecture with <br><span>Laravel, S3 & Redis</span></h1>
            <p>Welcome to my cloud laboratory. This portfolio is built on a high-availability decoupled architecture using AWS EC2, Amazon RDS (MySQL), Amazon S3 Object Storage, and dynamic in-memory caching and queuing using Redis.</p>
            <div class="hero-actions">
                <a href="#projects" class="btn-primary">Explore Projects</a>
                <a href="#contact" class="btn-secondary">Get in Touch</a>
            </div>
        </section>

        <!-- Projects Section -->
        <section id="projects" class="projects-section">
            <h2 class="section-title">Featured Projects</h2>
            <p class="section-desc">These projects represent standard industry architectures, optimized for high load and cloud native infrastructures.</p>
            
            <div class="projects-grid">
                @forelse($projects as $project)
                    <div class="project-card">
                        @if($project->image_url)
                            <img src="{{ $project->image_url }}" alt="{{ $project->title }}" class="project-image" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'">
                        @else
                            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" alt="Placeholder" class="project-image">
                        @endif
                        <div class="project-content">
                            <div class="project-tags">
                                @if($project->tags)
                                    @foreach($project->tags as $tag)
                                        <span class="tag">{{ $tag }}</span>
                                    @endforeach
                                @endif
                            </div>
                            <h3 class="project-title">{{ $project->title }}</h3>
                            <p class="project-description">{{ $project->description }}</p>
                            <div class="project-links">
                                @if($project->project_url)
                                    <a href="{{ $project->project_url }}" target="_blank" class="project-link link-demo">
                                        Live Demo ↗
                                    </a>
                                @endif
                                @if($project->github_url)
                                    <a href="{{ $project->github_url }}" target="_blank" class="project-link link-github">
                                        GitHub ↗
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>
                @empty
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: 16px; border: 1px dashed var(--card-border);">
                        <p style="color: var(--text-muted)">No projects found. Use the Admin Panel to seed or create projects!</p>
                    </div>
                @endforelse
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact-section">
            <h2 class="section-title">Let's Connect</h2>
            <p class="section-desc">Have a question or want to work together? Send a message and it will be dispatched immediately via our Redis queue.</p>
            
            <div class="contact-card">
                <form id="contactForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Your Name</label>
                            <input type="text" id="name" name="name" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email" required placeholder="john@example.com">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <input type="text" id="subject" name="subject" required placeholder="Project Inquiry">
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" required placeholder="Write your message here..."></textarea>
                    </div>
                    
                    <button type="submit" id="submitBtn" class="submit-btn">
                        <span class="spinner" id="btnSpinner"></span>
                        <span id="btnText">Send Message</span>
                    </button>
                </form>
            </div>
        </section>
    </main>

    <!-- Toast Notification -->
    <div id="toast" class="toast">
        <span class="toast-icon" id="toastIcon">✓</span>
        <span id="toastMessage">Message sent successfully!</span>
    </div>

    <!-- Scroll to Top Link -->
    <a href="#" id="scrollTop" class="scroll-top">▲</a>

    <!-- Footer -->
    <footer>
        <p>&copy; {{ date('Y') }} Cloud-Native Portfolio Lab. Built with Laravel 13, deployed on AWS.</p>
    </footer>

    <!-- Vanilla Javascript Logic -->
    <script>
        // Scroll navigation highlight and scroll top button visibility
        const scrollTopBtn = document.getElementById('scrollTop');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        // AJAX Contact Form Submission
        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnSpinner = document.getElementById('btnSpinner');
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toastIcon');
        const toastMessage = document.getElementById('toastMessage');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable button and show spinner
            submitBtn.disabled = true;
            btnSpinner.style.display = 'block';
            btnText.textContent = 'Processing...';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('{{ route("contact.submit") }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showToast('✓', result.message || 'Your message has been sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    const errorMsg = result.errors ? Object.values(result.errors)[0][0] : result.message;
                    showToast('✕', errorMsg || 'An error occurred. Please try again.', 'error');
                }
            } catch (error) {
                showToast('✕', 'Network error. Please check your connection.', 'error');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                btnSpinner.style.display = 'none';
                btnText.textContent = 'Send Message';
            }
        });

        function showToast(icon, message, type) {
            toastIcon.textContent = icon;
            toastMessage.textContent = message;
            
            toast.className = 'toast'; // Reset
            toast.classList.add('show', type);

            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    </script>
</body>
</html>
