"use client";

import { useState } from "react";
import { createProjectAction } from "@/lib/actions";

export default function AddProjectForm({ onToast }: { onToast: (icon: string, msg: string, type: "success" | "error") => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await createProjectAction(formData);
      if (result.success) {
        onToast("✓", result.message || "Project published successfully!", "success");
        e.currentTarget.reset();
      } else {
        onToast("✕", result.message || "Failed to create project.", "error");
      }
    } catch (error) {
      onToast("✕", "An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g. Serverless API Endpoint"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            required
            placeholder="Describe the project objective, architecture, and technology details..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (Comma-Separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            required
            placeholder="e.g. Laravel, AWS S3, Redis, Nginx"
          />
          <div className="help-text">Separate each tag with a comma.</div>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Project Image / Screenshot URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            placeholder="https://images.unsplash.com/photo-..."
          />
          <div className="help-text">Leave blank to use a default high-quality placeholder image.</div>
        </div>

        <div className="form-group">
          <label htmlFor="project_url">Live Demo URL (Optional)</label>
          <input
            type="url"
            id="project_url"
            name="project_url"
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="github_url">GitHub URL (Optional)</label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            placeholder="https://github.com/username/project"
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading && <span className="spinner" style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "50%",
            borderTopColor: "#fff",
            animation: "spin 1s ease-in-out infinite",
            marginRight: "8px"
          }}></span>}
          <span>{loading ? "Publishing..." : "Publish Project"}</span>
        </button>
      </form>
    </div>
  );
}
