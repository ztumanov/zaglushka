import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStoragePricing,
  simulateDeltaSync,
  calculateErasureCodingOverhead,
  calculateSlaCredit,
  validateTrialRequest,
  verifyChecksumMatch,
  validateIamLoginAttempt,
} from './vaultLogic';

test('validateIamLoginAttempt validates fields and returns IAM-403-TENANT for unregistered credentials', () => {
  const bad = validateIamLoginAttempt({
    tenantOrEmail: 'a',
    password: '123',
    totpCode: 'abc',
    clusterRegion: 'ru-mow-1',
  });
  assert.equal(bad.validInput, false);
  assert.ok(bad.fieldErrors.tenantOrEmail);
  assert.ok(bad.fieldErrors.password);
  assert.ok(bad.fieldErrors.totpCode);

  const denied = validateIamLoginAttempt({
    tenantOrEmail: 'admin@corp-infra.ru',
    password: 'superSecretPassword123',
    totpCode: '482910',
    clusterRegion: 'ru-mow-1',
  });
  assert.equal(denied.validInput, true);
  assert.equal(denied.authResponse?.errorCode, 'IAM-403-TENANT');
  assert.equal(denied.authResponse?.gatewayEndpoint, 'portal.sync-vault-cloud.online');
});

test('calculateStoragePricing computes monthly and annual discount accurately', () => {
  const monthly = calculateStoragePricing({
    storageTb: 50,
    seats: 15,
    billingCycle: 'monthly',
    redundancy: 'standard-ecc',
  });
  // 50 * 5.8 = 290, + (15 - 5) * 4.5 = 45 => 335
  assert.equal(monthly.monthlyTotalUsd, 335);
  assert.equal(monthly.annualSavingsUsd, 0);

  const annual = calculateStoragePricing({
    storageTb: 50,
    seats: 15,
    billingCycle: 'annual',
    redundancy: 'standard-ecc',
  });
  assert.equal(annual.monthlyTotalUsd, 274.7);
  assert.ok(annual.annualSavingsUsd > 700);
  assert.ok(annual.hyperscalerSavingsPercent > 50);
});

test('simulateDeltaSync calculates chunk counts and bandwidth savings', () => {
  const res = simulateDeltaSync({
    fileSizeMb: 1000,
    modifiedPercent: 5,
    chunkSizeKb: 1024,
    bandwidthMbps: 100,
  });
  assert.equal(res.totalChunks, 1000);
  assert.equal(res.modifiedChunks, 50);
  assert.ok(res.deltaTransferMb < 50);
  assert.ok(res.bandwidthSavedPercent > 95);
  assert.ok(res.deltaTransferSeconds < res.fullTransferSeconds);
});

test('calculateErasureCodingOverhead returns Reed-Solomon efficiency and fault tolerance', () => {
  const ecc = calculateErasureCodingOverhead({
    rawDataTb: 100,
    dataShards: 12,
    parityShards: 4,
  });
  assert.equal(ecc.totalShards, 16);
  assert.equal(ecc.storageEfficiencyPercent, 75);
  assert.equal(ecc.toleratedConcurrentNodeFailures, 4);
  assert.equal(ecc.totalPhysicalFootprintTb, 133.33);
});

test('calculateSlaCredit applies SLA credit schedule tiers', () => {
  assert.equal(calculateSlaCredit(99.995, 1000).creditUsd, 0);
  assert.equal(calculateSlaCredit(99.95, 1000).creditUsd, 100);
  assert.equal(calculateSlaCredit(99.5, 1000).creditUsd, 250);
  assert.equal(calculateSlaCredit(98.4, 1000).creditUsd, 500);
});

test('validateTrialRequest enforces required fields and email format', () => {
  const invalid = validateTrialRequest({
    fullName: 'A',
    workEmail: 'invalid-email',
    company: '',
    estimatedTb: 0,
    region: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.workEmail);
  assert.ok(invalid.errors.company);

  const valid = validateTrialRequest({
    fullName: 'Lukas Meier',
    workEmail: 'l.meier@helvetia-quant.ch',
    company: 'Helvetia Quant AG',
    estimatedTb: 120,
    region: 'ch-zrh-1',
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('verifyChecksumMatch validates 64-char SHA-256 hex digest', () => {
  const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const match = verifyChecksumMatch(hash, '  E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855 ');
  assert.equal(match.isValidFormat, true);
  assert.equal(match.matches, true);

  const bad = verifyChecksumMatch(hash, 'not-a-sha256');
  assert.equal(bad.isValidFormat, false);
  assert.equal(bad.matches, false);
});
