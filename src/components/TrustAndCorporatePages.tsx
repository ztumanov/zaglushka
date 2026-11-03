import React, { useState } from 'react';
import {
  CHANGELOG_ENTRIES,
  PageId,
  STORAGE_REGIONS,
} from '../data/siteCatalog';
import {
  calculateSlaCredit,
  validateTrialRequest,
} from '../utils/vaultLogic';

interface PageNavigationProps {
  onNavigate: (page: PageId) => void;
  onOpenProvisionModal: (presetTb?: number) => void;
}

export const CompliancePage: React.FC = () => {
  const [requestedReport, setRequestedReport] = useState<string | null>(null);
  const [auditorEmail, setAuditorEmail] = useState('');
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);

  const handleRequestAuditReport = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(auditorEmail.trim())) {
      setAuditError('Укажите корректный корпоративный адрес электронной почты для получения пакета аудита.');
      setAuditSuccess(null);
      return;
    }
    setAuditError(null);
    setAuditSuccess(
      `Пакет резюме аудита и маркированный водяным знаком отчёт (${requestedReport || 'ISO 27001 и SOC 2 Type II'}) отправлены на адрес ${auditorEmail.trim()}.`
    );
    setAuditorEmail('');
  };

  const frameworks = [
    {
      code: 'ISO/IEC 27001:2022 и 27018',
      auditor: 'TÜV Rheinland Cert GmbH',
      certId: 'Сертификат: 01 153 2600941',
      scope: 'Система управления информационной безопасностью, охватывающая ядро хранилища, шлюз S3 и площадки в Цюрихе и Франкфурте.',
    },
    {
      code: 'AICPA SOC 2 Type II',
      auditor: 'Ernst & Young AG (Цюрих)',
      certId: 'Период: Окт 2025 – Сен 2026',
      scope: 'Критерии безопасности, доступности, целостности обработки данных и конфиденциальности (Trust Services Criteria).',
    },
    {
      code: 'Swiss FADP и циркуляр FINMA 2023/1',
      auditor: 'KPMG Switzerland',
      certId: 'Аттестация: CH-FINMA-2026-Q3',
      scope: 'Операционная устойчивость и соблюдение регламентов критического аутсорсинга данных для банковских и страховых организаций Швейцарии.',
    },
    {
      code: 'EU GDPR ст. 28 и BSI C5 Type 2',
      auditor: 'BDO Cyber Security GmbH',
      certId: 'Реестр: BSI-C5-2026-DE-FRA1',
      scope: 'Каталог критериев комплаенса облачных вычислений (BSI C5) при полном отсутствии субпроцессоров за пределами ЕС и Швейцарии.',
    },
  ];

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Страница 11</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Регуляторные гарантии и надзор</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Непрерывная независимая аттестация</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Стандарты комплаенса и независимые аудиты безопасности
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Инфраструктура SyncVault Cloud AG ежегодно проходит независимые тесты на проникновение и регуляторные
          проверки на соответствие стандартам Швейцарии, Европейского союза, Японии и федеральных ведомств США.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((fw) => (
          <div
            key={fw.code}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{fw.auditor}</span>
                <span>{fw.certId}</span>
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900 mt-2">{fw.code}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{fw.scope}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRequestedReport(fw.code);
                  setAuditSuccess(null);
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer"
              >
                Запросить PDF-аттестат {fw.code} →
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Audit Package Request Form */}
      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <h2 className="text-xl font-display font-bold text-slate-900">
          Запрос пакета сертификатов и отчёта по тестированию на проникновение
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Выбранный документ:{' '}
          <strong className="font-mono text-slate-900">
            {requestedReport || 'Полный пакет комплаенса 2026 (ISO 27001 + SOC 2 Type II + криптоаудит NCC Group)'}
          </strong>
        </p>

        <form onSubmit={handleRequestAuditReport} className="mt-5 flex flex-col sm:flex-row gap-3 items-start" noValidate>
          <div className="w-full sm:max-w-md">
            <label htmlFor="compliance-email-input" className="sr-only">
              Корпоративный адрес электронной почты
            </label>
            <input
              id="compliance-email-input"
              type="email"
              placeholder="compliance-officer@enterprise.ch"
              value={auditorEmail}
              onChange={(e) => setAuditorEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            Отправить пакет аудита
          </button>
        </form>

        {auditError && (
          <p role="alert" className="mt-3 text-xs text-red-700 font-medium">
            {auditError}
          </p>
        )}
        {auditSuccess && (
          <p role="status" className="mt-3 text-xs text-emerald-700 font-medium">
            {auditSuccess}
          </p>
        )}
      </section>
    </div>
  );
};

