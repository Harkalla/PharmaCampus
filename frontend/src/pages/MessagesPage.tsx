import { FormEvent, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type Message = {
  id: string;
  room: string;
  user_id: string;
  content: string;
  created_at?: string;
};

type MessagesPageProps = { user: User; onLogout: () => void; };

const MessagesPage = ({ user, onLogout }: MessagesPageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');

  const loadMessages = () => {
    apiFetch<{ messages: Message[] }>('/messages').then((res) => setMessages(res.messages)).catch(console.error);
  };

  useEffect(() => { loadMessages(); }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ room: 'general', content })
    });
    setContent('');
    loadMessages();
  };

  return (
    <Layout user={user} title="Messagerie" onLogout={onLogout}>
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Discussions générales</h3>
          <span className="badge bg-brand-100 text-brand-700">En ligne</span>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-xl bg-white p-3">
              <div className="text-sm font-semibold text-slate-700">Étudiant</div>
              <div className="mt-1 text-sm text-slate-600">{message.content}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="mt-5 flex gap-3">
          <input className="input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Écrire un message..." />
          <button className="primary-btn" type="submit">Envoyer</button>
        </form>
      </div>
    </Layout>
  );
};

export default MessagesPage;
