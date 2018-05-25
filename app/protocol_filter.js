const path = require('path');

const FILE_SCHEME = /^file:\/\//;
const WINDOWS_PREFIX = /^\/[A-Z]:/;
function _urlToPath(targetUrl) {
  let withoutScheme = targetUrl.replace(FILE_SCHEME, '');
  if (WINDOWS_PREFIX.test(withoutScheme)) {
    withoutScheme = withoutScheme.slice(1);
  }

  const withoutQuerystring = withoutScheme.replace(/\?.*$/, '');
  const withoutHash = withoutQuerystring.replace(/#.*$/, '');

  return decodeURIComponent(withoutHash);
}

function _createFileHandler({ userDataPath, installPath }) {
  return (request, callback) => {
    // normalize() is primarily useful here for switching / to \ on windows
    const target = path.normalize(_urlToPath(request.url));

    if (!path.isAbsolute(target)) {
      return callback();
    }

    if (!target.startsWith(userDataPath) && !target.startsWith(installPath)) {
      console.log(`Warning: denying request to ${target}`);
      return callback();
    }

    return callback({
      path: target,
    });
  };
}

function installFileHandler({ protocol, userDataPath, installPath }) {
  protocol.interceptFileProtocol(
    'file',
    _createFileHandler({ userDataPath, installPath })
  );
}

// Turn off browser URI scheme since we do all network requests via Node.js
function _disabledHandler(request, callback) {
  return callback();
}

function installWebHandler({ protocol }) {
  protocol.interceptFileProtocol('about', _disabledHandler);
  protocol.interceptFileProtocol('content', _disabledHandler);
  protocol.interceptFileProtocol('chrome', _disabledHandler);
  protocol.interceptFileProtocol('cid', _disabledHandler);
  protocol.interceptFileProtocol('data', _disabledHandler);
  protocol.interceptFileProtocol('filesystem', _disabledHandler);
  protocol.interceptFileProtocol('ftp', _disabledHandler);
  protocol.interceptFileProtocol('gopher', _disabledHandler);
  protocol.interceptFileProtocol('http', _disabledHandler);
  protocol.interceptFileProtocol('https', _disabledHandler);
  protocol.interceptFileProtocol('javascript', _disabledHandler);
  protocol.interceptFileProtocol('mailto', _disabledHandler);
  protocol.interceptFileProtocol('ws', _disabledHandler);
  protocol.interceptFileProtocol('wss', _disabledHandler);
}

module.exports = {
  _urlToPath,
  installFileHandler,
  installWebHandler,
};
