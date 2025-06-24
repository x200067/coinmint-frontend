// main.js

// 用于确认脚本已加载
console.log('✅ main.js 已加载');

// 直接写死你的 GraphQL 接口（注意要用 https）  
const GRAPHQL_ENDPOINT = 'https://api.coinmint.net/graphql';

/**
 * 通用的 GraphQL 请求函数
 */
async function graphqlRequest(query, variables = {}) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    console.error('🔥 GraphQL errors:', json.errors);
    throw new Error('GraphQL 查询失败，请检查控制台错误');
  }
  return json.data;
}

/**
 * 拉取文章列表
 */
async function fetchPosts() {
  const query = `
    query {
      posts(first: 10) {
        nodes {
          title
          slug
        }
      }
    }
  `;
  const data = await graphqlRequest(query);
  return data.posts.nodes;
}

/**
 * 根据 slug 拉取单篇文章详情
 */
async function fetchPostBySlug(slug) {
  const query = `
    query($slug: String!) {
      postBy(slug: $slug) {
        title
        content
      }
    }
  `;
  const data = await graphqlRequest(query, { slug });
  return data.postBy;
}

/**
 * 渲染文章列表到 #post-list
 */
async function renderPostList() {
  const listEl = document.getElementById('post-list');
  listEl.innerHTML = '';
  const posts = await fetchPosts();
  posts.forEach(post => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${post.slug}`;
    a.textContent = post.title;
    li.appendChild(a);
    listEl.appendChild(li);
  });
  // 滚到博客区域
  document.getElementById('blog').scrollIntoView();
}

/**
 * 渲染单篇文章详情到 #post-detail
 */
async function renderPostDetail(slug) {
  const titleEl = document.getElementById('post-title');
  const contentEl = document.getElementById('post-content');
  const post = await fetchPostBySlug(slug);
  titleEl.innerText = post.title;
  contentEl.innerHTML = post.content;
  document.getElementById('post-detail').style.display = '';
}

/**
 * 路由控制：根据 location.hash 切换列表/详情
 */
function handleRouting() {
  const slug = location.hash.slice(1);
  const listView = document.getElementById('post-list');
  const detailView = document.getElementById('post-detail');
  if (slug) {
    listView.style.display = 'none';
    detailView.style.display = '';
    renderPostDetail(slug);
  } else {
    detailView.style.display = 'none';
    listView.style.display = '';
    renderPostList();
  }
}

/**
 * 入口：页面加载后绑定事件并触发一次路由
 */
document.addEventListener('DOMContentLoaded', () => {
  // “← 返回列表”按钮
  document.getElementById('back-button')
          .addEventListener('click', () => { location.hash = ''; });
  // 监听 hash 变化
  window.addEventListener('hashchange', handleRouting);
  // 初始路由
  handleRouting();
});
