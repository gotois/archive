export interface ShareParams {
  task_id: number
}

export function buildShareParams(taskId: number | string): ShareParams {
  const normalizedTaskId =
    typeof taskId === 'string' && taskId.trim() === ''
      ? Number.NaN
      : Number(taskId)

  if (!Number.isSafeInteger(normalizedTaskId) || normalizedTaskId <= 0) {
    throw new Error('Invalid task ID')
  }

  return { task_id: normalizedTaskId }
}
