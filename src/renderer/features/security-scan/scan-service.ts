import GithubService from '@shared/github/github.service';
import type { default as GithubServiceType } from '@shared/github/github.service';
import logger from '@renderer/utils/logger';
import { SecurityIssue, SecurityScanResult, ScanOptions } from './types';

export type { SecurityScanResult, ScanOptions };



export class SecurityScanService {
  private githubService: InstanceType<typeof GithubServiceType>;
  private octokit: any; // Add octokit property to fix the TypeScript error
  protected scanResults: SecurityScanResult;
  protected logger: any;

  constructor() {
    this.githubService = new GithubService(process.env['GITHUB_TOKEN'] || '');

    this.logger = logger as any;
    this.scanResults = {
      owner: '',
      repoName: '',
      repository: '',
      branch: 'main',
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
    if (!options.owner || !options.repo || !options.token) {
      throw new Error('Repository and token are required');
    }

    // Validate repository format
    if (!options.owner || !options.repo) {
      throw new Error('Invalid repository format. Expected: owner/repo-name');
    }

    this.githubService = new GithubService(options.token);

    const owner = options.owner;
    const repoName = options.repo;
    if (!owner || !repoName) {
      throw new Error('Invalid repository format. Expected: owner/repo-name');
    }

    this.scanResults = {
      repository: `${options.owner}/${options.repo}`,
      branch: options.branch || 'main',
      owner: options.owner,
      repoName: options.repo,
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
      const contents = await this.githubService.getContents({
        owner,
        repo: repoName,
        ref: this.scanResults.branch
      });

      if (!contents || (Array.isArray(contents) && contents.length === 0)) {
        this.logger.error('No files found in repository');
        return this.scanResults;
      }

      const files = Array.isArray(contents) ? contents : [contents];
      this.scanResults.totalFiles = files.length;
      await this.processFiles(files);

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

  protected async processFiles(files: any[]): Promise<void> {
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

          if (Array.isArray(contents.data)) {
            await this.processFiles(contents.data);
          }
        } else if (file.type === 'file') {
          try {
            const content = await this.octokit.repos.getContent({
              owner: this.scanResults.owner,
              repo: this.scanResults.repoName,
              path: file.path,
              ref: this.scanResults.branch
            });

            // Check if content is null or undefined
            if (!content || !content.data) {
              this.logger.error(`Failed to fetch file content for ${file.path}`);
              throw new Error('Failed to fetch file content');
            }

            // Check if content is a file with content (not a directory)
            if (!Array.isArray(content.data) && 'content' in content.data) {
              const fileContent = content.data.content;
              if (fileContent) {
                const decodedContent = Buffer.from(fileContent, 'base64').toString('utf-8');
                const issues = this.detectSecurityIssues(file.path, decodedContent);
                this.scanResults.issues.push(...issues);
                this.scanResults.scannedFiles++;
                this.scanResults.progress = Math.round((this.scanResults.scannedFiles / this.scanResults.totalFiles) * 100);
              } else {
                logger.warn(`No content found for file: ${file.path}`);
              }
            }
          } catch (error) {
            logger.error(`Failed to fetch file content for ${file.path}`, error);
            // Don't throw the error, just log it and continue
          }
        }
      }
    } catch (error) {
      logger.error('Error processing files', error);
      // Don't throw the error, just log it and continue
    }
  }

  protected detectSecurityIssues(filePath: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    
    // Hardcoded security patterns for demonstration
    const patterns = [
      { pattern: /password\s*=/i, severity: 'critical' as 'critical' | 'high' | 'medium' | 'low', type: 'hardcoded-credential' },
      { pattern: /api_key\s*=/i, severity: 'critical' as 'critical' | 'high' | 'medium' | 'low', type: 'hardcoded-credential' },
      { pattern: /secret\s*=/i, severity: 'critical' as 'critical' | 'high' | 'medium' | 'low', type: 'hardcoded-credential' },
      { pattern: /process\.env\.DATABASE_URL/i, severity: 'high' as 'critical' | 'high' | 'medium' | 'low', type: 'environment-variable' }
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

  protected findLine(content: string | null, search: string | null): number {
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
