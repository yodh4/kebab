import '@testing-library/jest-dom';

// Mock environment variables for import.meta.env
// This is needed because Vitest doesn't automatically provide these in tests
if (typeof globalThis !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).import = {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:4000',
      },
    },
  };
}

// Mock HTMLDialogElement methods (not supported in jsdom)
// The <dialog> element's showModal() and close() are browser APIs that jsdom doesn't implement
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};

HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
