import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME } from "./dynamodb";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image_url: string;
  project_url?: string;
  github_url?: string;
  created_at: string;
}

const DEFAULT_PROJECTS: ProjectData[] = [
  {
    id: "project_seed_1",
    title: 'Laravel e-Commerce Engine',
    description: 'A high-performance e-commerce platform built with Laravel, Livewire, and Redis. Features dynamic caching, job queues for invoice generation, and full integration with AWS S3 for product images.',
    tags: ['Laravel', 'Livewire', 'Redis', 'MySQL', 'AWS S3'],
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    project_url: 'https://ecommerce.example.com',
    github_url: 'https://github.com/example/laravel-ecommerce',
    created_at: new Date().toISOString(),
  },
  {
    id: "project_seed_2",
    title: 'Cloud-Native Portfolio Lab',
    description: 'The current portfolio website! A decoupled, highly optimized application deployed on AWS EC2, using RDS for data persistence, Redis for caching/queues, and S3 for asset management.',
    tags: ['Laravel', 'AWS EC2', 'AWS RDS', 'AWS S3', 'Redis'],
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    project_url: 'https://portfolio.example.com',
    github_url: 'https://github.com/example/portfolio-lab',
    created_at: new Date().toISOString(),
  },
  {
    id: "project_seed_3",
    title: 'Real-time Chat & Notifications',
    description: 'A real-time chat application utilizing Laravel Reverb, Redis broadcasting, and a modern responsive interface. Handles concurrent WebSocket connections with low latency.',
    tags: ['Laravel', 'WebSockets', 'Redis', 'TailwindCSS', 'CSS Grid'],
    image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    project_url: 'https://chat.example.com',
    github_url: 'https://github.com/example/chat-app',
    created_at: new Date().toISOString(),
  }
];

export async function getProjects(): Promise<ProjectData[]> {
  if (!TABLE_NAME) return DEFAULT_PROJECTS;

  try {
    const response = await ddbDocClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(id, :prefix)",
        ExpressionAttributeValues: {
          ":prefix": "project_",
        },
      })
    );

    const items = (response.Items as any[]) || [];
    if (items.length === 0) {
      // Try to seed initial projects if table is empty, but don't block
      await seedProjects().catch(() => {});
      return DEFAULT_PROJECTS;
    }

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || "[]"),
      image_url: item.image_url,
      project_url: item.project_url || "",
      github_url: item.github_url || "",
      created_at: item.created_at || new Date().toISOString(),
    })).sort((a, b) => b.created_at.localeCompare(a.created_at));
  } catch (error) {
    console.error("Failed to fetch projects from DynamoDB, falling back to seeds:", error);
    return DEFAULT_PROJECTS;
  }
}

export async function createProject(project: Omit<ProjectData, "id" | "created_at">): Promise<boolean> {
  if (!TABLE_NAME) return false;
  try {
    const id = "project_" + Date.now();
    const created_at = new Date().toISOString();
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id,
          ...project,
          created_at,
        },
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to create project:", error);
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!TABLE_NAME) return false;
  try {
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to delete project:", error);
    return false;
  }
}

export async function seedProjects(): Promise<void> {
  if (!TABLE_NAME) return;
  try {
    for (const project of DEFAULT_PROJECTS) {
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            ...project,
          },
        })
      );
    }
    console.log("Projects seeded successfully.");
  } catch (error) {
    console.error("Failed to seed projects:", error);
  }
}
