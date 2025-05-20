import { SecurityScanService, SecurityScanResult } from '../scan-service';

export class TestSecurityScanService extends SecurityScanService {
  setScanResults(results: SecurityScanResult): void {
    this.scanResults = results;
  }

  getScanResults(): SecurityScanResult {
    return this.scanResults;
  }

  getProcessFiles(): jest.Mock {
    return this.processFiles as jest.Mock;
  }
}
