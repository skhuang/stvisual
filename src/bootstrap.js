const fileProtocol = window.location.protocol === 'file:';

if (fileProtocol) {
  if (!window.__STVISUAL_FILE_BOOTSTRAPPED__) {
    window.__STVISUAL_FILE_BOOTSTRAPPED__ = true;
    const script = document.createElement('script');
    script.src = './src/standalone.js';
    script.defer = true;
    document.head.appendChild(script);
  }
} else {
  import('./main.js');
}
