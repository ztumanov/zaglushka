export type PageId =
  | 'home'
  | 'architecture'
  | 'sync-engine'
  | 'security'
  | 'pricing'
  | 'documentation'
  | 'api-reference'
  | 'clients'
  | 'enterprise'
  | 'regions'
  | 'compliance'
  | 'changelog'
  | 'about'
  | 'legal';

export type PageCategory = 'Платформа' | 'Разработчикам' | 'Инфраструктура' | 'О компании';

export interface PageMeta {
  id: PageId;
  number: string;
  title: string;
  shortTitle: string;
  category: PageCategory;
  path: string;
  summary: string;
  updatedAt: string;
}

export const SITE_PAGES: PageMeta[] = [
  {
    id: 'home',
    number: '01',
    title: 'Распределённое блочное хранилище и Zero-Knowledge синхронизация',
    shortTitle: 'Обзор',
    category: 'Платформа',
    path: '/',
    summary: 'Корпоративное контентно-адресуемое хранилище и субсекундная дельта-репликация между суверенными европейскими и мировыми ЦОД.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'architecture',
    number: '02',
    title: 'Движок хранения Merkle-DAG и архитектура кодов Рида-Соломона',
    shortTitle: 'Архитектура',
    category: 'Платформа',
    path: '/architecture',
    summary: 'Как SyncVault разделяет, хеширует, дедуплицирует и распределяет зашифрованные блоки по шардам чётности Reed-Solomon.',
    updatedAt: 'Октябрь 2026',
  },
  {
    id: 'sync-engine',
    number: '03',
    title: 'Протокол блочной дельта-синхронизации со скользящим хешем',
    shortTitle: 'Дельта-синхронизация',
    category: 'Платформа',
    path: '/sync-engine',
    summary: 'Разбиение на блоки переменной длины FastCDC, обнаружение локальных LAN-узлов и детерминированное разрешение конфликтов.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'security',
    number: '04',
    title: 'Криптографическая архитектура с нулевым разглашением (Zero-Knowledge)',
    shortTitle: 'Безопасность',
    category: 'Платформа',
    path: '/security',
    summary: 'Клиентское аутентифицированное шифрование XChaCha20-Poly1305, деривация ключей Argon2id и аппаратные модули FIPS 140-3 Level 3.',
    updatedAt: 'Октябрь 2026',
  },
  {
    id: 'pricing',
    number: '05',
    title: 'Прозрачные тарифы без платы за исходящий трафик (Zero Egress)',
    shortTitle: 'Тарифы',
    category: 'Платформа',
    path: '/pricing',
    summary: 'Предсказуемое лицензирование за терабайт и рабочее место при нулевой стоимости входящего/исходящего трафика и API-запросов.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'documentation',
    number: '06',
    title: 'Техническая документация и справочник CLI (svctl)',
    shortTitle: 'Документация',
    category: 'Разработчикам',
    path: '/documentation',
    summary: 'Руководства по настройке консольного клиента svctl, объектного шлюза S3, Rclone, Restic и монтирования POSIX FUSE.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'api-reference',
    number: '07',
    title: 'Справочник REST и gRPC API синхронизации',
    shortTitle: 'Справочник API',
    category: 'Разработчикам',
    path: '/api-reference',
    summary: 'Программные эндпоинты для согласования манифестов чанков, потоковой передачи блоков, фиксации WORM-снапшотов и журнала аудита.',
    updatedAt: 'Октябрь 2026',
  },
  {
    id: 'clients',
    number: '08',
    title: 'Клиентские приложения для Desktop, серверов и Kubernetes CSI',
    shortTitle: 'Загрузки',
    category: 'Разработчикам',
    path: '/clients',
    summary: 'Подписанные сборки для Linux, macOS Universal, Windows Server, драйвера Kubernetes CSI, iOS и Android с проверкой SHA-256.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'enterprise',
    number: '09',
    title: 'Корпоративное управление флотом и гибридное облако',
    shortTitle: 'Корпорациям',
    category: 'Инфраструктура',
    path: '/enterprise',
    summary: 'Единый вход SAML 2.0 / OIDC, синхронизация каталогов SCIM 2.0, ролевые политики доступа и изолированные on-premise узлы.',
    updatedAt: 'Сентябрь 2026',
  },
  {
    id: 'regions',
    number: '10',
    title: 'Глобальные регионы хранения и суверенитет данных',
    shortTitle: 'Регионы ЦОД',
    category: 'Инфраструктура',
    path: '/regions',
    summary: 'Географически изолированные кластеры в Цюрихе, Франкфурте, Стокгольме, Рейкьявике, Токио и Эшберне с жёсткой фиксацией юрисдикции.',
    updatedAt: 'Октябрь 2026',
  },
  {
    id: 'compliance',
    number: '11',
    title: 'Регуляторное соответствие и независимые аудиты безопасности',
    shortTitle: 'Комплаенс и аудит',
    category: 'Инфраструктура',
    path: '/compliance',
    summary: 'Сертификация ISO/IEC 27001:2022, аттестация SOC 2 Type II, соответствие Swiss FADP, EU GDPR (ст. 28), BSI C5 и HIPAA.',
    updatedAt: 'Октябрь 2026',
  },
  {
    id: 'changelog',
    number: '12',
    title: 'История релизов платформы и журнал изменений протокола',
    shortTitle: 'История версий',
    category: 'Разработчикам',
    path: '/changelog',
    summary: 'Хронология инженерных обновлений ядра хранилища SyncVault, демона синхронизации, шлюза S3 и криптографических модулей.',
    updatedAt: 'Ноябрь 2026',
  },
  {
    id: 'about',
    number: '13',
    title: 'О компании SyncVault Cloud AG и эксплуатации инфраструктуры',
    shortTitle: 'О компании',
    category: 'О компании',
    path: '/about',
    summary: 'Штаб-квартира в Цюрихе, собственное серверное оборудование и магистральная сеть AS214908 без зависимости от гиперскейлеров.',
    updatedAt: 'Сентябрь 2026',
  },
  {
    id: 'legal',
    number: '14',
    title: 'Условия обслуживания, политика конфиденциальности, DPA и SLA 99.99%',
    shortTitle: 'Правовые документы и SLA',
    category: 'О компании',
    path: '/legal',
    summary: 'Генеральное соглашение о подписке (MSA), дополнение об обработке данных (DPA) и финансовые гарантии доступности 99.99%.',
    updatedAt: 'Октябрь 2026',
  },
];

