/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, FolderLock, Grid, HardDrive, Plus, Terminal, X } from 'lucide-react';
import {
  ArchitecturePage,
  HomePage,
  PricingPage,
  SecurityPage,
  SyncEnginePage,
} from './components/CorePages';
import {
  ApiReferencePage,
  ClientsPage,
  DocumentationPage,
  EnterprisePage,
  RegionsPage,
} from './components/DeveloperAndProductPages';
import {
  AboutPage,
  ChangelogPage,
  CompliancePage,
  LegalPage,
} from './components/TrustAndCorporatePages';
import {
  INITIAL_VAULT_BUCKETS,
  PageCategory,
  PageId,
  SITE_PAGES,
  STORAGE_REGIONS,
  VaultBucketItem,
} from './data/siteCatalog';
import { computeToySha256Hex, validateTrialRequest } from './utils/vaultLogic';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim() as PageId;
    const found = SITE_PAGES.find((p) => p.id === hash);
    return found ? found.id : 'home';
  });

  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isWebConsoleOpen, setIsWebConsoleOpen] = useState(false);

  // Interactive S3 Web Console state
  const [consoleBuckets, setConsoleBuckets] = useState<VaultBucketItem[]>(INITIAL_VAULT_BUCKETS);
  const [selectedConsoleBucketName, setSelectedConsoleBucketName] = useState<string>(
    INITIAL_VAULT_BUCKETS[0].name
  );
  const [newObjectKey, setNewObjectKey] = useState('snapshots/2026-11-03/db-dump-encrypted.zst');
  const [newObjectSizeMb, setNewObjectSizeMb] = useState(512);
  const [copiedCredentialNotice, setCopiedCredentialNotice] = useState<string | null>(null);

  // Provision Modal Form State
  const [modalFullName, setModalFullName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalCompany, setModalCompany] = useState('');
  const [modalTb, setModalTb] = useState(25);
  const [modalRegion, setModalRegion] = useState('ch-zrh-1');
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [modalProvisionedVault, setModalProvisionedVault] = useState<{
    vaultId: string;
    endpoint: string;
    accessKeyId: string;
  } | null>(null);

  const currentPageIndex = SITE_PAGES.findIndex((p) => p.id === activePage);
  const currentPageMeta = SITE_PAGES[currentPageIndex] || SITE_PAGES[0];
  const prevPage = SITE_PAGES[(currentPageIndex - 1 + SITE_PAGES.length) % SITE_PAGES.length];
  const nextPage = SITE_PAGES[(currentPageIndex + 1) % SITE_PAGES.length];

  const activeConsoleBucket =
    consoleBuckets.find((b) => b.name === selectedConsoleBucketName) || consoleBuckets[0];

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim() as PageId;
      const found = SITE_PAGES.find((p) => p.id === hash);
      if (found) {
        setActivePage(found.id);
      } else if (!hash) {
        setActivePage('home');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.title = `${currentPageMeta.shortTitle} — SyncVault Cloud (sync-vault-cloud.online)`;
  }, [currentPageMeta]);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    setIsDirectoryOpen(false);
    window.location.hash = page === 'home' ? '/' : `/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProvisionModal = (presetTb = 25) => {
    setModalTb(presetTb);
    setModalErrors({});
    setModalProvisionedVault(null);
    setIsProvisionModalOpen(true);
  };

  const handleUploadSimulatedSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newObjectKey.trim() || `snapshots/backup-${Date.now()}.zst`;
    const sizeMb = Math.max(1, Math.min(65536, Number(newObjectSizeMb) || 256));
    const addedGb = sizeMb / 1024;
    const chunks = Math.max(1, Math.round(sizeMb / 4));
    const digest = `${computeToySha256Hex(`${cleanKey}:${sizeMb}:${Date.now()}`).slice(0, 6)}...${computeToySha256Hex(cleanKey).slice(-4)}`;

    setConsoleBuckets((prev) =>
      prev.map((bucket) => {
        if (bucket.name !== activeConsoleBucket.name) return bucket;
        return {
          ...bucket,
          filesCount: bucket.filesCount + 1,
          sizeGb: Math.round((bucket.sizeGb + addedGb) * 10) / 10,
          lastSync: 'Только что',
          recentObjects: [
            {
              filename: cleanKey,
              sizeMb,
              chunks,
              blake3Short: digest,
              modifiedAt: 'Только что (QUIC/TLS 1.3)',
            },
            ...bucket.recentObjects,
          ],
        };
      })
    );
    setCopiedCredentialNotice(
      `Зашифрованный объект ${cleanKey} (${sizeMb} МБ) разбит на ${chunks} чанков и записан в бакет ${activeConsoleBucket.name}.`
    );
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTrialRequest({
      fullName: modalFullName,
      workEmail: modalEmail,
      company: modalCompany,
      estimatedTb: modalTb,
      region: modalRegion,
    });

    if (!validation.valid) {
      setModalErrors(validation.errors as Record<string, string>);
      return;
    }

    setModalErrors({});
    const cleanOrg = modalCompany
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 10);
    setModalProvisionedVault({
      vaultId: `vlt_${modalRegion.replace(/-/g, '_')}_${cleanOrg || 'corp'}_9042`,
      endpoint: `https://s3.${modalRegion}.sync-vault-cloud.online`,
      accessKeyId: `sv_ak_live_${modalRegion.slice(0, 2)}_${cleanOrg.slice(0, 4) || 'org'}8841`,
    });
  };

  const categories: PageCategory[] = ['Платформа', 'Разработчикам', 'Инфраструктура', 'Компания'];

  const secondaryQuickLinks: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Обзор' },
    { id: 'sync-engine', label: 'FastCDC' },
    { id: 'api-reference', label: 'REST и S3 API' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'regions', label: 'Дата-центры' },
    { id: 'compliance', label: 'Комплаенс' },
    { id: 'changelog', label: 'Релизы' },
    { id: 'about', label: 'О компании' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('home');
            }}
            className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            SyncVault Cloud
          </a>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#/architecture"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('architecture');
              }}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'architecture' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Архитектура
            </a>
            <a
              href="#/security"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('security');
              }}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'security' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Безопасность
            </a>
            <a
              href="#/pricing"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('pricing');
              }}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'pricing' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Тарифы
            </a>
            <a
              href="#/documentation"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('documentation');
              }}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'documentation' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Документация
            </a>
            <a
              href="#/clients"
              onClick={(e) => {
                e.preventDefault();
                handleNavigate('clients');
              }}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                activePage === 'clients' ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Загрузки
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleOpenProvisionModal(25)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Создать хранилище
            </button>
          </div>
        </div>
      </header>

      {/* Secondary Sub-Navigation Bar: Natural Single-Line B2B Cloud Bar + S3 Web Console Trigger */}
      <div className="bg-slate-100/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1 py-0.5 shrink-0">
            {secondaryQuickLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activePage === item.id
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsWebConsoleOpen(true)}
              className="px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Веб-консоль S3</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDirectoryOpen((prev) => !prev)}
              aria-expanded={isDirectoryOpen}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Все разделы</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Full Site Directory Mega-Menu */}
        {isDirectoryOpen && (
          <div className="border-t border-slate-200 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-900">
                  Навигация по порталу SyncVault Cloud (sync-vault-cloud.online)
                </p>
                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Закрыть меню
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {SITE_PAGES.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleNavigate(page.id)}
                    className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      activePage === page.id
                        ? 'bg-blue-50 border-blue-600 text-blue-950'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{page.category}</span>
                      <span>{page.path}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-1">{page.shortTitle}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{page.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProvisionModal={handleOpenProvisionModal}
            onOpenWebConsole={() => setIsWebConsoleOpen(true)}
          />
        )}
        {activePage === 'architecture' && (
          <ArchitecturePage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'sync-engine' && (
          <SyncEnginePage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'security' && (
          <SecurityPage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'pricing' && (
          <PricingPage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'documentation' && (
          <DocumentationPage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'api-reference' && <ApiReferencePage />}
        {activePage === 'clients' && <ClientsPage />}
        {activePage === 'enterprise' && (
          <EnterprisePage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
        )}
        {activePage === 'regions' && <RegionsPage />}
        {activePage === 'compliance' && <CompliancePage />}
        {activePage === 'changelog' && <ChangelogPage />}
        {activePage === 'about' && <AboutPage />}
        {activePage === 'legal' && <LegalPage />}

        {/* Section-to-Section Contextual Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleNavigate(prevPage.id)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="block text-[11px] font-mono text-slate-400">
                Предыдущий раздел · {prevPage.category}
              </span>
              <span className="text-xs font-semibold text-slate-900">{prevPage.shortTitle}</span>
            </div>
          </button>

          <div className="text-center text-xs text-slate-500 font-mono tabular-nums self-center">
            sync-vault-cloud.online{currentPageMeta.path} · {currentPageMeta.category}
          </div>

          <button
            type="button"
            onClick={() => handleNavigate(nextPage.id)}
            className="flex items-center justify-end gap-3 px-5 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-right transition-colors cursor-pointer"
          >
            <div>
              <span className="block text-[11px] font-mono text-slate-400">
                Следующий раздел · {nextPage.category}
              </span>
              <span className="text-xs font-semibold text-slate-900">{nextPage.shortTitle}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </main>

      {/* Quiet Enterprise Footer with Complete Portal Sitemap */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
            <div className="lg:col-span-1">
              <p className="text-base font-display font-bold text-slate-900">SyncVault Cloud AG</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Суверенное распределённое блочное хранилище, дельта-синхронизация FastCDC и инфраструктура
                резервного копирования с нулевым разглашением.
              </p>
              <div className="text-xs font-mono text-slate-500 mt-3 space-y-0.5">
                <div>Домен: sync-vault-cloud.online</div>
                <div>Автономная система: AS214908</div>
                <div>Шлюз: s3.ch-zrh-1.sync-vault-cloud.online</div>
              </div>
            </div>

            {categories.map((cat) => (
              <div key={cat}>
                <p className="text-xs font-semibold text-slate-900 mb-3">{cat}</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  {SITE_PAGES.filter((p) => p.category === cat).map((page) => (
                    <li key={page.id}>
                      <a
                        href={`#/${page.id === 'home' ? '' : page.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigate(page.id);
                        }}
                        className="hover:text-blue-700 transition-colors"
                      >
                        {page.shortTitle}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2021–2026 SyncVault Cloud AG · Hardturmstrasse 161, 8005 Zürich, Switzerland · UID CHE-419.820.114
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNavigate('legal')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Условия и SLA
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleNavigate('compliance')}
                className="hover:text-slate-900 cursor-pointer"
              >
                ISO 27001 и SOC 2
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => handleNavigate('about')}
                className="hover:text-slate-900 cursor-pointer"
              >
                Связь с NOC
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive S3 / Web Vault Console Modal */}
      {isWebConsoleOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="web-console-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-4"
        >
          <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                  <FolderLock className="w-4 h-4" />
                  <span>ТЕНАНТ: vlt_ch_zrh_helvetia_9042 · s3.ch-zrh-1.sync-vault-cloud.online</span>
                </div>
                <h2 id="web-console-modal-title" className="text-lg font-display font-bold text-white mt-1">
                  Веб-консоль управления объектами S3 и снапшотами FastCDC
                </h2>
              </div>
              <button
                type="button"
                aria-label="Закрыть веб-консоль S3"
                onClick={() => setIsWebConsoleOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
              {/* Left column: Bucket Selector & Connection Params */}
              <div className="lg:col-span-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Изолированные бакеты S3</p>
                  <div className="space-y-1.5">
                    {consoleBuckets.map((b) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => {
                          setSelectedConsoleBucketName(b.name);
                          setCopiedCredentialNotice(null);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                          activeConsoleBucket.name === b.name
                            ? 'bg-blue-950/70 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="text-xs font-mono font-semibold truncate">{b.name}</div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                          <span>{b.region}</span>
                          <span>
                            {b.sizeGb.toLocaleString('ru-RU')} ГБ · {b.filesCount.toLocaleString('ru-RU')} объ.
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 text-xs font-mono space-y-1.5">
                  <div className="text-slate-400 font-sans font-semibold">Реквизиты S3 / QUIC шлюза</div>
                  <div className="text-[11px] text-slate-300 break-all">
                    Endpoint: https://s3.{activeConsoleBucket.region}.sync-vault-cloud.online
                  </div>
                  <div className="text-[11px] text-slate-300">
                    AccessKey: sv_ak_live_{activeConsoleBucket.region.slice(0, 2)}_8841
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    Режим: {activeConsoleBucket.wormLocked ? 'WORM Object Lock (Compliance)' : 'XChaCha20-Poly1305'}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCopiedCredentialNotice(
                        `Конфигурация rclone / aws-cli для бакета ${activeConsoleBucket.name} скопирована в буфер.`
                      )
                    }
                    className="mt-2 w-full py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-medium cursor-pointer"
                  >
                    Скопировать профиль подключения S3
                  </button>
                </div>
              </div>

              {/* Right column: Object table + Simulated Snapshot Upload */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200">s3://{activeConsoleBucket.name}/</span>
                    <span className="text-slate-400 tabular-nums">
                      Объектов: {activeConsoleBucket.filesCount.toLocaleString('ru-RU')} · Занято:{' '}
                      {activeConsoleBucket.sizeGb.toLocaleString('ru-RU')} ГБ
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                          <th className="py-2 px-3">Ключ объекта</th>
                          <th className="py-2 px-3">Размер</th>
                          <th className="py-2 px-3">Чанки</th>
                          <th className="py-2 px-3">BLAKE3-256</th>
                          <th className="py-2 px-3">Синхронизация</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {activeConsoleBucket.recentObjects.map((obj) => (
                          <tr key={obj.filename} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 text-slate-100 break-all">{obj.filename}</td>
                            <td className="py-2.5 px-3 text-slate-300 tabular-nums whitespace-nowrap">
                              {obj.sizeMb} МБ
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 tabular-nums">{obj.chunks}</td>
                            <td className="py-2.5 px-3 text-emerald-400 whitespace-nowrap">{obj.blake3Short}</td>
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{obj.modifiedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add/Upload Encrypted Snapshot Form */}
                <form
                  onSubmit={handleUploadSimulatedSnapshot}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span>Запись нового зашифрованного снапшота в бакет {activeConsoleBucket.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label htmlFor="console-object-key" className="block text-[11px] text-slate-400 mb-1">
                        Путь объекта S3 (Key)
                      </label>
                      <input
                        id="console-object-key"
                        type="text"
                        value={newObjectKey}
                        onChange={(e) => setNewObjectKey(e.target.value)}
                        className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="console-object-size" className="block text-[11px] text-slate-400 mb-1">
                        Объём (МБ)
                      </label>
                      <input
                        id="console-object-size"
                        type="number"
                        min={1}
                        max={65536}
                        value={newObjectSizeMb}
                        onChange={(e) => setNewObjectSizeMb(Number(e.target.value))}
                        className="w-full rounded bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Загрузить чанки</span>
                      </button>
                    </div>
                  </div>
                </form>

                {copiedCredentialNotice && (
                  <div
                    role="status"
                    className="bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 px-3.5 py-2 rounded-lg text-xs font-mono"
                  >
                    {copiedCredentialNotice}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tenant Provisioning Modal */}
      {isProvisionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="provision-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 sm:p-7 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium text-blue-700">Мгновенное выделение изолированного тенанта</p>
                <h2 id="provision-modal-title" className="text-lg font-display font-bold text-slate-900 mt-0.5">
                  Создание пространства хранения SyncVault
                </h2>
              </div>
              <button
                type="button"
                aria-label="Закрыть окно создания хранилища"
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!modalProvisionedVault ? (
              <form onSubmit={handleModalSubmit} className="mt-5 space-y-4" noValidate>
                <div>
                  <label htmlFor="modal-fullname" className="block text-xs font-medium text-slate-700 mb-1">
                    ФИО системного администратора
                  </label>
                  <input
                    id="modal-fullname"
                    type="text"
                    value={modalFullName}
                    onChange={(e) => setModalFullName(e.target.value)}
                    placeholder="Елена Ростова"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  {modalErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{modalErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-email" className="block text-xs font-medium text-slate-700 mb-1">
                    Корпоративный адрес электронной почты
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    placeholder="infra@organization.ch"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  {modalErrors.workEmail && (
                    <p className="text-xs text-red-600 mt-1">{modalErrors.workEmail}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-company" className="block text-xs font-medium text-slate-700 mb-1">
                      Название организации
                    </label>
                    <input
                      id="modal-company"
                      type="text"
                      value={modalCompany}
                      onChange={(e) => setModalCompany(e.target.value)}
                      placeholder="Aethelgard Systems AG"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                    {modalErrors.company && (
                      <p className="text-xs text-red-600 mt-1">{modalErrors.company}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="modal-tb" className="block text-xs font-medium text-slate-700 mb-1">
                      Выделяемая квота (ТБ)
                    </label>
                    <input
                      id="modal-tb"
                      type="number"
                      min={1}
                      max={50000}
                      value={modalTb}
                      onChange={(e) => setModalTb(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900"
                    />
                    {modalErrors.estimatedTb && (
                      <p className="text-xs text-red-600 mt-1">{modalErrors.estimatedTb}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-region" className="block text-xs font-medium text-slate-700 mb-1">
                    Основной суверенный регион хранения
                  </label>
                  <select
                    id="modal-region"
                    value={modalRegion}
                    onChange={(e) => setModalRegion(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900"
                  >
                    {STORAGE_REGIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} — {r.city}, {r.country} ({r.erasureDefault})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProvisionModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                  >
                    Развернуть тенант
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs space-y-2 border border-slate-800">
                  <div className="text-emerald-400 font-semibold">
                    ПРОСТРАНСТВО РАЗВЁРНУТО В РЕГИОНЕ {modalRegion.toUpperCase()}
                  </div>
                  <div>Vault ID: {modalProvisionedVault.vaultId}</div>
                  <div>Узел подключения: {modalProvisionedVault.endpoint}</div>
                  <div>Ключ доступа S3: {modalProvisionedVault.accessKeyId}</div>
                  <div>Квота: {modalTb} ТБ (12+4 Reed-Solomon · Безлимитный трафик)</div>
                </div>
                <p className="text-xs text-slate-600">
                  Инициализируйте локальный клиент командой{' '}
                  <code className="font-mono text-slate-900">
                    svctl init --vault {modalProvisionedVault.vaultId}
                  </code>
                  .
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProvisionModalOpen(false);
                      handleNavigate('documentation');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Открыть инструкцию CLI
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
