export const githubCheck = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === 'www.github.com';
};