export interface ApiEndpointSpec {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'Манифесты' | 'Блоки' | 'Снапшоты' | 'Аудит и GC';
  summary: string;
  rateLimit: string;
  requestSample: string;
  responseSample: string;
}

export const API_ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: 'negotiate-manifest',
    method: 'POST',
    path: '/v2/vaults/{vault_id}/manifests/diff',
    category: 'Манифесты',
    summary: 'Отправляет список BLAKE3-хешей чанков ревизии файла и возвращает только отсутствующие в хранилище блоки, требующие дозагрузки.',
    rateLimit: '1 200 запр. / мин',
    requestSample: `{
  "path": "/datasets/genomics/cohort_2026_q4.parquet",
  "base_revision": "rev_01J9X7K2M8N4P",
  "chunk_algorithm": "fastcdc-blake3-256",
  "chunks": [
    { "offset": 0, "length": 1048576, "blake3": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" },
    { "offset": 1048576, "length": 1048576, "blake3": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a" }
  ]
}`,
    responseSample: `{
  "manifest_session_id": "msess_88410c92b7",
  "total_chunks": 2,
  "existing_chunks": 1,
  "missing_chunks": [
    "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  ],
  "upload_endpoints": [
    "https://ingest-zrh1.sync-vault-cloud.online/v2/blocks/4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  ],
  "expires_in_seconds": 900
}`,
  },
  {
    id: 'put-encrypted-block',
    method: 'PUT',
    path: '/v2/blocks/{blake3_digest}',
    category: 'Блоки',
    summary: 'Передаёт зашифрованный алгоритмом XChaCha20-Poly1305 блок напрямую в региональное кольцо кодирования Рида-Соломона.',
    rateLimit: '10 000 запр. / мин',
    requestSample: `PUT /v2/blocks/4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a HTTP/2
Host: ingest-zrh1.sync-vault-cloud.online
Content-Type: application/octet-stream
X-SyncVault-Cipher: XChaCha20-Poly1305
X-SyncVault-Shard-Policy: rs-12-4-zrh1
Content-Length: 1048592

<бинарный шифротекст + 16-байтный тег аутентификации Poly1305>`,
    responseSample: `{
  "status": "committed",
  "blake3": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
  "stored_bytes": 1048592,
  "erasure_coding": "12+4 Reed-Solomon",
  "quorum_nodes_ack": 16,
  "committed_at": "2026-11-03T16:42:11.094Z"
}`,
  },
  {
    id: 'create-immutable-snapshot',
    method: 'POST',
    path: '/v2/vaults/{vault_id}/snapshots',
    category: 'Снапшоты',
    summary: 'Фиксирует неизменяемый корневой снапшот дерева Меркла с опциональной аппаратной блокировкой WORM (Write-Once-Read-Many).',
    rateLimit: '300 запр. / мин',
    requestSample: `{
  "label": "fy2026-q3-statutory-audit-archive",
  "retention_days": 2555,
  "worm_compliance_lock": true,
  "verify_merkle_root": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`,
    responseSample: `{
  "snapshot_id": "snap_01J9X8Z0V2W9R",
  "vault_id": "vlt_ch_zrh_9042",
  "merkle_root": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "worm_locked_until": "2033-11-01T00:00:00Z",
  "total_files": 148920,
  "deduplicated_size_bytes": 4829104921600
}`,
  },
  {
    id: 'list-audit-events',
    method: 'GET',
    path: '/v2/governance/audit-log?limit=50&ActorType=client_daemon',
    category: 'Аудит и GC',
    summary: 'Возвращает криптографически связанную цепочку записей журнала аудита по операциям ротации ключей, снапшотов и SAML-входов.',
    rateLimit: '600 запр. / мин',
    requestSample: `GET /v2/governance/audit-log?limit=2&region=ch-zrh-1 HTTP/2
Host: api.sync-vault-cloud.online
Authorization: Bearer sv_live_9948102a7f9c...`,
    responseSample: `{
  "chain_head_hash": "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730",
  "events": [
    {
      "event_id": "evt_9920184",
      "timestamp": "2026-11-03T15:19:04Z",
      "actor": "daemon:node-prod-db04.internal",
      "action": "manifest.commit",
      "vault_id": "vlt_ch_zrh_9042",
      "source_ip": "185.44.12.90",
      "prev_event_hash": "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b"
    }
  ]
}`,
  },
  {
    id: 'delete-expired-revisions',
    method: 'DELETE',
    path: '/v2/vaults/{vault_id}/gc/unreferenced-blocks',
    category: 'Аудит и GC',
    summary: 'Запускает двухфазную сборку мусора (mark-and-sweep) для освобождения несвязанных блоков за пределами окна хранения снапшотов.',
    rateLimit: '60 запр. / мин',
    requestSample: `DELETE /v2/vaults/vlt_ch_zrh_9042/gc/unreferenced-blocks?dry_run=false HTTP/2
Host: api.sync-vault-cloud.online
Authorization: Bearer sv_live_9948102a7f9c...`,
    responseSample: `{
  "gc_job_id": "gc_01J9X992L0K1M",
  "status": "scheduled",
  "estimated_reclaimable_bytes": 184290115584,
  "unreferenced_blocks_scanned": 44120,
  "worm_protected_skipped": 912040
}`,
  },
];

