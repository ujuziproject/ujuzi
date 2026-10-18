# Supabase sign-in email templates

Paste each file into Supabase → Authentication → Emails (Templates), in the matching template.

| Supabase template | File | Subject line |
|---|---|---|
| Magic Link | magic-link.html | Your uJuzi sign-in link |
| Confirm signup | confirm-signup.html | Confirm your email for uJuzi |
| Reset Password | reset-password.html | Reset your uJuzi password |
| Change Email Address | change-email.html | Confirm your new uJuzi email |

The templates use Supabase's variables: {{ .ConfirmationURL }}, {{ .Email }} and {{ .SiteURL }}.
