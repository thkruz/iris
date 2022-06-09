export const githubCheck = () => {
  return window.location.hostname.includes('github') || window.location.hostname === 'localhost';
};
