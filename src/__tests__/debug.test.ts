// Debug test to check if we can import and test a simple class

// A simple class to test
class TestClass {
  constructor(public name: string) {}
  
  greet() {
    return `Hello, ${this.name}!`;
  }
}

describe('Debug Test', () => {
  it('should create an instance of TestClass', () => {
    console.log('Starting debug test...');
    const instance = new TestClass('World');
    console.log('Instance created');
    expect(instance.greet()).toBe('Hello, World!');
    console.log('Test completed');
  });
});
