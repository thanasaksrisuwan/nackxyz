import { getProjects } from "@/lib/projects";
import AdminPanel from "../components/AdminPanel";

export const revalidate = 0; // Disable caching for the admin page to always show fresh database states

export const metadata = {
  title: "Admin Panel - Cloud-Native Portfolio Lab",
  description: "Secure administration panel for managing portfolio projects.",
};

export default async function AdminPage() {
  const projects = await getProjects();

  return <AdminPanel initialProjects={projects} />;
}
