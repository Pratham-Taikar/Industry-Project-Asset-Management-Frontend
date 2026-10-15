// =====================================================================
// AssetMX Asset Valuation & Depreciation Mock State Store
// Local storage persistence with initial clean state support
// =====================================================================

export interface AssetValuationRecord {
  id: string;
  assetId: string;
  effectiveDate: string; // YYYY-MM-DD
  previousValue: number | string;
  newRecordedValue: number;
  formulaUsed: string;
  notes: string;
  reference?: string;
  updatedBy: string;
  recordedAt: string; // YYYY-MM-DD HH:mm:ss
}

const STORAGE_PREFIX = 'amx_asset_valuation_ledger_';

export function getStoredValuations(assetId: string): AssetValuationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${assetId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load valuation ledger from localStorage', e);
  }
  return [];
}

export function saveStoredValuations(assetId: string, records: AssetValuationRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${assetId}`, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save valuation ledger to localStorage', e);
  }
}

export function addStoredValuation(
  assetId: string,
  entry: Omit<AssetValuationRecord, 'id' | 'assetId' | 'recordedAt'>
): AssetValuationRecord {
  const current = getStoredValuations(assetId);
  const now = new Date();
  const recordedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const newRecord: AssetValuationRecord = {
    id: `VAL-${now.getFullYear()}-${String(current.length + 1).padStart(4, '0')}`,
    assetId,
    effectiveDate: entry.effectiveDate,
    previousValue: entry.previousValue,
    newRecordedValue: entry.newRecordedValue,
    formulaUsed: entry.formulaUsed,
    notes: entry.notes,
    reference: entry.reference?.trim() || undefined,
    updatedBy: entry.updatedBy,
    recordedAt,
  };

  const updated = [newRecord, ...current];
  saveStoredValuations(assetId, updated);
  return newRecord;
}
