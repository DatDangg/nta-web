'use client';

import { useEffect } from 'react';

export function FocusMain() {
  useEffect(() => {
    document.getElementById('main')?.focus();
  }, []);

  return null;
}
