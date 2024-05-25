export {};

declare global {
    var ATL_CORE_TRACE: (msg: string, ...meta: any[]) => void;
    var ATL_CORE_INFO: (msg: string, ...meta: any[]) => void;
    var ATL_CORE_WARN: (msg: string, ...meta: any[]) => void;
    var ATL_CORE_ERROR: (msg: string, ...meta: any[]) => void;
    var ATL_CORE_CRITICAL: (msg: string, ...meta: any[]) => void;

    var ATL_TRACE: (msg: string, ...meta: any[]) => void;
    var ATL_INFO: (msg: string, ...meta: any[]) => void;
    var ATL_WARN: (msg: string, ...meta: any[]) => void;
    var ATL_ERROR: (msg: string, ...meta: any[]) => void;
    var ATL_CRITICAL: (msg: string, ...meta: any[]) => void;
}