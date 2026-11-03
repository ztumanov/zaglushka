export type RedundancyTier = 'standard-ecc' | 'multi-region' | 'air-gapped';
export type BillingCycle = 'monthly' | 'annual';

export interface StoragePricingInput {
  storageTb: number;
  seats: number;
  billingCycle: BillingCycle;
  redundancy: RedundancyTier;
}

export interface StoragePricingResult {
  monthlyTotalUsd: number;
  annualSavingsUsd: number;
  effectivePerTbUsd: number;
  hyperscalerComparisonUsd: number;
  hyperscalerSavingsPercent: number;
}

export function calculateStoragePricing(input: StoragePricingInput): StoragePricingResult {
  const safeTb = Math.max(1, Math.min(10000, Math.round(input.storageTb)));
  const safeSeats = Math.max(1, Math.min(5000, Math.round(input.seats)));

  const basePerTb: Record<RedundancyTier, number> = {
    'standard-ecc': 5.8,
    'multi-region': 8.4,
    'air-gapped': 11.9,
  };

  const seatRate = safeSeats <= 5 ? 0 : (safeSeats - 5) * 4.5;
  const rawMonthly = safeTb * basePerTb[input.redundancy] + seatRate;

  const discountFactor = input.billingCycle === 'annual' ? 0.82 : 1.0;
  const monthlyTotalUsd = Math.round(rawMonthly * discountFactor * 100) / 100;
  const annualSavingsUsd =
    input.billingCycle === 'annual'
      ? Math.round(rawMonthly * 12 * 0.18 * 100) / 100
      : 0;

  const effectivePerTbUsd = Math.round((monthlyTotalUsd / safeTb) * 100) / 100;

  // Traditional hyperscaler ($23/TB storage + $45/TB typical monthly sync egress)
  const hyperscalerComparisonUsd = Math.round((safeTb * 36.5 + safeSeats * 9) * 100) / 100;
  const hyperscalerSavingsPercent = Math.max(
    10,
    Math.min(
      90,
      Math.round(((hyperscalerComparisonUsd - monthlyTotalUsd) / hyperscalerComparisonUsd) * 100)
    )
  );

  return {
    monthlyTotalUsd,
    annualSavingsUsd,
    effectivePerTbUsd,
    hyperscalerComparisonUsd,
    hyperscalerSavingsPercent,
  };
}

export interface DeltaSyncInput {
  fileSizeMb: number;
  modifiedPercent: number;
  chunkSizeKb: number;
  bandwidthMbps: number;
}

export interface DeltaSyncResult {
  totalChunks: number;
  modifiedChunks: number;
  deltaTransferMb: number;
  bandwidthSavedPercent: number;
  deltaTransferSeconds: number;
  fullTransferSeconds: number;
}

export function simulateDeltaSync(input: DeltaSyncInput): DeltaSyncResult {
  const fileSizeMb = Math.max(1, input.fileSizeMb);
  const modifiedPercent = Math.max(0.1, Math.min(100, input.modifiedPercent));
  const chunkSizeKb = Math.max(64, Math.min(16384, input.chunkSizeKb));
  const bandwidthMbps = Math.max(1, input.bandwidthMbps);

  const totalKb = fileSizeMb * 1024;
  const totalChunks = Math.max(1, Math.ceil(totalKb / chunkSizeKb));
  const modifiedChunks = Math.max(1, Math.ceil(totalChunks * (modifiedPercent / 100)));

  // Include 32-byte BLAKE3 Merkle manifest overhead per chunk
  const manifestOverheadMb = (totalChunks * 32) / (1024 * 1024);
  const rawModifiedMb = (modifiedChunks * chunkSizeKb) / 1024;
  // Apply LZ4/Zstd block compression factor (~0.78 on changed blocks)
  const deltaTransferMb =
    Math.round(Math.min(fileSizeMb, rawModifiedMb * 0.78 + manifestOverheadMb) * 100) / 100;

  const bandwidthSavedPercent =
    Math.round(Math.max(0, ((fileSizeMb - deltaTransferMb) / fileSizeMb) * 100) * 10) / 10;

  const throughputMbPerSec = bandwidthMbps / 8;
  const deltaTransferSeconds = Math.max(0.1, Math.round((deltaTransferMb / throughputMbPerSec) * 10) / 10);
  const fullTransferSeconds = Math.max(0.1, Math.round((fileSizeMb / throughputMbPerSec) * 10) / 10);

  return {
    totalChunks,
    modifiedChunks,
    deltaTransferMb,
    bandwidthSavedPercent,
    deltaTransferSeconds,
    fullTransferSeconds,
  };
}

export interface ErasureCodingInput {
  rawDataTb: number;
  dataShards: number;
  parityShards: number;
}

export interface ErasureCodingResult {
  totalShards: number;
  storageEfficiencyPercent: number;
  overheadMultiplier: number;
  totalPhysicalFootprintTb: number;
  toleratedConcurrentNodeFailures: number;
}

export function calculateErasureCodingOverhead(input: ErasureCodingInput): ErasureCodingResult {
  const rawDataTb = Math.max(1, input.rawDataTb);
  const dataShards = Math.max(2, Math.min(32, Math.round(input.dataShards)));
  const parityShards = Math.max(1, Math.min(16, Math.round(input.parityShards)));

  const totalShards = dataShards + parityShards;
  const storageEfficiencyPercent = Math.round((dataShards / totalShards) * 1000) / 10;
  const overheadMultiplier = Math.round((totalShards / dataShards) * 100) / 100;
  const totalPhysicalFootprintTb = Math.round(rawDataTb * (totalShards / dataShards) * 100) / 100;

  return {
    totalShards,
    storageEfficiencyPercent,
    overheadMultiplier,
    totalPhysicalFootprintTb,
    toleratedConcurrentNodeFailures: parityShards,
  };
}