export interface ClientPackage {
  id: string;
  platform: string;
  architecture: string;
  version: string;
  releaseDate: string;
  sizeMb: number;
  filename: string;
  sha256: string;
  installCommand: string;
}

export const CLIENT_PACKAGES: ClientPackage[] = [
  {
    id: 'linux-amd64',
    platform: 'Linux (Debian / Ubuntu / RHEL / AlmaLinux)',
    architecture: 'x86_64 и ARM64 (Статический бинарный файл + юнит systemd)',
    version: '4.6.2',
    releaseDate: '2026-10-28',
    sizeMb: 28.4,
    filename: 'svctl-linux-amd64-4.6.2.tar.zst',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    installCommand: 'curl -fsSL https://get.sync-vault-cloud.online/install.sh | sudo sh',
  },
  {
    id: 'macos-universal',
    platform: 'macOS 14+ (Sonoma / Sequoia)',
    architecture: 'Universal Binary (Apple Silicon M1–M4 и Intel)',
    version: '4.6.2',
    releaseDate: '2026-10-28',
    sizeMb: 42.1,
    filename: 'SyncVault-Desktop-4.6.2-universal.dmg',
    sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    installCommand: 'brew install --cask syncvault-client',
  },
  {
    id: 'windows-x64',
    platform: 'Windows 11 и Windows Server 2022/2025',
    architecture: 'x64 Native (Виртуальный диск WinFsp + теневые копии VSS)',
    version: '4.6.2',
    releaseDate: '2026-10-28',
    sizeMb: 36.8,
    filename: 'SyncVault-Enterprise-4.6.2-x64.msi',
    sha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    installCommand: 'winget install SyncVaultCloud.SyncVaultEnterprise',
  },
  {
    id: 'k8s-csi',
    platform: 'Драйвер хранилища Kubernetes CSI',
    architecture: 'Мультиархитектурный OCI-контейнер (ядро Linux 5.15+)',
    version: '2.9.0',
    releaseDate: '2026-10-19',
    sizeMb: 19.2,
    filename: 'registry.sync-vault-cloud.online/csi/syncvault-csi:v2.9.0',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    installCommand: 'helm upgrade --install syncvault-csi oci://registry.sync-vault-cloud.online/charts/syncvault-csi',
  },
];

