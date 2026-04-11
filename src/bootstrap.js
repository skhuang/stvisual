const fileProtocol = window.location.protocol === 'file:';

if (fileProtocol) {
  const script = document.createElement('script');
  script.src = './src/standalone.js';
  script.defer = true;
  document.head.appendChild(script);
} else {
  import('./main.js');
}
