import React, { useState } from "react";
import { Profile } from "../types";
import { Input, Button } from "../components/ui";
import { BANKS_BASE } from "../utils/banks";

interface ProfileScreenProps {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
  onLogout: () => void;
}

export function ProfileScreen({
  profile,
  onUpdateProfile,
  onLogout,
}: ProfileScreenProps) {
  const [form, setForm] = useState({ ...profile, customBanks: profile.customBanks || {} });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'dados' | 'bancos'>('dados');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl pb-24 md:pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          👤 Meu Perfil
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas informações e configurações.
        </p>
      </header>

      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dados' 
              ? 'border-green-500 text-green-600 dark:text-green-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('dados')}
        >
          Dados Pessoais
        </button>
        <button
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'bancos' 
              ? 'border-green-500 text-green-600 dark:text-green-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('bancos')}
        >
          Imagens dos Bancos
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800"
      >
        {activeTab === 'dados' ? (
          <>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-4 ring-gray-50 dark:bg-gray-700 dark:ring-gray-900">
                {form.photoUrl ? (
                  <img
                    src={form.photoUrl}
                    alt="Perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">
                    🧑
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-4">
                <Input
                  label="Nome"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
                <Input
                  label="URL da Foto (opcional)"
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, photoUrl: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Moeda
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C853] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Personalize as URLs das imagens de cada banco. Deixe em branco para usar a imagem padrão.
            </p>
            {BANKS_BASE.map(bank => (
              <div key={bank.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 w-full sm:w-1/3 shrink-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center p-1 shadow-sm" style={{ border: `1px solid ${bank.color}44` }}>
                    <img 
                      src={form.customBanks?.[bank.id] || bank.logoUrl} 
                      alt={bank.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{bank.name}</span>
                </div>
                <div className="flex-1 w-full">
                  <Input
                    label=""
                    value={form.customBanks?.[bank.id] || ''}
                    placeholder={`Padrão`}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      customBanks: {
                        ...(prev.customBanks || {}),
                        [bank.id]: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 space-y-3 dark:border-gray-700">
          <Button type="submit" fullWidth>
            {saved ? "Salvo com sucesso!" : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="danger" fullWidth onClick={onLogout}>
            Sair da conta
          </Button>
        </div>
      </form>
    </div>
  );
}
