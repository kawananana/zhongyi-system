/** el-image 加载失败占位（内联 SVG，无外链依赖） */
export const IMAGE_ERROR_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<rect fill="#f2f3f5" width="120" height="120"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#909399" font-size="12">暂无图片</text>' +
      '</svg>',
  )
