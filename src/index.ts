async function main() {}

function ensureExit(code: number, timeout = 3000) {
    process.exitCode = code
    setTimeout(() => {
        process.exit(code)
    }, timeout)
}

process.once('uncaughtException', (error) => {
    console.error(error, 'Uncaught exception')
    ensureExit(1)
})

main()
