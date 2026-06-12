// content.js
(function() {
  if (window.__BILI_RSS_EXT_INJECTED__) return;
  window.__BILI_RSS_EXT_INJECTED__ = true;

  const pathParts = window.location.pathname.split('/');
  const uid = pathParts[1];
  if (!uid || isNaN(uid)) return;

  // 负责注入按钮，并依据订阅状态设置初始样式
  function injectButton(name, isSubscribed) {
    if (document.getElementById('bili-rss-sub-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'bili-rss-sub-btn';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      padding: 10px 16px;
      background: #fb7299;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: opacity 0.3s;
    `;

    // 根据是否已订阅设置初始状态
    let subscribed = isSubscribed;
    if (subscribed) {
      btn.textContent = '✅ 已订阅';
      btn.style.opacity = '0.8';
      btn.style.cursor = 'default';
    } else {
      btn.textContent = '🔔 RSS 订阅';
    }

    btn.onclick = () => {
      if (subscribed) return; // 已订阅就不再响应
      chrome.runtime.sendMessage({
        action: 'subscribe',
        uid: uid,
        name: name
      }, (response) => {
        if (response && response.success) {
          subscribed = true;
          btn.textContent = '✅ 已订阅';
          btn.style.opacity = '0.8';
          btn.style.cursor = 'default';
        } else {
          alert('订阅失败，请刷新重试');
        }
      });
    };

    document.body.appendChild(btn);
    console.log('按钮注入成功，UP主：', name, '状态：', subscribed ? '已订阅' : '未订阅');
  }

  // 名字提取函数（保持不变）
  function tryGetName() {
    const selectors = ['.nickname', '#h-name', '.h-name', '.username', '#name', 'h1 span'];
    for (let sel of selectors) {
      const el = document.querySelector(sel);
      const text = el?.textContent.trim();
      if (text) return text;
    }
    const titleMatch = document.title.match(/^(.+?)的个人空间/);
    if (titleMatch && titleMatch[1]) return titleMatch[1].trim();
    return null;
  }

  // 启动核心流程：先查是否已订阅，再决定如何注入
  function start() {
    // 从后台获取当前订阅列表，检查 uid 是否存在
    chrome.runtime.sendMessage({ action: 'getSubscriptions' }, (list) => {
      const isSubscribed = list ? list.some(item => item.uid === uid) : false;

      // 获取名字
      let name = tryGetName();

      if (name) {
        // 名字已就绪，直接注入
        injectButton(name, isSubscribed);
      } else {
        // 名字还没渲染，启动观察器等待
        console.log('名字尚未渲染，等待中...');
        const observer = new MutationObserver(() => {
          name = tryGetName();
          if (name) {
            injectButton(name, isSubscribed);
            observer.disconnect();
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
        // 超时保护
        setTimeout(() => {
          if (!document.getElementById('bili-rss-sub-btn')) {
            observer.disconnect();
            injectButton('UP主 ' + uid, isSubscribed);
          }
        }, 10000);
      }
    });
  }

  start();
})();