export const ChangelogPage: React.FC = () => {
  const [componentFilter, setComponentFilter] = useState<string>('Все');

  const filteredReleases = CHANGELOG_ENTRIES.filter(
    (entry) => componentFilter === 'Все' || entry.component === componentFilter
  );

  return (
    <div className="space-y-12">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Страница 12</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Поток инженерных обновлений</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Актуальная стабильная ветка: v4.6.2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          История релизов платформы и журнал изменений протокола
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Отслеживайте промышленные обновления ядра хранения на Rust, клиентских демонов FastCDC, модулей
          постквантовой криптографии и объектного шлюза S3.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
          {['Все', 'Ядро хранилища', 'Desktop и CLI', 'Криптография', 'Шлюз S3'].map((comp) => (
            <button
              key={comp}
              type="button"
              onClick={() => setComponentFilter(comp)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                componentFilter === comp ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredReleases.map((rel) => (
            <article key={rel.version} className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono">
                <span>
                  {rel.version} · {rel.component}
                </span>
                <span className="tabular-nums">Дата выпуска: {rel.date}</span>
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900 mt-2">{rel.title}</h2>
              <p className="text-sm text-slate-600 mt-1.5">{rel.summary}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 list-disc list-inside">
                {rel.changes.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [estimatedTb, setEstimatedTb] = useState(50);
  const [region, setRegion] = useState('ch-zrh-1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [provisionedTenantId, setProvisionedTenantId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateTrialRequest({
      fullName,
      workEmail,
      company,
      estimatedTb,
      region,
    });
    if (!res.valid) {
      setErrors(res.errors as Record<string, string>);
      setProvisionedTenantId(null);
      return;
    }
    setErrors({});
    const slug = company
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 16);
    setProvisionedTenantId(`vlt_${region.replace(/-/g, '_')}_${slug || 'tenant'}_8402`);
  };

  return (
    <div className="space-y-14">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Страница 13</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Штаб-квартира в Цюрихе (UID: CHE-419.820.114)</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>100% независимый акционерный капитал</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          О компании SyncVault Cloud AG
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Основанная в 2021 году в Цюрихе инженерами распределённых систем хранения и прикладными криптографами,
          компания SyncVault Cloud AG эксплуатирует суверенную инфраструктуру блочного хранения с нулевым
          разглашением в Европе, Японии и Северной Америке.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500">Штаб-квартира и NOC</p>
          <h2 className="text-base font-display font-bold text-slate-900 mt-1">
            Инженерный центр в Цюрихе
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Hardturmstrasse 161, 8005 Zürich, Switzerland
            <br />
            Торговый реестр Швейцарии: CHE-419.820.114
            <br />
            Дежурный NOC и пиринг: noc@sync-vault-cloud.online (AS214908)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500">Аппаратный контур</p>
          <h2 className="text-base font-display font-bold text-slate-900 mt-1">
            Собственное оборудование и тёмная оптика
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Мы владеем 100% наших серверных шасси, узлов ввода-вывода AMD EPYC, NVMe-массивов и криптомодулей
            Thales Luna HSM. Мы не перепродаём мощности сторонних гиперскейлеров.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500">Программа Bug Bounty</p>
          <h2 className="text-base font-display font-bold text-slate-900 mt-1">
            Открытая спецификация криптопротокола
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Отпечаток PGP: <span className="font-mono">9F44 B210 E881 C04A</span>
            <br />
            Служба безопасности: security@sync-vault-cloud.online
            <br />
            Вознаграждение до 25 000 CHF за подтверждённые уязвимости протокола.
          </p>
        </div>
      </section>

      {/* Validated Enterprise Provisioning & Contact Form */}
      <section className="bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-blue-700">Прямое выделение корпоративного тенанта</p>
          <h2 className="text-2xl font-display font-bold text-slate-900 mt-1">
            Запрос корпоративного хранилища или архитектурной консультации
          </h2>
          <p className="text-xs text-slate-600 mt-1.5">
            Заполните параметры ниже для мгновенного формирования манифеста выделенного пространства хранения в
            выбранной юрисдикции.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="about-fullname" className="block text-xs font-medium text-slate-700 mb-1">
                  ФИО администратора или архитектора
                </label>
                <input
                  id="about-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Д-р Лукас Майер"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="about-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Корпоративный Email
                </label>
                <input
                  id="about-email"
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="l.meier@helvetia-quant.ch"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                {errors.workEmail && <p className="text-xs text-red-600 mt-1">{errors.workEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="about-company" className="block text-xs font-medium text-slate-700 mb-1">
                  Название организации
                </label>
                <input
                  id="about-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Helvetia Quant AG"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
              </div>

              <div>
                <label htmlFor="about-tb" className="block text-xs font-medium text-slate-700 mb-1">
                  Начальная квота (ТБ)
                </label>
                <input
                  id="about-tb"
                  type="number"
                  min={1}
                  max={50000}
                  value={estimatedTb}
                  onChange={(e) => setEstimatedTb(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                {errors.estimatedTb && <p className="text-xs text-red-600 mt-1">{errors.estimatedTb}</p>}
              </div>

              <div>
                <label htmlFor="about-region" className="block text-xs font-medium text-slate-700 mb-1">
                  Основная юрисдикция
                </label>
                <select
                  id="about-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900"
                >
                  {STORAGE_REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.code} ({r.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Сформировать резерв хранилища
            </button>
          </form>

          {provisionedTenantId && (
            <div
              role="status"
              className="mt-6 bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 text-xs font-mono space-y-1.5"
            >
              <div className="text-emerald-400 font-semibold">
                РЕЗЕРВ ТЕНАНТА СОЗДАН · 30-ДНЕВНЫЙ КОРПОРАТИВНЫЙ СТЕНД
              </div>
              <div>Назначенный Vault ID: {provisionedTenantId}</div>
              <div>Эндпоинт записи: https://{region}.sync-vault-cloud.online</div>
              <div>Выделенная квота: {estimatedTb} ТБ (12+4 Reed-Solomon)</div>
              <div>Подтверждение отправлено на: {workEmail}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export const LegalPage: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'msa' | 'privacy' | 'dpa' | 'sla'>('sla');
  const [observedUptime, setObservedUptime] = useState(99.94);
  const [monthlySpendUsd, setMonthlySpendUsd] = useState(1200);

  const slaResult = calculateSlaCredit(observedUptime, monthlySpendUsd);

  return (
    <div className="space-y-12">
      <header className="bg-white border border-slate-200 rounded-xl p-8">
        <div className="text-xs text-slate-500">
          <span>Страница 14</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Нормативные договоры и гарантии SLA</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Применимое право: Кантон Цюрих, Швейцария</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mt-2">
          Условия обслуживания, политика конфиденциальности, DPA и SLA 99.99%
        </h1>
        <p className="text-base text-slate-600 mt-3 max-w-3xl leading-relaxed">
          Ознакомьтесь с Генеральным соглашением о подписке (MSA) компании SyncVault Cloud AG, Дополнением об
          обработке данных (DPA) в соответствии с законом Швейцарии FADP и ст. 28 EU GDPR, а также соглашением об
          уровне обслуживания (SLA).
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-7">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-6">
          {[
            { id: 'sla' as const, label: 'Гарантия 99.99% SLA и калькулятор' },
            { id: 'msa' as const, label: 'Генеральное соглашение (MSA)' },
            { id: 'privacy' as const, label: 'Политика конфиденциальности (FADP / GDPR)' },
            { id: 'dpa' as const, label: 'Соглашение об обработке данных (DPA ст. 28)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDoc(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeDoc === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeDoc === 'sla' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">
                Соглашение об уровне обслуживания (гарантия ежемесячной доступности 99.99%)
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                SyncVault Cloud AG гарантирует, что региональные узлы приёма и выдачи зашифрованных блоков будут
                доступны не менее 99.99% времени в каждом календарном месяце. При снижении показателя ниже 99.99%
                Заказчику автоматически начисляется финансовая компенсация по шкале ниже.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <label htmlFor="sla-uptime-range">Фактическая доступность за месяц (%)</label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">{observedUptime}%</span>
                  </div>
                  <input
                    id="sla-uptime-range"
                    type="range"
                    min={98.5}
                    max={100}
                    step={0.01}
                    value={observedUptime}
                    onChange={(e) => setObservedUptime(Number(e.target.value))}
                    className="w-full accent-blue-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <label htmlFor="sla-invoice-range">Сумма ежемесячного счёта за хранилище (USD)</label>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">${monthlySpendUsd}</span>
                  </div>
                  <input
                    id="sla-invoice-range"
                    type="range"
                    min={100}
                    max={25000}
                    step={100}
                    value={monthlySpendUsd}
                    onChange={(e) => setMonthlySpendUsd(Number(e.target.value))}
                    className="w-full accent-blue-700"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-400">{slaResult.tierLabel}</div>
                <div className="text-2xl font-display font-bold text-white tabular-nums">
                  Сумма компенсации: ${slaResult.creditUsd.toFixed(2)} ({slaResult.creditPercent}%)
                </div>
                <div className="text-slate-400">
                  Зачисляется автоматически в счёт следующего расчётного периода без необходимости подачи претензии.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'msa' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-w-3xl">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Генеральное соглашение о подписке (редакция 2026.10)
            </h2>
            <p>
              <strong className="text-slate-900">1. Право собственности и криптографическая изоляция.</strong> Заказчик
              сохраняет исключительные имущественные права на все зашифрованные блоки и манифесты, размещённые в
              SyncVault Cloud. Поскольку ключи шифрования (MUK и DEK) находятся исключительно под контролем
              Заказчика, SyncVault Cloud AG технически не может просматривать, индексировать или передавать третьим
              лицам содержимое хранилища.
            </p>
            <p>
              <strong className="text-slate-900">2. Гарантия бесплатного экспорта данных (Zero Egress).</strong> Заказчик
              вправе в любой момент выгрузить или мигрировать 100% сохранённых шардов Рида-Соломона и объектов S3 без
              комиссий за исходящий трафик или штрафов за досрочное извлечение.
            </p>
            <p>
              <strong className="text-slate-900">3. Применимое право.</strong> Настоящее Соглашение регулируется
              материальным правом Швейцарской Конфедерации с исключительной подсудностью Коммерческому суду кантона
              Цюрих.
            </p>
          </div>
        )}

        {activeDoc === 'privacy' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-w-3xl">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Политика конфиденциальности (соответствие Swiss FADP и EU GDPR)
            </h2>
            <p>
              <strong className="text-slate-900">Минимизация метаданных:</strong> SyncVault Cloud AG обрабатывает
              только минимально необходимые учётные данные для биллинга и аутентификации (корпоративный email,
              отпечаток открытого ключа Ed25519 и суммарный счётчик занятых байтов).
            </p>
            <p>
              <strong className="text-slate-900">Полное отсутствие сторонних трекеров:</strong> На домене
              sync-vault-cloud.online и в клиентских приложениях полностью отсутствуют рекламные пиксели,
              сторонние аналитические скрипты и межсайтовые файлы cookie.
            </p>
          </div>
        )}

        {activeDoc === 'dpa' && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-w-3xl">
            <h2 className="text-lg font-display font-bold text-slate-900">
              Дополнение об обработке данных (DPA — ст. 28 GDPR и закон FADP)
            </h2>
            <p>
              <strong className="text-slate-900">Технические и организационные меры (TOM):</strong> Приложение II
              нашего DPA закрепляет обязательство SyncVault Cloud AG поддерживать аппаратную защиту ключей в модулях
              FIPS 140-3 Level 3 HSM, избыточность 12+4 Reed-Solomon и строгую локализацию данных в выбранном
              Заказчиком регионе ЦОД.
            </p>
            <p>
              <strong className="text-slate-900">Перечень субпроцессоров:</strong> Хранение и сетевая маршрутизация
              осуществляются непосредственно на собственном серверном оборудовании SyncVault Cloud AG в Цюрихе
              (кампус Green.ch Lupfig) и Франкфурте (Equinix FR5).
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
