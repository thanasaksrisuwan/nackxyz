<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = [
            [
                'title' => 'Laravel e-Commerce Engine',
                'description' => 'A high-performance e-commerce platform built with Laravel, Livewire, and Redis. Features dynamic caching, job queues for invoice generation, and full integration with AWS S3 for product images.',
                'tags' => ['Laravel', 'Livewire', 'Redis', 'MySQL', 'AWS S3'],
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
                'project_url' => 'https://ecommerce.example.com',
                'github_url' => 'https://github.com/example/laravel-ecommerce',
            ],
            [
                'title' => 'Cloud-Native Portfolio Lab',
                'description' => 'The current portfolio website! A decoupled, highly optimized application deployed on AWS EC2, using RDS for data persistence, Redis for caching/queues, and S3 for asset management.',
                'tags' => ['Laravel', 'AWS EC2', 'AWS RDS', 'AWS S3', 'Redis'],
                'image_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
                'project_url' => 'https://portfolio.example.com',
                'github_url' => 'https://github.com/example/portfolio-lab',
            ],
            [
                'title' => 'Real-time Chat & Notifications',
                'description' => 'A real-time chat application utilizing Laravel Reverb, Redis broadcasting, and a modern responsive interface. Handles concurrent WebSocket connections with low latency.',
                'tags' => ['Laravel', 'WebSockets', 'Redis', 'TailwindCSS', 'CSS Grid'],
                'image_url' => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
                'project_url' => 'https://chat.example.com',
                'github_url' => 'https://github.com/example/chat-app',
            ],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(
                ['title' => $project['title']],
                $project
            );
        }
    }
}
