<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <svg
    class="cat-svg"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- 养生茶疗 -->
    <g v-if="name === 'tea_therapy'">
      <ellipse cx="24" cy="38" rx="14" ry="3" fill="#81c784" opacity="0.35" />
      <path d="M14 20h20l-2 14H16L14 20z" fill="#fff" stroke="#5d8a5e" stroke-width="1.2" />
      <path d="M16 20c0-6 3.5-10 8-10s8 4 8 10" stroke="#5d8a5e" stroke-width="1.5" fill="none" />
      <path d="M30 18c2 0 4 1.5 4 4v2h-4" stroke="#8bc34a" stroke-width="1.2" fill="none" />
      <circle cx="32" cy="14" r="3" fill="#aed581" />
      <circle cx="36" cy="18" r="2.5" fill="#c5e1a5" />
    </g>

    <!-- 艾灸艾柱 -->
    <g v-else-if="name === 'moxibustion'">
      <rect x="18" y="10" width="5" height="22" rx="2" fill="#d7a86e" />
      <rect x="25" y="14" width="5" height="18" rx="2" fill="#c4956a" />
      <path d="M20 8c0-2 1.5-3 2.5-3s2.5 1 2.5 3" fill="#8d6e4a" />
      <path d="M27.5 12c0-2 1.5-3 2.5-3s2.5 1 2.5 3" fill="#8d6e4a" />
      <path d="M16 6c2-3 5-5 8-5s6 2 8 5" stroke="#bdbdbd" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
      <path d="M20 4c1.5-2 4-3 6-3" stroke="#e0e0e0" stroke-width="1.2" stroke-linecap="round" opacity="0.5" />
    </g>

    <!-- 中医护肤 -->
    <g v-else-if="name === 'skincare'">
      <rect x="14" y="16" width="10" height="22" rx="2" fill="#f8bbd0" stroke="#e91e8c" stroke-width="1" />
      <rect x="16" y="12" width="6" height="6" rx="1" fill="#f48fb1" />
      <rect x="26" y="20" width="10" height="16" rx="3" fill="#fff" stroke="#ce93d8" stroke-width="1.2" />
      <ellipse cx="31" cy="28" rx="3" ry="4" fill="#f3e5f5" />
      <circle cx="31" cy="26" r="1.5" fill="#ab47bc" opacity="0.5" />
    </g>

    <!-- 中医书籍 -->
    <g v-else-if="name === 'books'">
      <rect x="12" y="14" width="14" height="20" rx="1" fill="#5c6bc0" />
      <rect x="14" y="12" width="14" height="20" rx="1" fill="#7986cb" />
      <rect x="16" y="10" width="14" height="20" rx="1" fill="#9fa8da" stroke="#3949ab" stroke-width="1" />
      <line x1="20" y1="14" x2="26" y2="14" stroke="#3949ab" stroke-width="1" opacity="0.5" />
      <line x1="20" y1="18" x2="26" y2="18" stroke="#3949ab" stroke-width="1" opacity="0.5" />
      <line x1="20" y1="22" x2="24" y2="22" stroke="#3949ab" stroke-width="1" opacity="0.5" />
    </g>

    <!-- 药食同源 -->
    <g v-else-if="name === 'food_medicine'">
      <ellipse cx="24" cy="36" rx="16" ry="4" fill="#ce93d8" opacity="0.3" />
      <path d="M10 22c0-8 6-14 14-14s14 6 14 14v6H10v-6z" fill="#fff" stroke="#8e24aa" stroke-width="1.2" />
      <circle cx="18" cy="24" r="3" fill="#e1bee7" />
      <circle cx="26" cy="22" r="2.5" fill="#f8bbd0" />
      <circle cx="30" cy="26" r="2" fill="#c5e1a5" />
      <path d="M20 18v-4M24 16v-3M28 18v-4" stroke="#7b1fa2" stroke-width="1.2" stroke-linecap="round" />
    </g>

    <!-- 膏方系列 -->
    <g v-else-if="name === 'herbal_paste'">
      <path d="M16 14h16l2 4v18c0 2-1.5 4-4 4H18c-2.5 0-4-2-4-4V14z" fill="#fff8e1" stroke="#f9a825" stroke-width="1.2" />
      <rect x="14" y="10" width="20" height="6" rx="2" fill="#ffca28" stroke="#f57f17" stroke-width="1" />
      <rect x="18" y="22" width="12" height="8" rx="1" fill="#ffe082" opacity="0.8" />
      <text x="24" y="28" text-anchor="middle" fill="#e65100" font-size="5" font-weight="bold">膏</text>
    </g>

    <!-- 理疗工具 -->
    <g v-else-if="name === 'physio_tools'">
      <path
        d="M14 28c4-8 10-12 16-14 2 6-2 12-8 16-4 2-8 0-8-2z"
        fill="#ffcc80"
        stroke="#ef6c00"
        stroke-width="1"
      />
      <ellipse cx="32" cy="16" rx="6" ry="8" fill="#ffe0b2" stroke="#fb8c00" stroke-width="1" />
      <path d="M28 20l8-4" stroke="#e65100" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- 养生足疗 -->
    <g v-else-if="name === 'foot_therapy'">
      <path d="M10 30h28c2 0 4 2 4 4v4H10v-8z" fill="#b3e5fc" stroke="#0288d1" stroke-width="1.2" />
      <path
        d="M22 18c-2 0-4 2-4 5v7h8v-7c0-3-2-5-4-5zm0 0c2-4 6-4 8 0"
        fill="#ffccbc"
        stroke="#e64a19"
        stroke-width="1"
      />
      <circle cx="16" cy="32" r="2" fill="#81d4fa" opacity="0.6" />
      <circle cx="32" cy="34" r="1.5" fill="#4fc3f7" opacity="0.5" />
    </g>

    <!-- 精品礼盒 -->
    <g v-else-if="name === 'gift_box'">
      <rect x="12" y="18" width="24" height="18" rx="2" fill="#ef9a9a" stroke="#c62828" stroke-width="1" />
      <rect x="10" y="14" width="28" height="6" rx="1" fill="#e57373" stroke="#c62828" stroke-width="1" />
      <rect x="22" y="14" width="4" height="22" fill="#ffcdd2" />
      <path d="M12 14h24" stroke="#b71c1c" stroke-width="2" />
      <path d="M18 14c3-4 9-4 12 0" stroke="#ffab91" stroke-width="2" fill="none" />
    </g>

    <!-- 滋补饮片 -->
    <g v-else-if="name === 'decoction'">
      <path d="M18 12h12l3 6v16c0 2-1 3-3 3H18c-2 0-3-1-3-3V12z" fill="#d7ccc8" stroke="#6d4c41" stroke-width="1.2" />
      <ellipse cx="24" cy="12" rx="8" ry="3" fill="#a1887f" />
      <ellipse cx="20" cy="22" rx="3" ry="1.5" fill="#8d6e63" transform="rotate(-20 20 22)" />
      <ellipse cx="26" cy="24" rx="3" ry="1.5" fill="#a1887f" transform="rotate(15 26 24)" />
      <ellipse cx="24" cy="28" rx="2.5" ry="1.2" fill="#6d4c41" />
      <path d="M14 10c2-2 6-3 10-3s8 1 10 3" stroke="#4e342e" stroke-width="1" fill="none" opacity="0.4" />
    </g>

    <!-- fallback -->
    <g v-else>
      <circle cx="24" cy="24" r="14" fill="#e8f5e9" stroke="#1a5f3f" stroke-width="1.5" />
      <path d="M24 16v16M16 24h16" stroke="#1a5f3f" stroke-width="2" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.cat-svg {
  width: 38px;
  height: 38px;
  display: block;
}

@media (max-width: 900px) {
  .cat-svg {
    width: 30px;
    height: 30px;
  }
}
</style>
