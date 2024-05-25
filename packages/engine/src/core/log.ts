import log from 'loglevel';

export class Log {
    private static coreLogger: log.Logger;
    private static clientLogger: log.Logger;

    public static init(): void {
        this.coreLogger = log.getLogger('ATLAS');
        this.clientLogger = log.getLogger('APP');

        this.coreLogger.setLevel(log.levels.TRACE);
        this.clientLogger.setLevel(log.levels.TRACE);
    }

    static getCoreLogger(): log.Logger {
        return this.coreLogger;
    }

    static getClientLogger(): log.Logger {
        return this.clientLogger;
    }
}

ATL_CORE_TRACE = (msg: string, ...meta: any[]) => Log.getCoreLogger().trace(msg, ...meta);
ATL_CORE_INFO = (msg: string, ...meta: any[]) => Log.getCoreLogger().info(msg, ...meta);
ATL_CORE_WARN = (msg: string, ...meta: any[]) => Log.getCoreLogger().warn(msg, ...meta);
ATL_CORE_ERROR = (msg: string, ...meta: any[]) => Log.getCoreLogger().error(msg, ...meta);
ATL_CORE_CRITICAL = (msg: string, ...meta: any[]) => Log.getCoreLogger().error('CRITICAL: ' + msg, ...meta);

ATL_TRACE = (msg: string, ...meta: any[]) => Log.getClientLogger().trace(msg, ...meta);
ATL_INFO = (msg: string, ...meta: any[]) => Log.getClientLogger().info(msg, ...meta);
ATL_WARN = (msg: string, ...meta: any[]) => Log.getClientLogger().warn(msg, ...meta);
ATL_ERROR = (msg: string, ...meta: any[]) => Log.getClientLogger().error(msg, ...meta);
ATL_CRITICAL = (msg: string, ...meta: any[]) => Log.getClientLogger().error('CRITICAL: ' + msg, ...meta);