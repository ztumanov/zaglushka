import React from 'react';

export const MerkleArchitectureSchematic: React.FC<{
  activeChunkIndex?: number;
  onSelectChunk?: (idx: number) => void;
}> = ({ activeChunkIndex = 1, onSelectChunk }) => {
  const chunks = [
    { idx: 0, label: 'Блок 0x00', size: '1 024 КБ', hash: '9f86d0...0a08', status: 'Дедуплицирован (пропуск отправки)' },
    { idx: 1, label: 'Блок 0x01', size: '640 КБ', hash: '4b2277...bf8a', status: 'Изменён (поток дельта-синхронизации)' },
    { idx: 2, label: 'Блок 0x02', size: '1 408 КБ', hash: 'd4735e...1170', status: 'Дедуплицирован (пропуск отправки)' },
    { idx: 3, label: 'Блок 0x03', size: '896 КБ', hash: 'ef2d12...9931', status: 'Дедуплицирован (пропуск отправки)' },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-6 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs text-slate-400">Контентно-адресуемый конвейер · FastCDC + BLAKE3-256</p>
          <h3 className="text-base font-semibold text-white mt-0.5">
            Дедупликация блоков Merkle-DAG и распределение чётности
          </h3>
        </div>
        <span className="text-xs font-mono text-blue-400 tabular-nums whitespace-nowrap shrink-0 pt-0.5">
          ch-zrh-1 · 12+4 ECC
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 my-3">
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-400 block">Окно нарезки</span>
          <span className="text-xs font-mono font-semibold text-slate-200 tabular-nums">64 КБ – 4 МБ</span>
        </div>
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-400 block">Шифр AEAD</span>
          <span className="text-xs font-mono font-semibold text-slate-200">XChaCha20</span>
        </div>
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-400 block">Кворум кольца</span>
          <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">16 / 16 узлов</span>
        </div>
      </div>

      {/* SVG Technical Architecture Diagram */}
      <div className="my-2">
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

          {/* Grid background lines */}
          <g stroke="#1e293b" strokeWidth="1">
            <line x1="0" y1="45" x2="680" y2="45" />
            <line x1="0" y1="115" x2="680" y2="115" />
            <line x1="0" y1="185" x2="680" y2="185" />
            <line x1="170" y1="0" x2="170" y2="230" />
            <line x1="390" y1="0" x2="390" y2="230" />
          </g>

          {/* Top Root Node */}
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

          {/* Connector lines from Root to Chunks */}
          <path d="M 196 52 L 245 34" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M 196 52 L 245 86" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <path d="M 196 52 L 245 138" stroke="#475569" strokeWidth="1.5" fill="none" />
          <path d="M 196 52 L 245 190" stroke="#475569" strokeWidth="1.5" fill="none" />

          {/* 4 Variable Content-Defined Chunks */}
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

          {/* Connector from Modified Chunk to Parity Ring */}
          <path d="M 420 86 L 478 55" stroke="#3b82f6" strokeWidth="1.75" strokeDasharray="4 3" fill="none" />
          <path d="M 420 86 L 478 115" stroke="#3b82f6" strokeWidth="1.75" fill="none" />
          <path d="M 420 86 L 478 175" stroke="#3b82f6" strokeWidth="1.75" strokeDasharray="4 3" fill="none" />

          {/* Right: Sovereign Vault Nodes */}
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

          {/* Bottom Caption */}
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
      </div>

      {/* Interactive Block Selector Strip */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Инспекция состояния блока FastCDC:</span>
          <span className="font-mono text-slate-300 tabular-nums">
            {chunks[activeChunkIndex].hash} · {chunks[activeChunkIndex].status}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {chunks.map((c) => (
            <button
              key={c.idx}
              type="button"
              onClick={() => onSelectChunk?.(c.idx)}
              className={`px-3 py-2 rounded-lg text-left text-xs font-mono transition-colors border cursor-pointer ${
                activeChunkIndex === c.idx
                  ? 'bg-blue-950/80 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200">{c.label}</div>
              <div className="text-[11px] text-slate-400 tabular-nums">{c.size}</div>
            </button>
          ))}
        </div>
      </div>
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
        {/* Alpine terrain contour */}
        <path
          d="M 0 55 Q 110 20 220 48 T 460 35 T 640 50 L 640 180 L 0 180 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Subterranean chamber */}
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
