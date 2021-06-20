// Tampermonkey API https://www.tampermonkey.net/documentation.php

type PropNamesOmitType<T, P> = {
  [K in keyof T]: T[K] extends P ? never : K;
}[keyof T];
type OmitFunctionProps<T> = Pick<T, PropNamesOmitType<T, Function>>;

declare namespace Tampermonkey {
  type Value = string | boolean | number;
  type RunAt = "document-start" | "document-body" | "document-end" | "document-idle" | "context-menu";
  type ClipboardType = "text" | "html";
  type ClipboardInfo = ClipboardOptions | ClipboardType;
  type ValueChangeCallback = (name: string, old_value: Value, new_value: Value, remote: boolean) => void;
  type VoidCallback = () => void;

  interface Response<Context = void> {
    readonly finalUrl: string;
    readonly readyState: 1 | 2 | 3 | 4;
    readonly status: number;
    readonly statusText: string;
    readonly responseHeaders: string;
    readonly response: string;
    readonly responseXML: Document | false;
    readonly responseText: string;
    readonly context?: Context;
  }

  interface ProgressResponse<Context = void> extends Response<Context> {
    lengthComputable: boolean;
    loaded: number;
    total: number;
  }

  interface Request<Context = void> {
    /** HTTP method */
    method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'TRACE'
    | 'OPTIONS'
    | 'CONNECT';
    /** destination URL */
    url: string;
    /** HTTP headers */
    headers?: Headers;
    /** body string request data */
    data?: string;
    /** cookie data that'll patch the current cookies for this request */
    cookie?: string;
    /** enables sending `data` as binary
     * @default false
     */
    binary?: boolean;
    /**
     * disables caching the response content
     * @default false
     */
    nocache?: boolean;
    /**
     * whether to revalidate cached content or not
     * @default false
     */
    revalidate?: boolean;
    /**
     * milliseconds to wait before terminating the request - `0` disables it
     * @default 0
     */
    timeout?: number;
    /** a pass-through object that'll be added to the response */
    context?: Context;
    /** expected format of the response data */
    responseType?: "arraybuffer" | "blob" | "json";
    /** HTTP MIME type */
    overrideMimeType?: string;
    /**
     * disables sending cookies on the request
     * @default false
     */
    anonymous?: boolean;
    /**
     * uses the HTML5 Fetch API instead of XHR (`XMLHttpRequest`)
     * @default false
     */
    fetch?: boolean;
    /** user name for authentication */
    user?: string;
    /** password for authentication */
    password?: string;
    /** function called if the request is aborted */
    onabort?(response: Response<Context>): void;
    /** function called if an error occurs while processing the request */
    onerror?(response: Response<Context>): void;
    /** function called when the request starts loading */
    onloadstart?(response: Response<Context>): void;
    /** function called when the request progress state changes */
    onprogress?(response: ProgressResponse<Context>): void;
    /** function called when the request ready state changes */
    onreadystatechange?(response: Response<Context>): void;
    /** function called if request times out */
    ontimeout?(response: Response<Context>): void;
    /** function called if the request was loaded */
    onload?(response: Response<Context>): void;
  }

  interface XHRResponse {
    /** cancels the request */
    abort: () => void;
  }

  interface TabOptions {
    active?: boolean;
    insert?: boolean;
    setParent?: boolean;
    incognito?: boolean;
  }

  interface TabHandler {
    close: () => void,
    onclose?: () => void,
    closed: boolean,
  }

  interface DownloadDetails {
    /** the URL from where the data should be downloaded */
    url: string;
    /** the filename to download the URL to.
     *
     * For security reasons, the extension needs to be whitelisted at
     * Tampermonkey's options page
     * */
    name: string;
    /** HTTP headers */
    headers?: Headers;
    /** show a saveAs dialog */
    saveAs?: boolean;
    /** callback to be executed if this download ended up with an error */
    onerror?(details: DownloadErrorDetails): void;
    /** callback to be executed if this download finished */
    onload?(): void;
    /** callback to be executed if this download made some progress */
    onprogress?(): void;
    /** callback to be executed if this download failed due to a timeout */
    ontimeout?(): void;
  }

  interface DownloadHandler {
    abort: () => void;
  }

  interface DownloadErrorDetails {
    error: "not_enabled" | "not_whitelisted" | "not_permitted" | "not_supported" | "not_succeeded";
    details: unknown;
  }

  interface ScriptOptionOverride {
    excludes: boolean;
    includes: boolean;
    orig_excludes: string[];
    orig_includes: string[];
    use_excludes: string[];
    use_includes: string[];
  }

  interface ScriptOptions {
    awareOfChrome: boolean;
    compat_arrayleft: boolean;
    compat_foreach: boolean;
    compat_forvarin: boolean;
    compat_metadata: boolean;
    compat_prototypes: boolean;
    compat_uW_gmonkey: boolean;
    noframes: boolean;
    override?: ScriptOptionOverride;
    run_at?: RunAt;
  }

  interface ScriptInfo {
    author?: string;
    copyright?: string;
    description?: string;
    excludes: string[];
    homepage?: string;
    icon?: string;
    icon64?: string;
    includes: string[];
    lastUpdated: number;
    matches: string[];
    downloadMode: "native" | "disabled" | "browser";
    name: string;
    namespace?: string;
    options: ScriptOptions;
    position: number;
    resources: string[];
    "run-at": RunAt;
    system: boolean;
    unwrap: boolean;
    version?: string;
  }

