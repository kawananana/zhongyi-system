export interface HomeCarouselSlide {
  id: string
  title: string
  subtitle: string
  image: string
}

/** 首页 3D 轮播：五脏喜好科普图 */
export const HOME_CAROUSEL_SLIDES: HomeCarouselSlide[] = [
  {
    id: 'liver',
    title: '肝',
    subtitle: '喜酸、青色食物 · 主筋 · 开窍于目',
    image: '/images/home/carousel/organ-liver.png',
  },
  {
    id: 'heart',
    title: '心',
    subtitle: '喜苦、红色食物 · 主血 · 开窍于舌',
    image: '/images/home/carousel/organ-heart.png',
  },
  {
    id: 'spleen',
    title: '脾',
    subtitle: '喜甘、黄色食物 · 主肌肉 · 开窍于口',
    image: '/images/home/carousel/organ-spleen.png',
  },
  {
    id: 'lung',
    title: '肺',
    subtitle: '喜辛、白色食物 · 主皮毛 · 开窍于鼻',
    image: '/images/home/carousel/organ-lung.png',
  },
  {
    id: 'kidney',
    title: '肾',
    subtitle: '喜咸、黑色食物 · 主骨髓 · 开窍于耳',
    image: '/images/home/carousel/organ-kidney.png',
  },
]
