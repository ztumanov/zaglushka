import React, { useState } from 'react';
import { Check, Copy, Download, Search } from 'lucide-react';
import {
  API_ENDPOINTS,
  CLIENT_PACKAGES,
  PageId,
  STORAGE_REGIONS,
} from '../data/siteCatalog';
import { verifyChecksumMatch } from '../utils/vaultLogic';

interface PageNavigationProps {
  onNavigate: (page: PageId) => void;
  onOpenProvisionModal: (presetTb?: number) => void;
}

export const DocumentationPage: React.FC<PageNavigationProps> = ({ onNavigate }) => {
  const [selectedTool, setSelectedTool] = useState<'svctl' | 's3' | 'rclone' | 'restic'>('svctl');
  const [selectedRegion, setSelectedRegion] = useState('ch-zrh-1');
  const [vaultName, setVaultName] = useState('prod-genomics-archive');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const getSnippet = () => {
    if (selectedTool === 'svctl') {
      return `# Инициализация локального репозитория Zero-Knowledge с привязкой к ${selectedRegion}
svctl init --vault "${vaultName}" \\
  --region "${selectedRegion}" \\
  --endpoint "https://${selectedRegion}.sync-vault-cloud.online" \\
  --cipher "xchacha20-poly1305" \\
  --chunker "fastcdc-1024k"

# Монтирование как высокоскоростного тома FUSE с NVMe-кэшем чтения 64 ГБ
svctl mount "${vaultName}" /mnt/syncvault \\
  --cache-dir /var/cache/syncvault \\
  --cache-size 64G \\
  --lan-discovery=true`;
    }
    if (selectedTool === 's3') {
      return `# Настройка профиля AWS CLI v2 для S3-совместимого объектного шлюза SyncVault
aws configure set aws_access_key_id "sv_ak_904218a9f..." --profile syncvault
aws configure set aws_secret_access_key "sv_sk_77319b04e..." --profile syncvault
aws configure set region "${selectedRegion}" --profile syncvault

# Загрузка архива с аппаратной блокировкой WORM Object Lock (режим COMPLIANCE)
aws s3api put-object \\
  --profile syncvault \\
  --endpoint-url "https://s3.${selectedRegion}.sync-vault-cloud.online" \\
  --bucket "${vaultName}" \\
  --key "snapshots/ledger-2026-11.parquet" \\
  --body ./ledger-2026-11.parquet \\
  --object-lock-mode COMPLIANCE \\
  --object-lock-retain-until-date "2033-11-01T00:00:00Z"`;
    }
    if (selectedTool === 'rclone') {
      return `# Конфигурация ~/.config/rclone/rclone.conf
[syncvault-${selectedRegion}]
type = s3
provider = Other
env_auth = false
access_key_id = sv_ak_904218a9f0021
secret_access_key = sv_sk_77319b04e9910
region = ${selectedRegion}
endpoint = https://s3.${selectedRegion}.sync-vault-cloud.online
chunk_size = 64Mi
upload_concurrency = 16

# Запуск многопоточной инкрементальной синхронизации
rclone sync /srv/datasets syncvault-${selectedRegion}:${vaultName} --fast-list --transfers=16`;
    }
    return `# Инициализация зашифрованного репозитория Restic поверх шлюза SyncVault S3
export AWS_ACCESS_KEY_ID="sv_ak_904218a9f0021"
export AWS_SECRET_ACCESS_KEY="sv_sk_77319b04e9910"
export RESTIC_REPOSITORY="s3:https://s3.${selectedRegion}.sync-vault-cloud.online/${vaultName}"

restic init
restic backup /var/lib/postgresql/data --tag "automated-hourly" --compression max`;
  };

  const handleCopy = () => {
    const code = getSnippet();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1800);
  };

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Документация разработчика</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Руководства для инженеров и администраторов</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>CLI v4.6.2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Техническая документация и интеграционные профили
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Настройте нативный демон <span className="font-mono text-slate-800">svctl</span> для блочного
          монтирования файловых систем POSIX или подключите существующие конвейеры резервного копирования и
          аналитики через S3-совместимый объектный шлюз.
        </p>
      </header>

      {/* Interactive Configuration Builder */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <p className="text-xs font-medium text-blue-700">Интерактивный конфигуратор конвейера</p>
            <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Генератор готовой клиентской конфигурации
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'svctl' as const, label: 'Демон svctl и FUSE' },
              { id: 's3' as const, label: 'AWS S3 CLI' },
              { id: 'rclone' as const, label: 'Синхронизация Rclone' },
              { id: 'restic' as const, label: 'Бэкап Restic' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTool(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedTool === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="doc-vault-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Идентификатор целевого хранилища (Vault ID / Bucket)
            </label>
            <input
              id="doc-vault-name"
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value || 'default-vault')}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="doc-region-select" className="block text-xs font-medium text-slate-700 mb-1.5">
              Регион и юрисдикция приёма данных
            </label>
            <select
              id="doc-region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            >
              {STORAGE_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} — {r.city}, {r.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs text-slate-400">
            <span className="font-mono">
              Узел подключения: https://{selectedRegion}.sync-vault-cloud.online
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Команды скопированы' : 'Скопировать конфигурацию'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{getSnippet()}</code>
          </pre>
        </div>
      </section>

      {/* Architecture Reference Guides */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500">Руководство 01 · Модуль FUSE</p>
            <h3 className="text-base font-display font-bold text-slate-900 mt-1.5">
              Разреженная подгрузка блоков по требованию
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Монтируйте многотерабайтные сейфы на ноутбуках и CI-агентах без скачивания всего дерева каталогов.
              Передаются и верифицируются по дереву Меркла только те 1-мегабайтные блоки, к которым обратился
              системный вызов <span className="font-mono">read(2)</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('clients')}
            className="mt-5 text-xs font-semibold text-blue-700 hover:text-blue-800 text-left cursor-pointer"
          >
            Скачать демон FUSE →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500">Руководство 02 · S3 Object Lock</p>
            <h3 className="text-base font-display font-bold text-slate-900 mt-1.5">
              Защита резервных копий от шифровальщиков
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Настройте Veeam v12, Rubrik или Restic на использование блокировок режима Compliance WORM, чтобы
              даже при хищении ключей доступа злоумышленник не смог удалить или перезаписать архивные инкременты.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('api-reference')}
            className="mt-5 text-xs font-semibold text-blue-700 hover:text-blue-800 text-left cursor-pointer"
          >
            Схема API снапшотов →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono text-slate-500">Руководство 03 · Аппаратные ключи</p>
            <h3 className="text-base font-display font-bold text-slate-900 mt-1.5">
              Токены YubiKey FIDO2 и модули PKCS#11 HSM
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Привяжите фоновые серверные демоны резервного копирования к регистрам TPM 2.0 PCR или сетевым
              аппаратным модулям PKCS#11 HSM для автоматического запуска без хранения паролей на диске.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('security')}
            className="mt-5 text-xs font-semibold text-blue-700 hover:text-blue-800 text-left cursor-pointer"
          >
            Спецификация хранения ключей →
          </button>
        </div>
      </section>
    </div>
  );
};

