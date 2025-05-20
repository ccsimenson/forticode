export interface WebhookEvent {
  action?: string;
  installation?: {
    id: number;
    account?: {
      login: string;
    };
  };
  repository?: {
    full_name: string;
    id: number;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  };
  repositories?: Array<{
    full_name: string;
    id: number;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  }>;
  pull_request?: {
    id: number;
    number: number;
    state: string;
    title: string;
    user: {
      login: string;
    };
    [key: string]: any;
  };
  repositories_added?: Array<{
    id: number;
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  }>;
  repositories_removed?: Array<{
    id: number;
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  }>;
  review?: {
    id: number;
    state: string;
    user: {
      login: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface InstallationEvent extends WebhookEvent {
  installation: {
    id: number;
    account: {
      login: string;
    };
  };
  action: 'created' | 'deleted';
}

export interface RepositoryEvent extends WebhookEvent {
  repositories_added?: Array<{
    id: number;
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  }>;
  repositories_removed?: Array<{
    id: number;
    full_name: string;
    name: string;
    owner: {
      login: string;
    };
    [key: string]: any;
  }>;
}

export interface PullRequestEvent extends WebhookEvent {
  pull_request: {
    id: number;
    number: number;
    state: string;
    title: string;
    user: {
      login: string;
    };
    [key: string]: any;
  };
  action: 'opened' | 'synchronize' | 'closed';
}

export interface PullRequestReviewEvent extends WebhookEvent {
  pull_request: {
    id: number;
    number: number;
    state: string;
    title: string;
    user: {
      login: string;
    };
    [key: string]: any;
  };
  review: {
    id: number;
    state: string;
    user: {
      login: string;
    };
    [key: string]: any;
  };
}
