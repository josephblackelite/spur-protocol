(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function highlightJson(obj) {
    const json = JSON.stringify(obj, null, 2);
    return escapeHtml(json)
      .replace(/"([^"]+)":/g, '<span class="tok-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="tok-str">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="tok-bool">$1</span>');
  }

  function renderList(objects, selectedId) {
    const tiers = [
      { key: 'core', label: 'Core pipeline' },
      { key: 'supporting', label: 'Supporting' },
    ];

    return tiers.map((tier) => {
      const items = objects.filter((o) => o.tier === tier.key);
      const cards = items.map((o) => `
        <button class="explorer-card ${o.id === selectedId ? 'is-selected' : ''}" data-id="${o.id}" role="tab" aria-selected="${o.id === selectedId}">
          <span class="explorer-card-title">${escapeHtml(o.title)}</span>
          <span class="explorer-card-tagline">${escapeHtml(o.tagline)}</span>
        </button>
      `).join('');
      return `<div class="explorer-tier"><span class="explorer-tier-label">${tier.label}</span>${cards}</div>`;
    }).join('');
  }

  function renderDetail(obj) {
    const fieldRows = obj.fields.map((f) => `
      <tr>
        <td><code>${escapeHtml(f.name)}</code></td>
        <td><span class="field-type">${escapeHtml(f.type)}</span></td>
        <td>${f.required ? '<span class="badge required">required</span>' : '<span class="badge optional">optional</span>'}</td>
      </tr>
    `).join('');

    return `
      <div class="detail-head">
        <span class="detail-tier tier-${obj.tier}">${obj.tier === 'core' ? 'Core pipeline object' : 'Supporting object'}</span>
        <h3>${escapeHtml(obj.title)}</h3>
        <p class="subtle">${escapeHtml(obj.description)}</p>
      </div>

      <div class="detail-fields">
        <h4>Fields</h4>
        <table class="field-table">
          <thead><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead>
          <tbody>${fieldRows}</tbody>
        </table>
      </div>

      <div class="detail-example">
        <h4>Real example &mdash; from <code>examples/</code></h4>
        <div class="code-panel">
          <div class="code-panel-head"><span class="code-tag">JSON</span><span class="code-filename">${escapeHtml(obj.id)}</span></div>
          <pre class="code-block"><code>${highlightJson(obj.example)}</code></pre>
        </div>
      </div>
    `;
  }

  async function init() {
    const listEl = document.getElementById('explorer-list');
    const detailEl = document.getElementById('explorer-detail');
    if (!listEl || !detailEl) return;

    let objects;
    try {
      const res = await fetch('/data/objects.json');
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      objects = data.objects;
    } catch (err) {
      listEl.innerHTML = '<p class="subtle">Could not load protocol data.</p>';
      console.error('Failed to load /data/objects.json', err);
      return;
    }

    let selectedId = objects[0].id;

    function render() {
      listEl.innerHTML = renderList(objects, selectedId);
      const selected = objects.find((o) => o.id === selectedId);
      detailEl.innerHTML = renderDetail(selected);

      listEl.querySelectorAll('.explorer-card').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedId = btn.dataset.id;
          render();
        });
      });
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
