<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Message</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h2 {
            color: #4f46e5;
            margin-top: 0;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 10px;
        }
        .field {
            margin-bottom: 20px;
        }
        .label {
            font-weight: bold;
            color: #4b5563;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .value {
            margin-top: 5px;
            font-size: 1.1em;
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
        }
        .message-box {
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.8em;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>New Contact Submission</h2>
        
        <div class="field">
            <div class="label">Sender Name</div>
            <div class="value">{{ $contact->name }}</div>
        </div>

        <div class="field">
            <div class="label">Sender Email</div>
            <div class="value">{{ $contact->email }}</div>
        </div>

        <div class="field">
            <div class="label">Subject</div>
            <div class="value">{{ $contact->subject }}</div>
        </div>

        <div class="field">
            <div class="label">Message</div>
            <div class="value message-box">{{ $contact->message }}</div>
        </div>

        <div class="footer">
            <p>Sent from Laravel Portfolio Lab Contact Form</p>
        </div>
    </div>
</body>
</html>
