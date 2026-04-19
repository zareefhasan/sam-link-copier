var SAM_PATTERN = /https:\/\/sam\.gov\/opp\/[a-zA-Z0-9]+\/view/i;

chrome.action.onClicked.addListener(function(tab) {
  if (!tab.url || tab.url.indexOf('ezgovopps.com') === -1) {
    showSplash(tab.id, 'error', 'Not an ezgovopps.com page');
    return;
  }

  chrome.scripting.executeScript(
    { target: { tabId: tab.id }, func: findSamUrl },
    function(results) {
      var url = results && results[0] && results[0].result;
      if (!url) {
        showSplash(tab.id, 'warn', 'No SAM link found on this page');
        return;
      }
      chrome.scripting.executeScript(
        { target: { tabId: tab.id }, func: writeClipboard, args: [url] },
        function() { showSplash(tab.id, 'success', 'SAM link copied!'); }
      );
    }
  );
});

function findSamUrl() {
  var pattern = /https:\/\/sam\.gov\/opp\/[a-zA-Z0-9]+\/view/i;
  var anchors = document.querySelectorAll('a[href]');
  for (var i = 0; i < anchors.length; i++) {
    if (pattern.test(anchors[i].href)) return anchors[i].href;
  }
  var hit = document.documentElement.innerHTML.match(pattern);
  if (hit) return hit[0];
  return null;
}

function writeClipboard(text) {
  navigator.clipboard.writeText(text);
}

function showSplash(tabId, type, message) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: renderSplash,
    args: [type, message]
  });
}

function renderSplash(type, message) {
  var existing = document.getElementById('__sam_splash__');
  if (existing) existing.remove();

  var colors = {
    success: { bg: '#0d2b1a', border: '#3fb950', icon: '\u2713' },
    error:   { bg: '#2b0d0d', border: '#f85149', icon: '\u2717' },
    warn:    { bg: '#2b220d', border: '#e3b341', icon: '?' }
  };
  var c = colors[type] || colors.error;

  var overlay = document.createElement('div');
  overlay.id = '__sam_splash__';
  overlay.setAttribute('style', [
    'all:initial',
    'position:fixed',
    'top:0',
    'left:0',
    'width:100%',
    'height:100%',
    'z-index:2147483647',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'pointer-events:none'
  ].join(';'));

  var card = document.createElement('div');
  card.setAttribute('style', [
    'background:' + c.bg,
    'border:2px solid ' + c.border,
    'border-radius:20px',
    'padding:36px 52px',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'gap:16px',
    'box-shadow:0 8px 40px rgba(0,0,0,0.6)',
    'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'
  ].join(';'));

  var icon = document.createElement('div');
  icon.setAttribute('style', [
    'width:68px',
    'height:68px',
    'border-radius:50%',
    'border:2.5px solid ' + c.border,
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'font-size:34px',
    'color:' + c.border
  ].join(';'));
  icon.textContent = c.icon;

  var label = document.createElement('div');
  label.setAttribute('style', [
    'color:#e6edf3',
    'font-size:15px',
    'font-weight:600',
    'white-space:nowrap'
  ].join(';'));
  label.textContent = message;

  card.appendChild(icon);
  card.appendChild(label);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  setTimeout(function() {
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    setTimeout(function() { overlay.remove(); }, 320);
  }, 1800);
}
