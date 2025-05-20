import { Octokit } from '@octokit/rest';
import { logger } from '../../utils/logger';
import { SecurityScanResult, SecurityIssue } from './types';

// Define severity levels
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ScanOptions {
  repository: string;
  branch: string;
  token: string;
}

export class SecurityScanService {
  private octokit: Octokit;
  private scanResults!: SecurityScanResult;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env['GITHUB_TOKEN'] || '',
      userAgent: 'FortiCode Security Scanner'
    });

    this.scanResults = {
      repository: '',
      branch: 'main',
      owner: '',
      repoName: '',
      totalFiles: 0,
      scannedFiles: 0,
      issuesFound: 0,
      issues: [],
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      endTime: undefined,
      error: ''
    };
  }

  async startScan(options: ScanOptions): Promise<SecurityScanResult> {
    if (!options.repository || !options.token) {
      throw new Error('Repository and token are required');
    }

    this.octokit = new Octokit({
      auth: options.token,
      userAgent: 'FortiCode Security Scanner'
    });

    const [owner, repoName] = options.repository.split('/');
    if (!owner || !repoName) {
      throw new Error('Invalid repository format. Expected: owner/repo-name');
    }

    this.scanResults = {
      repository: options.repository,
      branch: options.branch || 'main',
      owner,
      repoName,
      totalFiles: 0,
      scannedFiles: 0,
      issuesFound: 0,
      issues: [],
      status: 'running',
      progress: 0,
      startTime: new Date(),
      endTime: undefined,
      error: ''
    };

    try {
      const contents = await this.octokit.repos.getContent({
        owner,
        repo: repoName,
        path: '',
        ref: this.scanResults.branch
      });

      if (contents.data) {
        const files = Array.isArray(contents.data) ? contents.data : [contents.data];
        this.scanResults.totalFiles = files.length;
        await this.processFiles(files);
      }

      this.scanResults.status = 'completed';
      this.scanResults.endTime = new Date();
      return this.scanResults;
    } catch (error) {
      this.scanResults.error = error instanceof Error ? error.message : 'An error occurred';
      this.scanResults.status = 'error';
      this.scanResults.endTime = new Date();
      throw error;
    }
  }

  private async processFiles(files: any[]): Promise<void> {
    if (!files) return;

    try {
      for (const file of files) {
        if (!file || typeof file !== 'object' || !file.type) {
          logger.warn('Invalid file object');
          continue;
        }

        if (file.type === 'dir') {
          const contents = await this.octokit.repos.getContent({
            owner: this.scanResults.owner,
            repo: this.scanResults.repoName,
            path: file.path,
            ref: this.scanResults.branch
          });

          if (contents.data) {
            const dirFiles = Array.isArray(contents.data) ? contents.data : [contents.data];
            await this.processFiles(dirFiles);
          }
        } else if (file.type === 'file') {
          const content = await this.octokit.repos.getContent({
            owner: this.scanResults.owner,
            repo: this.scanResults.repoName,
            path: file.path,
            ref: this.scanResults.branch
          });

          if (!content.data) {
            logger.warn(`No content found for file: ${file.path}`);
            continue;
          }

          // For file content, we need to make a separate request to get the raw content
          // For file content, we need to make a separate request to get the raw content
          const rawContent = await this.octokit.repos.getContent({
            owner: this.scanResults.owner,
            repo: this.scanResults.repoName,
            path: file.path,
            ref: this.scanResults.branch,
            mediaType: { format: 'raw' }
          });

          if (!rawContent.data) {
            logger.warn(`No content found for file: ${file.path}`);
            continue;
          }

          const fileContent = rawContent.data.toString();
          const issues = this.detectSecurityIssues(file.path, fileContent);
          
          if (issues.length > 0) {
            this.scanResults.issues = [...this.scanResults.issues, ...issues];
            this.scanResults.issuesFound += issues.length;
          }
          
          this.scanResults.scannedFiles++;
          this.scanResults.progress = Math.round((this.scanResults.scannedFiles / this.scanResults.totalFiles) * 100);
        }
      }
    } catch (error) {
      logger.error('Error processing files', error);
    }
  }

  private detectSecurityIssues(filePath: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    
    // Hardcoded security patterns for demonstration
    const patterns = [
      { pattern: /password\s*=/i, severity: 'critical' as SeverityLevel, type: 'hardcoded-credential' },
      { pattern: /api_key\s*=/i, severity: 'critical' as SeverityLevel, type: 'hardcoded-credential' },
      { pattern: /secret\s*=/i, severity: 'critical' as SeverityLevel, type: 'hardcoded-credential' },
      { pattern: /process\.env\.DATABASE_URL/i, severity: 'high' as SeverityLevel, type: 'environment-variable' }
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        for (const match of matches) {
          const line = this.findLine(content, match);
          issues.push({
            path: filePath,
            line,
            severity: pattern.severity,
            type: pattern.type,
            description: `Potential security issue found: ${pattern.type}`
          });
        }
      }
    }

    return issues;
  }

  private findLine(content: string | null, search: string | null): number {
    if (!content || !search || typeof content !== 'string' || typeof search !== 'string') {
      return -1;
    }

    try {
      const lines = content.split('\n');
      if (!lines || !Array.isArray(lines)) {
        return -1;
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (typeof line === 'string' && line.includes(search)) {
          return i + 1;
        }
      }
      return -1;
    } catch (error) {
      logger.error('Error finding line number:', error);
      return -1;
    }
  }
}
