export interface SecurityIssue {
  path: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
}

export interface SecurityScanResult {
  repository: string;
  branch: string;
  owner: string;
  repoName: string;
  totalFiles: number;
  scannedFiles: number;
  issuesFound: number;
  issues: SecurityIssue[];
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime: Date | undefined;
  error?: string;
}

export interface ScanOptions {
  repository: string;
  token: string;
  branch?: string;
}
