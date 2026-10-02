import styles from "./gallery-pagination.module.css";

export function GalleryPagination({ label, page, pages, onChange }: {
  label: string;
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return <div className={styles.controls} role="group" aria-label={`${label} pagination`}>
    <button type="button" aria-label={`Previous ${label}`} onClick={() => onChange((page - 1 + pages) % pages)}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m14 6-6 6 6 6" /></svg>
    </button>
    <span role="status" aria-live="polite" aria-atomic="true">{page + 1} / {pages}</span>
    <button type="button" aria-label={`Next ${label}`} onClick={() => onChange((page + 1) % pages)}>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m10 6 6 6-6 6" /></svg>
    </button>
  </div>;
}