  interface Info {
    script: ScriptInfo;
    scriptMetaStr?: string;
    scriptSource: string;
    scriptUpdateURL?: string;
    scriptWillUpdate: boolean;
    scriptHandler: string;
    isIncognito: boolean;
    isFirstPartyIsolation: boolean;
    version: string;
  }

  interface ClipboardOptions {
    type: ClipboardType;
    mimetype: string;
  }

  interface NotificationDetails {
    /** the text of the notification (required unless highlight is set) */
    text?: string;
    /** the notification title */
    title: string;
    /** the image */
    image?: string;
    /** a boolean flag whether to highlight the tab that sends the notification (required unless text is set) */
    highlight?: boolean;
    /** a boolean flag whether to not play a sound */
    silent?: boolean;
    /** the time after that the notification will be hidden (0 = disabled) */
    timeout?: number;
    /** called when the notification is closed (no matter if this was triggered by a timeout or a click) or the tab was highlighted */
    ondone?: VoidCallback;
    /** called in case the user clicks the notification */
    onclick?: VoidCallback;
  }
}

/**
 * Adds the given style to the document and returns the injected style element.
 * @param rules
 */
declare function GM_addStyle(rules: string): Promise<HTMLStyleElement>;

/**
 * Creates an HTML element specified by `tag_name`, applies all given attributes
 * and returns the injected HTML element. If a `parent_node` is given, then it
 * is attached to it, otherwise it'll be attached to either the head or body
 * depending on the tag.
 * @param parent_node
 * @param tag_name
 * @param attributes
 */
declare function GM_addElement<T extends Element>(tag_name: string, attributes: Partial<OmitFunctionProps<T>>): Promise<T>;
declare function GM_addElement<T extends Element>(parent_node: Element, tag_name: string, attributes: Partial<OmitFunctionProps<T>>): Promise<T>;

/**
 * Deletes `name` from storage.
 * @param name
 */
declare function GM_deleteValue(name: string): Promise<void>;

/**
 * List all names on the storage.
 */
declare function GM_listValues(): Promise<string[]>;

/**
 * Adds a change listener to the storage and returns the listener ID. `name` is
 * the name of the observed variable. The `remote` argument of the callback
 * function shows whether this value was modified from the instance of another
 * tab (`true`) or within this script instance (`false`). Therefore this
 * functionality can be used by scripts of different browser tabs to communicate
 * with each other.
 * @param name
 * @param callback
 */
declare function GM_addValueChangeListener(name: string, callback: Tampermonkey.ValueChangeCallback): Promise<number>;

/**
 * Removes a change listener by its ID.
 * @param listener_id
 */
declare function GM_removeValueChangeListener(listener_id: number): Promise<void>;

declare function GM_setValue(name: string, value: Tampermonkey.Value): Promise<void>;

declare function GM_getValue<T = Tampermonkey.Value>(name: string, defaultValue?: T): Promise<T | undefined>;

declare function GM_log(message: any): Promise<void>;

declare function GM_getResourceText(name: string): Promise<string>;

declare function GM_getResourceURL(name: string): Promise<string>;

/**
 * Adds an item to the User Script Commands menu
 * @param name caption to display on the menu item
 * @param fn function to call when the menu item is selected
 * @param accessKey single character used to select this command when the menu is open. It should be a letter present in the name
 * @returns menu command ID
 */
declare function GM_registerMenuCommand(name: string, fn: Function, accessKey: string): Promise<number>;

/**
 * Removes an item from the User Script Commands menu
 * @param menuCmdId menu command ID to remove
 */
declare function GM_unregisterMenuCommand(menuCmdId: number): Promise<void>;

declare function GM_openInTab(url: string, options?: Tampermonkey.TabOptions): Promise<Tampermonkey.TabHandler>;
declare function GM_openInTab(url: string, loadInBackground?: boolean): Promise<Tampermonkey.TabHandler>;

declare function GM_xmlhttpRequest<T = void>(details: Tampermonkey.Request<T>): Promise<Tampermonkey.XHRResponse>;

/**
 * Downloads a given URL to the local disk.
 * @param details
 * @param url
 * @param name
 */
declare function GM_download(details: Tampermonkey.DownloadDetails): Promise<Tampermonkey.DownloadHandler>;
declare function GM_download(url: string, name: string): Promise<Tampermonkey.DownloadHandler>;

// TODO callback signature
declare function GM_getTab(callback: Function): Promise<void>;
// TODO tab type
declare function GM_saveTab(tab: unknown): Promise<void>;
// TODO callback signature
declare function GM_getTabs(callback: Function): Promise<void>;

declare function GM_notification(details: Tampermonkey.NotificationDetails, ondone?: Tampermonkey.VoidCallback): Promise<void>;
declare function GM_notification(text: string, title: string, image?: string, onclick?: Tampermonkey.VoidCallback): Promise<void>;

declare function GM_setClipboard(data: any, info: Tampermonkey.ClipboardInfo): Promise<void>;

declare const GM_info: Tampermonkey.Info;
declare const unsafeWindow: Window;
