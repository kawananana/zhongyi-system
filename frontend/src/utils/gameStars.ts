/** 按正确率换算 1～3 星 */
export function starsFromRatio(ratio: number): number {
  if (ratio >= 0.85) return 3
  if (ratio >= 0.55) return 2
  if (ratio > 0) return 1
  return 0
}

/** 认药配对：尝试次数越少星级越高 */
export function starsFromMatchAttempts(pairs: number, attempts: number): number {
  if (attempts <= pairs) return 3
  if (attempts <= pairs + 2) return 2
  return 1
}

/** 翻牌：步数越少星级越高 */
export function starsFromMemoryMoves(pairs: number, moves: number): number {
  if (moves <= pairs) return 3
  if (moves <= pairs + 3) return 2
  return 1
}
