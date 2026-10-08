'use client';

import { useState } from 'react';

export type ContactValues = { name: string; email: string; phone: string; message: string; honeypot: string };
export type ContactField = 'name' | 'email' | 'phone' | 'message';
export type ContactMessages = Record<ContactField, string> & {
  rateLimit: string;
  sendError: string;
  summary: string;
};

type ContactApiErrors = Partial<Record<ContactField | 'form' | 'honeypot', string>>;

// Server error strings (src/lib/api/contact-schema.ts) are Vietnamese-only; the UI is localized,
// so we read only *which* fields the server flagged and render the localized message for them.
function readServerErrors(payload: unknown): ContactApiErrors {
  if (typeof payload !== 'object' || payload === null || !('errors' in payload)) return {};
  const apiErrors = payload.errors;
  if (typeof apiErrors !== 'object' || apiErrors === null) return {};
  const errors: ContactApiErrors = {};
  for (const [field, message] of Object.entries(apiErrors)) {
    if (typeof message !== 'string') continue;
    switch (field) {
      case 'name':
      case 'email':
      case 'phone':
      case 'message':
      case 'form':
      case 'honeypot':
        errors[field] = message;
        break;
    }
  }
  return errors;
}

const EMPTY_VALUES: ContactValues = { name: '', email: '', phone: '', message: '', honeypot: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{9,15}$/;

function validate(values: ContactValues, messages: ContactMessages, fields: readonly ContactField[]): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  const name = values.name.trim();
  const message = values.message.trim();
  if (fields.includes('name') && (name.length < 2 || name.length > 100)) errors.name = messages.name;
  if (fields.includes('email') && !EMAIL_PATTERN.test(values.email.trim())) errors.email = messages.email;
  if (fields.includes('phone') && values.phone && !PHONE_PATTERN.test(values.phone)) errors.phone = messages.phone;
  if (fields.includes('message') && (message.length < 10 || message.length > 2000)) errors.message = messages.message;
  return errors;
}

export function useContactForm(messages: ContactMessages, fields: readonly ContactField[] = ['name', 'email', 'phone', 'message']) {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [status, setStatus] = useState<'default' | 'validating' | 'submitting' | 'success' | 'rate-limit' | 'error'>('default');
  const [summary, setSummary] = useState('');

  function updateField(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== 'honeypot') {
      const fieldError = validate({ ...values, [field]: value }, messages, fields)[field];
      setErrors((current) => {
        const next = { ...current };
        if (fieldError) next[field] = fieldError;
        else delete next[field];
        return next;
      });
    }
  }

  function validateForm() {
    const nextErrors = validate(values, messages, fields);
    setErrors(nextErrors);
    setStatus('validating');
    return Object.keys(nextErrors).length === 0;
  }

  function validateField(field: ContactField) {
    const fieldError = validate(values, messages, fields)[field];
    setErrors((current) => {
      const next = { ...current };
      if (fieldError) next[field] = fieldError;
      else delete next[field];
      return next;
    });
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
      if (response.status === 400) {
        const apiErrors = readServerErrors(payload);
        const fieldErrors: Partial<Record<ContactField, string>> = {};
        for (const field of fields) {
          if (apiErrors[field]) fieldErrors[field] = messages[field];
        }
        setErrors(fieldErrors);
        setSummary(Object.keys(fieldErrors).length ? messages.summary : messages.sendError);
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
