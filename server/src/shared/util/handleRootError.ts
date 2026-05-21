export function handleRootError(err: unknown): never {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined

    console.error('[Unhandled ERROR] Error on server root:', message)
    if (stack) console.error(stack)

    process.exit(1)
}