'use client';

import { useState } from 'react';

export type ContactValues = { name: string; email: string; phone: string; message: string; honeypot: string };
export type ContactField = 'name' | 'email' | 'phone' | 'message';
export type ContactMessages = Record<ContactField, string> & {
  rateLimit: string;
  sendError: string;
  summary: string;
};

const EMPTY_VALUES: ContactValues = { name: '', email: '', phone: '', message: '', honeypot: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{9,15}$/;

function validate(values: ContactValues, messages: ContactMessages): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  const name = values.name.trim();
  const message = values.message.trim();
  if (name.length < 2 || name.length > 100) errors.name = messages.name;
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = messages.email;
  if (values.phone && !PHONE_PATTERN.test(values.phone)) errors.phone = messages.phone;
  if (message.length < 10 || message.length > 2000) errors.message = messages.message;
  return errors;
}

export function useContactForm(messages: ContactMessages) {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<'default' | 'validating' | 'submitting' | 'success' | 'rate-limit' | 'error'>('default');
  const [summary, setSummary] = useState('');

  function updateField(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== 'honeypot') {
      const fieldError = validate({ ...values, [field]: value }, messages)[field];
      setErrors((current) => ({ ...current, [field]: fieldError }));
    }
  }

  function validateForm() {
    const nextErrors = validate(values, messages);
    setErrors(nextErrors);
    setStatus('validating');
    return Object.keys(nextErrors).length === 0;
  }

  function validateField(field: ContactField) {
    const fieldError = validate(values, messages)[field];
    setErrors((current) => ({ ...current, [field]: fieldError }));
    setStatus('validating');
  }

  async function submit() {
    if (status === 'submitting' || !validateForm()) return;
    setSummary('');
    setStatus('submitting');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload: unknown = await response.json();
      if (response.ok) {
        setStatus('success');
        return;
      }
      if (response.status === 429) {
        setSummary(messages.rateLimit);
        setStatus('rate-limit');
        return;
      }
      if (response.status === 400 && typeof payload === 'object' && payload !== null && 'errors' in payload) {
        const apiErrors = payload.errors;
        const fieldErrors: Partial<Record<ContactField, string>> = {};
        if (typeof apiErrors === 'object' && apiErrors !== null) {
          for (const field of ['name', 'email', 'phone', 'message'] as const) {
            if (field in apiErrors) fieldErrors[field] = messages[field];
          }
        }
        setErrors(fieldErrors);
        setSummary(messages.summary);
        setStatus('error');
        return;
      }
      setSummary(messages.sendError);
      setStatus('error');
    } catch {
      setSummary(messages.sendError);
      setStatus('error');
    }
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setErrors({});
    setSummary('');
    setStatus('default');
  }

  return { values, errors, status, summary, updateField, validateField, submit, reset };
}
