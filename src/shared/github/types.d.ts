/**
 * Type definitions for GitHub API responses and webhook payloads
 */
export interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: 'User' | 'Bot' | 'Organization' | 'Mannequin';
    site_admin: boolean;
}
export interface GitHubRepository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubUser;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    default_branch: string;
}
export interface GitHubCommit {
    id: string;
    tree_id: string;
    message: string;
    timestamp: string;
    author: {
        name: string;
        email: string;
        username?: string;
    };
    committer: {
        name: string;
        email: string;
        username?: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
}
export interface GitHubWebhookPayload {
    action?: string;
    repository: GitHubRepository;
    sender: GitHubUser;
    organization?: {
        login: string;
        id: number;
        node_id: string;
        url: string;
        html_url: string;
    };
    installation?: {
        id: number;
        node_id: string;
    };
}
export interface GitHubAppConfig {
    id: number;
    privateKey: string;
    webhookSecret: string;
    clientId: string;
    clientSecret: string;
}
export interface GitHubPullRequestPayload extends GitHubWebhookPayload {
    action: 'opened' | 'edited' | 'closed' | 'reopened' | 'synchronize' | 'assigned' | 'unassigned' | 'review_requested' | 'review_request_removed' | 'ready_for_review' | 'converted_to_draft' | 'labeled' | 'unlabeled';
    number: number;
    pull_request: {
        url: string;
        id: number;
        node_id: string;
        html_url: string;
        diff_url: string;
        patch_url: string;
        issue_url: string;
        number: number;
        state: 'open' | 'closed';
        locked: boolean;
        title: string;
        user: GitHubUser;
        body: string | null;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
        merged_at: string | null;
        merge_commit_sha: string | null;
        assignee: GitHubUser | null;
        assignees: GitHubUser[];
        requested_reviewers: GitHubUser[];
        labels: Array<{
            id: number;
            node_id: string;
            url: string;
            name: string;
            description: string | null;
            color: string;
            default: boolean;
        }>;
        head: {
            label: string;
            ref: string;
            sha: string;
            user: GitHubUser;
            repo: GitHubRepository;
        };
        base: {
            label: string;
            ref: string;
            sha: string;
            user: GitHubUser;
            repo: GitHubRepository;
        };
        author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';
        draft: boolean;
        merged: boolean;
        mergeable: boolean | null;
        rebaseable: boolean | null;
        mergeable_state: string;
        merged_by: GitHubUser | null;
        comments: number;
        review_comments: number;
        maintainer_can_modify: boolean;
        commits: number;
        additions: number;
        deletions: number;
        changed_files: number;
    };
}
export interface GitHubPushPayload extends GitHubWebhookPayload {
    ref: string;
    before: string;
    after: string;
    created: boolean;
    deleted: boolean;
    forced: boolean;
    base_ref: string | null;
    compare: string;
    commits: GitHubCommit[];
    head_commit: GitHubCommit | null;
    repository: GitHubRepository & {
        id: number;
        node_id: string;
        full_name: string;
        private: boolean;
        owner: GitHubUser;
        html_url: string;
        description: string | null;
        fork: boolean;
        url: string;
        created_at: number;
        updated_at: string;
        pushed_at: number;
        git_url: string;
        ssh_url: string;
        clone_url: string;
        default_branch: string;
    };
    pusher: {
        name: string;
        email: string;
    };
    sender: GitHubUser;
}
export interface GitHubIssuePayload extends GitHubWebhookPayload {
    action: 'opened' | 'edited' | 'deleted' | 'pinned' | 'unpinned' | 'closed' | 'reopened' | 'assigned' | 'unassigned' | 'labeled' | 'unlabeled' | 'locked' | 'unlocked' | 'transferred' | 'milestoned' | 'demilestoned';
    issue: {
        url: string;
        repository_url: string;
        labels_url: string;
        comments_url: string;
        events_url: string;
        html_url: string;
        id: number;
        node_id: string;
        number: number;
        title: string;
        user: GitHubUser;
        labels: Array<{
            id: number;
            node_id: string;
            url: string;
            name: string;
            description: string | null;
            color: string;
            default: boolean;
        }>;
        state: 'open' | 'closed';
        locked: boolean;
        assignee: GitHubUser | null;
        assignees: GitHubUser[];
        milestone: {
            url: string;
            html_url: string;
            labels_url: string;
            id: number;
            node_id: string;
            number: number;
            title: string;
            description: string | null;
            creator: GitHubUser;
            open_issues: number;
            closed_issues: number;
            state: 'open' | 'closed';
            created_at: string;
            updated_at: string;
            due_on: string | null;
            closed_at: string | null;
        } | null;
        comments: number;
        created_at: string;
        updated_at: string;
        closed_at: string | null;
        author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' | 'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER';
        active_lock_reason: 'too heated' | 'off-topic' | 'resolved' | 'spam' | null;
        body: string | null;
        performed_via_github_app: {
            id: number;
            node_id: string;
            owner: GitHubUser;
            name: string;
            description: string | null;
            external_url: string;
            html_url: string;
            created_at: string;
            updated_at: string;
            permissions: Record<string, string>;
            events: string[];
        } | null;
    };
    changes?: {
        title?: {
            from: string;
        };
        body?: {
            from: string;
        };
    };
    label?: {
        id: number;
        node_id: string;
        url: string;
        name: string;
        description: string | null;
        color: string;
        default: boolean;
    };
}
export interface GitHubFileContent {
    content: string;
    encoding: string;
    sha: string;
    size: number;
    url: string;
    path: string;
    name: string;
}
export interface GitHubFileInfo {
    type: string;
    size: number;
    name: string;
    path: string;
    content?: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    download_url: string | null;
}
export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
    protection?: {
        enabled: boolean;
        required_status_checks: {
            enforcement_level: string;
            contexts: string[];
        };
    };
    protection_url?: string;
}
export type GitHubEvent = 'pull_request' | 'push' | 'issues' | 'issue_comment' | 'pull_request_review' | 'pull_request_review_comment' | 'pull_request_review_thread' | 'create' | 'delete' | 'fork' | 'release' | 'member' | 'public' | 'status' | 'watch' | 'deployment_status';
export type GitHubEventHandler = (payload: GitHubWebhookPayload) => Promise<void> | void;
type EventHandlerMap = {
    pull_request: (payload: GitHubPullRequestPayload) => Promise<void> | void;
    push: (payload: GitHubPushPayload) => Promise<void> | void;
    issues: (payload: GitHubIssuePayload) => Promise<void> | void;
    [K: string]: ((payload: any) => Promise<void> | void) | undefined;
};
export type GitHubEventHandlers = Partial<EventHandlerMap>;
export {};
//# sourceMappingURL=types.d.ts.map