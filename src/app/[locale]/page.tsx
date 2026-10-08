import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('nav');

  return (
    <main>
      <h1>{t('home')}</h1>
    </main>
  );
}
