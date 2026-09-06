import { useState } from 'react';
import Layout from '../components/Layout';
import { apiFetch } from '../lib/api';
import { User } from '../types';

type SearchResult = {
  type: string;
  label: string;
  link: string;
};

type SearchPageProps = { user: User; onLogout: () => void; };

const SearchPage = ({ user, onLogout }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    const response = await apiFetch<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`);
    setResults(response.results);
  };

  return (
    <Layout user={user} title="Recherche" onLogout={onLogout}>
      <div className="card p-6">
        <div className="mb-4 flex gap-3">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher cours, examens, médicaments..." />
          <button className="primary-btn" onClick={handleSearch}>Rechercher</button>
        </div>

        <div className="space-y-3">
          {results.length === 0 ? <div className="text-slate-500">🔎 {query ? 'Aucun résultat trouvé pour votre recherche.' : 'Recherchez un cours, un examen, un QCM, un médicament ou une publication.'}</div> : results.map((result, index) => (
            <a key={`${result.type}-${index}`} href={result.link} className="block rounded-2xl border border-slate-200 p-3 hover:border-brand-300">
              <div className="text-xs uppercase tracking-[0.2em] text-brand-700">{result.type}</div>
              <div className="mt-1 font-semibold text-slate-800">{result.label}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
