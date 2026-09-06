import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch, formatDate } from '../lib/api';
import { User } from '../types';

type NotificationsPageProps = { user: User; onLogout: () => void };
type Notification = { id: string; title: string; message: string; link?: string; is_read?: number; created_at?: string };

const NotificationsPage = ({ user, onLogout }: NotificationsPageProps) => {
  const [items, setItems] = useState<Notification[]>([]);
  useEffect(() => { apiFetch<{ notifications: Notification[] }>('/notifications').then((response) => setItems(response.notifications)).catch(() => undefined); }, []);
  const markAllRead = async () => { await apiFetch('/notifications/read', { method: 'PATCH', body: JSON.stringify({}) }); setItems((current) => current.map((item) => ({ ...item, is_read: 1 }))); };
  return <Layout user={user} title="Notifications" onLogout={onLogout}><section className="card mx-auto max-w-3xl p-6"><div className="mb-5 flex items-center justify-between"><div><p className="section-label">Centre de messages</p><h2 className="mt-2 text-2xl font-black text-emerald-50">Mes notifications</h2></div><button className="secondary-btn" onClick={markAllRead}>Tout marquer comme lu</button></div><div className="space-y-3">{items.map((item) => <article key={item.id} className={`surface-muted p-4 ${item.is_read ? 'opacity-60' : ''}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-emerald-50">{item.title}</h3><p className="mt-1 text-sm text-slate-400">{item.message}</p></div><span className="shrink-0 text-xs text-slate-500">{formatDate(item.created_at)}</span></div></article>)}{!items.length && <p className="text-slate-500">Aucune notification.</p>}</div></section></Layout>;
};

export default NotificationsPage;
