<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Privacy Policy
    |--------------------------------------------------------------------------
    */
    'privacy' => [
        'title' => 'Privacy Policy',
        'meta_description' => 'Shh Me privacy policy — how we collect, use, and protect your data. GDPR & CCPA compliant.',
        'last_updated' => 'Last updated: March 26, 2026',
        'intro' => 'Shh Me ("we", "us", "our") operates the Shh Me mobile application. This policy explains how we collect, use, disclose, and safeguard your information.',

        'data_collected_title' => 'Data We Collect',
        'data_collected_items' => [
            'Account data: email address, date of birth, display name, profile photo.',
            'Usage data: messages sent (encrypted), reactions, timestamps, device type.',
            'Technical data: IP address, device identifiers, crash logs, app version.',
            'Photos: images shared within conversations (encrypted at rest, auto-deleted after 24 hours).',
        ],

        'purpose_title' => 'How We Use Your Data',
        'purpose_items' => [
            'Provide and maintain the service.',
            'Enforce age restrictions (18+).',
            'Detect and prevent abuse, spam, and violations of our Community Guidelines.',
            'Send transactional notifications (never marketing without consent).',
            'Improve the app through anonymized analytics.',
        ],

        'retention_title' => 'Data Retention',
        'retention_text' => 'Messages and photos are automatically deleted after 24 hours. Account data is retained while your account is active. Upon deletion, all personal data is purged within 30 days.',

        'rights_eu_title' => 'Your Rights (EU/EEA — GDPR)',
        'rights_eu_items' => [
            'Access: request a copy of your personal data.',
            'Rectification: correct inaccurate data.',
            'Erasure: request deletion of your data ("right to be forgotten").',
            'Portability: receive your data in a machine-readable format.',
            'Objection: object to processing based on legitimate interest.',
            'Complaint: lodge a complaint with your local Data Protection Authority.',
        ],

        'rights_us_title' => 'Your Rights (US — CCPA/CPRA)',
        'rights_us_items' => [
            'Know: request what personal information we collect and why.',
            'Delete: request deletion of your personal information.',
            'Opt-out: we do not sell personal information.',
            'Non-discrimination: exercising your rights will not affect the service you receive.',
        ],

        'security_title' => 'Security',
        'security_text' => 'We use industry-standard encryption (TLS in transit, AES-256 at rest) and conduct regular security audits. No method of transmission is 100% secure; we cannot guarantee absolute security.',

        'children_title' => 'Children',
        'children_text' => 'Shh Me is strictly for users aged 18 and older. We do not knowingly collect data from anyone under 18. If we learn we have, we will delete it immediately.',

        'dpo_title' => 'Data Protection Officer',
        'dpo_text' => 'For any privacy-related questions, contact our DPO at:',
        'dpo_email' => 'dpo@shh-me.com',

        'contact_title' => 'Contact Us',
        'contact_text' => 'Email: contact@shh-me.com',

        'changes_title' => 'Changes to This Policy',
        'changes_text' => 'We may update this policy from time to time. We will notify you of material changes via in-app notification.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Terms of Service
    |--------------------------------------------------------------------------
    */
    'terms' => [
        'title' => 'Terms of Service',
        'meta_description' => 'Shh Me terms of service — rules, responsibilities, and your agreement with us.',
        'last_updated' => 'Last updated: March 26, 2026',
        'intro' => 'By using Shh Me, you agree to these Terms. If you do not agree, do not use the app.',

        'eligibility_title' => 'Eligibility',
        'eligibility_text' => 'You must be at least 18 years old to create an account and use Shh Me. By registering, you confirm you meet this age requirement.',

        'acceptable_use_title' => 'Acceptable Use',
        'acceptable_use_text' => 'You agree not to:',
        'acceptable_use_items' => [
            'Send unsolicited, harassing, threatening, or illegal content.',
            'Impersonate another person or entity.',
            'Distribute malware, spam, or automated messages.',
            'Attempt to access another user\'s account without authorization.',
            'Use the service for commercial purposes without prior written consent.',
            'Share content involving minors in any sexual or exploitative context.',
        ],

        'moderation_title' => 'Content Moderation',
        'moderation_text' => 'We may review, remove, or restrict content that violates these Terms or our Community Guidelines. AI-assisted moderation may be used. Decisions can be appealed by contacting support.',

        'account_deletion_title' => 'Account Deletion',
        'account_deletion_text' => 'You may delete your account at any time from the app settings or via our deletion page. All personal data will be permanently erased within 30 days. This action is irreversible.',

        'ip_title' => 'Intellectual Property',
        'ip_text' => 'All trademarks, logos, and service marks displayed on Shh Me are our property. You retain ownership of content you create but grant us a limited, non-exclusive license to display it within the service.',

        'liability_title' => 'Limitation of Liability',
        'liability_text' => 'Shh Me is provided "as is" without warranty of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.',

        'termination_title' => 'Termination',
        'termination_text' => 'We may suspend or terminate your account at any time for violation of these Terms, without prior notice. Upon termination, your right to use the service ceases immediately.',

        'governing_law_title' => 'Governing Law',
        'governing_law_text' => 'These Terms are governed by the laws of France. Any disputes shall be submitted to the exclusive jurisdiction of the courts of Paris, France.',

        'contact_title' => 'Contact',
        'contact_text' => 'Questions about these Terms? Email us at contact@shh-me.com.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Community Guidelines
    |--------------------------------------------------------------------------
    */
    'community' => [
        'title' => 'Community Guidelines',
        'meta_description' => 'Shh Me community guidelines — rules for a safe and respectful anonymous messaging experience.',
        'last_updated' => 'Last updated: March 26, 2026',
        'intro' => 'Shh Me is a space for honest, anonymous expression. To keep it safe, everyone must follow these guidelines.',

        'rules_title' => 'Community Rules',
        'rules_items' => [
            'Be respectful: no bullying, harassment, hate speech, or discrimination.',
            'No explicit content involving minors — zero tolerance.',
            'No threats of violence or self-harm.',
            'No doxxing: never share someone\'s personal information without consent.',
            'No spam or commercial solicitation.',
            'No impersonation of others.',
            'No illegal activity or promotion thereof.',
            'Respect the anonymity of others — do not attempt to unmask users.',
        ],

        'consequences_title' => 'Consequences',
        'consequences_text' => 'Violations result in progressive enforcement:',
        'consequences_items' => [
            'Warning: first-time minor violations receive a warning.',
            'Restriction: repeated violations lead to feature restrictions (e.g., photo sharing disabled).',
            'Suspension: serious or repeated violations result in temporary suspension (7-30 days).',
            'Ban: severe violations (threats, CSAM, doxxing) result in permanent account ban.',
        ],

        'reporting_title' => 'Reporting',
        'reporting_text' => 'If you encounter content that violates these guidelines, report it directly from the app. All reports are reviewed within 24 hours. You can also email reports to:',
        'reporting_email' => 'report@shh-me.com',

        'appeals_title' => 'Appeals',
        'appeals_text' => 'If you believe an action against your account was made in error, you may appeal by emailing contact@shh-me.com within 30 days.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */
    'contact' => [
        'title' => 'Contact Us',
        'meta_description' => 'Contact the Shh Me team — questions, feedback, or support.',
        'intro' => 'Have a question, suggestion, or need help? Reach out to us.',
        'email_label' => 'Your email',
        'message_label' => 'Your message',
        'submit' => 'Send',
        'email_address' => 'contact@shh-me.com',
        'email_text' => 'You can also email us directly at:',
        'success' => 'Your message has been sent. We will reply as soon as possible.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Account Deletion
    |--------------------------------------------------------------------------
    */
    'delete_account' => [
        'title' => 'Delete Your Account',
        'meta_description' => 'Delete your Shh Me account — permanent data erasure within 30 days.',
        'intro' => 'We\'re sorry to see you go. Deleting your account is permanent and cannot be undone.',

        'what_happens_title' => 'What happens when you delete your account',
        'what_happens_items' => [
            'Your profile, display name, and photo are removed immediately.',
            'All your messages and conversations are deleted.',
            'All shared photos are permanently erased.',
            'Your personal data is purged from our servers within 30 days.',
            'You will not be able to recover your account after deletion.',
        ],

        'email_label' => 'Your account email',
        'confirm_button' => 'Request Account Deletion',
        'confirmation_text' => 'A confirmation email will be sent to verify your identity before deletion proceeds.',
        'in_app_text' => 'You can also delete your account directly from the app: Settings > Account > Delete Account.',
    ],
];
