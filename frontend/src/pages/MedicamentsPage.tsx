import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchMedicines } from '../lib/pharmaData';
import { Medicine, User } from '../types';

type MedicamentsPageProps = { user: User; onLogout: () => void; };

const MedicamentsPage = ({ user, onLogout }: MedicamentsPageProps) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchMedicines(query).then(setMedicines).catch(console.error);
  }, [query]);

  return (
    <Layout user={user} title="Médicaments" onLogout={onLogout}>
      <div className="card p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input className="input max-w-lg" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un médicament..." />
          <div className="text-sm text-slate-500">Informations à titre pédagogique, non substitutives à un avis médical.</div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <img src={medicine.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80'} alt={medicine.name} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{medicine.name}</h3>
                  <p className="text-sm text-slate-600">DCI : {medicine.dci}</p>
                  <p className="text-sm text-slate-600">Classe : {medicine.therapeutic_class}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p><strong>Indications :</strong> {medicine.indications}</p>
                <p><strong>Posologie :</strong> {medicine.dosage}</p>
                <p><strong>Contre-indications :</strong> {medicine.contraindications}</p>
                <p><strong>Effets indésirables :</strong> {medicine.adverse_effects}</p>
                <p><strong>Précautions :</strong> {medicine.precautions}</p>
                <p><strong>Interactions :</strong> {medicine.interactions}</p>
                <p><strong>Formes :</strong> {medicine.forms}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MedicamentsPage;
