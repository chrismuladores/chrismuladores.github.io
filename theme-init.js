(() => {
  const saved = localStorage.getItem('chrismuladores-theme');
  const theme = saved === 'dark' || saved === 'light' ? saved : 'light';
  document.documentElement.dataset.theme = theme;
})();
