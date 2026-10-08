import type { ContactForm } from './contact-schema';

const FORWARD_TIMEOUT_MS = 5000;

export async function forwardContactForm(contact: ContactForm): Promise<void> {
  const target = process.env.CONTACT_FORM_TARGET;
  if (!target || process.env.NEXT_PUBLIC_CONTACT_FORM_TARGET) {
    throw new Error('Contact forwarding is not configured');
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
    }),
    signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error('Contact forwarding failed');
  }
}
