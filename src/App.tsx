/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Grid, X } from 'lucide-react';
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
import { PageCategory, PageId, SITE_PAGES, STORAGE_REGIONS } from './data/siteCatalog';
import { validateTrialRequest } from './utils/vaultLogic';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim() as PageId;
    const found = SITE_PAGES.find((p) => p.id === hash);
    return found ? found.id : 'home';
  });

  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

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
      endpoint: `https://${modalRegion}.sync-vault-cloud.online`,
      accessKeyId: `sv_ak_live_${modalRegion.slice(0, 2)}_${cleanOrg.slice(0, 4) || 'org'}8841`,
    });
  };

  const categories: PageCategory[] = ['Платформа', 'Разработчикам', 'Инфраструктура', 'О компании'];

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

      {/* Contextual Sub-Bar: Breadcrumb & 14-Page Site Explorer */}
      <div className="bg-slate-100/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-mono text-slate-500">sync-vault-cloud.online</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-500">{currentPageMeta.category}</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900">
              {currentPageMeta.number}. {currentPageMeta.shortTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="quick-page-jump" className="sr-only">
              Быстрый переход к странице
            </label>
            <select
              id="quick-page-jump"
              aria-label="Быстрый переход к странице"
              value={activePage}
              onChange={(e) => handleNavigate(e.target.value as PageId)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              {SITE_PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  Стр. {p.number}: {p.shortTitle} ({p.path})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsDirectoryOpen((prev) => !prev)}
              aria-expanded={isDirectoryOpen}
              className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Все 14 страниц</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible 14-Page Site Directory Panel */}
        {isDirectoryOpen && (
          <div className="border-t border-slate-200 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-900">
                  Полная карта сайта из 14 страниц (sync-vault-cloud.online)
                </p>
                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Свернуть каталог
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
                      <span>Стр. {page.number}</span>
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
          <HomePage onNavigate={handleNavigate} onOpenProvisionModal={handleOpenProvisionModal} />
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

        {/* Sequential Page Pagination Footer Strip */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => handleNavigate(prevPage.id)}
            className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="block text-[11px] font-mono text-slate-400">
                Назад · Страница {prevPage.number}
              </span>
              <span className="text-xs font-semibold text-slate-900">{prevPage.shortTitle}</span>
            </div>
          </button>

          <div className="text-center text-xs text-slate-500 font-mono tabular-nums self-center">
            Страница {currentPageMeta.number} из {SITE_PAGES.length} ({currentPageMeta.path})
          </div>

          <button
            type="button"
            onClick={() => handleNavigate(nextPage.id)}
            className="flex items-center justify-end gap-3 px-5 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-right transition-colors cursor-pointer"
          >
            <div>
              <span className="block text-[11px] font-mono text-slate-400">
                Далее · Страница {nextPage.number}
              </span>
              <span className="text-xs font-semibold text-slate-900">{nextPage.shortTitle}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </main>

      {/* Quiet Enterprise Footer with Complete 14-Page Sitemap */}
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
                <div>Сеть: AS214908 (SyncVault-CH)</div>
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
                        <span className="font-mono text-slate-400 mr-1.5">{page.number}.</span>
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
