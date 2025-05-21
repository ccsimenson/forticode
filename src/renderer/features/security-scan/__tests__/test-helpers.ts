import { SecurityScanService, SecurityScanResult } from '../scan-service';
import { Mock } from 'vitest';

export class TestSecurityScanService extends SecurityScanService {
  setScanResults(results: SecurityScanResult): void {
    this.scanResults = results;
  }

  getScanResults(): SecurityScanResult {
    return this.scanResults;
  }

  getProcessFiles(): Mock {
    return this.processFiles as Mock;
  }
}
