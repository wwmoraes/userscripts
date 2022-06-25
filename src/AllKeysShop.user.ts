// ==UserScript==
// @name            AllKeysShop
// @description     better wishlist management and Steam integration
// @version         0.1.0-rc.1
// @copyright       2021, William Artero (https://artero.dev)
// @license         MIT; https://opensource.org/licenses/MIT
// @icon            https://www.allkeyshop.com/blog/wp-content/themes/aks-theme/assets/image/favicon-32x32.png
// @namespace       https://www.allkeyshop.com
// @homepageURL     https://github.com/wwmoraes/userscripts
// @supportURL      https://github.com/wwmoraes/userscripts/issues
// @contributionURL https://github.com/wwmoraes/userscripts
// @updateURL       https://openuserjs.org/meta/wwmoraes/AllKeysShop.meta.js
// @downloadURL     https://openuserjs.org/src/scripts/wwmoraes/AllKeysShop.user.js
// ==OpenUserJS==
// @author          wwmoraes
// ==/OpenUserJS==
// @match           https://www.allkeyshop.com/*
// @connect         ipinfo.io
// @connect         steamid.io
// @connect         store.steampowered.com
// @grant           GM_registerMenuCommand
// @grant           GM_unregisterMenuCommand
// @grant           GM_xmlhttpRequest
// ==/UserScript==

"use strict";

type DBEventResolveCallback<T> = (result: T) => void;

type DBEventRejectCallback<T> = (event: IDBEvent<T>) => void;
interface AKSWishlistImportSteamResponse {
  data: string[];
  type: "success" | string;
}

interface IndexedDBManager<T> {
  open(): Promise<void>;
  add(value: T, key?: IDBValidKey): Promise<void>;
  get(query: IDBValidKey | IDBKeyRange): Promise<T | undefined>;
  delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
  put(data: T, key?: IDBValidKey): Promise<void>;
  getAllKeys(): Promise<IDBValidKey[] | undefined>;
  getKeyByIndex(query: IDBValidKey | IDBKeyRange, indexName: string): Promise<IDBValidKey>;
}

interface GameInfo {
  id: string;
  steamAppID?: string;
  priority?: number;
}

interface Context extends Record<string, unknown> {
  gameInfo: IndexedDBManager<GameInfo>;
  countryCode: string;
  steam64ID: string;
  setUsernameCmd: number;
}

