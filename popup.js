// popup.js

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 加载并显示订阅列表
  loadSubscriptionList();

  // 绑定导出 OPML 按钮
  document.getElementById('exportBtn').addEventListener('click', exportOPML);

  // 如果有内置阅读器页面，可以显示按钮并绑定点击
  // 目前先隐藏，等我们做好 reader.html 后再启用
});

// 从后台获取订阅列表并渲染
function loadSubscriptionList() {
  chrome.runtime.sendMessage({ action: 'getSubscriptions' }, (list) => {
    if (!list) list = [];
    renderList(list);
  });
}

// 渲染列表到页面
function renderList(list) {
  const container = document.getElementById('list');
  const countEl = document.getElementById('count');
  countEl.textContent = `${list.length}/∞`;

  if (list.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:#999;">还没有订阅任何UP主。<br>去 <strong>space.bilibili.com/任意UID</strong> 页面，点击右下角按钮添加。</div>';
    return;
  }

  let html = '';
  list.forEach(item => {
    html += `
      <div class="item" data-uid="${item.uid}">
        <div class="info">
          <span class="name">${escapeHTML(item.name)}</span>
          <span class="uid">UID: ${item.uid}</span>
        </div>
        <button class="delete-btn">✕</button>
      </div>
    `;
  });
  container.innerHTML = html;

  // 给每个删除按钮绑定事件
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.parentElement.getAttribute('data-uid');
      deleteSubscription(uid);
    });
  });
}

// 删除订阅
function deleteSubscription(uid) {
  if (confirm('确定要删除这个订阅吗？')) {
    chrome.runtime.sendMessage({ action: 'unsubscribe', uid: uid }, (response) => {
      if (response.success) {
        loadSubscriptionList(); // 重新加载列表
      }
    });
  }
}

// 导出 OPML 文件
function exportOPML() {
  chrome.runtime.sendMessage({ action: 'getSubscriptions' }, (list) => {
    if (!list || list.length === 0) {
      alert('列表为空，请先添加订阅');
      return;
    }
    const opmlString = generateOPML(list);
    downloadOPMLFile(opmlString);
  });
}

// 生成 OPML 字符串
function generateOPML(subscriptions) {
  // 这里使用公共 RSSHub 实例，如果你自己搭建了，可以改为你的域名
  const rssHubBase = 'https://rsshub.app';
  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>B站虚拟关注</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>`;

  subscriptions.forEach(sub => {
    const feedUrl = `${rssHubBase}/bilibili/user/dynamic/${sub.uid}`;
    opml += `
    <outline text="${escapeXML(sub.name)}" title="${escapeXML(sub.name)}" type="rss" xmlUrl="${feedUrl}" />`;
  });

  opml += `
  </body>
</opml>`;
  return opml;
}

// 下载 OPML 文件
function downloadOPMLFile(content) {
  const blob = new Blob([content], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: 'bilibili_subscriptions.opml',
    saveAs: true // 弹出保存对话框
  }, () => {
    // 下载开始后回收 URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// 辅助函数：转义 HTML 防止 XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 辅助函数：转义 XML 特殊字符
function escapeXML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
}