/** 各部位相机视角预设（模型居中后，基于 modelSize 计算） */
export const BODY_PART_OPTIONS = ['全部', '胸腹', '背部', '上肢', '下肢']

export function getBodyPartCamera(viewKey, modelSize) {
  if (!modelSize) {
    return { target: [0, 0, 0], position: [0, 0.1, 2.2] }
  }

  const h = modelSize.y
  const d = Math.max(modelSize.x, modelSize.z) * 1.75

  const views = {
    全部: {
      target: [0, 0, 0],
      position: [0, h * 0.12, d],
    },
    胸腹: {
      target: [0, h * 0.02, 0],
      position: [0, h * 0.02, d * 0.52],
    },
    背部: {
      target: [0, h * 0.02, 0],
      position: [0, h * 0.02, -d * 0.52],
    },
    上肢: {
      target: [0, h * 0.32, 0],
      position: [d * 0.58, h * 0.32, d * 0.42],
    },
    下肢: {
      target: [0, -h * 0.32, 0],
      position: [d * 0.42, -h * 0.26, d * 0.48],
    },
  }

  return views[viewKey] || views['全部']
}
