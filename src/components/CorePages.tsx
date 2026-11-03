import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Database,
  HardDrive,
  Lock,
  Server,
  Shield,
} from 'lucide-react';
import { PageId, STORAGE_REGIONS } from '../data/siteCatalog';
import {
  BillingCycle,
  RedundancyTier,
  calculateErasureCodingOverhead,
  calculateStoragePricing,
  simulateDeltaSync,
} from '../utils/vaultLogic';
import { MerkleArchitectureSchematic, SwissFacilitySchematic } from './VisualSchematics';

interface PageNavigationProps {
  onNavigate: (page: PageId) => void;
  onOpenProvisionModal: (presetTb?: number) => void;
  onOpenWebConsole?: () => void;
}

export const HomePage: React.FC<PageNavigationProps> = ({
  onNavigate,
  onOpenProvisionModal,
  onOpenWebConsole,
}) => {
  const [activeChunkIndex, setActiveChunkIndex] = useState(1);
  const [samplePayload, setSamplePayload] = useState(
    'SELECT cohort_id, genomic_variant_hash, zstd_frame FROM clinical_vault_2026 WHERE region = "ch-zrh-1" AND verified = true;'
  );
  const [copiedManifest, setCopiedManifest] = useState(false);

  const computeDeterministicHex = (input: string, seed: number): string => {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${hex1}${hex2}`;
  };

  const rootDigest = `${computeDeterministicHex(samplePayload, 1)}${computeDeterministicHex(
    samplePayload,
    2
  )}${computeDeterministicHex(samplePayload, 3)}${computeDeterministicHex(samplePayload, 4)}`;

  const handleCopyDigest = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rootDigest).catch(() => {});
    }
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 1800);
  };

  return (
    <div className="space-y-20">
      {/* Hero Section: 2-Column Split with items-stretch */}
      <section className="pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-8 lg:p-10 shadow-xs">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-4">
                <span>Швейцарская юрисдикция (FADP)</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>Шифрование XChaCha20</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span>Совместимость с S3 и POSIX FUSE</span>
              </div>
              <h1
                className="font-display font-bold text-slate-900 tracking-tight leading-[1.12]"
                style={{ fontSize: 'clamp(2.1rem, 3.3vw, 3.1rem)', textWrap: 'balance' }}
              >
                Облачное блочное хранилище и защищённая дельта-синхронизация.
              </h1>
              <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
                Инфраструктура <span className="font-mono text-slate-900 font-medium">sync-vault-cloud.online</span>{' '}
                предоставляет отказоустойчивые объектные бакеты S3 и высокоскоростную репликацию блочных томов по
                протоколу HTTP/3 QUIC с шифрованием на стороне клиента и нулевой платой за исходящий трафик.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenProvisionModal(25)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Создать бакет хранилища</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {onOpenWebConsole && (
                  <button
                    type="button"
                    onClick={onOpenWebConsole}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Открыть веб-консоль S3
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('documentation')}
                  className="px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Документация CLI →
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono text-slate-500">
                <span>S3: s3.ch-zrh-1.sync-vault-cloud.online</span>
                <span>AS214908 (SyncVault-CH)</span>
                <span>SLA 99.99%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <MerkleArchitectureSchematic
              activeChunkIndex={activeChunkIndex}
              onSelectChunk={setActiveChunkIndex}
            />
          </div>
        </div>

        {/* Full-Width 4-Column KPI Row Below Hero Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Скорость потоковой дедупликации FastCDC</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-1 font-mono tabular-nums">
              4.3 ГБ/с
            </p>
            <p className="text-xs text-slate-500 mt-1">Аппаратное ускорение AVX-512 и Apple Neon</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Расчётная надёжность хранения объектов</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-1 font-mono tabular-nums">
              99.999999999%
            </p>
            <p className="text-xs text-slate-500 mt-1">Избыточность 12+4 Reed-Solomon в 4 зонах ЦОД</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Задержка чтения блока (p99 TTFB)</p>
            <p className="text-2xl font-display font-bold text-slate-900 mt-1 font-mono tabular-nums">
              6.4 мс
            </p>
            <p className="text-xs text-slate-500 mt-1">Прямой пиринг SwissIX / DE-CIX 400GbE</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">Тарификация исходящего трафика и запросов</p>
            <p className="text-2xl font-display font-bold text-blue-700 mt-1 font-mono tabular-nums">
              $0.00 / ТБ
            </p>
            <p className="text-xs text-slate-500 mt-1">Полный Zero Egress для S3, Rclone и Veeam</p>
          </div>
        </div>
      </section>

      {/* Production Gateways & Active Cluster Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium text-blue-700">Магистральные шлюзы доступа</p>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-0.5">
              Промышленные точки подключения S3 API и QUIC-синхронизации
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('regions')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Все 6 дата-центров и пиринг →
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Кластер</th>
                <th className="py-2.5 px-4 font-semibold">Локация ЦОД</th>
                <th className="py-2.5 px-4 font-semibold">Эндпоинт S3 / QUIC</th>
                <th className="py-2.5 px-4 font-semibold">Схема хранения</th>
                <th className="py-2.5 pl-4 font-semibold text-right">Средний RTT (Европа)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {STORAGE_REGIONS.slice(0, 4).map((r) => (
                <tr key={r.code} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-semibold text-blue-700">{r.code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    {r.city}, {r.country}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{r.s3Endpoint}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{r.erasureDefault}</td>
                  <td className="py-3 pl-4 text-right tabular-nums text-slate-900">{r.latencyEuMs} мс</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Core Capabilities: Asymmetric Bento-Grid with Editorial Numbering */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-medium text-blue-700">Технологический стек</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              Архитектура для высоконагруженных систем резервного копирования и репликации
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('sync-engine')}
            className="text-sm font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Спецификация протокола дельта-обмена</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500 font-mono">
                Контентно-определяемая нарезка блоков
              </p>
              <h3 className="text-xl font-display font-semibold text-slate-900 mt-2">
                01. Глобальная дедупликация со скользящим окном FastCDC
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Обычные объектные хранилища перезаписывают весь архивный файл целиком при изменении нескольких
                килобайт внутри образа виртуальной машины или дампа базы данных. Демон SyncVault разбивает поток
                скользящим Gear-хешем на блоки от 64 КБ до 4 МБ и передаёт по сети только уникальные изменённые
                сегменты.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Криптографический индекс</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                  Дерево Меркла BLAKE3-256
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Потоковое сжатие</span>
                <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                  Zstandard (zstd уровень 6)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Снижение сетевого трафика</span>
                <span className="font-mono font-semibold text-blue-700 mt-0.5 block tabular-nums">
                  До 94% на инкрементах
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500 font-mono">
                Клиентское управление ключами
              </p>
              <h3 className="text-xl font-semibold font-display text-slate-900 mt-2">
                02. Шифрование Zero-Knowledge до отправки в сеть
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Содержимое файлов, имена объектов и структура директорий шифруются алгоритмом XChaCha20-Poly1305
                на процессоре клиента. На серверах хранения размещаются исключительно обезличенные шарды.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('security')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Схема иерархии ключей</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500 font-mono">
                Стандартные протоколы интеграции
              </p>
              <h3 className="text-xl font-display font-semibold text-slate-900 mt-2">
                03. Нативный шлюз S3, монтирование FUSE и Kubernetes CSI
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Подключайте хранилище как локальный диск POSIX в Linux/macOS/Windows или используйте готовые
                коннекторы AWS S3 SDK, Rclone, Restic, BorgBackup и Veeam Backup &amp; Replication.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('clients')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Дистрибутивы клиентов</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-500 font-mono">
                Неизменяемые архивы
              </p>
              <h3 className="text-xl font-display font-semibold text-slate-900 mt-2">
                04. Аппаратная фиксация WORM Object Lock и защита от шифровальщиков
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Поддержка стандартов SEC 17a-4(f), FINMA и GDPR. Фиксация корневого хеша Меркла в режиме Compliance
                гарантирует невозможность перезаписи или удаления резервных копий до истечения заданного срока
                даже при компрометации административных ключей.
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <span>Поддерживаемые политики: Governance · Compliance · Legal Hold</span>
              <button
                type="button"
                onClick={() => onNavigate('compliance')}
                className="font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                Аудиторские заключения ISO / SOC 2 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Impact / Case Studies */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-xs font-medium text-slate-500">Эксплуатация под нагрузкой</p>
          <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
            Показатели производительности в корпоративных инфраструктурах
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500">
                <span>Биоинформатика и геномика</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Базель, Швейцария</span>
              </div>
              <p className="text-2xl font-display font-bold text-blue-700 mt-3 font-mono tabular-nums">
                -78.4% расходов на внешний трафик
              </p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                «Репликация 1.4 ПБ геномных секвенций BAM/CRAM между тремя исследовательскими площадками в Европе
                ранее требовала до 41 000 CHF в месяц на оплату исходящего трафика. Перевод конвейера на FastCDC и
                кластер CH-ZRH-1 сократил окно синхронизации с 4 часов до 11 минут».
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
              <p className="font-semibold text-slate-900">Д-р Лукас Фойгт</p>
              <p className="text-slate-500">Руководитель вычислительной инфраструктуры, RheinBio Genomics AG</p>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500">
                <span>Количественный трейдинг</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Франкфурт и Цюрих</span>
              </div>
              <p className="text-2xl font-display font-bold text-blue-700 mt-3 font-mono tabular-nums">
                В 3.8 раза быстрее гидратация Parquet
              </p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                «Кластер аналитики монтирует 680 ТБ исторических биржевых данных L3 через драйвер SyncVault
                Kubernetes CSI. Локальное NVMe-кэширование дедуплицированных блоков сократило запуск расчётных
                задач с 27 до 7.1 минуты».
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
              <p className="font-semibold text-slate-900">Мартина Линдквист</p>
              <p className="text-slate-500">Директор по инфраструктуре, Nordstein Capital Partners</p>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500">
                <span>Производство медиа и VFX</span>
                <span aria-hidden="true" className="mx-1.5">·</span>
                <span>Мюнхен и Стокгольм</span>
              </div>
              <p className="text-2xl font-display font-bold text-blue-700 mt-3 font-mono tabular-nums">
                91.6% экономии полосы пропускания
              </p>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                «При внесении правок цветокоррекции в 400-гигабайтные мастер-исходники OpenEXR демон FUSE передаёт
                по протоколу QUIC только изменённые блоки кадров. Команды в разных странах работают с общим
                хранилищем без ночных очередей репликации».
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
              <p className="font-semibold text-slate-900">Хенрик Сёдерстрём</p>
              <p className="text-slate-500">Главный системный архитектор, Atelier NordVFX</p>
            </div>
          </article>
        </div>
      </section>

      {/* Interactive Client-Side Manifest Sandbox */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-blue-700">Проверка алгоритма хеширования</p>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
              Калькулятор корневого дайджеста Меркла BLAKE3-256
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Измените содержимое тестового блока ниже, чтобы проверить, как клиентский демон формирует
              контентно-адресуемый идентификатор чанка перед шифрованием XChaCha20-Poly1305.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSamplePayload(
                    'SELECT cohort_id, genomic_variant_hash, zstd_frame FROM clinical_vault_2026 WHERE region = "ch-zrh-1" AND verified = true;'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                SQL-снапшот БД
              </button>
              <button
                type="button"
                onClick={() =>
                  setSamplePayload(
                    '{"vault_id":"vlt_ch_zrh_9042","erasure_policy":"rs_12_4","worm_lock":true,"retention_days":2555}'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Политика хранения WORM
              </button>
              <button
                type="button"
                onClick={() =>
                  setSamplePayload(
                    'rclone sync /mnt/nvme_raid0/ledger syncvault-zrh1:prod-immutable-ledger --fast-list --transfers=32'
                  )
                }
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Задача репликации Rclone
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div>
              <label
                htmlFor="sandbox-payload-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Входной буфер блока данных (вычисление в памяти клиента)
              </label>
              <textarea
                id="sandbox-payload-input"
                rows={3}
                value={samplePayload}
                onChange={(e) => setSamplePayload(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span>Корневой дайджест Меркла BLAKE3-256</span>
                <button
                  type="button"
                  onClick={handleCopyDigest}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? 'Скопировано' : 'Копировать дайджест'}</span>
                </button>
              </div>
              <div className="text-slate-100 break-all select-all bg-slate-950 px-3 py-2 rounded border border-slate-800">
                {rootDigest}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-400 tabular-nums">
                <div>Размер буфера: {samplePayload.length} байт</div>
                <div>Код MAC: +16 байт (Poly1305)</div>
                <div>Кольцо: ch-zrh-1 (12+4)</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const ArchitecturePage: React.FC<PageNavigationProps> = ({ onNavigate }) => {
  const [rawDataTb, setRawDataTb] = useState(120);
  const [dataShards, setDataShards] = useState(12);
  const [parityShards, setParityShards] = useState(4);

  const eccResult = calculateErasureCodingOverhead({
    rawDataTb,
    dataShards,
    parityShards,
  });

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Архитектура ядра хранения</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Merkle-DAG + Коды Рида-Соломона</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Фабрика RDMA RoCEv2 400GbE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Контентно-адресуемое ядро хранения и архитектура избыточности
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          SyncVault Cloud заменяет монолитные объектные корзины неизменяемым направленным ациклическим графом
          (Merkle-DAG) контентно-адресуемых блоков с помехоустойчивым кодированием Рида-Соломона над полями Галуа
          между независимыми доменами отказа.
        </p>
      </header>

      {/* Pipeline Walkthrough */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">Этап 01 · Нормализация потока</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Скользящая нарезка FastCDC Gear-Hash
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Входящий поток проходит через 48-байтное скользящее окно Gear-хеша, которое определяет естественные
            границы разреза от 64 КБ до 4 МБ. Вставка байтов в начало 50-гигабайтного дампа БД затрагивает только
            один чанк, сохраняя хеши всех последующих блоков неизменными.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-mono text-slate-500 space-y-1">
            <div>Мин. блок: 65 536 байт</div>
            <div>Сред. блок: 1 048 576 байт</div>
            <div>Макс. блок: 4 194 304 байт</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">Этап 02 · Криптографическая адресация</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Дерево BLAKE3-256 и ключевая дедупликация
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Каждый чанк сжимается алгоритмом Zstandard и шифруется конвергентным подключом тенанта с помощью
            XChaCha20-Poly1305. Дайджест BLAKE3 от полученного шифротекста становится постоянным неизменяемым
            адресом блока в распределённом кольце хранения.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-mono text-slate-500 space-y-1">
            <div>Длина дайджеста: 256 бит (32 Б)</div>
            <div>Вероятность коллизии: 2^-128</div>
            <div>Верификация: Потоковое доказательство Меркла</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs font-mono text-blue-700">Этап 03 · Отказоустойчивое распределение</p>
          <h2 className="text-lg font-display font-bold text-slate-900 mt-1.5">
            Полосы Вандермонда Рида-Соломона
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Зафиксированные блоки разделяются на <span className="font-mono">k</span> шардов данных и{' '}
            <span className="font-mono">m</span> шардов чётности в поле <span className="font-mono">GF(2^8)</span>.
            Шарды синхронно записываются в изолированные серверные стойки и подземные залы по сети RDMA RoCEv2.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-mono text-slate-500 space-y-1">
            <div>Базовый профиль: 12 данных + 4 чётности</div>
            <div>Коэффициент избыточности: 1.33x</div>
            <div>Цикл сверки bit-rot: Каждые 14 суток</div>
          </div>
        </div>
      </section>

      {/* Interactive Reed-Solomon Erasure Coding Simulator */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-7">
          <div>
            <p className="text-xs font-medium text-blue-700">Интерактивный планировщик надёжности и накладных расходов</p>
            <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Симулятор кодирования Рида-Соломона (Erasure Coding)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDataShards(8);
                setParityShards(2);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              8+2 Стандартный
            </button>
            <button
              type="button"
              onClick={() => {
                setDataShards(12);
                setParityShards(4);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 rounded-md cursor-pointer"
            >
              12+4 Суверенный (по умолч.)
            </button>
            <button
              type="button"
              onClick={() => {
                setDataShards(16);
                setParityShards(6);
              }}
              className="px-3 py-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
            >
              16+6 Глубокий архив
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="ecc-raw-tb">Полезный логический объём данных (ТБ)</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{rawDataTb} ТБ</span>
              </div>
              <input
                id="ecc-raw-tb"
                type="range"
                min={10}
                max={2000}
                step={10}
                value={rawDataTb}
                onChange={(e) => setRawDataTb(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="ecc-data-shards">Шарды данных (k)</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{dataShards} шардов</span>
              </div>
              <input
                id="ecc-data-shards"
                type="range"
                min={4}
                max={20}
                step={1}
                value={dataShards}
                onChange={(e) => setDataShards(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="ecc-parity-shards">Шарды чётности (m — допустимое число одновременных отказов узлов)</label>
                <span className="font-mono font-semibold text-blue-700 tabular-nums">{parityShards} шардов чётности</span>
              </div>
              <input
                id="ecc-parity-shards"
                type="range"
                min={1}
                max={8}
                step={1}
                value={parityShards}
                onChange={(e) => setParityShards(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <span className="text-xs text-slate-400 block">Эффективность хранения</span>
                <span className="text-2xl font-display font-bold text-white font-mono tabular-nums mt-1 block">
                  {eccResult.storageEfficiencyPercent}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Множитель объёма: {eccResult.overheadMultiplier}x
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <span className="text-xs text-slate-400 block">Физический объём на дисках</span>
                <span className="text-2xl font-display font-bold text-blue-400 font-mono tabular-nums mt-1 block">
                  {eccResult.totalPhysicalFootprintTb} ТБ
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  против {rawDataTb * 3} ТБ при 3-кратной репликации
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Распределение полосы ({eccResult.totalShards} независимых узлов хранения)</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  Выдерживает отказ любых {eccResult.toleratedConcurrentNodeFailures} узлов
                </span>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5">
                {Array.from({ length: dataShards }).map((_, i) => (
                  <div
                    key={`d-${i}`}
                    className="h-7 rounded bg-blue-600/30 border border-blue-500/60 flex items-center justify-center text-[10px] font-mono text-blue-200"
                    title={`Шард данных D${i + 1}`}
                  >
                    D{i + 1}
                  </div>
                ))}
                {Array.from({ length: parityShards }).map((_, i) => (
                  <div
                    key={`p-${i}`}
                    className="h-7 rounded bg-amber-500/25 border border-amber-400/60 flex items-center justify-center text-[10px] font-mono text-amber-200"
                    title={`Шард чётности P${i + 1}`}
                  >
                    P{i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Node Specification Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Спецификация серверных узлов хранения SyncVault Gen-5 (Цюрих и Франкфурт)
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 pr-4 font-semibold">Подсистема</th>
                <th className="py-2.5 px-4 font-semibold">Аппаратная конфигурация</th>
                <th className="py-2.5 pl-4 font-semibold">Назначение в кольце хранения</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">Процессорный контур</td>
                <td className="py-3 px-4 font-mono text-slate-700">2x AMD EPYC 9654 (192 ядра Zen 4, AVX-512)</td>
                <td className="py-3 pl-4 text-slate-600">Аппаратное кодирование полос GF(2^8) и проверка BLAKE3</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">Горячий слой метаданных</td>
                <td className="py-3 px-4 font-mono text-slate-700">8x 15.36 TB Kioxia CM7-R Enterprise NVMe PCIe 5.0</td>
                <td className="py-3 pl-4 text-slate-600">Индексы дерева Меркла, WAL-журнал и кэш мелких блоков</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">Сетевая фабрика</td>
                <td className="py-3 px-4 font-mono text-slate-700">2x NVIDIA ConnectX-7 400GbE (RDMA RoCEv2 + MACsec)</td>
                <td className="py-3 pl-4 text-slate-600">Неблокируемый обмен шардами и внешние каналы QUIC / S3</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">Аппаратный корень доверия</td>
                <td className="py-3 px-4 font-mono text-slate-700">TPM 2.0 + Thales Luna Network HSM 7 (FIPS 140-3 L3)</td>
                <td className="py-3 pl-4 text-slate-600">Аттестация загрузки ядра и подпись корневых снапшотов WORM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <SwissFacilitySchematic />
    </div>
  );
};

export const SyncEnginePage: React.FC<PageNavigationProps> = () => {
  const [fileSizeMb, setFileSizeMb] = useState(2048);
  const [modifiedPercent, setModifiedPercent] = useState(4);
  const [chunkSizeKb, setChunkSizeKb] = useState(1024);
  const [bandwidthMbps, setBandwidthMbps] = useState(250);

  const syncMetrics = simulateDeltaSync({
    fileSizeMb,
    modifiedPercent,
    chunkSizeKb,
    bandwidthMbps,
  });

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Сетевой протокол репликации</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>HTTP/3 QUIC (UDP 443)</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Локальный пиринг LAN Relay</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Дельта-синхронизация со скользящим хешем и LAN-ретрансляция
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Движок репликации SyncVault исключает избыточную передачу данных по внешним WAN-каналам за счёт
          согласования компактных манифестов BLAKE3 поверх HTTP/3 QUIC и автоматического обмена блоками между
          рабочими станциями в локальной корпоративной подсети.
        </p>
      </header>

      {/* Interactive Delta Sync Calculator */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="border-b border-slate-200 pb-5 mb-7">
          <p className="text-xs font-medium text-blue-700">Интерактивный симулятор передачи данных</p>
          <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
            Калькулятор блочной дельта-передачи в сравнении с полной перезагрузкой файла
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="sync-filesize">Исходный размер файла или архива (МБ)</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{fileSizeMb} МБ</span>
              </div>
              <input
                id="sync-filesize"
                type="range"
                min={100}
                max={10240}
                step={100}
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="sync-mod-pct">Доля изменённых данных между ревизиями (%)</label>
                <span className="font-mono font-semibold text-blue-700 tabular-nums">{modifiedPercent}% изменено</span>
              </div>
              <input
                id="sync-mod-pct"
                type="range"
                min={1}
                max={50}
                step={1}
                value={modifiedPercent}
                onChange={(e) => setModifiedPercent(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="sync-bandwidth">Пропускная способность канала (Мбит/с)</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{bandwidthMbps} Мбит/с</span>
              </div>
              <input
                id="sync-bandwidth"
                type="range"
                min={25}
                max={1000}
                step={25}
                value={bandwidthMbps}
                onChange={(e) => setBandwidthMbps(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-2">
                Средний целевой размер блока FastCDC
              </span>
              <div className="flex items-center gap-2">
                {[256, 512, 1024, 4096].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setChunkSizeKb(kb)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      chunkSizeKb === kb
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {kb} КБ
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <span className="text-xs text-slate-400 block">Объём дельта-пакета SyncVault</span>
                <span className="text-2xl font-display font-bold text-blue-400 font-mono tabular-nums mt-1 block">
                  {syncMetrics.deltaTransferMb} МБ
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Отправлено {syncMetrics.modifiedChunks} из {syncMetrics.totalChunks} чанков
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4">
                <span className="text-xs text-slate-400 block">Экономия WAN-трафика</span>
                <span className="text-2xl font-display font-bold text-emerald-400 font-mono tabular-nums mt-1 block">
                  {syncMetrics.bandwidthSavedPercent}%
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  С учётом блочного сжатия LZ4/Zstd
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Время дельта-синхронизации SyncVault</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {syncMetrics.deltaTransferSeconds} сек
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Время полной перезагрузки по стандартному S3 / WebDAV</span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {syncMetrics.fullTransferSeconds} сек
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conflict Resolution Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Детерминированная матрица разрешения конфликтов по векторным часам
        </h2>
        <p className="text-sm text-slate-600 mt-1.5">
          Каждый узел поддерживает причинно-следственный вектор версий Лэмпорта для каждого дескриптора inode,
          исключая тихую потерю правок при одновременном переподключении офлайн-станций.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="py-3 pr-4 font-semibold">Сценарий конкурентной модификации</th>
                <th className="py-3 px-4 font-semibold">Состояние векторных часов</th>
                <th className="py-3 px-4 font-semibold">Автоматическая политика разрешения</th>
                <th className="py-3 pl-4 font-semibold text-right">Сохранность данных</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">
                  Правка непересекающихся блоков в файле Parquet / SQLite
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">v[A:4, B:2] || v[A:3, B:3]</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Слияние веток дерева Меркла внутри файла либо создание параллельной конфликтной ревизии
                </td>
                <td className="py-3.5 pl-4 text-right font-mono text-emerald-700 font-semibold">
                  100% обеих версий
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">
                  Переименование каталога одновременно с записью дочернего файла
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">Постоянный inode_uuid</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Коммит дочерних блоков следует за UUID родительского каталога по новому пути без сиротских файлов
                </td>
                <td className="py-3.5 pl-4 text-right font-mono text-emerald-700 font-semibold">
                  0 потерянных дескрипторов
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">
                  Офлайн-удаление против удалённой модификации содержимого
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">Метка удаления &lt; Часов правки</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Изменённый файл имеет приоритет над устаревшей меткой удаления; история фиксируется в снапшоте
                </td>
                <td className="py-3.5 pl-4 text-right font-mono text-emerald-700 font-semibold">
                  Изменённый файл сохранён
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const SecurityPage: React.FC<PageNavigationProps> = () => {
  const [selectedLayer, setSelectedLayer] = useState<'kdf' | 'block' | 'pq'>('block');

  const layerDetails = {
    kdf: {
      title: 'Уровень 01 · Памятеёмкая деривация ключей Argon2id + аппаратный PRF токена',
      spec: 'Argon2id (m=256 МиБ, t=4 итерации, p=4 потока) + FIDO2 HMAC-Secret / YubiKey PRF',
      description:
        'Парольная фраза пользователя или аппаратный ключ безопасности формируют 256-битный Мастер-ключ разблокировки (MUK) локально на процессоре клиента. Ключ MUK никогда не покидает оперативную память устройства и ни в каком виде не передаётся на серверы SyncVault.',
    },
    block: {
      title: 'Уровень 02 · Поблочное аутентифицированное шифрование XChaCha20-Poly1305',
      spec: '256-битный ключ файла + 192-битный расширенный одноразовый номер (Nonce) + 128-битный тег Poly1305',
      description:
        'Каждый чанк FastCDC шифруется независимым эфемерным ключом, обёрнутым ключом шифрования данных сейфа (DEK). Имена файлов, дерево каталогов, расширенные POSIX-атрибуты и точные размеры выравниваются и запечатываются до отправки.',
    },
    pq: {
      title: 'Уровень 03 · Постквантовая гибридная инкапсуляция ключей (ML-KEM-1024 + X25519)',
      spec: 'Стандарт NIST FIPS 203 ML-KEM-1024 в комбинации с RFC 7748 X25519 через HKDF-SHA512',
      description:
        'При совместном доступе команд к корпоративным хранилищам ключи DEK инкапсулируются с помощью гибридного постквантового обмена, защищая долгосрочные геномные, финансовые и юридические архивы от атак класса «перехватить сейчас — расшифровать на квантовом компьютере позже».',
    },
  };

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Информационная безопасность</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Криптография с нулевым разглашением</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Аудит безопасности NCC Group</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Криптографическая архитектура сквозного шифрования (Zero-Knowledge)
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          SyncVault Cloud построен на строгой математической границе доверия: узлы хранения проверяют доказательства
          целостности BLAKE3 и обеспечивают блокировки WORM, но технически не располагают криптографическими
          ключами для расшифровки ваших блоков или структуры каталогов.
        </p>
      </header>

      {/* Interactive Key Hierarchy Selector */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <p className="text-xs font-medium text-blue-700">Интерактивный инспектор криптографических конвертов</p>
            <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Трёхуровневая иерархия ключей Zero-Knowledge
            </h2>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedLayer('kdf')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedLayer === 'kdf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              01. Деривация KDF
            </button>
            <button
              type="button"
              onClick={() => setSelectedLayer('block')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedLayer === 'block' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              02. Блочный шифр
            </button>
            <button
              type="button"
              onClick={() => setSelectedLayer('pq')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                selectedLayer === 'pq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              03. Постквантовый KEM
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800">
          <p className="text-xs font-mono text-blue-400">{layerDetails[selectedLayer].spec}</p>
          <h3 className="text-xl font-display font-bold text-white mt-2">
            {layerDetails[selectedLayer].title}
          </h3>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-3xl">
            {layerDetails[selectedLayer].description}
          </p>
        </div>
      </section>

      {/* Threat Model Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Верифицируемая модель угроз и защита при принудительном изъятии
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-semibold">Артефакт / Компонент</th>
                <th className="py-3 px-4 font-semibold">На рабочей станции клиента</th>
                <th className="py-3 px-4 font-semibold">В канале передачи (TLS 1.3 / QUIC)</th>
                <th className="py-3 pl-4 font-semibold">На дисках ЦОД SyncVault</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">Содержимое файлов (чанки)</td>
                <td className="py-3.5 px-4 text-slate-600">В ОЗУ только на момент нарезки FastCDC</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">XChaCha20-Poly1305 внутри TLS 1.3</td>
                <td className="py-3.5 pl-4 font-mono text-blue-700">Зашифрованные шарды Рида-Соломона</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">Имена файлов и дерево папок</td>
                <td className="py-3.5 px-4 text-slate-600">Локальная точка монтирования POSIX / VFS</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">Зашифрованные узлы дерева Меркла</td>
                <td className="py-3.5 pl-4 font-mono text-blue-700">Метаданные полностью скрыты</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 font-medium text-slate-900">Мастер-ключ сейфа (DEK)</td>
                <td className="py-3.5 px-4 text-slate-600">Системная связка ключей / HSM / YubiKey</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">Только обёрнутый конверт ML-KEM-1024</td>
                <td className="py-3.5 pl-4 font-mono text-emerald-700 font-semibold">Никогда не доступен SyncVault</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export const PricingPage: React.FC<PageNavigationProps> = ({ onOpenProvisionModal }) => {
  const [storageTb, setStorageTb] = useState(50);
  const [seats, setSeats] = useState(15);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [redundancy, setRedundancy] = useState<RedundancyTier>('standard-ecc');

  const pricing = calculateStoragePricing({
    storageTb,
    seats,
    billingCycle,
    redundancy,
  });

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Тарификация и биллинг</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Предсказуемая экономика хранения</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Без оплаты исходящего трафика и API</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Прозрачные тарифные планы и интерактивный калькулятор TCO
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Каждый тарифный план SyncVault Cloud включает безлимитный входящий и исходящий трафик, неограниченное
          число запросов S3 API, клиентское шифрование с нулевым разглашением и неизменяемые WORM-снапшоты без
          скрытых комиссий.
        </p>
      </header>

      {/* 3 Audience-Named Pricing Tiers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Для инженерных и исследовательских команд</p>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
              Суверенный Стандарт
            </h2>
            <div className="mt-4 flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-3xl font-bold text-slate-900">$5.80</span>
              <span className="text-xs text-slate-500">/ ТБ / месяц</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Включает первые 5 учётных записей · 1 суверенный регион</p>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
              <li>Кодирование Рида-Соломона 12+4 (в пределах выбранного региона)</li>
              <li>Безлимитный исходящий WAN-трафик и запросы S3 API</li>
              <li>Клиенты FastCDC для Desktop, серверов и мобильных ОС</li>
              <li>История неизменяемых снапшотов до 90 суток</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onOpenProvisionModal(10)}
            className="mt-7 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Выбрать Суверенный Стандарт
          </button>
        </div>

        <div className="bg-white border-2 border-blue-700 rounded-xl p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-700">Для критичных промышленных контуров</p>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
              Мультирегиональный Двойной Сейф
            </h2>
            <div className="mt-4 flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-3xl font-bold text-slate-900">$8.40</span>
              <span className="text-xs text-slate-500">/ ТБ / месяц</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Синхронная гео-репликация между 2 суверенными зонами</p>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
              <li>Активно-активная репликация (например, Цюрих + Франкфурт)</li>
              <li>Единый вход SAML 2.0 / OIDC и синхронизация каталогов SCIM 2.0</li>
              <li>Регуляторная блокировка WORM Compliance Lock (до 10 лет)</li>
              <li>Драйвер Kubernetes CSI и приоритетная реакция SLA 15 минут</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onOpenProvisionModal(50)}
            className="mt-7 w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            Развернуть Мультирегиональный Сейф
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Для финансовых институтов и госсектора</p>
            <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
              Выделенный Анклав и Air-Gap
            </h2>
            <div className="mt-4 flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-3xl font-bold text-slate-900">$11.90</span>
              <span className="text-xs text-slate-500">/ ТБ / месяц</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Физическая изоляция стойки + аппаратные HSM FIPS 140-3 L3</p>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-5">
              <li>Выделенная подземная серверная стойка в бункере CH-ZRH-1</li>
              <li>Аппаратное хранение корневых ключей в HSM под контролем заказчика</li>
              <li>Прямой оптический кросс-коннект 100G/400G (SwissIX / DE-CIX)</li>
              <li>Индивидуальный пакет аттестации FINMA, BSI C5 и HIPAA BAA</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onOpenProvisionModal(250)}
            className="mt-7 w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Запросить Выделенный Анклав
          </button>
        </div>
      </section>

      {/* Interactive Storage & Egress TCO Calculator */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-7">
          <div>
            <p className="text-xs font-medium text-blue-700">Интерактивный расчёт стоимости владения</p>
            <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
              Калькулятор совокупной стоимости владения (TCO) в сравнении с гиперскейлерами
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Помесячная оплата
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Годовой контракт (-18%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="calc-storage-tb">Дедуплицированный объём хранения (ТБ)</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{storageTb} ТБ</span>
              </div>
              <input
                id="calc-storage-tb"
                type="range"
                min={5}
                max={1000}
                step={5}
                value={storageTb}
                onChange={(e) => setStorageTb(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="calc-seats">Активные сотрудники и сервисные аккаунты</label>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{seats} аккаунтов</span>
              </div>
              <input
                id="calc-seats"
                type="range"
                min={1}
                max={250}
                step={1}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-2">Профиль отказоустойчивости</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard-ecc' as RedundancyTier, label: 'Стандарт 12+4' },
                  { id: 'multi-region' as RedundancyTier, label: 'Мультирегион' },
                  { id: 'air-gapped' as RedundancyTier, label: 'Выделенный HSM' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setRedundancy(tier.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      redundancy === tier.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 block">Расчётная стоимость в месяц</span>
                <span className="text-3xl font-display font-bold text-white font-mono tabular-nums mt-1 block">
                  ${pricing.monthlyTotalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right font-mono tabular-nums">
                <span className="text-xs text-slate-400 block">Эффективная ставка</span>
                <span className="text-base font-semibold text-blue-400">${pricing.effectivePerTbUsd} / ТБ</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Аналогичный объём AWS S3 / Azure + ежемесячный трафик</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  ${pricing.hyperscalerComparisonUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} / мес
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Чистая экономия бюджета инфраструктуры</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  На {pricing.hyperscalerSavingsPercent}% дешевле гиперскейлеров
                </span>
              </div>
              {pricing.annualSavingsUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Годовая выгода при контракте на 12 месяцев</span>
                  <span className="font-mono text-blue-400 tabular-nums">
                    ${pricing.annualSavingsUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} / год
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenProvisionModal(storageTb)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              Зафиксировать тариф и развернуть сейф на {storageTb} ТБ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
