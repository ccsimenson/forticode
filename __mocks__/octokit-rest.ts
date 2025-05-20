// Mock implementation of @octokit/rest
export const Octokit = class MockOctokit {
    static defaults = jest.fn().mockReturnThis();
    auth = jest.fn();
    repos = {
      getContent: jest.fn().mockImplementation(({ path }) => {
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
    paginate = jest.fn();
    request = jest.fn();
    graphql = jest.fn();
    log = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    hook = {
      wrap: jest.fn((_event: string, callback: () => any) => callback()),
      before: jest.fn(),
      after: jest.fn(),
      error: jest.fn()
    };
  
    constructor(options: any) {
      console.log('MockOctokit created with options:', options);
    }
  };
  
  export default { Octokit };