export interface SlaCreditResult {
  creditPercent: number;
  creditUsd: number;
  tierLabel: string;
}

export function calculateSlaCredit(uptimePercent: number, monthlyInvoiceUsd: number): SlaCreditResult {
  const safeInvoice = Math.max(0, monthlyInvoiceUsd);
  if (uptimePercent >= 99.99) {
    return { creditPercent: 0, creditUsd: 0, tierLabel: 'Норматив SLA выполнен (>= 99.99%)' };
  }
  if (uptimePercent >= 99.9) {
    return {
      creditPercent: 10,
      creditUsd: Math.round(safeInvoice * 0.1 * 100) / 100,
      tierLabel: 'Уровень компенсации 1 (99.90% – 99.98%)',
    };
  }
  if (uptimePercent >= 99.0) {
    return {
      creditPercent: 25,
      creditUsd: Math.round(safeInvoice * 0.25 * 100) / 100,
      tierLabel: 'Уровень компенсации 2 (99.00% – 99.89%)',
    };
  }
  return {
    creditPercent: 50,
    creditUsd: Math.round(safeInvoice * 0.5 * 100) / 100,
    tierLabel: 'Максимальная компенсация (< 99.00%)',
  };
}

export interface TrialRequestInput {
  fullName: string;
  workEmail: string;
  company: string;
  estimatedTb: number;
  region: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TrialRequestInput, string>>;
}

export function validateTrialRequest(input: TrialRequestInput): ValidationResult {
  const errors: Partial<Record<keyof TrialRequestInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Укажите полное имя администратора (минимум 2 символа).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.workEmail || !emailRegex.test(input.workEmail.trim())) {
    errors.workEmail = 'Введите корректный корпоративный адрес электронной почты.';
  }

  if (!input.company || input.company.trim().length < 2) {
    errors.company = 'Укажите название организации или подразделения.';
  }

  if (!Number.isFinite(input.estimatedTb) || input.estimatedTb < 1 || input.estimatedTb > 50000) {
    errors.estimatedTb = 'Объём хранилища должен быть в диапазоне от 1 до 50 000 ТБ.';
  }

  if (!input.region || input.region.trim().length === 0) {
    errors.region = 'Выберите основную юрисдикцию размещения данных.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function verifyChecksumMatch(expectedSha256: string, providedHash: string): {
  trimmedInput: string;
  isValidFormat: boolean;
  matches: boolean;
} {
  const cleanExpected = expectedSha256.trim().toLowerCase();
  const cleanProvided = providedHash.trim().toLowerCase();
  const hex64Regex = /^[a-f0-9]{64}$/;
  const isValidFormat = hex64Regex.test(cleanProvided);

  return {
    trimmedInput: cleanProvided,
    isValidFormat,
    matches: isValidFormat && cleanExpected === cleanProvided,
  };
}

export function computeToySha256Hex(seed: string): string {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part1}${part2}${part1}${part2}${part1}${part2}`.slice(0, 64);
}

export interface IamLoginAttemptInput {
  tenantOrEmail: string;
  password: string;
  totpCode?: string;
  clusterRegion: string;
}

export interface IamLoginAttemptResult {
  validInput: boolean;
  fieldErrors: {
    tenantOrEmail?: string;
    password?: string;
    totpCode?: string;
  };
  authResponse?: {
    errorCode: string;
    auditTraceId: string;
    message: string;
    gatewayEndpoint: string;
  };
}

export function validateIamLoginAttempt(input: IamLoginAttemptInput): IamLoginAttemptResult {
  const fieldErrors: IamLoginAttemptResult['fieldErrors'] = {};
  const cleanId = (input.tenantOrEmail || '').trim();
  const cleanPass = input.password || '';
  const cleanTotp = (input.totpCode || '').trim();

  if (cleanId.length < 3) {
    fieldErrors.tenantOrEmail = 'Укажите корпоративный Email или идентификатор тенанта (например, vlt_ch_zrh_...).';
  }

  if (cleanPass.length < 6) {
    fieldErrors.password = 'Введите пароль учётной записи IAM (не менее 6 символов).';
  }

  if (cleanTotp.length > 0 && !/^\d{6}$/.test(cleanTotp)) {
    fieldErrors.totpCode = 'Код двухфакторной аутентификации TOTP должен состоять из 6 цифр.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { validInput: false, fieldErrors };
  }

  const hash = computeToySha256Hex(`${cleanId}:${input.clusterRegion}`).slice(0, 10);
  const gatewayEndpoint =
    input.clusterRegion === 'ru-mow-1'
      ? 'portal.sync-vault-cloud.online'
      : `s3.${input.clusterRegion}.sync-vault-cloud.online`;

  return {
    validInput: true,
    fieldErrors: {},
    authResponse: {
      errorCode: 'IAM-403-TENANT',
      auditTraceId: `req_${input.clusterRegion.replace(/-/g, '_')}_${hash}`,
      gatewayEndpoint,
      message: `Доступ отклонён узлом ${gatewayEndpoint}: учётная запись «${cleanId}» не найдена в реестре активных корпоративных контрактов или не предъявлен аппаратный клиентский сертификат mTLS (Код: IAM-403-TENANT).`,
    },
  };
}


