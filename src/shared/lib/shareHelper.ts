export interface ShareParams {
  id_task: number
}

export function buildShareParams(taskId: number | string): ShareParams {
  const normalizedTaskId =
    typeof taskId === 'string' && taskId.trim() === ''
      ? Number.NaN
      : Number(taskId)

  if (!Number.isSafeInteger(normalizedTaskId)) {
    throw new Error('Invalid task ID')
  }

  return { id_task: normalizedTaskId }
}