(() => {
  const isLocalStorageAvailable = (): boolean => {
    try {
      if (typeof window.localStorage === "undefined") return false;
      const key = "__storage_test__";
      window.localStorage.setItem(key, key);
      if (window.localStorage.getItem(key) !== key) return false;
      window.localStorage.removeItem(key);
      return true;
    }
    catch (e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        window.localStorage && window.localStorage.length !== 0;
    }
  };

  if (!isLocalStorageAvailable()) {
    console.warn("local storage IS NOT available! AllKeyShop cannot work without it :/");
    GM_registerMenuCommand("Please enable local storage", () => {
      alert("AllKeyShop requires local storage to persist your steam ID number to sync properly. Please enable it and reload the page.");
    }, "x");
    return;
  }

  const steam64IDKey = "steam64ID";

  const isRecord = (data: unknown):
    data is Record<string, unknown> =>
    data !== null &&
    typeof data === "object";

  const isSteamWishlistEntry = (data: unknown): data is Steam.WishlistEntry =>
    isRecord(data) &&
    typeof data.name === "string";

  const isSteamWishlistData = (data: unknown): data is Steam.WishlistData =>
    isRecord(data) &&
    Object.keys(data).every(key => isSteamWishlistEntry(data[key]));

  const isAKSWishlistImportSteamResponse = (data: unknown): data is AKSWishlistImportSteamResponse =>
    isRecord(data) &&
    typeof data.type === "string" &&
    typeof data.data !== "undefined" &&
    Array.isArray(data.data) &&
    data.data.every(entry => typeof entry === "string");

  const fetchSteamWishlistData = (steam64ID: string) =>
    new Promise<Tampermonkey.Response>((resolve, reject) => GM_xmlhttpRequest({
      method: "GET",
      url: `https://store.steampowered.com/wishlist/profiles/${steam64ID}/wishlistdata/?p=0`,
      onload: resolve,
      onerror: reject,
    }));

  const fetchCountryCode = () =>
    new Promise<Tampermonkey.Response>((resolve, reject) => GM_xmlhttpRequest({
      method: "GET",
      url: "https://ipinfo.io/country",
      onload: resolve,
      onerror: reject,
    }));

  const fetchSteamSearchSuggestion = (query: string, countryCode: string) =>
    new Promise<Tampermonkey.Response>((resolve, reject) => GM_xmlhttpRequest({
      method: "GET",
      url: `https://store.steampowered.com/search/suggest?term=${encodeURIComponent(query)}&f=games&l=english&&cc=${countryCode}&category1=998&excluded_content_descriptors%5B0%5D=3&excluded_content_descriptors%5B1%5D=4`,
      onload: resolve,
      onerror: reject,
    }));

  const fetchSteam64ID = (input: string) =>
    new Promise<Tampermonkey.Response>((resolve, reject) => GM_xmlhttpRequest({
      method: "POST",
      url: "https://steamid.io/lookup",
      data: `input=${input}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      onload: resolve,
      onerror: reject,
    }));

  /**
   * searches the Steam store games
   *
   * @param {string} query term to search for
   * @param {string} countryCode user country code
   * @returns {Promise<Record<string, string>>} dictionary of app IDs and the respective game name
   */
  const searchSteamGame = async (query: string, countryCode: string): Promise<Record<string, string>> => {
    const response = await fetchSteamSearchSuggestion(query, countryCode);
    const responseDocument = new DOMParser().parseFromString(response.responseText, "text/html");

    return Array.from(responseDocument.querySelectorAll("[data-ds-appid]")).reduce((entries, element) => {
      const appid = element.getAttribute("data-ds-appid");
      if (appid === null) return entries;

      const nameElement = element.querySelector(".match_name");
      if (nameElement === null || nameElement.textContent === null) return entries;

      entries[appid] = nameElement.textContent;

      return entries;
    }, {} as Record<string, string>);
  };

  const dbEventCallback = <T>(resolve: DBEventResolveCallback<T>, reject: DBEventRejectCallback<T>) => (event: IDBEvent<T>): void => {
    if (event.target === null) return reject(event);
    if (typeof event.target.result === "undefined") return reject(event);

    return resolve(event.target.result);
  };

  const tryGetLocalStorageValue = async (key: string, fallback?: () => Promise<string>): Promise<string> => {
    let value = localStorage.getItem(key);
    if (value === null && typeof fallback === "function") {
      value = await fallback();
      localStorage.setItem(key, value);
    }
    return value || "";
  };

  const getCountryCode = async (): Promise<string> => {
    const key = "countryCode";
    let countryCode = localStorage.getItem(key);
    if (countryCode === null) {
      const response = await fetchCountryCode();
      countryCode = response.responseText.trim();
      localStorage.setItem(key, countryCode);
    }

    return countryCode;
  };

  const getSteam64ID = () => tryGetLocalStorageValue(steam64IDKey, async (): Promise<string> => {
    const id = prompt("what's your current Steam user name?");
    if (id === null) throw new Error("user name not provided");

    const response = await fetchSteam64ID(id);
    const responseDocument = new DOMParser().parseFromString(response.responseText, "text/html");
    const canonicalElement = responseDocument.querySelector<HTMLLinkElement>("head link[rel=canonical]");
    if (canonicalElement === null) throw new Error("unable to get Steam64 ID");

    const url = new URL(canonicalElement.href);
    const steam64ID = url.pathname.split("/").pop();
    if (typeof steam64ID === "undefined") throw new Error("unable to get Steam64 ID");

    return steam64ID;
  });

  const sanitizeQuery = (query: string): string => query.replaceAll("&", " ").replaceAll(".", " ");

  // TODO refactor function
  // eslint-disable-next-line max-params
  const showGameSelector = async (parent: Element, query: string, countryCode: string, callback: (value: string) => void) => {
    const sanitizedQuery = sanitizeQuery(query);
    console.trace("showGameSelector sanitizedQuery", sanitizedQuery);
    const suggestions = await searchSteamGame(sanitizedQuery, countryCode);

    const container = document.createElement("div");
    const selector = document.createElement("select");
    container.appendChild(selector);

    const emptyOption = document.createElement("option");
    emptyOption.disabled = true;
    emptyOption.selected = true;
    emptyOption.appendChild(document.createTextNode("—"));
    selector.appendChild(emptyOption);

    Object.entries(suggestions).forEach(([
      appID,
      name,
    ]) => {
      const option = document.createElement("option");
      option.value = appID;
      option.appendChild(document.createTextNode(name));
      selector.appendChild(option);
    });

    selector.addEventListener("input", event => {
      parent.removeChild(container);
      if (event.target === null) return;
      if (!(event.target instanceof HTMLSelectElement)) return;
      callback((event.target as HTMLSelectElement).value);
    });

    parent.appendChild(container);
  };

  // TODO refactor function
  // eslint-disable-next-line max-lines-per-function
  const checkGameEntry = async (element: HTMLTableRowElement, context: Context) => {
    const gameID = element.getAttribute("data-game-id");
    if (gameID === null) return;

    const gameNameElement = element.querySelector(".game-name");
    if (gameNameElement === null) return;

    const gameName = gameNameElement.textContent?.trim();
    if (typeof gameName === "undefined") return;

    let gameInfo = await context.gameInfo.get(gameID);
    // game is not on the database, which means either it was added manually
    // or is a new entry due to an AKS import. In that case, we try to get
    // the Steam app ID by searching the game name on the Steam Store.
    if (typeof gameInfo === "undefined") {
      gameInfo = { id: gameID };

      console.info("game info not found for ID %s, searching Steam...", gameID);
      const searchResults = await searchSteamGame(gameName, context.countryCode);
      const searchKeys = Object.keys(searchResults);
      if (searchKeys.length === 1) {
        gameInfo.steamAppID = searchKeys.shift();
      }

      console.trace("updating game info", element);
      await context.gameInfo.put(gameInfo);
    }

    let span = element.querySelector<HTMLSpanElement>("span.aks-game-state");
    if (span === null) {
      span = document.createElement("span");
      span.classList.add("aks-game-state");
    } else {
      span.removeAttribute("style");
      Array.from(span.children).forEach(span.removeChild);
    }

    // mark the game as unknown/unlinked due to missing info
    if (typeof gameInfo.steamAppID === "undefined") {
      span.style.fontWeight = "bold";
      span.style.cursor = "pointer";
      span.appendChild(document.createTextNode("⁇"));
      span.addEventListener("click", () => {
        showGameSelector(gameNameElement, gameName, context.countryCode, value => {
          const newGameInfo = {
            id: gameID,
            steamAppID: value,
          } as GameInfo;
          console.trace("updating game", newGameInfo);
          context.gameInfo.put(newGameInfo).then(console.trace, console.debug);
          checkGameEntry(element, context);
        });
      });
      gameNameElement?.appendChild(span);
      return;
    }

    if (typeof gameInfo.priority !== "undefined") {
      element.setAttribute("data-priority", gameInfo.priority.toString());
    }

    // game info found, thus we set the priority attribute, and add the Steam
    // logo after the name so the user easily knows which games are linked
    span.classList.add("sprite");
    span.style.backgroundPosition = "-44px -22px";
    span.style.width = "22px";
    span.style.height = "22px";
    span.style.transform = "scale(0.5)";
    span.style.verticalAlign = "middle";
    gameNameElement?.appendChild(span);
  };

  const aksImportSteamWishlist = async (context: Context) => {
    const listID = document.querySelector<HTMLElement>(".akswl-list[data-list-id]")?.getAttribute("data-list-id");
    if (typeof listID !== "string") {
      throw new Error("unable to get the current wishlist ID");
    }

    const formData = new URLSearchParams();
    formData.set("action", "akswl_import_steam_wishlist");
    formData.set("listId", listID);
    formData.set("steamId", context.steam64ID);
    formData.set("steamIdType", "steamId64");

    const response = await fetch("https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php", {
      method: "POST",
      body: formData,
    });

    if (response.status !== 200) {
      console.error("AKS backend response", response);
      throw new Error("received non-OK response from AKS backend");
    }

    const data = await response.json();
    if (!isAKSWishlistImportSteamResponse(data)) {
      throw new Error("unknown data format returned by the AKS backend");
    }

    const container = document.querySelector("table.akswl-list tbody");
    if (container === null) {
      throw new Error("wishlist container not found");
    }

    const template = document.createElement("template");
    data.data.forEach(entry => {
      template.innerHTML = entry.trim();
      const element = template.content.querySelector<HTMLTableRowElement>("tr.game-row");
      if (element === null) return;

      container.appendChild(element);
    });
  };

  const cleanupWishlist = () => {
    const gameEntries = Array.from(document.querySelectorAll<HTMLTableRowElement>("tr[data-game-id]:not([data-priority])"));

    gameEntries.forEach(entry => {
      const deleteElement = entry.querySelector<HTMLElement>(".delete");
      if (deleteElement === null) return;

      console.info("removing game id %s", entry.getAttribute("data-game-id"));
      deleteElement.dispatchEvent(new Event("click"));
    });
  };

  const tidyDatabase = async (context: Context) => {
    const databaseKeys = await context.gameInfo.getAllKeys();
    if (typeof databaseKeys === "undefined") return;

    const gameIDs = Array.from(document.querySelectorAll<HTMLTableRowElement>("tr[data-game-id]")).map(element => element.getAttribute("data-game-id"));

    databaseKeys.filter(key => !gameIDs.includes(key.toString())).
      forEach(key => {
        console.info("removing game ID %s from database...", key);
        context.gameInfo.delete(key);
      });
  };

  // TODO refactor function
  // eslint-disable-next-line max-lines-per-function
  const importSteamWishlistPriority = async (context: Context) => {
    const response = await fetchSteamWishlistData(context.steam64ID);
    const content = response.response;
    const data = JSON.parse(content);
    if (!isSteamWishlistData(data)) {
      console.error("invalid data returned by the Steam API", data);
      return;
    }

    Object.keys(data).forEach(async steamAppID => {
      const steamGameData = data[steamAppID];
      if (typeof steamGameData === "undefined") return;

      console.trace("retrieving AKS game ID for steam app ID %s", steamAppID);
      const key = await context.gameInfo.getKeyByIndex(steamAppID, "steamAppID");
      if (typeof key === "undefined") {
        console.warn("no game info found for '%s'", steamGameData.name);
        return;
      }

      console.trace("retrieving game info for game ID %s, steam app ID %s", key, steamAppID);
      const gameInfo = await context.gameInfo.get(key);
      if (typeof gameInfo === "undefined") {
        console.warn("no game info found for '%s'", steamGameData.name);
        return;
      }

      gameInfo.priority = steamGameData.priority;
      console.trace("updating game info", gameInfo);
      await context.gameInfo.put(gameInfo);
    });

    // sort elements with priority
    const listContainer = document.querySelector<HTMLTableSectionElement>("table.akswl-list tbody");
    if (listContainer === null) return;

    const prioritizedElements = Array.from(document.querySelectorAll<HTMLTableRowElement>("tr[data-game-id][data-priority]")).sort((a, b) => {
      const valueA = a.getAttribute("data-priority");
      const valueB = b.getAttribute("data-priority");
      if (valueA === null || valueB === null) return 0;

      return parseInt(valueA, 10) - parseInt(valueB, 10);
    });

    // reverse the list and "unshift" on the parent. DOM insert/append methods
    // move elements, so this effectively orders the synced entries, while
    // all other entries will be pushed to the end of the list.
    prioritizedElements.reverse().forEach(element => {
      listContainer.insertBefore(element, listContainer.firstChild);
    });

    const saveOrderButton = document.querySelector<HTMLButtonElement>("button.save-order");
    if (saveOrderButton === null) return;

    console.info("saving order...");
    saveOrderButton.disabled = false;
    saveOrderButton.dispatchEvent(new Event("click"));
  };

  const augmentWishlistGameRows = (context: Context) => {
    const gameRows = document.querySelectorAll<HTMLTableRowElement>(".akswl-list tbody tr.game-row");
    gameRows.forEach(gameRow => checkGameEntry(gameRow, context));
  };

  const setUsernameMenu = (context: Context) => async () => {
    try {
      context.steam64ID = await getSteam64ID();
      if (context.steam64ID === "") return;

      GM_unregisterMenuCommand(context.setUsernameCmd);
      // TODO create menu manager middleware to prevent a reload
      // context.setUsernameCmd = -1;
      // await setupWishlistMenus(context);
      location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const setupWishlistMenus = async (context: Context) => {
    if (context.steam64ID === "") {
      // eslint-disable-next-line require-atomic-updates
      context.setUsernameCmd = await GM_registerMenuCommand("Set username", setUsernameMenu(context), "s");
      return;
    }
    // imports the steam wishlist data and reorders the games using the priority
    await GM_registerMenuCommand("Import Steam Wishlist", async () => {
      // import steam wishlist games
      await aksImportSteamWishlist(context);
      // remove unknown game entries
      cleanupWishlist();
      // import the priority
      await importSteamWishlistPriority(context);
      // adds icons on the game rows to indicate the game state
      augmentWishlistGameRows(context);
    }, "i");

    await GM_registerMenuCommand("Reorder Wishlist", async () => {
      // import the priority
      await importSteamWishlistPriority(context);
      // adds icons on the game rows to indicate the game state
      augmentWishlistGameRows(context);
    }, "r");

    await GM_registerMenuCommand("Tidy Database", () => tidyDatabase(context), "t");

    await GM_registerMenuCommand("Cleanup list", cleanupWishlist, "c");

    await GM_registerMenuCommand(`Change steam user`, async () => {
      context.steam64ID = await getSteam64ID();
    }, "c");

    const steamIDInputElement = document.querySelector<HTMLInputElement>("input.steam-id-input");
    if (steamIDInputElement !== null) {
      steamIDInputElement.value = context.steam64ID;
      steamIDInputElement.dispatchEvent(new Event("input", {
        bubbles: true,
        cancelable: true,
      }));
    }

    augmentWishlistGameRows(context);
  };

  class StoreManager<T> implements IndexedDBManager<T> {
    protected databaseName: string;

    protected version?: number;

    protected storeName: string;

    protected storeParameters: IDBObjectStoreParameters;

    protected db?: IDBDatabase;

    private openHandler = (db: IDBDatabase) => {
      this.db = db;
    };

    protected upgradeHandler = (db: IDBDatabase) => {
      db.createObjectStore(this.storeName, this.storeParameters);
    };

    // TODO refactor function
    // eslint-disable-next-line max-params
    constructor(storeName: string, databaseName: string, version?: number, storeParameters?: IDBObjectStoreParameters) {
      this.storeName = storeName;
      this.databaseName = databaseName;
      this.version = version;
      this.storeParameters = storeParameters ?? {
        autoIncrement: false,
      } as IDBObjectStoreParameters;
    }

    public open = (): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof this.db !== "undefined") reject(new Error("database is already opened"));

        const request = indexedDB.open(this.databaseName, this.version);
        request.onerror = reject;
        request.onsuccess = dbEventCallback<IDBDatabase>(db => {
          this.openHandler(db);
          resolve();
        }, reject);
        request.onupgradeneeded = dbEventCallback<IDBDatabase>(this.upgradeHandler, reject);
      });

    public add = (value: T, key?: IDBValidKey): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") {
          reject(new Error("db is not initialized"));
          return;
        }

        const transaction = this.db.transaction(this.storeName, "readwrite");
        transaction.onerror = reject;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        const request = store.add(value, key);
        request.onerror = reject;
        request.onsuccess = dbEventCallback<void>(resolve, reject);
      });

    public get = (query: IDBValidKey | IDBKeyRange): Promise<T | undefined> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") {
          reject(new Error("db is not initialized"));
          return;
        }

        const transaction = this.db.transaction(this.storeName, "readonly");
        transaction.onerror = reject;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        const request = store.get(query);
        request.onerror = reject;
        request.onsuccess = (event: IDBEvent<T>) => {
          if (event.target === null) {
            reject(event);
            return;
          }

          resolve(event.target.result);
        };
      });

    public delete = (key: IDBValidKey | IDBKeyRange): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") {
          reject(new Error("db is not initialized"));
          return;
        }

        const transaction = this.db.transaction(this.storeName, "readwrite");
        transaction.onerror = reject;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        request.onerror = reject;
        request.onsuccess = dbEventCallback<void>(resolve, reject);
      });

    public put = (data: T, key?: IDBValidKey): Promise<void> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") return;

        const transaction = this.db.transaction(this.storeName, "readwrite");
        transaction.onerror = console.debug;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        const request = store.put(data, key);
        request.onerror = reject;
        request.onsuccess = dbEventCallback<void>(resolve, reject);
      });

    public getAllKeys = (): Promise<IDBValidKey[] | undefined> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") {
          reject(new Error("db is not initialized"));
          return;
        }

        const transaction = this.db.transaction(this.storeName, "readonly");
        transaction.onerror = console.trace;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        const request = store.getAllKeys();
        request.onerror = reject;
        request.onsuccess = dbEventCallback<IDBValidKey[]>(resolve, reject);
      });

    public getKeyByIndex = (query: IDBValidKey | IDBKeyRange, indexName: string): Promise<IDBValidKey> =>
      new Promise((resolve, reject) => {
        if (typeof this.db === "undefined") {
          Promise.reject(new Error("db is not initialized"));
          return;
        }

        const transaction = this.db.transaction(this.storeName, "readonly");
        transaction.onerror = console.trace;
        transaction.oncomplete = dbEventCallback<IDBTransaction>(console.debug, reject);

        const store = transaction.objectStore(this.storeName);
        if (!store.indexNames.contains(indexName)) {
          reject(new Error("index is not defined"));
          return;
        }

        const index = store.index(indexName);
        const request = index.getKey(query);
        request.onerror = reject;
        request.onsuccess = dbEventCallback<IDBValidKey>(resolve, reject);
      });
  }

  class GameInfoStore extends StoreManager<GameInfo> {
    constructor() {
      super("appid", "steam", 1, {
        autoIncrement: false,
        keyPath: "id",
      });
    }

    protected upgradeHandler = (db: IDBDatabase) => {
      console.info("creating store...", this.storeName);
      const store = db.createObjectStore(this.storeName, this.storeParameters);
      console.info("creating index...", "steamAppID");
      store.createIndex("steamAppID", "steamAppID", { unique: true });
    };
  }

  type UserScriptCallback<T> = (context: T) => Promise<void>;
  class UserScript<T extends Record<string, unknown>> {
    private startupCallbacks: UserScriptCallback<T>[];

    private hrefListeners: Record<string, UserScriptCallback<T>>;

    private context: T;

    constructor(context: T) {
      this.startupCallbacks = [];
      this.hrefListeners = {};
      this.context = context;
    }

    public addStartupCallback = (callback: UserScriptCallback<T>) =>
      this.startupCallbacks.push(callback);

    public addPageListener = (href: string, listener: UserScriptCallback<T>) => {
      const hrefListener = this.hrefListeners[href];
      if (typeof hrefListener !== "undefined") return;
      this.hrefListeners[href] = listener;
    };

    public start = async () => {
      // executes all startup callbacks prior to running a page listener
      await Promise.allSettled(this.startupCallbacks.map(callback => callback(this.context)));

      // search for listeners applicable to the current page
      const listeners = Object.keys(this.hrefListeners).
        filter(href => location.href.match(href)).
        map(href => this.hrefListeners[href]).
        filter((listener?: UserScriptCallback<T>): listener is UserScriptCallback<T> =>
          typeof listener === "function");

      // execute the listeners
      listeners.forEach(listener => listener(this.context));
    };
  }

  const instance = new UserScript<Context>({
    gameInfo: new GameInfoStore(),
    countryCode: "",
    steam64ID: "",
    setUsernameCmd: -1,
  });

  instance.addStartupCallback(async context => {
    try {
      await context.gameInfo.open();
      /* eslint-disable require-atomic-updates */
      context.countryCode = await getCountryCode();
      context.steam64ID = await tryGetLocalStorageValue(steam64IDKey);
      /* eslint-enable require-atomic-updates */
    } catch (error) {
      console.error(error);
    }
  });

  instance.addPageListener("https://www.allkeyshop.com/blog/list/.+/.+/", setupWishlistMenus);

  instance.start();
})();
