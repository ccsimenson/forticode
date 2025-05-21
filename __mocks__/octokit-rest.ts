// Mock implementation of @octokit/rest
import { vi } from 'vitest';

export const Octokit = class MockOctokit {
    static defaults = vi.fn().mockReturnThis();
    auth = vi.fn();
    repos = {
      getContent: vi.fn().mockImplementation(({ path }) => {
        // For the error test case
        if (path === 'error.txt') {
          return Promise.reject(new Error('File not found'));
        }
        
        // For directory listing
        if (path === '') {
          return Promise.resolve({
            data: [{
              name: 'test.txt',
              path: 'test.txt',
              type: 'file',
              sha: 'test-sha',
              size: 11,
              url: 'https://api.github.com/repos/owner/repo/contents/test.txt',
              download_url: 'https://raw.githubusercontent.com/owner/repo/main/test.txt',
              _links: {
                self: 'https://api.github.com/repos/owner/repo/contents/test.txt',
                git: 'https://api.github.com/repos/owner/repo/git/blobs/test-sha',
                html: 'https://github.com/owner/repo/blob/main/test.txt'
              }
            }]
          });
        }
  
        // For file content
        return Promise.resolve({
          data: {
            content: Buffer.from('test content').toString('base64'),
            type: 'file',
            name: 'test.txt',
            path: 'test.txt',
            sha: 'test-sha',
            size: 11,
            url: 'https://api.github.com/repos/owner/repo/contents/test.txt',
            download_url: 'https://raw.githubusercontent.com/owner/repo/main/test.txt',
            _links: {
              self: 'https://api.github.com/repos/owner/repo/contents/test.txt',
              git: 'https://api.github.com/repos/owner/repo/git/blobs/test-sha',
              html: 'https://github.com/owner/repo/blob/main/test.txt'
            }
          }
        });
      }),
    };
    paginate = vi.fn();
    request = vi.fn();
    graphql = vi.fn();
    log = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    hook = {
      wrap: vi.fn((_event: string, callback: () => any) => callback()),
      before: vi.fn(),
      after: vi.fn(),
      error: vi.fn()
    };
  
    constructor(options: any) {
      console.log('MockOctokit created with options:', options);
    }
  };
  
  export default { Octokit };