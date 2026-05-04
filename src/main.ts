import { createApp } from 'vue'
import App from './App.vue'
import { ofetch } from 'ofetch'

import './styles.css'

console.log(
  'good'
)

createApp(App).mount('#app')

function testErawar() {
  ofetch('/api')
}

setInterval(() => testErawar(), 3500)
    // ===== THEME =====
    // Restore saved preference
    const saved = localStorage.getItem('verity-theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    function toggleTheme() {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('verity-theme', 'light');
      } else {
        html.classList.remove('light');
        html.classList.add('dark');
        localStorage.setItem('verity-theme', 'dark');
      }
    }
    window.toggleTheme = toggleTheme

    // ===== PAGE ROUTING =====
    function showPage(name) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + name).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.getElementById('readProgress').style.width = '0%';
    }
    window.showPage = showPage

    // ===== FILTER TABS =====
    function setFilter(name, el) {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');
    }
    window.setFilter = setFilter

    // ===== LIKE =====
    function toggleLike(btn) {
      btn.classList.toggle('liked');
      const countEl = btn.querySelector('.like-count');
      const count = parseInt(countEl.textContent);
      countEl.textContent = btn.classList.contains('liked') ? count + 1 : count - 1;
    }
    window.toggleLike = toggleLike

    // ===== FOLLOW =====
    function toggleFollow(btn) {
      if (btn.classList.contains('not-following')) {
        btn.classList.replace('not-following', 'following');
        btn.textContent = 'Following';
      } else {
        btn.classList.replace('following', 'not-following');
        btn.textContent = 'Follow';
      }
    }
    window.toggleFollow = 

    // ===== PROFILE TABS =====
    function setProfileTab(btn) {
      btn.closest('.glass').querySelectorAll('button').forEach(b => {
        b.style.background = '';
        b.classList.remove('t-heading');
        b.classList.add('t-muted');
      });
      btn.style.background = 'var(--border-h)';
      btn.classList.remove('t-muted');
      btn.classList.add('t-heading');
    }
    window.setProfileTab = setProfileTab

    // ===== READ PROGRESS =====
    window.addEventListener('scroll', () => {
      if (!document.getElementById('page-post').classList.contains('active')) return;
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      document.getElementById('readProgress').style.width = Math.min(progress, 100) + '%';
    });