export const ApiReferencePage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpointId, setSelectedEndpointId] = useState(API_ENDPOINTS[0].id);

  const filteredEndpoints = API_ENDPOINTS.filter((ep) => {
    const matchesCategory = categoryFilter === 'Все' || ep.category === categoryFilter;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeEndpoint =
    filteredEndpoints.find((ep) => ep.id === selectedEndpointId) ||
    filteredEndpoints[0] ||
    API_ENDPOINTS[0];

  return (
    <div className="space-y-12">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Справочник протокола</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Плоскость управления HTTP/2 и HTTP/3 QUIC</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Базовый URI: https://api.sync-vault-cloud.online</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Справочник REST и gRPC API синхронизации
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Все вызовы плоскости управления аутентифицируются токенами Ed25519 с ограниченной областью действия или
          клиентскими сертификатами mTLS и возвращают детерминированные ответы в форматах JSON и Protobuf.
        </p>
      </header>

      {/* Filter & Search Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {['Все', 'Манифесты', 'Блоки', 'Снапшоты', 'Аудит и GC'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  categoryFilter === cat ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Фильтр эндпоинтов API по пути или описанию"
              placeholder="Поиск эндпоинта (manifests, gc)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {filteredEndpoints.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg">
            <p className="text-sm font-medium text-slate-700">По заданному фильтру эндпоинты не найдены.</p>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('Все');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md cursor-pointer"
            >
              Сбросить фильтры API
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Endpoint List */}
            <div className="lg:col-span-5 space-y-2">
              {filteredEndpoints.map((ep) => {
                const isSelected = ep.id === activeEndpoint.id;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setSelectedEndpointId(ep.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900">{ep.method}</span>
                      <span className="text-slate-500">{ep.category} · {ep.rateLimit}</span>
                    </div>
                    <div className="text-xs font-mono font-semibold text-blue-800 mt-1 break-all">
                      {ep.path}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{ep.summary}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Endpoint Schema Inspector */}
            <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <div className="text-xs font-mono text-blue-400">
                  {activeEndpoint.method} {activeEndpoint.path}
                </div>
                <p className="text-sm text-slate-200 mt-2">{activeEndpoint.summary}</p>
                <p className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
                  Квота запросов: {activeEndpoint.rateLimit}
                </p>
              </div>

              <div>
                <p className="text-xs font-mono text-slate-400 mb-2">Тело запроса и заголовки</p>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-slate-200 overflow-x-auto">
                  <code>{activeEndpoint.requestSample}</code>
                </pre>
              </div>

              <div>
                <p className="text-xs font-mono text-slate-400 mb-2">Ответ сервера (200 OK / 201 Created)</p>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>{activeEndpoint.responseSample}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export const ClientsPage: React.FC = () => {
  const [selectedPkgId, setSelectedPkgId] = useState(CLIENT_PACKAGES[0].id);
  const [userChecksumInput, setUserChecksumInput] = useState(CLIENT_PACKAGES[0].sha256);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const selectedPkg = CLIENT_PACKAGES.find((p) => p.id === selectedPkgId) || CLIENT_PACKAGES[0];
  const verification = verifyChecksumMatch(selectedPkg.sha256, userChecksumInput);

  const handleSelectPackage = (pkgId: string) => {
    const found = CLIENT_PACKAGES.find((p) => p.id === pkgId);
    if (found) {
      setSelectedPkgId(pkgId);
      setUserChecksumInput(found.sha256);
    }
  };

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Репозиторий пакетов</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Воспроизводимые сборки (Reproducible Builds)</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Подпись Ed25519 и GPG</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Нативные клиенты для Desktop, серверов и Kubernetes CSI
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Все клиентские бинарные файлы SyncVault компилируются детерминированно из прошедших аудит исходных кодов
          на Rust и подписываются нашим офлайн-ключом релиза (<span className="font-mono text-slate-800">0x9F44B210E881C04A</span>).
        </p>
      </header>

      {downloadNotice && (
        <div
          role="status"
          className="bg-blue-50 border border-blue-200 text-blue-950 rounded-xl px-5 py-3.5 flex items-center justify-between text-xs"
        >
          <span className="font-mono">{downloadNotice}</span>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="font-semibold text-blue-800 hover:underline cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Package Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CLIENT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>v{pkg.version} · {pkg.releaseDate}</span>
                <span className="tabular-nums">{pkg.sizeMb} МБ</span>
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900 mt-2">{pkg.platform}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{pkg.architecture}</p>

              <div className="mt-4 bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <code>{pkg.installCommand}</code>
              </div>

              <div className="mt-3 text-[11px] font-mono text-slate-500 break-all">
                SHA-256: {pkg.sha256}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setDownloadNotice(
                    `Инициализирована передача с зеркала: https://dl.sync-vault-cloud.online/releases/v${pkg.version}/${pkg.filename} (SHA-256 подтверждён)`
                  )
                }
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать {pkg.filename}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPackage(pkg.id)}
                className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                Сверить хеш →
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Interactive SHA-256 Checksum Verifier */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Интерактивный верификатор контрольных сумм SHA-256
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Вставьте вывод команды <span className="font-mono">sha256sum {selectedPkg.filename}</span> ниже для
          проверки криптографической подлинности пакета по официальному манифесту релиза.
        </p>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <label htmlFor="verifier-pkg-select" className="block text-xs font-medium text-slate-700 mb-1.5">
              Проверяемый пакет дистрибутива
            </label>
            <select
              id="verifier-pkg-select"
              value={selectedPkgId}
              onChange={(e) => handleSelectPackage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900"
            >
              {CLIENT_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.filename}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-8">
            <label htmlFor="verifier-hash-input" className="block text-xs font-medium text-slate-700 mb-1.5">
              Вычисленный 64-символьный шестнадцатеричный дайджест SHA-256
            </label>
            <input
              id="verifier-hash-input"
              type="text"
              value={userChecksumInput}
              onChange={(e) => setUserChecksumInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span>
            Эталон: <strong className="text-slate-900">{selectedPkg.sha256}</strong>
          </span>
          <span
            className={`font-semibold ${
              verification.matches
                ? 'text-emerald-700'
                : verification.isValidFormat
                ? 'text-red-700'
                : 'text-amber-700'
            }`}
          >
            {verification.matches
              ? 'ПОДТВЕРЖДЕНО: Контрольная сумма SHA-256 совпадает с манифестом релиза'
              : verification.isValidFormat
              ? 'НЕСОВПАДЕНИЕ: Хеш-сумма отличается от официального пакета'
              : 'НЕВЕРНЫЙ ФОРМАТ: Введите корректную 64-символьную строку SHA-256 (hex)'}
          </span>
        </div>
      </section>
    </div>
  );
};

export const EnterprisePage: React.FC<PageNavigationProps> = ({ onOpenProvisionModal }) => {
  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Enterprise-инфраструктура</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Корпоративное управление</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>SAML 2.0 / OIDC + SCIM 2.0 + Гибридные инсталляции</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Управление корпоративным парком и изолированные гибридные сейфы
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Централизованно управляйте политиками доступа на тысячах рабочих станций и серверов, сохраняя разделённое
          владение криптографическими ключами через собственный провайдер идентификации (Okta, Microsoft Entra ID,
          Keycloak) и локальные аппаратные модули HSM.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">01 · Федерация удостоверений</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Zero-Trust SAML 2.0 / OIDC и синхронизация SCIM 2.0
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Автоматизируйте выдачу прав и мгновенный отзыв криптографических ключей при изменении групп в Active
            Directory. Поддерживается обязательное подтверждение аппаратным токеном FIDO2 WebAuthn при монтировании
            особо защищённых хранилищ.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">02 · Ключи под контролем заказчика (BYOK / HYOK)</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Внешние KMS и анклавы Hold-Your-Own-Key
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Храните корневые ключи шифрования внутри собственного периметра в кластерах Thales Luna, Entrust
            nShield или HashiCorp Vault. Отключение внешнего узла KMS мгновенно делает облачные шарды нечитаемыми.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">03 · Гибридные локальные узлы</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Локальный программно-аппаратный узел SyncVault
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Разверните ядро хранения SyncVault на собственных NVMe-серверах для записи на скорости локальной сети
            с асинхронным зеркалированием зашифрованных полос Рида-Соломона в бункер Цюриха (`ch-zrh-1`).
          </p>
        </div>
      </section>

      {/* Role-Based Access Control Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">
              Матрица криптографического ролевого доступа (RBAC)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Права разграничиваются как на уровне управляющего API, так и через разделённые криптографические конверты.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenProvisionModal(100)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            Запросить архитектурную сессию
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-semibold">Операция в хранилище</th>
                <th className="py-3 px-4 font-semibold">Аудитор (только манифест)</th>
                <th className="py-3 px-4 font-semibold">Демон бэкапа (Append-Only)</th>
                <th className="py-3 px-4 font-semibold">Владелец сейфа</th>
                <th className="py-3 pl-4 font-semibold">Офицер безопасности (Кворум)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-3 pr-4 font-sans font-medium text-slate-900">Сверка доказательств Меркла BLAKE3</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 pl-4 text-emerald-700">Разрешено</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-sans font-medium text-slate-900">Запись новых зашифрованных дельта-блоков</td>
                <td className="py-3 px-4 text-slate-400">Запрещено</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 pl-4 text-slate-400">Запрещено (разделение ролей)</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-sans font-medium text-slate-900">Расшифровка дерева файлов и чтения</td>
                <td className="py-3 px-4 text-slate-400">Нет ключа DEK</td>
                <td className="py-3 px-4 text-slate-600">Только ключ записи</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 pl-4 text-slate-400">Нет ключа DEK</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-sans font-medium text-slate-900">Продление и политика блокировки WORM</td>
                <td className="py-3 px-4 text-slate-400">Запрещено</td>
                <td className="py-3 px-4 text-emerald-700">По авто-политике</td>
                <td className="py-3 px-4 text-emerald-700">Разрешено</td>
                <td className="py-3 pl-4 text-emerald-700">Кворум 2 из 3 подписей</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const RegionsPage: React.FC = () => {
  const [primaryRegionCode, setPrimaryRegionCode] = useState('ch-zrh-1');
  const [replicaRegionCode, setReplicaRegionCode] = useState('de-fra-1');

  const primaryRegion = STORAGE_REGIONS.find((r) => r.code === primaryRegionCode) || STORAGE_REGIONS[0];
  const replicaRegion = STORAGE_REGIONS.find((r) => r.code === replicaRegionCode) || STORAGE_REGIONS[1];

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Карта сети и дата-центров</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Автономная система AS214908</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Жёсткая географическая фиксация данных</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Глобальные регионы ЦОД и гарантии суверенитета данных
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          В отличие от глобальных облачных провайдеров, реплицирующих метаданные по всему миру, SyncVault жёстко
          фиксирует как зашифрованные шарды Рида-Соломона, так и базу манифестов строго внутри выбранной вами
          правовой юрисдикции.
        </p>
      </header>

      {/* Interactive Replication Topology Planner */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Интерактивный планировщик гео-репликации и юрисдикций
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Выберите основной регион записи и резервный кластер репликации для проверки применимого законодательства,
          энергоэффективности PUE и магистральных операторов связи.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <label htmlFor="primary-region-select" className="block text-xs font-semibold text-slate-700">
              Основной регион приёма данных (синхронное кольцо RPO = 0)
            </label>
            <select
              id="primary-region-select"
              value={primaryRegionCode}
              onChange={(e) => setPrimaryRegionCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900"
            >
              {STORAGE_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} — {r.city}, {r.country}
                </option>
              ))}
            </select>
            <div className="text-xs space-y-1.5 pt-2 text-slate-600">
              <div>
                <strong className="text-slate-900">Правовой контур:</strong> {primaryRegion.jurisdiction}
              </div>
              <div>
                <strong className="text-slate-900">Класс сооружения:</strong> {primaryRegion.tierClassification}
              </div>
              <div>
                <strong className="text-slate-900">Энергетика и PUE:</strong> {primaryRegion.energySource}
              </div>
              <div>
                <strong className="text-slate-900">Магистрали:</strong> {primaryRegion.backboneCarriers}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <label htmlFor="replica-region-select" className="block text-xs font-semibold text-slate-700">
              Резервный регион гео-репликации (зашифрованное зеркало)
            </label>
            <select
              id="replica-region-select"
              value={replicaRegionCode}
              onChange={(e) => setReplicaRegionCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono text-slate-900"
            >
              {STORAGE_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.code} — {r.city}, {r.country}
                </option>
              ))}
            </select>
            <div className="text-xs space-y-1.5 pt-2 text-slate-600">
              <div>
                <strong className="text-slate-900">Правовой контур:</strong> {replicaRegion.jurisdiction}
              </div>
              <div>
                <strong className="text-slate-900">Схема чётности:</strong> {replicaRegion.erasureDefault}
              </div>
              <div>
                <strong className="text-slate-900">Аттестации:</strong> {replicaRegion.certifications}
              </div>
              <div className="font-mono text-blue-700">
                Межрегиональный канал: Выделенная волна 100G (MACsec IEEE 802.1AE)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Regional Specifications Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Спецификации всех промышленных регионов хранения и пиринга
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-semibold">Код региона</th>
                <th className="py-3 px-4 font-semibold">Локация</th>
                <th className="py-3 px-4 font-semibold">Площадка и профиль чётности</th>
                <th className="py-3 px-4 font-semibold">Сертификаты</th>
                <th className="py-3 pl-4 font-semibold text-right">RTT по Европе</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STORAGE_REGIONS.map((reg) => (
                <tr key={reg.code} className="hover:bg-slate-50">
                  <td className="py-3.5 pr-4 font-mono font-semibold text-blue-700">{reg.code}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {reg.city}, {reg.country}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {reg.tierClassification} · <span className="font-mono">{reg.erasureDefault}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{reg.certifications}</td>
                  <td className="py-3.5 pl-4 text-right font-mono tabular-nums text-slate-900">
                    {reg.latencyEuMs} мс
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
