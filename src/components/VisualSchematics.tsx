import React, { useState } from 'react';
import { Folder, HardDrive, Lock, Shield } from 'lucide-react';
import { INITIAL_VAULT_BUCKETS } from '../data/siteCatalog';

export const MerkleArchitectureSchematic: React.FC<{
  activeChunkIndex?: number;
  onSelectChunk?: (idx: number) => void;
}> = ({ activeChunkIndex = 1, onSelectChunk }) => {
  const [heroTab, setHeroTab] = useState<'console' | 'dag'>('console');
  const [selectedBucketId, setSelectedBucketId] = useState(INITIAL_VAULT_BUCKETS[0].id);

  const activeBucket =
    INITIAL_VAULT_BUCKETS.find((b) => b.id === selectedBucketId) || INITIAL_VAULT_BUCKETS[0];

  const chunks = [
    { idx: 0, label: 'Блок 0x00', size: '1 024 КБ', hash: '9f86d0...0a08', status: 'В кэше (пропуск)' },
    { idx: 1, label: 'Блок 0x01', size: '640 КБ', hash: '4b2277...bf8a', status: 'Дельта-поток QUIC' },
    { idx: 2, label: 'Блок 0x02', size: '1 408 КБ', hash: 'd4735e...1170', status: 'В кэше (пропуск)' },
    { idx: 3, label: 'Блок 0x03', size: '896 КБ', hash: 'ef2d12...9931', status: 'В кэше (пропуск)' },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 sm:p-6 flex flex-col justify-between h-full shadow-lg">
      {/* Window Chrome & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
            SV
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Консоль тенанта · sync-vault-cloud.online
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Кластер: ch-zrh-1 · TLS 1.3 / QUIC · XChaCha20
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setHeroTab('console')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              heroTab === 'console'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Файловые бакеты
          </button>
          <button
            type="button"
            onClick={() => setHeroTab('dag')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              heroTab === 'dag'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Граф Merkle-DAG
          </button>
        </div>
      </div>

      {heroTab === 'console' ? (
        <div className="my-4 space-y-4 flex-1 flex flex-col justify-between">
          {/* Bucket Selector Strip */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span>Активные контейнеры S3 / FUSE в тенанте:</span>
              <span className="font-mono text-emerald-400 tabular-nums">
                Дедупликация: -{activeBucket.dedupSavedPercent}% объёма
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {INITIAL_VAULT_BUCKETS.map((bkt) => {
                const isSelected = bkt.id === activeBucket.id;
                return (
                  <button
                    key={bkt.id}
                    type="button"
                    onClick={() => setSelectedBucketId(bkt.id)}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{bkt.region}</span>
                      <span>{bkt.wormLocked ? 'WORM LOCK' : 'RW SYNC'}</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-white truncate mt-1">
                      {bkt.name}
                    </div>
                    <div className="text-[11px] font-mono text-blue-300 tabular-nums mt-0.5">
                      {bkt.sizeGb.toLocaleString('ru-RU')} ГБ · {bkt.filesCount.toLocaleString('ru-RU')} объект.
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Objects Table inside Selected Bucket */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>s3://{activeBucket.name}/</span>
              <span>Синхронизировано: {activeBucket.lastSync}</span>
            </div>
            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              {activeBucket.recentObjects.map((obj, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-900/70"
                >
                  <div className="min-w-0">
                    <div className="text-slate-100 truncate font-medium">{obj.filename}</div>
                    <div className="text-[10px] text-slate-400">
                      BLAKE3: {obj.blake3Short} · {obj.chunks} чанков FastCDC
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="text-blue-400 font-semibold">{obj.sizeMb} МБ</div>
                    <div className="text-[10px] text-slate-500">{obj.modifiedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Endpoint Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <div className="bg-slate-950/70 rounded px-2.5 py-1.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Протокол</span>
              <span className="text-slate-200">HTTP/3 QUIC :443</span>
            </div>
            <div className="bg-slate-950/70 rounded px-2.5 py-1.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Избыточность</span>
              <span className="text-slate-200">12+4 Reed-Solomon</span>
            </div>
            <div className="bg-slate-950/70 rounded px-2.5 py-1.5 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Состояние кольца</span>
              <span className="text-emerald-400">16/16 узлов в сети</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-3 flex-1 flex flex-col justify-between">
          {/* SVG Technical Architecture Diagram */}
          <svg
            viewBox="0 0 680 230"
            className="w-full h-auto"
            role="img"
            aria-label="Схема контентно-определяемой нарезки блоков Merkle-DAG и кодирования Рида-Соломона"
          >
            <defs>
              <linearGradient id="sv-node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="sv-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>

            <g stroke="#1e293b" strokeWidth="1">
              <line x1="0" y1="45" x2="680" y2="45" />
              <line x1="0" y1="115" x2="680" y2="115" />
              <line x1="0" y1="185" x2="680" y2="185" />
              <line x1="170" y1="0" x2="170" y2="230" />
              <line x1="390" y1="0" x2="390" y2="230" />
            </g>

            <rect
              x="16"
              y="24"
              width="180"
              height="56"
              rx="6"
              fill="url(#sv-node-grad)"
              stroke="#475569"
              strokeWidth="1.5"
            />
            <text x="28" y="46" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              КОРНЕВОЙ МАНИФЕСТ MERKLE
            </text>
            <text x="28" y="65" fill="#f8fafc" fontSize="12" fontWeight="600" fontFamily="monospace">
              root: e3b0c442...b855
            </text>

            <path d="M 196 52 L 245 34" stroke="#475569" strokeWidth="1.5" fill="none" />
            <path d="M 196 52 L 245 86" stroke="#3b82f6" strokeWidth="2" fill="none" />
            <path d="M 196 52 L 245 138" stroke="#475569" strokeWidth="1.5" fill="none" />
            <path d="M 196 52 L 245 190" stroke="#475569" strokeWidth="1.5" fill="none" />

            {[0, 1, 2, 3].map((idx) => {
              const y = 14 + idx * 52;
              const isModified = idx === 1;
              const isSelected = activeChunkIndex === idx;
              return (
                <g key={idx}>
                  <rect
                    x="245"
                    y={y}
                    width="175"
                    height="40"
                    rx="5"
                    fill={isModified ? 'url(#sv-active-grad)' : 'url(#sv-node-grad)'}
                    stroke={isSelected ? '#60a5fa' : isModified ? '#3b82f6' : '#334155'}
                    strokeWidth={isSelected ? '2' : '1.2'}
                  />
                  <text x="257" y={y + 17} fill={isModified ? '#bfdbfe' : '#94a3b8'} fontSize="10" fontFamily="monospace">
                    {chunks[idx].label} · {chunks[idx].size}
                  </text>
                  <text x="257" y={y + 32} fill="#f8fafc" fontSize="11" fontWeight="600" fontFamily="monospace">
                    {isModified ? 'ДЕЛЬТА -> XChaCha20' : 'ДЕДУП -> В КЭШЕ'}
                  </text>
                </g>
              );
            })}

            <path d="M 420 86 L 478 55" stroke="#3b82f6" strokeWidth="1.75" strokeDasharray="4 3" fill="none" />
            <path d="M 420 86 L 478 115" stroke="#3b82f6" strokeWidth="1.75" fill="none" />
            <path d="M 420 86 L 478 175" stroke="#3b82f6" strokeWidth="1.75" strokeDasharray="4 3" fill="none" />

            <rect x="478" y="22" width="186" height="52" rx="6" fill="url(#sv-node-grad)" stroke="#334155" strokeWidth="1.2" />
            <text x="490" y="42" fill="#93c5fd" fontSize="10" fontFamily="monospace">
              УЗЕЛ AZ-1 · ЦЮРИХ (ЛЮПФИГ)
            </text>
            <text x="490" y="59" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              Шарды данных D01–D06
            </text>

            <rect x="478" y="88" width="186" height="52" rx="6" fill="url(#sv-node-grad)" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="490" y="108" fill="#93c5fd" fontSize="10" fontFamily="monospace">
              УЗЕЛ AZ-2 · ЦУГ (БУНКЕР)
            </text>
            <text x="490" y="125" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              Шарды данных D07–D12
            </text>

            <rect x="478" y="154" width="186" height="52" rx="6" fill="url(#sv-node-grad)" stroke="#334155" strokeWidth="1.2" />
            <text x="490" y="174" fill="#93c5fd" fontSize="10" fontFamily="monospace">
              УЗЕЛ AZ-3 · БАЗЕЛЬ (ЧЁТНОСТЬ)
            </text>
            <text x="490" y="191" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              Шарды чётности P01–P04
            </text>

            <rect x="16" y="105" width="180" height="98" rx="6" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <text x="28" y="126" fill="#94a3b8" fontSize="10" fontFamily="monospace">
              КЛИЕНТСКИЙ КОНВЕРТ
            </text>
            <text x="28" y="146" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              Шифр: XChaCha20
            </text>
            <text x="28" y="164" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              Код MAC: Poly1305-128
            </text>
            <text x="28" y="182" fill="#60a5fa" fontSize="11" fontFamily="monospace">
              0 байт открытого текста
            </text>
          </svg>

          <div className="pt-3 border-t border-slate-800">
            <div className="grid grid-cols-4 gap-2">
              {chunks.map((c) => (
                <button
                  key={c.idx}
                  type="button"
                  onClick={() => onSelectChunk?.(c.idx)}
                  className={`px-2.5 py-1.5 rounded text-left text-xs font-mono transition-colors border cursor-pointer ${
                    activeChunkIndex === c.idx
                      ? 'bg-blue-950/80 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{c.label}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">{c.size}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SwissFacilitySchematic: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
        <div>
          <p className="text-xs text-slate-400">Инженерия дата-центров · Кантоны Аргау и Цюрих</p>
          <h4 className="text-base font-semibold text-white">
            Подземный гидроэнергетический бункер хранения Tier IV (CH-ZRH-1)
          </h4>
        </div>
        <span className="text-xs font-mono text-slate-300 tabular-nums">
          Глубина: 45 м в граните · PUE 1.14
        </span>
      </div>
      <svg
        viewBox="0 0 640 180"
        className="w-full h-auto"
        role="img"
        aria-label="Архитектурный разрез швейцарского подземного хранилища данных"
      >
        <rect x="0" y="0" width="640" height="180" rx="8" fill="#090d16" />
        <path
          d="M 0 55 Q 110 20 220 48 T 460 35 T 640 50 L 640 180 L 0 180 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1.5"
        />
        <rect x="70" y="74" width="500" height="82" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
        <line x1="235" y1="74" x2="235" y2="156" stroke="#334155" strokeWidth="1.5" />
        <line x1="405" y1="74" x2="405" y2="156" stroke="#334155" strokeWidth="1.5" />

        <text x="90" y="100" fill="#93c5fd" fontSize="10" fontFamily="monospace">
          ЗАЛ A · NVMe КЭШ
        </text>
        <text x="90" y="120" fill="#f8fafc" fontSize="12" fontWeight="600" fontFamily="monospace">
          Фабрика 400GbE
        </text>
        <text x="90" y="138" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          p99 TTFB: 6.4 мс
        </text>

        <text x="255" y="100" fill="#93c5fd" fontSize="10" fontFamily="monospace">
          ЗАЛ B · КОЛЬЦА ДАННЫХ
        </text>
        <text x="255" y="120" fill="#f8fafc" fontSize="12" fontWeight="600" fontFamily="monospace">
          12+4 Reed-Solomon
        </text>
        <text x="255" y="138" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          Надёжность 11 девяток
        </text>

        <text x="425" y="100" fill="#93c5fd" fontSize="10" fontFamily="monospace">
          ЗАЛ C · АНКЛАВ HSM
        </text>
        <text x="425" y="120" fill="#f8fafc" fontSize="12" fontWeight="600" fontFamily="monospace">
          FIPS 140-3 Level 3
        </text>
        <text x="425" y="138" fill="#94a3b8" fontSize="10" fontFamily="monospace">
          Защита от вскрытия
        </text>
      </svg>
    </div>
  );
};