export interface StorageRegionSpec {
  code: string;
  city: string;
  country: string;
  jurisdiction: string;
  energySource: string;
  tierClassification: string;
  latencyEuMs: number;
  erasureDefault: string;
  certifications: string;
  backboneCarriers: string;
}

export const STORAGE_REGIONS: StorageRegionSpec[] = [
  {
    code: 'ch-zrh-1',
    city: 'Цюрих (Люпфиг)',
    country: 'Швейцария',
    jurisdiction: 'Федеральный закон Швейцарии о защите данных (FADP) · Вне юрисдикции EU/US Cloud Act',
    energySource: '100% альпийская гидроэнергетика (PUE 1.14)',
    tierClassification: 'Подземный бункерный ЦОД Tier IV',
    latencyEuMs: 7,
    erasureDefault: '12+4 Reed-Solomon (4 зоны доступности)',
    certifications: 'FINMA Circular 2023/1 · ISO 27001 · SOC 2 Type II',
    backboneCarriers: 'SwissIX, DE-CIX Direct, Telia, Init7 400G',
  },
  {
    code: 'de-fra-1',
    city: 'Франкфурт-на-Майне',
    country: 'Германия',
    jurisdiction: 'EU GDPR · Аттестация BSI C5 (ФРГ)',
    energySource: '100% сертифицированная ветровая и солнечная генерация (PUE 1.18)',
    tierClassification: 'Операторско-нейтральный кампус Tier III+',
    latencyEuMs: 4,
    erasureDefault: '12+4 Reed-Solomon (3 зоны доступности)',
    certifications: 'BSI C5 Type 2 · ISO 27001 · ISO 27018',
    backboneCarriers: 'DE-CIX Frankfurt, NTT, Cogent, GTT 400G',
  },
  {
    code: 'se-sto-1',
    city: 'Стокгольм (Чиста)',
    country: 'Швеция',
    jurisdiction: 'EU GDPR · Скандинавский суверенный периметр',
    energySource: '100% гидроэнергетика + рекуперация тепла в городскую сеть (PUE 1.11)',
    tierClassification: 'Скальный подземный зал Tier III+',
    latencyEuMs: 18,
    erasureDefault: '10+4 Reed-Solomon (3 зоны доступности)',
    certifications: 'ISO 27001 · SOC 2 Type II · ISO 14001',
    backboneCarriers: 'Netnod, Arelion, GlobalConnect 400G',
  },
  {
    code: 'is-rek-1',
    city: 'Рейкьявик (Кефлавик)',
    country: 'Исландия',
    jurisdiction: 'EEA GDPR · Долговременный архив и неизменяемое WORM-хранилище',
    energySource: '100% геотермальная и гидроэнергия (PUE 1.08)',
    tierClassification: 'Высокоплотный архивный комплекс Tier III',
    latencyEuMs: 39,
    erasureDefault: '16+4 Reed-Solomon Глубокий архив',
    certifications: 'ISO 27001 · PCI-DSS 4.0 Physical',
    backboneCarriers: 'FARICE-1, DANICE, подводное кольцо IRIS',
  },
  {
    code: 'jp-tyo-1',
    city: 'Токио (Индзай)',
    country: 'Япония',
    jurisdiction: 'Закон APPI (Япония) · Финансовый контур APAC',
    energySource: 'Солнечный PPA + сейсмоизолированный фундамент (PUE 1.24)',
    tierClassification: 'Сейсмостойкий комплекс Tier IV',
    latencyEuMs: 162,
    erasureDefault: '12+4 Reed-Solomon (3 зоны доступности)',
    certifications: 'ISMAP · SOC 2 Type II · ISO 27001',
    backboneCarriers: 'JPIX, BBIX, IIJ, NTT Communications',
  },
  {
    code: 'us-iad-1',
    city: 'Эшберн (Вирджиния)',
    country: 'США',
    jurisdiction: 'Контур US Federal / HIPAA BAA / CCPA',
    energySource: '100% компенсация возобновляемыми сертификатами REC (PUE 1.21)',
    tierClassification: 'Корпоративный кластер Tier III+',
    latencyEuMs: 78,
    erasureDefault: '12+4 Reed-Solomon (3 зоны доступности)',
    certifications: 'HIPAA BAA · SOC 2 Type II · FedRAMP Moderate Ready',
    backboneCarriers: 'Equinix Ashburn IX, Lumen, Zayo 400G',
  },
];

