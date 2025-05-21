import { 
  GitHubWebhookPayload, 
  GitHubPullRequestPayload, 
  GitHubPushPayload, 
  GitHubIssuePayload,
  GitHubEventHandlers
} from './types';

/**
 * Handles incoming GitHub webhook events
 */
export class WebhookHandler {
  private eventHandlers: GitHubEventHandlers = {};

  /**
   * Register an event handler
   * @param event - The GitHub event name
   * @param handler - The handler function
   */
  on<T extends keyof GitHubEventHandlers>(
    event: T,
    handler: NonNullable<GitHubEventHandlers[T]>
  ): void {
    this.eventHandlers[event] = handler;
  }

  /**
   * Handle a GitHub webhook event
   * @param event - The GitHub event name (e.g., 'pull_request', 'push', 'issues')
   * @param payload - The webhook payload
   */
  async handleEvent(event: string, payload: GitHubWebhookPayload): Promise<void> {
    try {
      const handler = this.eventHandlers[event];
      if (handler) {
        await handler(payload as any);
      } else {
        console.log(`No handler registered for event: ${event}`);
      }
    } catch (error) {
      console.error(`Error handling ${event} event:`, error);
      throw error;
    }
  }

  /**
   * Handle pull request events
   * @param payload - The pull request webhook payload
   */
  async handlePullRequest(payload: GitHubPullRequestPayload): Promise<void> {
    const handler = this.eventHandlers.pull_request;
    if (handler) {
      await handler(payload);
    } else {
      console.log('No pull request handler registered');
    }
  }

  /**
   * Handle push events
   * @param payload - The push webhook payload
   */
  async handlePush(payload: GitHubPushPayload): Promise<void> {
    const handler = this.eventHandlers.push;
    if (handler) {
      await handler(payload);
    } else {
      console.log('No push handler registered');
    }
  }

  /**
   * Handle issue events
   * @param payload - The issue webhook payload
   */
  async handleIssue(payload: GitHubIssuePayload): Promise<void> {
    const handler = this.eventHandlers.issues;
    if (handler) {
      await handler(payload);
    } else {
      console.log('No issue handler registered');
    }
    // Add issue handling logic here
  }
}

// Export a default instance
export const webhookHandler = new WebhookHandler();

/**
 * Runs security checks on the given commit SHA
 * @param _commitSha - The commit SHA to check (currently unused)
 * @returns A promise that resolves to an array of security issues
 */
async function runSecurityChecks(_commitSha: string): Promise<Array<{
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
}>> {
  // TODO: Implement actual security checks
  // This is a placeholder for now
  return [];
}

/**
 * Generates a markdown report from security check results
 * @param checks - Array of security check results
 * @returns A markdown formatted report string
 */
function generateSecurityReport(checks: Array<{
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
}>): string {
  if (checks.length === 0) {
    return '## ✅ No security issues found!\n\n' +
           'The security scan completed successfully and no issues were detected.';
  }

  let report = '## 🔍 Security Scan Results\n\n' +
              `Found ${checks.length} potential security issue${checks.length > 1 ? 's' : ''}:\n\n`;

  const bySeverity = {
    high: checks.filter(check => check.severity === 'high'),
    medium: checks.filter(check => check.severity === 'medium'),
    low: checks.filter(check => check.severity === 'low')
  };

  const severityEmoji = {
    high: '🔴',
    medium: '🟠',
    low: '🔵'
  };

  (['high', 'medium', 'low'] as const).forEach(severity => {
    const issues = bySeverity[severity];
    if (issues.length > 0) {
      report += `\n### ${severityEmoji[severity]} ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity (${issues.length})\n\n`;
      issues.forEach(issue => {
        report += `- ${issue.message}`;
        if (issue.file) {
          report += ` in \`${issue.file}${issue.line ? `:${issue.line}` : ''}\``;
        }
        report += '\n';
      });
    }
  });

  report += '\n---\n';
  report += '> ℹ️ This is an automated security scan. ' +
           'Please review these findings and address any issues as needed.';

  return report;
}

// Export utility functions for testing and external use
export { runSecurityChecks, generateSecurityReport };
