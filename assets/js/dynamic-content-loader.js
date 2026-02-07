/**
 * 动态内容加载器 - 日时区兼容版
 */

const GITHUB_CDN = "https://cdn.jsdelivr.net/gh/";

function convertToCDN(url) {
    if (url.includes('raw.githubusercontent.com')) {
        return url.replace('https://raw.githubusercontent.com/', GITHUB_CDN).replace(/\/([^\/]+)\/([^\/]+)\/(.+)/, '/$1/$2@$3');
    }
    return url;
}

function toggleCollapse(btn) {
    const container = btn.closest('.dynamic-container');
    const contentBody = container.querySelector('.dynamic-content-body');
    const isCollapsed = contentBody.classList.toggle('collapsed');
    btn.innerHTML = isCollapsed ? '🔽 展开更多内容' : '🔼 收起内容';
}

function checkAndApplyCollapse(id) {
    const container = document.getElementById(id);
    if (!container) return;
    const contentArea = container.querySelector('.dynamic-content-body');
    const currentHeight = contentArea.scrollHeight;

    if (currentHeight > 351) {
        contentArea.classList.add('collapsed');
        if (!container.querySelector('.toggle-btn')) {
            const btn = document.createElement('button');
            btn.className = 'toggle-btn';
            btn.innerHTML = '🔽 展开更多内容';
            btn.onclick = function () { toggleCollapse(this); };
            container.appendChild(btn);
        }
    } else if (currentHeight > 0) {
        contentArea.classList.remove('collapsed');
        const oldBtn = container.querySelector('.toggle-btn');
        if (oldBtn) oldBtn.remove();
    }
}

async function silentUpdate(id, url, type, count = 5) {
    const container = document.getElementById(id);
    if (!container) return;
    const contentArea = container.querySelector('.dynamic-content-body');
    const statusText = container.querySelector('.load-status');

    checkAndApplyCollapse(id);

    try {
        if (type === 'md') {
            const fetchUrl = convertToCDN(url);
            const response = await fetch(fetchUrl, { cache: 'no-cache' });
            if (!response.ok) throw new Error("Fetch MD Failed");
            const text = await response.text();
            contentArea.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : simpleMarkdownToHtml(text);
        } else {
            let data = null;
            // 线路 1
            try {
                const r1 = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&_t=${Date.now()}`);
                const j1 = await r1.json();
                if (j1.status === 'ok') data = j1;
            } catch (e) { }

            // 线路 2
            if (!data) {
                try {
                    const r2 = await fetch(`https://api.feed2json.org/convert?url=${encodeURIComponent(url)}`);
                    const j2 = await r2.json();
                    if (j2.items) data = { items: j2.items };
                } catch (e) { }
            }

            if (!data) throw new Error("RSS Failed");

            let items = data.items;

            // 每日动态的特殊逻辑
            if (id.includes('daily')) {
                const today = new Date();
                const todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

                // 过滤今天的内容
                let dailyItems = items.filter(i => {
                    const d = new Date(i.pubDate || i.date_published || "");
                    const dStr = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
                    return dStr === todayStr;
                });

                // 如果今天没更新，则显示最近的 3 条（防止显示为空白失败）
                if (dailyItems.length === 0) {
                    items = items.slice(0, 3);
                    if (statusText) statusText.innerText = "📅 今日暂无更新，显示近期资讯";
                } else {
                    items = dailyItems;
                    if (statusText) statusText.innerText = `✅ 已同步今日动态 (${new Date().toLocaleTimeString()})`;
                }
            } else {
                items = items.slice(0, count);
                if (statusText) statusText.innerText = `✅ 已同步最新 (${new Date().toLocaleTimeString()})`;
            }

            let html = '<ul style="list-style-type: disc; padding-left: 20px;">';
            items.forEach(item => {
                const title = item.title || "Untitled";
                const link = item.link || item.url || "#";
                html += `<li style="margin-bottom:10px;"><a href="${link}" target="_blank" style="font-weight:bold;color:#0056b3;">${title}</a></li>`;
            });
            html += '</ul>';
            contentArea.innerHTML = html;
        }

        setTimeout(() => checkAndApplyCollapse(id), 300);

    } catch (e) {
        console.warn("[动态加载] 失败:", e);
        if (statusText) statusText.innerText = "⚠️ 自动同步暂不可用";
        checkAndApplyCollapse(id);
    }
}

function simpleMarkdownToHtml(markdown) {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

const style = document.createElement('style');
style.textContent = `
    .dynamic-container { border: 1px solid #e1e4e8; border-radius: 8px; margin: 20px 0; padding: 15px; background: #fafafa; }
    .dynamic-content-body { overflow: hidden; transition: max-height 0.3s ease-in-out; position: relative; max-height: 2000px; }
    .dynamic-content-body.collapsed { max-height: 280px !important; }
    .dynamic-content-body.collapsed::after {
        content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 50px;
        background: linear-gradient(transparent, #fafafa); pointer-events: none;
    }
    .toggle-btn {
        display: block; width: 100%; padding: 10px; margin-top: 10px;
        background: #f1f3f5; border: 1px solid #ddd; border-radius: 6px;
        color: #0056b3; font-size: 0.9em; cursor: pointer; text-align: center;
    }
`;
document.head.appendChild(style);
