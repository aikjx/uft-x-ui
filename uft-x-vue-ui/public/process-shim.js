// Global process shim for Babel in browser environment
(function() {
  if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
    window.process = {
      env: {
        NODE_ENV: 'development'
      },
      version: '16.0.0',
      platform: 'browser',
      arch: 'browser',
      nextTick: function(fn) {
        return setTimeout(fn, 0);
      },
      hrtime: function(start) {
        var now = Date.now();
        var seconds = Math.floor(now / 1000);
        var nanoseconds = (now % 1000) * 1000000;
        if (start) {
          return [seconds - start[0], nanoseconds - start[1]];
        }
        return [seconds, nanoseconds];
      }
    };
  }
  
  if (typeof global !== 'undefined' && typeof global.process === 'undefined') {
    global.process = window.process || {};
  }
})();