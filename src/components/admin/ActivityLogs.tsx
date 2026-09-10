import React from 'react';

export function ActivityLogs() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold">Logs de Atividade</h2>
        <p className="text-black dark:text-black/50 dark:text-white/50 text-sm mt-1">Histórico de ações administrativas.</p>
      </div>
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6">
        <div className="text-black dark:text-black/40 dark:text-white/40 text-center py-12 text-sm">
           Nenhum log de atividade registrado.
        </div>
      </div>
    </div>
  );
}