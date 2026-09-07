import { parse } from 'yaml';
const sources = import.meta.glob<string>('../../_data/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
});
function data<T>(name: string): T {
  return parse(sources[`../../_data/${name}.yml`]) as T;
}
export const profile = data<{
  name: string;
  tagline: string;
  bio: string;
  image: string;
  contacts: { label: string; url: string; icon: string }[];
}>('profile');
export const themes = data<{ title: string; description: string }[]>('research_themes');
export const education =
  data<
    { years: string; program: string; focus: string; advisors: string[]; description: string }[]
  >('education');
export const experience =
  data<{ years: string; role: string; organization: string; logo?: string; description: string }[]>(
    'experience'
  );
export const awards = data<string[]>('awards');
export const skills = data<{ name: string; items: string[] }[]>('skills');
export const talks = data<
  {
    title: string;
    event?: string;
    location?: string;
    date?: string;
    url?: string;
    note?: string;
  }[]
>('invited_talks');
export const cvPublications = data<
  {
    id: string;
    date?: string;
    location?: string;
    pages?: string;
    page_count?: string;
    column?: string;
  }[]
>('cv_publications');
export const translations = data<Record<string, { en: string; ja: string }>>('i18n');
export const dateLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'Asia/Tokyo' });
