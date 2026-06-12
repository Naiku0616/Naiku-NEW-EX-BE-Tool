// background.js

// 当扩展安装或更新时，初始化存储
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('subscriptions', (data) => {
    if (!data.subscriptions) {
      // 如果没有数据，设置一个空数组
      chrome.storage.local.set({ subscriptions: [] });
      console.log('初始化虚拟关注列表');
    }
  });
});

// 监听来自其他脚本（content.js 或 popup.js）的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理订阅请求
  if (request.action === 'subscribe') {
    addSubscription(request.uid, request.name, sendResponse);
    return true; // 必须返回 true 表示异步响应
  }

  // 处理获取列表请求
  if (request.action === 'getSubscriptions') {
    chrome.storage.local.get('subscriptions', (data) => {
      sendResponse(data.subscriptions || []);
    });
    return true;
  }

  // 可以在这里添加其他 action，比如删除订阅
  if (request.action === 'unsubscribe') {
    removeSubscription(request.uid, sendResponse);
    return true;
  }
});

// 添加订阅函数
function addSubscription(uid, name, sendResponse) {
  chrome.storage.local.get('subscriptions', (data) => {
    const list = data.subscriptions || [];
    // 检查是否已存在
    if (list.some(item => item.uid === uid)) {
      sendResponse({ success: true, message: '已经订阅过了' });
      return;
    }
    // 添加到列表
    list.push({
      uid: uid,
      name: name,
      addedAt: Date.now()
    });
    // 保存
    chrome.storage.local.set({ subscriptions: list }, () => {
      console.log(`订阅成功: ${name} (${uid})`);
      sendResponse({ success: true });
    });
  });
}

// 删除订阅函数（供后续扩展用）
function removeSubscription(uid, sendResponse) {
  chrome.storage.local.get('subscriptions', (data) => {
    let list = data.subscriptions || [];
    list = list.filter(item => item.uid !== uid);
    chrome.storage.local.set({ subscriptions: list }, () => {
      sendResponse({ success: true });
    });
  });
}