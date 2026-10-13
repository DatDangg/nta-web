'use client';

import { useState } from 'react';
import { ListingIcon } from '@/components/listing/icons';
import { Link } from '@/i18n/navigation';
import type { SolutionsMenuGroup } from '@/lib/content/solutions-menu';

interface SolutionsMegaMenuProps {
  groups: SolutionsMenuGroup[];
  pathname: string;
  onNavigate: () => void;
}

/** Panel 2 cột của dropdown "Giải pháp": trái = nhóm, phải = mô tả + giải pháp của nhóm đang chọn. */
export function SolutionsMegaMenu({ groups, pathname, onNavigate }: SolutionsMegaMenuProps) {
  const [activeKey, setActiveKey] = useState(() => groups.find((group) => pathname.startsWith(group.href))?.key ?? groups[0]?.key);
  const active = groups.find((group) => group.key === activeKey) ?? groups[0];
  if (!active) return null;

  return (
    <div className="absolute left-0 top-full z-10 mt-px grid w-[min(48rem,calc(100vw-3rem))] grid-cols-[19rem_1fr] rounded-2xl border border-border bg-background p-3 shadow-xl">
      <ul className="flex flex-col gap-1 border-r border-border pr-3">
        {groups.map((group) => {
          const selected = group.key === active.key;
          return (
            <li key={group.key}>
              <Link
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${selected ? 'bg-primary-light' : 'hover:bg-background-alt'}`}
                href={group.href}
                id={`desktop-solutions-${group.key}`}
                onClick={onNavigate}
                onFocus={() => setActiveKey(group.key)}
                onMouseEnter={() => setActiveKey(group.key)}
              >
                <ListingIcon aria-hidden="true" className="size-6 shrink-0 text-primary" name={group.icon} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium ${selected ? 'text-primary' : 'text-text-primary'}`}>{group.title}</span>
                  <span className="mt-0.5 block text-xs text-text-secondary">{group.tagline}</span>
                </span>
                <svg aria-hidden="true" className={`size-4 shrink-0 ${selected ? 'text-primary' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="py-2 pl-6 pr-3">
        <p className="text-base font-semibold text-text-primary">{active.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{active.description}</p>
        <ul className="mt-4 grid gap-1">
          {active.items.map((item) => (
            <li key={item.slug}>
              <Link className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-background-alt" href={item.href} onClick={onNavigate}>
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                  <ListingIcon aria-hidden="true" className="size-5" name={item.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-text-primary">{item.title}</span>
                  {item.subtitle ? <span className="mt-0.5 block text-xs text-text-secondary">{item.subtitle}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
