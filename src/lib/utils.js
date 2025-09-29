export async function withTimeout(promise, ms = 10000) {
  const t = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))
  return Promise.race([promise, t])
}
