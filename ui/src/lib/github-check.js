export const githubCheck = () => {
  return window.location.hostname.includes('github.io') || window.location.hostname === 'localhost';
};
