import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getMongoDb } from "@/lib/mongodb";
import { getReels } from "@/lib/reels";
import { ReelActions, ReelForm } from "./reel-form";
import styles from "./reels.module.css";
export default async function AdminReelsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> } = {}) {
  await requireAdminAccess();
  const reels = await getReels(await getMongoDb());
  const params = await searchParams;
  const editId = typeof params?.edit === "string" ? params.edit : "";
  const editing = reels.find(reel => reel.id === editId);
  if (editId && !editing) notFound();
  return <section className={styles.page}>
    <header className={styles.header}><div><h1>Reels</h1><p>Manage the reel gallery below the homepage Results section.</p></div><Link href="/admin/reels?new=1" className={styles.add}>Add reel</Link></header>
    {params?.new === "1" || editing ? <ReelForm key={editing?.id || "new"} reel={editing} /> : <>
      <p className={styles.count}>{reels.length} reels &middot; {reels.filter(reel => reel.status === "published").length} published</p>
      {reels.length ? <div className={styles.list}>{reels.map(reel => <article key={reel.id} className={styles.row}>
        {reel.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.thumbnail} src={reel.thumbnailUrl} alt={reel.title} />
        ) : <div className={styles.placeholder}>No thumbnail</div>}
        <div className={styles.details}><p className={styles.status}>{reel.status} &middot; Order {reel.sortOrder}</p><h2>{reel.title}</h2><p>{reel.clientName} &middot; {reel.platform}</p><a href={reel.url} target="_blank" rel="noopener noreferrer">View original &#8599;</a><ReelActions reel={reel} /></div>
      </article>)}</div> : <div className={styles.empty}><h2>No reels yet</h2><p>Add a reel, upload a thumbnail, and publish it to show it below Results.</p><Link href="/admin/reels?new=1">Add your first reel &#8599;</Link></div>}
    </>}
  </section>;
}
