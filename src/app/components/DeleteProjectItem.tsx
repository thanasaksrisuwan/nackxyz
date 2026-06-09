"use client";

import { useState } from "react";
import { deleteProjectAction } from "@/lib/actions";
import { ProjectData } from "@/lib/projects";

interface DeleteProjectItemProps {
  project: ProjectData;
  onToast: (icon: string, msg: string, type: "success" | "error") => void;
}

export default function DeleteProjectItem({ project, onToast }: DeleteProjectItemProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteProjectAction(project.id);
      if (result.success) {
        onToast("✓", result.message || "Project deleted successfully!", "success");
      } else {
        onToast("✕", result.message || "Failed to delete project.", "error");
      }
    } catch (error) {
      onToast("✕", "An error occurred during deletion.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-list-item">
      <div className="project-info">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt=""
            className="project-thumb"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=80&q=80";
            }}
          />
        ) : (
          <div
            className="project-thumb"
            style={{
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            No Img
          </div>
        )}
        <div className="project-meta">
          <div className="project-title-mini" title={project.title}>
            {project.title}
          </div>
          <div className="project-tags-mini" title={project.tags.join(", ")}>
            {project.tags.join(", ")}
          </div>
        </div>
      </div>

      <button className="btn-delete" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
