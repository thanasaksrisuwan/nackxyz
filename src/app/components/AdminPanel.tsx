"use client";

import { useState } from "react";
import Link from "next/link";
import AddProjectForm from "./AddProjectForm";
import DeleteProjectItem from "./DeleteProjectItem";
import { ProjectData } from "@/lib/projects";

export default function AdminPanel({ initialProjects }: { initialProjects: ProjectData[] }) {
  const [toast, setToast] = useState<{ show: boolean; icon: string; msg: string; type: "success" | "error" }>({
    show: false,
    icon: "✓",
    msg: "",
    type: "success",
  });

  const triggerToast = (icon: string, msg: string, type: "success" | "error") => {
    setToast({ show: true, icon, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  return (
    <>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <div className="grid-overlay"></div>

      <header>
        <div className="nav-container">
          <Link href="/" className="logo">
            PORTFOLIO LAB
          </Link>
          <Link href="/" className="back-btn" style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to Portfolio
          </Link>
        </div>
      </header>

      <main className="container">
        <h2 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>
          Portfolio Admin Console
        </h2>

        <div className="grid-2">
          {/* Project Creation Panel */}
          <div>
            <h3 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "1.5rem", marginBottom: "1.25rem" }}>
              Add New Project
            </h3>
            <AddProjectForm onToast={triggerToast} />
          </div>

          {/* Project List & Management Panel */}
          <div>
            <h3 style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "1.5rem", marginBottom: "1.25rem" }}>
              Manage Existing Projects
            </h3>
            <div className="panel-card" style={{ maxHeight: "700px", overflowY: "auto" }}>
              {initialProjects.map((project) => (
                <DeleteProjectItem key={project.id} project={project} onToast={triggerToast} />
              ))}
              {initialProjects.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>
                  <p>No projects registered in the database yet.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Use the form to add projects.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? "show" : ""} ${toast.type}`}>
        <span className="toast-icon">{toast.icon}</span>
        <span>{toast.msg}</span>
      </div>
    </>
  );
}
