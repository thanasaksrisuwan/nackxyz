import Link from "next/link";
import { getProjects } from "@/lib/projects";
import ContactForm from "./components/ContactForm";

export const revalidate = 0; // Disable server caching to ensure dynamic project updates show up

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <>
      {/* Abstract Background Gradients & Grid Overlay */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="grid-overlay"></div>

      {/* Navigation Header */}
      <header>
        <div className="nav-container">
          <Link href="/" className="logo">
            PORTFOLIO LAB
          </Link>
          <nav>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
            <Link href="/dashboard" className="nav-btn">
              Trade Bot ↗
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-badge">Cloud-Native Architect</div>
          <h1>
            Full-Stack Serverless &amp; <span>Trading Systems</span>
          </h1>
          <p>
            Welcome to the Lab. I design high-performance, cost-efficient cloud architectures
            operating entirely within the AWS Free Tier. Explore my projects and live trading engine below.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn-primary">
              View Work
            </a>
            <a href="#contact" className="btn-secondary">
              Get in Touch
            </a>
          </div>
        </section>

        {/* Bio Section */}
        <section style={{ padding: "4rem 0", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div className="grid-2" style={{ alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "2rem", marginBottom: "1.5rem" }}>
                Decoupled &amp; Ephemeral Architecture
              </h2>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.7", marginBottom: "1rem" }}>
                This portfolio has been completely migrated from a Laravel monolith to a modern
                <strong> Next.js Full-Stack App Router</strong> application.
              </p>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>
                Leveraging Next.js <strong>Server Components</strong> for lightning-fast server-side rendering
                and <strong>Server Actions</strong> for secure API calls, the entire system is optimized to
                execute inside serverless AWS Lambda micro-VMs with zero cold-start database overhead.
              </p>
            </div>
            <div className="panel-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Framework</span>
                <span style={{ color: "var(--accent)", fontWeight: "700" }}>Next.js (App Router)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Data Layer</span>
                <span style={{ color: "#a855f7", fontWeight: "700" }}>Amazon DynamoDB</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Compute</span>
                <span style={{ color: "var(--success)", fontWeight: "700" }}>AWS Lambda (FaaS)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Styling</span>
                <span style={{ color: "#fbbf24", fontWeight: "700" }}>Vanilla CSS Custom Tokens</span>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="projects-section" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <h2 className="section-title" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>Featured Projects</h2>
          <p className="section-desc">
            These projects represent standard industry architectures, optimized for high load and cloud native infrastructures.
          </p>

          <div className="projects-grid">
            {projects.map((project) => (
              <div className="project-card" key={project.id}>
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="project-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
                    alt="Placeholder"
                    className="project-image"
                  />
                )}
                <div className="project-content">
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="project-title" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-links">
                    {project.project_url && (
                      <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="project-link link-demo">
                        Live Demo ↗
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="project-link link-github">
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "3rem",
                  background: "var(--card-bg)",
                  borderRadius: "16px",
                  border: "1px dashed var(--card-border)",
                }}
              >
                <p style={{ color: "var(--text-muted)" }}>
                  No projects found. Use the Admin Panel to seed or create projects!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="contact-section" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <h2 className="section-title" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>Let's Connect</h2>
          <p className="section-desc">
            Have a question or want to work together? Send a message and it will be dispatched immediately via Telegram webhook.
          </p>

          <ContactForm />
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; {new Date().getFullYear()} Cloud-Native Portfolio Lab. Built with Next.js, deployed on AWS.</p>
        <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
          <Link href="/admin" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
            Admin Access
          </Link>
        </p>
      </footer>
    </>
  );
}
