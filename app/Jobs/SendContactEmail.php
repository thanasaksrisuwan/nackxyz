<?php

namespace App\Jobs;

use App\Mail\ContactMail;
use App\Models\Contact;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendContactEmail implements ShouldQueue
{
    use Queueable;

    public Contact $contact;

    /**
     * Create a new job instance.
     */
    public function __construct(Contact $contact)
    {
        $this->contact = $contact;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get administrator email or fallback to MAIL_FROM_ADDRESS
        $adminEmail = config('mail.admin_email', config('mail.from.address'));

        Mail::to($adminEmail)->send(new ContactMail($this->contact));
    }
}
