import React, { useRef, useState } from 'react';
import { Settings as SettingsType, Profile } from '../types';
import { exportData } from '../utils';
import { Moon, Sun, Monitor, Download, Upload, Info } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { BANKS_BASE } from '../utils/banks';

interface SettingsScreenProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  fullData: any; // Used for export
  onImportData: (data: string) => boolean;
  profile?: Profile;
  onUpdateProfile?: (profile: Profile) => void;
  isAdmin?: boolean;
}

export function SettingsScreen({ 
  settings, 
  onUpdateSettings, 
  fullData, 
  onImportData,
  profile,
  onUpdateProfile,
  isAdmin = false
}: SettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'bancos'>('geral');
  const [customBanks, setCustomBanks] = useState<Record<string, string>>(profile?.customBanks || {});
  const [saved, setSaved] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (onImportData(content)) {
          alert('Dados importados com sucesso!');
        } else {
          alert('Erro ao importar arquivo. Certifique-se de que é um backup válido do Reserva Já.');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveBanks = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile && onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        customBanks
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-xl pb-24 md:pb-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          ⚙️ Configurações
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Personalize sua experiência no Reserva Já.
        </p>
      </header>

      {/* Só exibe as abas se for Administrador */}
      {isAdmin && (
        <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'geral' 
                ? 'border-green-500 text-green-600 dark:text-green-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('geral')}
          >
            Geral
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bancos' 
                ? 'border-green-500 text-green-600 dark:text-green-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('bancos')}
          >
            Imagens dos Bancos (Admin)
          </button>
        </div>
      )}

      {activeTab === 'geral' ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aparência</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                  settings.theme === 'light'
                    ? 'border-[#00C853] bg-green-50 text-[#00C853] dark:bg-green-900/20'
                    : 'border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-300'
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                  settings.theme === 'dark'
                    ? 'border-[#00C853] bg-green-50 text-[#00C853] dark:bg-green-900/20'
                    : 'border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-300'
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Escuro</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'system' })}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                  settings.theme === 'system'
                    ? 'border-[#00C853] bg-green-50 text-[#00C853] dark:bg-green-900/20'
                    : 'border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-300'
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">Sistema</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup e Dados</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Salve suas metas para não perder nada ou importe um backup anterior.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => exportData(fullData)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Backup
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleImportClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Backup
                </Button>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-50 p-2 text-blue-500 dark:bg-blue-900/20">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Sobre o Reserva Já</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Versão 1.0.0<br/>
                  Um aplicativo PWA moderno e offline-first para te ajudar a atingir seus objetivos financeiros.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <form onSubmit={handleSaveBanks} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Personalize as URLs das imagens de cada banco. Deixe em branco para usar a imagem padrão.
            </p>
            {BANKS_BASE.map(bank => (
              <div key={bank.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 w-full sm:w-1/3 shrink-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center p-1 shadow-sm" style={{ border: `1px solid ${bank.color}44` }}>
                    <img 
                      src={customBanks?.[bank.id] || bank.logoUrl} 
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
                    value={customBanks?.[bank.id] || ''}
                    placeholder={`Padrão`}
                    onChange={(e) => setCustomBanks(prev => ({
                      ...prev,
                      [bank.id]: e.target.value
                    }))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button type="submit" fullWidth>
              {saved ? "Salvo com sucesso!" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