export interface ChangelogEntry {
  version: string;
  date: string;
  component: 'Ядро хранилища' | 'Desktop и CLI' | 'Криптография' | 'Шлюз S3';
  title: string;
  summary: string;
  changes: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: 'v4.6.2',
    date: '2026-10-28',
    component: 'Desktop и CLI',
    title: 'SIMD-ускорение алгоритма FastCDC на инструкциях AVX-512 и Apple Neon',
    summary: 'Пропускная способность локальной нарезки файлов на чанки выросла с 1.8 ГБ/с до 4.3 ГБ/с на современных NVMe-накопителях.',
    changes: [
      'Добавлено векторизованное скользящее окно Gear-хеша для динамических границ блоков от 64 КБ до 4 МБ.',
      'Потребление оперативной памяти фоновым демоном FUSE снижено до 28 МБ RSS на деревьях свыше 1 млн индексных дескрипторов (inode).',
      'Устранено состояние гонки символических ссылок при живой сборке директорий target в проектах Rust и Xcode.',
    ],
  },
  {
    version: 'v4.6.0',
    date: '2026-10-09',
    component: 'Криптография',
    title: 'Постквантовая гибридная инкапсуляция ключей (ML-KEM-1024 + X25519)',
    summary: 'Все конверты мастер-ключей хранилищ и рукопожатия локальной LAN-синхронизации переведены на гибридный стандарт NIST FIPS 203 ML-KEM-1024.',
    changes: [
      'Реализована гибридная обёртка ключей X25519 + ML-KEM-1024 для общих командных сейфов.',
      'Добавлена поддержка аппаратного расширения FIDO2 PRF на токенах YubiKey для беспарольной разблокировки CLI.',
      'В Центре комплаенса опубликован отчёт независимого криптографического аудита NCC Group за 3 квартал 2026 года.',
    ],
  },
  {
    version: 'v4.5.4',
    date: '2026-09-18',
    component: 'Шлюз S3',
    title: 'Zero-Copy составная загрузка и поддержка S3 Object Lock Governance',
    summary: 'Нативная трансляция заголовков S3 Object Lock (x-amz-object-lock-mode) напрямую в неизменяемые WORM-корни дерева Меркла.',
    changes: [
      'Полная совместимость с резервным копированием Veeam v12.2, Restic 0.17 и BorgBackup поверх S3 API.',
      'Время до первого байта (p99 TTFB) при чтении диапазонов по 64 МБ в регионе ch-zrh-1 сокращено до 6.4 мс.',
      'Добавлены политики ограничения полосы пропускания на префикс и фильтрация подсетей IPv6 CIDR.',
    ],
  },
  {
    version: 'v4.4.0',
    date: '2026-08-11',
    component: 'Ядро хранилища',
    title: 'Реконструкция полос Рида-Соломона 12+4 поверх RDMA RoCEv2',
    summary: 'Восстановление выбывших узлов хранения ускорено в 3.4 раза по фабрике 400GbE без просадки клиентских операций IOPS.',
    changes: [
      'Межстоечный трафик восстановления чётности выделен в изолированные аппаратные очереди RoCEv2 DSCP.',
      'Внедрена фоновая верификация bit-rot, проверяющая 100% сохранённых дайджестов BLAKE3 каждые 14 суток.',
      'Добавлен эндпоинт метрик Prometheus / OpenMetrics для выделенных корпоративных кластеров.',
    ],
  },
  {
    version: 'v4.2.1',
    date: '2026-06-24',
    component: 'Desktop и CLI',
    title: 'Пиринговое обнаружение узлов в локальной сети (LAN Relay) через mDNS и QUIC',
    summary: 'Рабочие станции в одном корпоративном VLAN синхронизируют тяжёлые репозитории напрямую по зашифрованному QUIC без нагрузки на внешний интернет-канал.',
    changes: [
      'Взаимная аттестация узлов mTLS гарантирует, что пиры в локальной сети не получают доступ к открытому тексту без ключей сейфа.',
      'Автоматическое переключение на региональные шлюзы при фильтрации UDP-порта 4433 межсетевым экраном.',
    ],
  },
];
