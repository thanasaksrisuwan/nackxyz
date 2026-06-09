"use client";

import { useState } from "react";
import { submitContactAction } from "@/lib/actions";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; icon: string; msg: string; type: "success" | "error" }>({
    show: false,
    icon: "✓",
    msg: "Message sent successfully!",
    type: "success",
  });

  const triggerToast = (icon: string, msg: string, type: "success" | "error") => {
    setToast({ show: true, icon, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await submitContactAction(null, formData);

      if (result.success) {
        triggerToast("✓", result.message, "success");
        e.currentTarget.reset();
      } else {
        triggerToast("✕", result.message || "An error occurred.", "error");
      }
    } catch (error) {
      triggerToast("✕", "Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-card">
        <form onSubmit={handleSubmit}>
          {/* Honeypot field (hidden from normal users) */}
          <div style={{ display: "none" }}>
            <label htmlFor="honey">Do not fill this out</label>
            <input type="text" id="honey" name="honey" defaultValue="" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input type="text" id="name" name="name" required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" required placeholder="john@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" required placeholder="Project Inquiry" />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required placeholder="Write your message here..."></textarea>
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
            <span>{loading ? "Processing..." : "Send Message"}</span>
          </button>
        </form>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? "show" : ""} ${toast.type}`}>
        <span className="toast-icon">{toast.icon}</span>
        <span>{toast.msg}</span>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
