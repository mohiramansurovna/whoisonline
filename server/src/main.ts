import { createHttpServer } from "./shared/config/server.config.ts";
import { loadEnvConfig } from "./shared/config/env.config.ts";
import { handleRootError } from "./shared/util/handleRootError.ts";
import { initWebSocketServer } from "./shared/config/ws.config.ts";
import { PgClient } from "./shared/config/pg.config.ts";
import { RedisClient } from "./shared/config/redis.config.ts";


async function bootstrap() {
    const envConfig = loadEnvConfig();

    await Promise.all([
        PgClient.init(envConfig).catch(err => { throw new Error(`PgPool init failed: ${err.message}`) }),
        RedisClient.init(envConfig).catch(err => { throw new Error(`Redis init failed: ${err.message}`) }),
    ])

    const server = createHttpServer();

    server.listen(envConfig.APP_PORT, () => {
        console.log(`Server is listening on http://localhost:${envConfig.APP_PORT}`)
    })

    initWebSocketServer(server);

}

process.on('uncaughtException', (err) => handleRootError(err))
process.on('unhandledRejection', (reason) => handleRootError(reason))
bootstrap().catch(handleRootError)