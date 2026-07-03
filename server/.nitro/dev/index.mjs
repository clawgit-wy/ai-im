import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import destr from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/destr/dist/index.mjs';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, createError, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, removeResponseHeader, appendResponseHeader, setResponseHeader, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getRouterParam, readBody, getQuery as getQuery$1, getHeader } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/h3/dist/index.mjs';
import { createHooks } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, decodePath, withLeadingSlash, withoutTrailingSlash } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/scule/dist/index.mjs';
import { getContext } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import path, { resolve, dirname, join } from 'node:path';
import consola from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/nitropack/node_modules/source-map/source-map.js';
import http, { Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/ws/wrapper.mjs';
import fs, { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/pathe/dist/index.mjs';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import Database from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/better-sqlite3/lib/index.js';
import bcrypt from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/bcryptjs/index.js';
import jwt from 'file:///Users/apple/Desktop/ai-im/ai-im/node_modules/jsonwebtoken/index.js';

const serverAssets = [{"baseName":"server","dir":"/Users/apple/Desktop/ai-im/ai-im/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/apple/Desktop/ai-im/ai-im/server"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/apple/Desktop/ai-im/ai-im/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/apple/Desktop/ai-im/ai-im/server/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/apple/Desktop/ai-im/ai-im/server/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/apple/Desktop/ai-im/ai-im/server/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {
      "/api/**": {
        "cors": true,
        "headers": {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
          "access-control-max-age": "0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      },
      "/mercy/**": {
        "cors": true,
        "headers": {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
          "access-control-max-age": "0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    }
  },
  "jwtSecret": "ai-im-dev-secret-key",
  "tokenExpiresIn": 604800
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: undefined,
  AsyncLocalStorage: void 0
});

function isPathInScope(pathname, base) {
  let canonical;
  try {
    const pre = pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\");
    canonical = new URL(pre, "http://_").pathname;
  } catch {
    return false;
  }
  return !base || canonical === base || canonical.startsWith(base + "/");
}

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          if (!isPathInScope(event.path.split("?")[0], strpBase)) {
            throw createError({ statusCode: 400 });
          }
          targetPath = withoutBase(targetPath, strpBase);
        } else if (targetPath.startsWith("//")) {
          targetPath = targetPath.replace(/^\/+/, "/");
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const JWT_SECRET = "ai-im-jwt-secret-2026";
const DB_PATH = path.join(process.cwd(), "server", "data", "ai-im.db");
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
const verifyCodes = /* @__PURE__ */ new Map();
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY,
    name TEXT,
    avatar TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    onlineStatus INTEGER,
    lastOptTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    name TEXT,
    avatar TEXT,
    type INTEGER,
    lastMsg TEXT,
    time INTEGER,
    unread INTEGER,
    aiEnabled INTEGER
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId INTEGER,
    fromUid INTEGER,
    fromName TEXT,
    fromAvatar TEXT,
    type INTEGER,
    content TEXT,
    sendTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid INTEGER,
    sessionId INTEGER,
    username TEXT,
    avatar TEXT,
    role INTEGER,
    onlineStatus INTEGER,
    joinTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    startTime INTEGER,
    endTime INTEGER,
    allDay INTEGER,
    remindTime INTEGER,
    type TEXT,
    completed INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    avatar TEXT,
    prompt TEXT,
    apiKey TEXT,
    endpoint TEXT,
    enabled INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    avatar TEXT,
    systemPrompt TEXT,
    modelConfig TEXT,
    enabled INTEGER,
    createTime INTEGER
  );

  CREATE TABLE IF NOT EXISTS plugins (
    id INTEGER PRIMARY KEY,
    name TEXT,
    description TEXT,
    icon TEXT,
    version TEXT,
    author TEXT,
    status INTEGER,
    enabled INTEGER,
    installTime INTEGER,
    updateTime INTEGER
  );
`);
function todayAt(hours, minutes) {
  const d = /* @__PURE__ */ new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}
function tomorrowAt(hours, minutes) {
  return todayAt(hours, minutes) + 864e5;
}
function seedData() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount > 0) return;
  const hashedPassword = bcrypt.hashSync("123456", 10);
  const now = Date.now();
  const insertUser = db.prepare("INSERT INTO users (uid, name, avatar, email, phone, password, onlineStatus, lastOptTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertUser.run(1, "\u7528\u62371", "\u{1F464}", "user@example.com", "13800138000", hashedPassword, 1, now);
  insertUser.run(2, "\u5F20\u4E09", "\u{1F468}", "zhangsan@example.com", "13800138001", hashedPassword, 2, now - 36e5);
  insertUser.run(3, "\u674E\u56DB", "\u{1F469}", "lisi@example.com", "13800138002", hashedPassword, 1, now - 72e5);
  insertUser.run(4, "\u5C0F\u660E", "\u{1F9D1}", "xiaoming@example.com", "13800138003", hashedPassword, 1, now - 864e5);
  const insertSession = db.prepare("INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertSession.run(1, "AI\u52A9\u624B", "\u{1F916}", 1, "\u4F60\u597D\uFF0C\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u52A9\u4F60\u7684\u5417\uFF1F", now - 18e5, 2, 1);
  insertSession.run(2, "\u5F20\u4E09", "\u{1F468}", 1, "\u4ECA\u5929\u7684\u4F1A\u8BAE\u5B89\u6392\u597D\u4E86", now - 54e5, 0, 0);
  insertSession.run(3, "\u674E\u56DB", "\u{1F469}", 1, "\u6587\u4EF6\u5DF2\u53D1\u9001\uFF0C\u8BF7\u67E5\u6536", now - 864e5, 0, 0);
  insertSession.run(4, "\u65E5\u7A0B\u673A\u5668\u4EBA", "\u{1F916}", 1, "\u660E\u5929\u4E0B\u53483\u70B9\u6709\u4F1A\u8BAE\u5B89\u6392", now - 864e5, 0, 1);
  insertSession.run(5, "\u9879\u76EE\u56E2\u961F\u7FA4", "\u{1F465}", 2, "\u5C0F\u660E: \u9700\u6C42\u6587\u6863\u5DF2\u66F4\u65B0", now - 1728e5, 3, 1);
  insertSession.run(6, "\u6280\u672F\u4EA4\u6D41\u7FA4", "\u{1F465}", 2, "\u738B\u4E94: \u6709\u4EBA\u7528\u8FC7Tauri\u5417\uFF1F", now - 2592e5, 0, 0);
  const insertMessage = db.prepare("INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertMessage.run(1, 0, "AI\u52A9\u624B", "\u{1F916}", 1, "\u4F60\u597D\uFF01\u6211\u662F\u4F60\u7684\u667A\u80FD\u52A9\u624B\uFF0C\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u52A9\u4F60\u7684\u5417\uFF1F", now - 24e5);
  insertMessage.run(1, 1, "\u6211", "\u{1F464}", 1, "\u6211\u60F3\u4E86\u89E3\u4ECA\u5929\u6709\u54EA\u4E9B\u65E5\u7A0B\u5B89\u6392\uFF1F", now - 234e4);
  insertMessage.run(1, 0, "AI\u52A9\u624B", "\u{1F916}", 1, "\u4F60\u4ECA\u5929\u6709\u4EE5\u4E0B\u65E5\u7A0B\u5B89\u6392\uFF1A\n\n\u{1F4C5} 09:00 - \u6668\u4F1A\n\u{1F4C5} 14:00 - \u9879\u76EE\u8BC4\u5BA1\u4F1A\u8BAE\n\u{1F4C5} 16:30 - \u4E0E\u5BA2\u6237\u7535\u8BDD\u6C9F\u901A", now - 228e4);
  insertMessage.run(1, 1, "\u6211", "\u{1F464}", 1, "\u597D\u7684\uFF0C\u5E2E\u6211\u63D0\u9192\u4E00\u4E0B14\u70B9\u7684\u4F1A\u8BAE", now - 222e4);
  insertMessage.run(1, 0, "AI\u52A9\u624B", "\u{1F916}", 1, "\u5DF2\u8BBE\u7F6E\u63D0\u9192\uFF0C\u6211\u4F1A\u572813:50\u63D0\u9192\u4F60\u53C2\u52A0\u9879\u76EE\u8BC4\u5BA1\u4F1A\u8BAE\u3002\u9700\u8981\u6211\u5E2E\u4F60\u51C6\u5907\u4F1A\u8BAE\u6750\u6599\u5417\uFF1F", now - 216e4);
  insertMessage.run(5, 0, "\u7CFB\u7EDF", "\u2699\uFE0F", 7, "\u5F20\u4E09 \u521B\u5EFA\u4E86\u7FA4\u7EC4\u300C\u9879\u76EE\u56E2\u961F\u7FA4\u300D", now - 864e5);
  insertMessage.run(5, 2, "\u5F20\u4E09", "\u{1F468}", 1, "\u5927\u5BB6\u597D\uFF0C\u8FD9\u662F\u6211\u4EEC\u7684\u9879\u76EE\u6C9F\u901A\u7FA4", now - 863e5);
  insertMessage.run(5, 3, "\u674E\u56DB", "\u{1F469}", 1, "\u6536\u5230\uFF01", now - 862e5);
  insertMessage.run(5, 0, "\u65E5\u7A0B\u673A\u5668\u4EBA", "\u{1F916}", 1, "\u68C0\u6D4B\u5230\u7FA4\u7EC4\u5DF2\u521B\u5EFA\uFF0C\u6211\u53EF\u4EE5\u5E2E\u5927\u5BB6\u7BA1\u7406\u65E5\u7A0B\u5B89\u6392\u3002", now - 861e5);
  insertMessage.run(5, 4, "\u5C0F\u660E", "\u{1F9D1}", 1, "\u9700\u6C42\u6587\u6863\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u67E5\u770B", now - 1728e5);
  const insertMember = db.prepare("INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertMember.run(2, 5, "\u5F20\u4E09", "\u{1F468}", 1, 2, now - 864e5);
  insertMember.run(3, 5, "\u674E\u56DB", "\u{1F469}", 2, 1, now - 864e5);
  insertMember.run(4, 5, "\u5C0F\u660E", "\u{1F9D1}", 3, 1, now - 864e5);
  insertMember.run(1, 5, "\u6211", "\u{1F464}", 3, 1, now - 864e5);
  insertMember.run(1, 1, "\u6211", "\u{1F464}", 1, 1, now - 864e5);
  insertMember.run(1, 2, "\u6211", "\u{1F464}", 1, 1, now - 864e5);
  insertMember.run(2, 2, "\u5F20\u4E09", "\u{1F468}", 2, 2, now - 864e5);
  insertMember.run(1, 3, "\u6211", "\u{1F464}", 1, 1, now - 864e5);
  insertMember.run(3, 3, "\u674E\u56DB", "\u{1F469}", 2, 1, now - 864e5);
  insertMember.run(1, 4, "\u6211", "\u{1F464}", 1, 1, now - 864e5);
  insertMember.run(1, 6, "\u6211", "\u{1F464}", 3, 1, now - 864e5);
  const insertSchedule = db.prepare("INSERT INTO schedules (id, title, content, startTime, endTime, allDay, remindTime, type, completed, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertSchedule.run(1, "\u6668\u4F1A", "\u56E2\u961F\u65E5\u5E38\u6C9F\u901A\u4F1A\u8BAE", todayAt(9, 0), todayAt(9, 30), 0, 10, "meeting", 1, now - 864e5);
  insertSchedule.run(2, "\u9879\u76EE\u8BC4\u5BA1\u4F1A\u8BAE", "\u4F1A\u8BAE\u5BA4A301", todayAt(14, 0), todayAt(15, 30), 0, 10, "meeting", 0, now - 864e5);
  insertSchedule.run(3, "\u5BA2\u6237\u7535\u8BDD\u6C9F\u901A", "\u8BA8\u8BBA\u9879\u76EE\u8FDB\u5EA6", todayAt(16, 30), todayAt(17, 0), 0, 5, "call", 0, now - 864e5);
  insertSchedule.run(4, "\u56E2\u961F\u5468\u4F1A", "\u672C\u5468\u5DE5\u4F5C\u603B\u7ED3\u4E0E\u4E0B\u5468\u8BA1\u5212", tomorrowAt(14, 0), tomorrowAt(15, 0), 0, 15, "meeting", 0, now);
  const insertWorkflow = db.prepare("INSERT INTO workflows (id, name, description, avatar, prompt, apiKey, endpoint, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertWorkflow.run(1, "\u65E5\u7A0B\u52A9\u624B", "\u667A\u80FD\u7BA1\u7406\u65E5\u7A0B\u5B89\u6392\uFF0C\u81EA\u52A8\u63D0\u9192\u91CD\u8981\u4E8B\u9879", "\u{1F4C5}", "\u4F60\u662F\u4E00\u4E2A\u65E5\u7A0B\u7BA1\u7406\u52A9\u624B...", "", "", 1, now - 864e5 * 7);
  insertWorkflow.run(2, "\u7FFB\u8BD1\u52A9\u624B", "\u652F\u6301\u591A\u8BED\u8A00\u5B9E\u65F6\u7FFB\u8BD1\uFF0C\u81EA\u52A8\u8BC6\u522B\u8BED\u8A00\u7C7B\u578B", "\u{1F310}", "\u4F60\u662F\u4E00\u4E2A\u7FFB\u8BD1\u52A9\u624B...", "app-dify-xxx", "https://api.dify.ai/v1", 1, now - 864e5 * 5);
  insertWorkflow.run(3, "\u6570\u636E\u5206\u6790", "\u81EA\u52A8\u751F\u6210\u6570\u636E\u62A5\u8868\uFF0C\u667A\u80FD\u5206\u6790\u6570\u636E\u8D8B\u52BF", "\u{1F4CA}", "\u4F60\u662F\u4E00\u4E2A\u6570\u636E\u5206\u6790\u52A9\u624B...", "", "", 0, now - 864e5 * 3);
  insertWorkflow.run(4, "\u90AE\u4EF6\u52A9\u624B", "\u667A\u80FD\u90AE\u4EF6\u7BA1\u7406\uFF0C\u81EA\u52A8\u5206\u7C7B\u548C\u56DE\u590D", "\u{1F4E7}", "\u4F60\u662F\u4E00\u4E2A\u90AE\u4EF6\u52A9\u624B...", "app-dify-yyy", "https://api.dify.ai/v1", 1, now - 864e5);
  insertWorkflow.run(5, "\u6587\u6863\u751F\u6210", "\u6839\u636E\u6A21\u677F\u81EA\u52A8\u751F\u6210\u5404\u7C7B\u6587\u6863", "\u{1F4DD}", "\u4F60\u662F\u4E00\u4E2A\u6587\u6863\u751F\u6210\u52A9\u624B...", "", "", 0, now);
  const insertAgent = db.prepare("INSERT INTO agents (id, name, description, avatar, systemPrompt, modelConfig, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  insertAgent.run(1, "Claude", "\u64C5\u957F\u4EE3\u7801\u751F\u6210\u3001\u6587\u672C\u521B\u4F5C\u548C\u590D\u6742\u63A8\u7406\u4EFB\u52A1\u3002\u9002\u5408\u7F16\u7A0B\u3001\u5199\u4F5C\u548C\u5206\u6790\u573A\u666F\u3002", "\u{1F916}", "You are Claude, a helpful AI assistant.", JSON.stringify({ model: "claude-3-opus", temperature: 0.7, maxTokens: 4096 }), 1, now - 864e5 * 30);
  insertAgent.run(2, "Hermes", "\u4E13\u6CE8\u4E8E\u5BF9\u8BDD\u4EA4\u4E92\u548C\u77E5\u8BC6\u95EE\u7B54\u3002\u54CD\u5E94\u5FEB\u901F\uFF0C\u9002\u5408\u65E5\u5E38\u5BF9\u8BDD\u548C\u5FEB\u901F\u67E5\u8BE2\u3002", "\u{1F9E0}", "You are Hermes, a fast and knowledgeable AI assistant.", JSON.stringify({ model: "hermes-2-pro", temperature: 0.8, maxTokens: 2048 }), 1, now - 864e5 * 20);
  insertAgent.run(3, "\u81EA\u5B9A\u4E49\u667A\u80FD\u4F53", "\u7528\u6237\u81EA\u5B9A\u4E49\u7684\u667A\u80FD\u4F53\uFF0C\u53EF\u4EE5\u914D\u7F6E\u7279\u5B9A\u7684\u6A21\u578B\u3001\u63D0\u793A\u8BCD\u548C\u5DE5\u5177\u94FE\u3002", "\u{1F3AF}", "", JSON.stringify({ model: "gpt-4", temperature: 0.7, maxTokens: 4096 }), 0, now - 864e5);
  const insertPlugin = db.prepare("INSERT INTO plugins (id, name, description, icon, version, author, status, enabled, installTime, updateTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  insertPlugin.run(1, "\u622A\u56FE\u5DE5\u5177", "\u5FEB\u901F\u622A\u56FE\u3001\u6807\u6CE8\u3001\u7F16\u8F91\u548C\u5206\u4EAB\u529F\u80FD\u3002\u652F\u6301\u5168\u5C4F\u3001\u533A\u57DF\u3001\u7A97\u53E3\u622A\u56FE\u3002", "\u{1F4F8}", "1.0.0", "AI-IM Team", 0, 1, now - 864e5 * 30, now - 864e5 * 30);
  insertPlugin.run(2, "IT\u5DE5\u5177\u7BB1", "\u5F00\u53D1\u4EBA\u5458\u5E38\u7528\u5DE5\u5177\u96C6\u5408\uFF1AJSON\u683C\u5F0F\u5316\u3001Base64\u7F16\u7801\u3001\u6B63\u5219\u6D4B\u8BD5\u3001\u65F6\u95F4\u8F6C\u6362\u7B49\u3002", "\u{1F527}", "1.2.0", "AI-IM Team", 0, 1, now - 864e5 * 25, now - 864e5 * 10);
  insertPlugin.run(3, "Markdown\u7F16\u8F91\u5668", "\u5B9E\u65F6\u9884\u89C8Markdown\u7F16\u8F91\uFF0C\u652F\u6301\u5BFC\u51FAPDF\u3001HTML\u7B49\u683C\u5F0F\u3002", "\u{1F4DD}", "1.1.0", "AI-IM Team", 0, 1, now - 864e5 * 20, now - 864e5 * 5);
  insertPlugin.run(4, "\u989C\u8272\u9009\u62E9\u5668", "\u989C\u8272\u62FE\u53D6\u3001\u8F6C\u6362\u548C\u914D\u8272\u65B9\u6848\u751F\u6210\u5DE5\u5177\u3002", "\u{1F3A8}", "0.9.0", "Community", 2, 0, 0, 0);
  insertPlugin.run(5, "\u7F51\u7EDC\u5DE5\u5177", "IP\u67E5\u8BE2\u3001DNS\u89E3\u6790\u3001\u7AEF\u53E3\u626B\u63CF\u3001\u7F51\u7EDC\u6D4B\u901F\u7B49\u5DE5\u5177\u3002", "\u{1F310}", "0.8.0", "Community", 2, 0, 0, 0);
}
seedData();
function success(data, message = "\u64CD\u4F5C\u6210\u529F") {
  return { success: true, code: 200, message, data };
}
function fail(message = "\u64CD\u4F5C\u5931\u8D25", code = 400) {
  return { success: false, code, message, data: null };
}
function listResponse(list, cursor = "", isLast = true) {
  return { cursor, isLast, list };
}
function generateToken(uid) {
  const user = db.prepare("SELECT name FROM users WHERE uid = ?").get(uid);
  return jwt.sign({ uid, name: (user == null ? void 0 : user.name) || "" }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { uid: decoded.uid, name: decoded.name };
  } catch {
    return null;
  }
}
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
function getNextId(table) {
  const idCol = table === "users" ? "uid" : "id";
  const row = db.prepare(`SELECT MAX(${idCol}) as maxId FROM ${table}`).get();
  return ((row == null ? void 0 : row.maxId) || 0) + 1;
}
function notifySession(sessionId, data) {
  const broadcast = globalThis.broadcastToSession;
  if (broadcast) broadcast(sessionId, data);
}
function notifyUser(uid, data) {
  const broadcast = globalThis.broadcastToUser;
  if (broadcast) broadcast(uid, data);
}

const wsConnections = /* @__PURE__ */ new Map();
const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws, request) => {
  const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  const token = url.searchParams.get("token");
  if (!token) {
    ws.close(4001, "\u7F3A\u5C11 token");
    return;
  }
  const user = verifyToken(`Bearer ${token}`);
  if (!user) {
    ws.close(4003, "token \u65E0\u6548\u6216\u5DF2\u8FC7\u671F");
    return;
  }
  const uid = user.uid;
  const existing = wsConnections.get(uid);
  if (existing && existing.readyState === WebSocket.OPEN) {
    existing.close(4e3, "\u91CD\u590D\u767B\u5F55");
  }
  wsConnections.set(uid, ws);
  ws.send(JSON.stringify({ type: "connected", data: { uid, name: user.name } }));
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch {
    }
  });
  ws.on("close", () => {
    if (wsConnections.get(uid) === ws) {
      wsConnections.delete(uid);
    }
  });
  ws.on("error", () => {
    wsConnections.delete(uid);
  });
});
function broadcastToSession(sessionId, data) {
  const members = db.prepare("SELECT uid FROM group_members WHERE sessionId = ?").all(sessionId);
  const message = JSON.stringify({ type: "session", sessionId, data });
  if (members.length > 0) {
    for (const { uid } of members) {
      const ws = wsConnections.get(uid);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  } else {
    for (const [, ws] of wsConnections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  }
}
function broadcastToUser(uid, data) {
  const ws = wsConnections.get(uid);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}
globalThis.broadcastToSession = broadcastToSession;
globalThis.broadcastToUser = broadcastToUser;
globalThis.wsConnections = wsConnections;
const _GgIoiXFOIg6uuPdlZ18ubRCqyIcQsNekfvCiEOeyg = defineNitroPlugin((nitroApp) => {
  const originalListen = http.Server.prototype.listen;
  http.Server.prototype.listen = function(...args) {
    const result = originalListen.apply(this, args);
    this.on("upgrade", (request, socket, head) => {
      const url = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (url.pathname === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    });
    http.Server.prototype.listen = originalListen;
    return result;
  };
});

const plugins = [
  _GgIoiXFOIg6uuPdlZ18ubRCqyIcQsNekfvCiEOeyg
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _OPCn4J = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const _lazy_k3cIXQ = () => Promise.resolve().then(function () { return agent_delete$1; });
const _lazy_FxnxoJ = () => Promise.resolve().then(function () { return agent_post$1; });
const _lazy_HF9agb = () => Promise.resolve().then(function () { return agent_put$1; });
const _lazy_QX1CRL = () => Promise.resolve().then(function () { return detail_get$9; });
const _lazy_fly2EF = () => Promise.resolve().then(function () { return list_get$7; });
const _lazy_u77KmL = () => Promise.resolve().then(function () { return group_post$1; });
const _lazy_zgcoqD = () => Promise.resolve().then(function () { return exit_delete$1; });
const _lazy_hpBAvA = () => Promise.resolve().then(function () { return member_delete$1; });
const _lazy_DQoULj = () => Promise.resolve().then(function () { return member_post$1; });
const _lazy_Knsart = () => Promise.resolve().then(function () { return members_get$1; });
const _lazy_hOD0M8 = () => Promise.resolve().then(function () { return msg_post$1; });
const _lazy_zORw3Z = () => Promise.resolve().then(function () { return page_get$3; });
const _lazy_shXaOi = () => Promise.resolve().then(function () { return read_put$1; });
const _lazy_ZByIxQ = () => Promise.resolve().then(function () { return recall_put$1; });
const _lazy_DcbW7_ = () => Promise.resolve().then(function () { return recv_get$1; });
const _lazy_1_0c6u = () => Promise.resolve().then(function () { return session_delete$1; });
const _lazy_z164kE = () => Promise.resolve().then(function () { return session_post$1; });
const _lazy_czSXb_ = () => Promise.resolve().then(function () { return detail_get$7; });
const _lazy_wxaoeg = () => Promise.resolve().then(function () { return page_get$1; });
const _lazy_G42ZIc = () => Promise.resolve().then(function () { return topUpMsg_post$1; });
const _lazy__XGCKG = () => Promise.resolve().then(function () { return add_post$1; });
const _lazy_347wXP = () => Promise.resolve().then(function () { return change_post$1; });
const _lazy_pRxo3N = () => Promise.resolve().then(function () { return del_post$3; });
const _lazy_cIBWmG = () => Promise.resolve().then(function () { return info_do_post$1; });
const _lazy_i7h0kd = () => Promise.resolve().then(function () { return list_post$5; });
const _lazy_pkhop9 = () => Promise.resolve().then(function () { return phoneByAccount_post$1; });
const _lazy_1v7YU8 = () => Promise.resolve().then(function () { return search_do_post$1; });
const _lazy_N3D_Fs = () => Promise.resolve().then(function () { return updateSign_do_post$1; });
const _lazy_6UQV8d = () => Promise.resolve().then(function () { return add_do_post$1; });
const _lazy__wtkqq = () => Promise.resolve().then(function () { return changeAdmin_post$1; });
const _lazy_CBXoU7 = () => Promise.resolve().then(function () { return create_do_post$1; });
const _lazy_qaA4Lv = () => Promise.resolve().then(function () { return disband_do_post$1; });
const _lazy_8mkqNG = () => Promise.resolve().then(function () { return infoNew_do_post$1; });
const _lazy_NwMKjG = () => Promise.resolve().then(function () { return listNew_do_post$1; });
const _lazy_zajQrc = () => Promise.resolve().then(function () { return quit_do_post$1; });
const _lazy_S5aocg = () => Promise.resolve().then(function () { return remove_do_post$1; });
const _lazy_SsrBt3 = () => Promise.resolve().then(function () { return searchPage_do_post$1; });
const _lazy_kybEjG = () => Promise.resolve().then(function () { return update_do_post$1; });
const _lazy_RnvHRI = () => Promise.resolve().then(function () { return updateNotice_do_post$1; });
const _lazy_q3ryVk = () => Promise.resolve().then(function () { return clear_do_post$1; });
const _lazy_Ul1nRG = () => Promise.resolve().then(function () { return offlineAndTop_do_post$1; });
const _lazy_GvuPrS = () => Promise.resolve().then(function () { return read_do_post$1; });
const _lazy_khgfvV = () => Promise.resolve().then(function () { return readMsg_do_post$1; });
const _lazy_6fmhXM = () => Promise.resolve().then(function () { return remind_do_post$1; });
const _lazy_6yMhB9 = () => Promise.resolve().then(function () { return remindList_do_post$1; });
const _lazy_fIjKeC = () => Promise.resolve().then(function () { return status_do_post$1; });
const _lazy_gh9TiM = () => Promise.resolve().then(function () { return sync_do_post$1; });
const _lazy_bXjNaC = () => Promise.resolve().then(function () { return top_do_post$1; });
const _lazy_Di3cBH = () => Promise.resolve().then(function () { return topList_do_post$1; });
const _lazy_U_kiaq = () => Promise.resolve().then(function () { return unReadNum_do_post$1; });
const _lazy_FimE1P = () => Promise.resolve().then(function () { return withdraw_do_post$1; });
const _lazy_TX9djY = () => Promise.resolve().then(function () { return emp_do_post$1; });
const _lazy_WeQk5c = () => Promise.resolve().then(function () { return listYxt_do_post$1; });
const _lazy_kh8PX4 = () => Promise.resolve().then(function () { return plugin_put$1; });
const _lazy_exzOCj = () => Promise.resolve().then(function () { return detail_get$5; });
const _lazy_UWeRUR = () => Promise.resolve().then(function () { return install_post$1; });
const _lazy_Mu9zfp = () => Promise.resolve().then(function () { return list_get$5; });
const _lazy_1QO13L = () => Promise.resolve().then(function () { return toggle_put$1; });
const _lazy_LQuTyn = () => Promise.resolve().then(function () { return uninstall_delete$1; });
const _lazy_gxuuhy = () => Promise.resolve().then(function () { return robot_delete$1; });
const _lazy_pH6hCT = () => Promise.resolve().then(function () { return robot_post$1; });
const _lazy_3oomR3 = () => Promise.resolve().then(function () { return robot_put$1; });
const _lazy_ivcIYR = () => Promise.resolve().then(function () { return detail_get$3; });
const _lazy_UmvGdP = () => Promise.resolve().then(function () { return list_get$3; });
const _lazy_moofoa = () => Promise.resolve().then(function () { return schedule_delete$1; });
const _lazy_Yw3QEQ = () => Promise.resolve().then(function () { return schedule_post$1; });
const _lazy_aUJlkQ = () => Promise.resolve().then(function () { return schedule_put$1; });
const _lazy_qYOeMT = () => Promise.resolve().then(function () { return detail_get$1; });
const _lazy_uBtP8W = () => Promise.resolve().then(function () { return list_get$1; });
const _lazy_boYebj = () => Promise.resolve().then(function () { return del_post$1; });
const _lazy_uTZEit = () => Promise.resolve().then(function () { return list_post$3; });
const _lazy_fxeC1E = () => Promise.resolve().then(function () { return close_post$1; });
const _lazy_vp6wkr = () => Promise.resolve().then(function () { return list_post$1; });
const _lazy_r2WjdT = () => Promise.resolve().then(function () { return open_post$1; });
const _lazy_gnny0D = () => Promise.resolve().then(function () { return reset_post$1; });
const _lazy_vglDQ0 = () => Promise.resolve().then(function () { return info_get$1; });
const _lazy_pQPF0s = () => Promise.resolve().then(function () { return info_put$1; });
const _lazy_xx9rQD = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_IdprHp = () => Promise.resolve().then(function () { return logout_post$1; });
const _lazy_TCNe8g = () => Promise.resolve().then(function () { return onlines_do_post$1; });
const _lazy_xr_yUB = () => Promise.resolve().then(function () { return onlineStatus_post$1; });
const _lazy_RBQWzV = () => Promise.resolve().then(function () { return register_post$1; });
const _lazy_q6CkIb = () => Promise.resolve().then(function () { return resetPassword_post$1; });
const _lazy_sGZ0Kv = () => Promise.resolve().then(function () { return sendCode_post$1; });
const _lazy_0Q6UZo = () => Promise.resolve().then(function () { return meetingInfo_post$1; });
const _lazy_JH18cz = () => Promise.resolve().then(function () { return login_do_post$1; });
const _lazy_z3D4S9 = () => Promise.resolve().then(function () { return logout_do_post$1; });

const handlers = [
  { route: '', handler: _OPCn4J, lazy: false, middleware: true, method: undefined },
  { route: '/api/agent', handler: _lazy_k3cIXQ, lazy: true, middleware: false, method: "delete" },
  { route: '/api/agent', handler: _lazy_FxnxoJ, lazy: true, middleware: false, method: "post" },
  { route: '/api/agent', handler: _lazy_HF9agb, lazy: true, middleware: false, method: "put" },
  { route: '/api/agent/detail', handler: _lazy_QX1CRL, lazy: true, middleware: false, method: "get" },
  { route: '/api/agent/list', handler: _lazy_fly2EF, lazy: true, middleware: false, method: "get" },
  { route: '/api/chat/group', handler: _lazy_u77KmL, lazy: true, middleware: false, method: "post" },
  { route: '/api/chat/group/exit', handler: _lazy_zgcoqD, lazy: true, middleware: false, method: "delete" },
  { route: '/api/chat/group/member', handler: _lazy_hpBAvA, lazy: true, middleware: false, method: "delete" },
  { route: '/api/chat/group/member', handler: _lazy_DQoULj, lazy: true, middleware: false, method: "post" },
  { route: '/api/chat/group/members', handler: _lazy_Knsart, lazy: true, middleware: false, method: "get" },
  { route: '/api/chat/msg', handler: _lazy_hOD0M8, lazy: true, middleware: false, method: "post" },
  { route: '/api/chat/msg/page', handler: _lazy_zORw3Z, lazy: true, middleware: false, method: "get" },
  { route: '/api/chat/msg/read', handler: _lazy_shXaOi, lazy: true, middleware: false, method: "put" },
  { route: '/api/chat/msg/recall', handler: _lazy_ZByIxQ, lazy: true, middleware: false, method: "put" },
  { route: '/api/chat/msg/recv', handler: _lazy_DcbW7_, lazy: true, middleware: false, method: "get" },
  { route: '/api/chat/session', handler: _lazy_1_0c6u, lazy: true, middleware: false, method: "delete" },
  { route: '/api/chat/session', handler: _lazy_z164kE, lazy: true, middleware: false, method: "post" },
  { route: '/api/chat/session/detail', handler: _lazy_czSXb_, lazy: true, middleware: false, method: "get" },
  { route: '/api/chat/session/page', handler: _lazy_wxaoeg, lazy: true, middleware: false, method: "get" },
  { route: '/api/chatTopUp/topUpMsg', handler: _lazy_G42ZIc, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/add', handler: _lazy__XGCKG, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/change', handler: _lazy_347wXP, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/del', handler: _lazy_pRxo3N, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/info.do', handler: _lazy_cIBWmG, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/list', handler: _lazy_i7h0kd, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/phoneByAccount', handler: _lazy_pkhop9, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/search.do', handler: _lazy_1v7YU8, lazy: true, middleware: false, method: "post" },
  { route: '/api/contact/updateSign.do', handler: _lazy_N3D_Fs, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/add.do', handler: _lazy_6UQV8d, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/changeAdmin', handler: _lazy__wtkqq, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/create.do', handler: _lazy_CBXoU7, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/disband.do', handler: _lazy_qaA4Lv, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/infoNew.do', handler: _lazy_8mkqNG, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/listNew.do', handler: _lazy_NwMKjG, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/quit.do', handler: _lazy_zajQrc, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/remove.do', handler: _lazy_S5aocg, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/searchPage.do', handler: _lazy_SsrBt3, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/update.do', handler: _lazy_kybEjG, lazy: true, middleware: false, method: "post" },
  { route: '/api/group/updateNotice.do', handler: _lazy_RnvHRI, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/clear.do', handler: _lazy_q3ryVk, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/offlineAndTop.do', handler: _lazy_Ul1nRG, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/read.do', handler: _lazy_GvuPrS, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/readMsg.do', handler: _lazy_khgfvV, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/remind.do', handler: _lazy_6fmhXM, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/remindList.do', handler: _lazy_6yMhB9, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/status.do', handler: _lazy_fIjKeC, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/sync.do', handler: _lazy_gh9TiM, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/top.do', handler: _lazy_bXjNaC, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/topList.do', handler: _lazy_Di3cBH, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/unReadNum.do', handler: _lazy_U_kiaq, lazy: true, middleware: false, method: "post" },
  { route: '/api/msg/withdraw.do', handler: _lazy_FimE1P, lazy: true, middleware: false, method: "post" },
  { route: '/api/org/emp.do', handler: _lazy_TX9djY, lazy: true, middleware: false, method: "post" },
  { route: '/api/org/listYxt.do', handler: _lazy_WeQk5c, lazy: true, middleware: false, method: "post" },
  { route: '/api/plugin', handler: _lazy_kh8PX4, lazy: true, middleware: false, method: "put" },
  { route: '/api/plugin/detail', handler: _lazy_exzOCj, lazy: true, middleware: false, method: "get" },
  { route: '/api/plugin/install', handler: _lazy_UWeRUR, lazy: true, middleware: false, method: "post" },
  { route: '/api/plugin/list', handler: _lazy_Mu9zfp, lazy: true, middleware: false, method: "get" },
  { route: '/api/plugin/toggle', handler: _lazy_1QO13L, lazy: true, middleware: false, method: "put" },
  { route: '/api/plugin/uninstall', handler: _lazy_LQuTyn, lazy: true, middleware: false, method: "delete" },
  { route: '/api/robot', handler: _lazy_gxuuhy, lazy: true, middleware: false, method: "delete" },
  { route: '/api/robot', handler: _lazy_pH6hCT, lazy: true, middleware: false, method: "post" },
  { route: '/api/robot', handler: _lazy_3oomR3, lazy: true, middleware: false, method: "put" },
  { route: '/api/robot/detail', handler: _lazy_ivcIYR, lazy: true, middleware: false, method: "get" },
  { route: '/api/robot/list', handler: _lazy_UmvGdP, lazy: true, middleware: false, method: "get" },
  { route: '/api/schedule', handler: _lazy_moofoa, lazy: true, middleware: false, method: "delete" },
  { route: '/api/schedule', handler: _lazy_Yw3QEQ, lazy: true, middleware: false, method: "post" },
  { route: '/api/schedule', handler: _lazy_aUJlkQ, lazy: true, middleware: false, method: "put" },
  { route: '/api/schedule/detail', handler: _lazy_qYOeMT, lazy: true, middleware: false, method: "get" },
  { route: '/api/schedule/list', handler: _lazy_uBtP8W, lazy: true, middleware: false, method: "get" },
  { route: '/api/session/del', handler: _lazy_boYebj, lazy: true, middleware: false, method: "post" },
  { route: '/api/session/list', handler: _lazy_uTZEit, lazy: true, middleware: false, method: "post" },
  { route: '/api/session/msgNotice/close', handler: _lazy_fxeC1E, lazy: true, middleware: false, method: "post" },
  { route: '/api/session/msgNotice/list', handler: _lazy_vp6wkr, lazy: true, middleware: false, method: "post" },
  { route: '/api/session/msgNotice/open', handler: _lazy_r2WjdT, lazy: true, middleware: false, method: "post" },
  { route: '/api/session/msgNotice/reset', handler: _lazy_gnny0D, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/info', handler: _lazy_vglDQ0, lazy: true, middleware: false, method: "get" },
  { route: '/api/user/info', handler: _lazy_pQPF0s, lazy: true, middleware: false, method: "put" },
  { route: '/api/user/login', handler: _lazy_xx9rQD, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/logout', handler: _lazy_IdprHp, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/onlines.do', handler: _lazy_TCNe8g, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/onlineStatus', handler: _lazy_xr_yUB, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/register', handler: _lazy_RBQWzV, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/reset-password', handler: _lazy_q6CkIb, lazy: true, middleware: false, method: "post" },
  { route: '/api/user/send-code', handler: _lazy_sGZ0Kv, lazy: true, middleware: false, method: "post" },
  { route: '/api/yml/meetingInfo', handler: _lazy_0Q6UZo, lazy: true, middleware: false, method: "post" },
  { route: '/mercy/app/auth/login.do', handler: _lazy_JH18cz, lazy: true, middleware: false, method: "post" },
  { route: '/mercy/app/user/logout.do', handler: _lazy_z3D4S9, lazy: true, middleware: false, method: "post" }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineNitroPlugin(def) {
  return def;
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const agent_delete = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u667A\u80FD\u4F53ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const result = db.prepare("DELETE FROM agents WHERE id = ?").run(id);
  if (result.changes === 0) {
    return fail("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728", 404);
  }
  return success(null, "\u5220\u9664\u667A\u80FD\u4F53\u6210\u529F");
});

const agent_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: agent_delete
});

const agent_post = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.name) {
    return fail("\u667A\u80FD\u4F53\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const id = getNextId("agents");
  const modelConfig = body.modelConfig || { model: "gpt-4", temperature: 0.7, maxTokens: 4096 };
  const agent = {
    id,
    name: body.name,
    description: body.description || "",
    avatar: body.avatar || "\u{1F916}",
    systemPrompt: body.systemPrompt || "",
    modelConfig,
    enabled: body.enabled !== void 0 ? body.enabled ? 1 : 0 : 1,
    createTime: Date.now()
  };
  db.prepare(
    "INSERT INTO agents (id, name, description, avatar, systemPrompt, modelConfig, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(agent.id, agent.name, agent.description, agent.avatar, agent.systemPrompt, JSON.stringify(modelConfig), agent.enabled, agent.createTime);
  return success(agent, "\u521B\u5EFA\u667A\u80FD\u4F53\u6210\u529F");
});

const agent_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: agent_post
});

const agent_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.id) {
    return fail("\u667A\u80FD\u4F53ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const agent = db.prepare("SELECT id FROM agents WHERE id = ?").get(body.id);
  if (!agent) {
    return fail("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728", 404);
  }
  const fields = [];
  const values = [];
  if (body.name !== void 0) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.description !== void 0) {
    fields.push("description = ?");
    values.push(body.description);
  }
  if (body.avatar !== void 0) {
    fields.push("avatar = ?");
    values.push(body.avatar);
  }
  if (body.systemPrompt !== void 0) {
    fields.push("systemPrompt = ?");
    values.push(body.systemPrompt);
  }
  if (body.modelConfig !== void 0) {
    fields.push("modelConfig = ?");
    values.push(JSON.stringify(body.modelConfig));
  }
  if (body.enabled !== void 0) {
    fields.push("enabled = ?");
    values.push(body.enabled ? 1 : 0);
  }
  if (fields.length > 0) {
    values.push(body.id);
    db.prepare(`UPDATE agents SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  return success(null, "\u66F4\u65B0\u667A\u80FD\u4F53\u6210\u529F");
});

const agent_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: agent_put
});

const detail_get$8 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u667A\u80FD\u4F53ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const row = db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
  if (!row) {
    return fail("\u667A\u80FD\u4F53\u4E0D\u5B58\u5728", 404);
  }
  const agent = {
    ...row,
    modelConfig: row.modelConfig ? JSON.parse(row.modelConfig) : {}
  };
  return success(agent);
});

const detail_get$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: detail_get$8
});

const list_get$6 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const rows = db.prepare("SELECT * FROM agents ORDER BY createTime DESC").all();
  const agents = rows.map((row) => ({
    ...row,
    modelConfig: row.modelConfig ? JSON.parse(row.modelConfig) : {}
  }));
  return success(listResponse(agents));
});

const list_get$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_get$6
});

const group_post = defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { groupName, avatar, uidList } = body;
  if (!groupName) {
    return fail("\u7FA4\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
  }
  if (!Array.isArray(uidList) || uidList.length === 0) {
    return fail("\u8BF7\u9009\u62E9\u7FA4\u6210\u5458");
  }
  const sessionId = getNextId("sessions");
  const now = Date.now();
  db.prepare(
    "INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(sessionId, groupName, avatar || "\u{1F465}", 2, "\u7FA4\u7EC4\u5DF2\u521B\u5EFA", now, 0, 0);
  const memberUids = Array.from(/* @__PURE__ */ new Set([user.uid, ...uidList]));
  const insertMember = db.prepare(
    "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const uid of memberUids) {
    const u = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(uid);
    insertMember.run(uid, sessionId, (u == null ? void 0 : u.name) || "\u672A\u77E5\u7528\u6237", (u == null ? void 0 : u.avatar) || "\u{1F464}", uid === user.uid ? 1 : 3, (u == null ? void 0 : u.onlineStatus) || 1, now);
  }
  db.prepare(
    "INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(sessionId, 0, "\u7CFB\u7EDF", "\u2699\uFE0F", 7, `${user.name} \u521B\u5EFA\u4E86\u7FA4\u7EC4\u300C${groupName}\u300D`, now);
  return success({ id: sessionId }, "\u521B\u5EFA\u7FA4\u7EC4\u6210\u529F");
});

const group_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: group_post
});

const exit_delete = defineEventHandler((event) => {
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const sessionId = Number(query.sessionId);
  if (!sessionId) {
    return fail("\u7F3A\u5C11\u4F1A\u8BDDID\u53C2\u6570");
  }
  const session = db.prepare("SELECT id FROM sessions WHERE id = ?").get(sessionId);
  if (!session) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728", 404);
  }
  const member = db.prepare("SELECT role FROM group_members WHERE sessionId = ? AND uid = ?").get(sessionId, user.uid);
  if (!member) {
    return fail("\u60A8\u4E0D\u662F\u8BE5\u7FA4\u6210\u5458", 400);
  }
  if (member.role === 1) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    db.prepare("DELETE FROM messages WHERE sessionId = ?").run(sessionId);
    db.prepare("DELETE FROM group_members WHERE sessionId = ?").run(sessionId);
    return success(null, "\u7FA4\u7EC4\u5DF2\u89E3\u6563");
  }
  db.prepare("DELETE FROM group_members WHERE sessionId = ? AND uid = ?").run(sessionId, user.uid);
  db.prepare(
    "INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(sessionId, 0, "\u7CFB\u7EDF", "\u2699\uFE0F", 7, `${user.name} \u9000\u51FA\u4E86\u7FA4\u7EC4`, Date.now());
  return success(null, "\u9000\u51FA\u7FA4\u7EC4\u6210\u529F");
});

const exit_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: exit_delete
});

const member_delete = defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { sessionId, uid } = body;
  if (!sessionId || !uid) {
    return fail("\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570");
  }
  const session = db.prepare("SELECT id FROM sessions WHERE id = ?").get(sessionId);
  if (!session) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728", 404);
  }
  const operator = db.prepare("SELECT role FROM group_members WHERE sessionId = ? AND uid = ?").get(sessionId, user.uid);
  if (!operator || operator.role !== 1 && operator.role !== 2) {
    return fail("\u6CA1\u6709\u6743\u9650\u79FB\u9664\u6210\u5458", 403);
  }
  const target = db.prepare("SELECT username, role FROM group_members WHERE sessionId = ? AND uid = ?").get(sessionId, uid);
  if (!target) {
    return fail("\u6210\u5458\u4E0D\u5B58\u5728", 404);
  }
  if (target.role === 1) {
    return fail("\u4E0D\u80FD\u79FB\u9664\u7FA4\u4E3B", 403);
  }
  db.prepare("DELETE FROM group_members WHERE sessionId = ? AND uid = ?").run(sessionId, uid);
  db.prepare(
    "INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(sessionId, 0, "\u7CFB\u7EDF", "\u2699\uFE0F", 7, `${target.username} \u88AB ${user.name} \u79FB\u51FA\u7FA4\u7EC4`, Date.now());
  return success(null, "\u79FB\u9664\u6210\u5458\u6210\u529F");
});

const member_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: member_delete
});

const member_post = defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { sessionId, uidList } = body;
  if (!sessionId) {
    return fail("\u7F3A\u5C11\u4F1A\u8BDDID\u53C2\u6570");
  }
  if (!Array.isArray(uidList) || uidList.length === 0) {
    return fail("\u8BF7\u9009\u62E9\u8981\u6DFB\u52A0\u7684\u6210\u5458");
  }
  const session = db.prepare("SELECT id FROM sessions WHERE id = ?").get(sessionId);
  if (!session) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728", 404);
  }
  const existingMembers = db.prepare("SELECT uid FROM group_members WHERE sessionId = ?").all(sessionId);
  const existingUids = new Set(existingMembers.map((m) => m.uid));
  const now = Date.now();
  const newNames = [];
  const insertMember = db.prepare(
    "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const uid of uidList) {
    if (existingUids.has(uid)) continue;
    const u = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(uid);
    if (!u) continue;
    insertMember.run(uid, sessionId, u.name, u.avatar, 3, u.onlineStatus, now);
    newNames.push(u.name);
  }
  const names = newNames.join("\u3001");
  if (names) {
    db.prepare(
      "INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(sessionId, 0, "\u7CFB\u7EDF", "\u2699\uFE0F", 7, `${user.name} \u9080\u8BF7 ${names} \u52A0\u5165\u7FA4\u7EC4`, now);
  }
  return success(null, "\u6DFB\u52A0\u6210\u5458\u6210\u529F");
});

const member_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: member_post
});

const members_get = defineEventHandler((event) => {
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const sessionId = Number(query.sessionId);
  if (!sessionId) {
    return fail("\u7F3A\u5C11\u4F1A\u8BDDID\u53C2\u6570");
  }
  const members = db.prepare("SELECT uid, sessionId, username, avatar, role, onlineStatus, joinTime FROM group_members WHERE sessionId = ?").all(sessionId);
  return success(listResponse(members), "\u83B7\u53D6\u7FA4\u6210\u5458\u6210\u529F");
});

const members_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: members_get
});

const msg_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const user = verifyToken(getHeader(event, "authorization"));
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const { sessionId, msgType, body: msgBody } = body;
  const content = (msgBody == null ? void 0 : msgBody.content) || "";
  const result = db.prepare(
    "INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(sessionId, user.uid, user.name, "\u{1F464}", msgType, content, Date.now());
  const messageId = result.lastInsertRowid;
  db.prepare("UPDATE sessions SET lastMsg = ?, time = ? WHERE id = ?").run(content, Date.now(), sessionId);
  notifySession(sessionId, {
    type: "message",
    sessionId,
    message: {
      id: messageId,
      sessionId,
      fromUid: user.uid,
      fromName: user.name,
      fromAvatar: "\u{1F464}",
      type: msgType,
      body: { content },
      sendTime: Date.now()
    }
  });
  return success({
    fromUser: {
      uid: user.uid,
      username: user.name,
      avatar: "\u{1F464}"
    },
    message: {
      id: messageId,
      sessionId,
      type: msgType,
      body: { content },
      sendTime: Date.now(),
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: (/* @__PURE__ */ new Date()).toLocaleTimeString()
  });
});

const msg_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: msg_post
});

const page_get$2 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const sessionId = Number(query.sessionId);
  const cursor = query.cursor ? Number(query.cursor) : 0;
  const size = Number(query.size) || 20;
  let allMessages;
  if (cursor > 0) {
    allMessages = db.prepare("SELECT * FROM messages WHERE sessionId = ? AND id < ? ORDER BY id DESC LIMIT ?").all(sessionId, cursor, size);
  } else {
    allMessages = db.prepare("SELECT * FROM messages WHERE sessionId = ? ORDER BY id DESC LIMIT ?").all(sessionId, size);
  }
  allMessages.reverse();
  const list = allMessages.map((msg) => ({
    fromUser: {
      uid: msg.fromUid,
      username: msg.fromName,
      avatar: msg.fromAvatar
    },
    message: {
      id: msg.id,
      sessionId: msg.sessionId,
      type: msg.type,
      body: { content: msg.content },
      sendTime: msg.sendTime,
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: new Date(msg.sendTime).toLocaleTimeString()
  }));
  const isLast = allMessages.length < size;
  const newCursor = allMessages.length > 0 ? String(allMessages[0].id) : "";
  return success(listResponse(list, newCursor, isLast));
});

const page_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: page_get$2
});

const read_put = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { sessionId } = body;
  const result = db.prepare("UPDATE sessions SET unread = 0 WHERE id = ?").run(sessionId);
  if (result.changes === 0) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728");
  }
  return success(null);
});

const read_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: read_put
});

const recall_put = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { msgId, sessionId } = body;
  const result = db.prepare("UPDATE messages SET content = ? WHERE id = ? AND sessionId = ?").run("\u6D88\u606F\u5DF2\u64A4\u56DE", msgId, sessionId);
  if (result.changes === 0) {
    return fail("\u6D88\u606F\u4E0D\u5B58\u5728");
  }
  notifySession(sessionId, { type: "recall", sessionId, msgId });
  return success(null);
});

const recall_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: recall_put
});

const recv_get = defineEventHandler((event) => {
  const query = getQuery$1(event);
  const sessionId = query.sessionId ? Number(query.sessionId) : 0;
  const lastTime = query.lastTime ? Number(query.lastTime) : 0;
  let recentMessages = [];
  if (sessionId > 0) {
    if (lastTime > 0) {
      recentMessages = db.prepare("SELECT * FROM messages WHERE sessionId = ? AND sendTime > ? ORDER BY sendTime ASC").all(sessionId, lastTime);
    } else {
      recentMessages = db.prepare("SELECT * FROM messages WHERE sessionId = ? ORDER BY sendTime DESC LIMIT 20").all(sessionId);
      recentMessages.reverse();
    }
  } else {
    if (lastTime > 0) {
      recentMessages = db.prepare("SELECT * FROM messages WHERE sendTime > ? ORDER BY sendTime ASC").all(lastTime);
    } else {
      recentMessages = db.prepare("SELECT * FROM messages ORDER BY sendTime DESC LIMIT 20").all();
      recentMessages.reverse();
    }
  }
  const list = recentMessages.map((msg) => ({
    fromUser: {
      uid: msg.fromUid,
      username: msg.fromName,
      avatar: msg.fromAvatar
    },
    message: {
      id: msg.id,
      sessionId: msg.sessionId,
      type: msg.type,
      body: { content: msg.content },
      sendTime: msg.sendTime,
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: new Date(msg.sendTime).toLocaleTimeString()
  }));
  return success(listResponse(list));
});

const recv_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: recv_get
});

const session_delete = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u7F3A\u5C11\u4F1A\u8BDDID\u53C2\u6570");
  }
  const session = db.prepare("SELECT id FROM sessions WHERE id = ?").get(id);
  if (!session) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728", 404);
  }
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
  db.prepare("DELETE FROM messages WHERE sessionId = ?").run(id);
  db.prepare("DELETE FROM group_members WHERE sessionId = ?").run(id);
  return success(null, "\u5220\u9664\u4F1A\u8BDD\u6210\u529F");
});

const session_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: session_delete
});

const session_post = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const id = getNextId("sessions");
  const sessionType = body.type || 1;
  const newSession = {
    id,
    name: body.name || "\u65B0\u4F1A\u8BDD",
    avatar: body.avatar || "\u{1F4AC}",
    type: sessionType,
    lastMsg: "",
    time: Date.now(),
    unread: 0,
    aiEnabled: body.aiEnabled ? 1 : 0
  };
  db.prepare(
    "INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(newSession.id, newSession.name, newSession.avatar, newSession.type, newSession.lastMsg, newSession.time, newSession.unread, newSession.aiEnabled);
  const now = Date.now();
  const creatorUser = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(user.uid);
  db.prepare(
    "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(user.uid, id, (creatorUser == null ? void 0 : creatorUser.name) || user.name, (creatorUser == null ? void 0 : creatorUser.avatar) || "\u{1F464}", 1, (creatorUser == null ? void 0 : creatorUser.onlineStatus) || 1, now);
  if (sessionType === 1 && body.targetUid) {
    const targetUser = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(body.targetUid);
    if (targetUser) {
      db.prepare(
        "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(body.targetUid, id, targetUser.name, targetUser.avatar, 3, targetUser.onlineStatus, now);
      notifyUser(body.targetUid, {
        type: "session",
        sessionId: id,
        data: { type: "session_update", data: { sessionId: id, action: "created" } }
      });
    }
  }
  return success(newSession, "\u521B\u5EFA\u4F1A\u8BDD\u6210\u529F");
});

const session_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: session_post
});

const detail_get$6 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u7F3A\u5C11\u4F1A\u8BDDID\u53C2\u6570");
  }
  const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id);
  if (!session) {
    return fail("\u4F1A\u8BDD\u4E0D\u5B58\u5728", 404);
  }
  return success(session, "\u83B7\u53D6\u4F1A\u8BDD\u8BE6\u60C5\u6210\u529F");
});

const detail_get$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: detail_get$6
});

const page_get = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const rows = db.prepare("SELECT * FROM sessions ORDER BY time DESC").all();
  return success(listResponse(rows), "\u83B7\u53D6\u4F1A\u8BDD\u5217\u8868\u6210\u529F");
});

const page_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: page_get
});

const topUpMsg_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const topUpMsg_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: topUpMsg_post
});

const add_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const add_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: add_post
});

const change_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const change_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: change_post
});

const del_post$2 = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const del_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: del_post$2
});

const info_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const uid = Number(body == null ? void 0 : body.uid);
  const user = db.prepare("SELECT * FROM users WHERE uid = ?").get(uid);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  const ytUser = {
    uid: String(user.uid),
    name: user.name,
    headUrl: user.avatar,
    mobile: user.phone,
    email: user.email,
    sign: "",
    online: String(user.onlineStatus)
  };
  return success(ytUser);
});

const info_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: info_do_post
});

const list_post$4 = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  const rows = db.prepare("SELECT * FROM users").all();
  const list = rows.map((u) => ({
    uid: String(u.uid),
    name: u.name,
    headUrl: u.avatar,
    mobile: u.phone,
    email: u.email,
    sign: "",
    online: String(u.onlineStatus)
  }));
  return success(listResponse(list, "", true));
});

const list_post$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$4
});

const phoneByAccount_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const account = body == null ? void 0 : body.account;
  const user = db.prepare("SELECT phone FROM users WHERE email = ? OR phone = ? OR name = ?").get(account, account, account);
  return success({ phone: (user == null ? void 0 : user.phone) || "" });
});

const phoneByAccount_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: phoneByAccount_post
});

const search_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const keyword = (body == null ? void 0 : body.keyword) || "";
  const rows = db.prepare("SELECT * FROM users WHERE name LIKE ?").all(`%${keyword}%`);
  const list = rows.map((u) => ({
    uid: String(u.uid),
    name: u.name,
    headUrl: u.avatar,
    mobile: u.phone,
    email: u.email,
    sign: "",
    online: String(u.onlineStatus)
  }));
  return success(listResponse(list, "", true));
});

const search_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: search_do_post
});

const updateSign_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const updateSign_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: updateSign_do_post
});

const add_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { group_id, uidList } = body || {};
  const gid = Number(group_id);
  const now = Date.now();
  const insertMember = db.prepare(
    "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const raw of Array.isArray(uidList) ? uidList : []) {
    const uid = Number(raw);
    const u = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(uid);
    insertMember.run(uid, gid, (u == null ? void 0 : u.name) || "\u672A\u77E5\u7528\u6237", (u == null ? void 0 : u.avatar) || "\u{1F464}", 3, (u == null ? void 0 : u.onlineStatus) || 1, now);
  }
  return success(null);
});

const add_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: add_do_post
});

const changeAdmin_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { group_id, uid } = body || {};
  const gid = Number(group_id);
  const newOwner = Number(uid);
  db.prepare("UPDATE group_members SET role = 3 WHERE sessionId = ? AND role = 1").run(gid);
  db.prepare("UPDATE group_members SET role = 1 WHERE sessionId = ? AND uid = ?").run(gid, newOwner);
  return success(null);
});

const changeAdmin_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: changeAdmin_post
});

const create_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { name, avatar, uidList } = body || {};
  const id = getNextId("sessions");
  db.prepare(
    "INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, name || "", avatar || "\u{1F465}", 2, "", Date.now(), 0, 0);
  const now = Date.now();
  const memberUids = Array.from(/* @__PURE__ */ new Set([tokenUser.uid, ...Array.isArray(uidList) ? uidList.map((u) => Number(u)) : []]));
  const insertMember = db.prepare(
    "INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  for (const uid of memberUids) {
    const u = db.prepare("SELECT name, avatar, onlineStatus FROM users WHERE uid = ?").get(uid);
    insertMember.run(uid, id, (u == null ? void 0 : u.name) || "\u672A\u77E5\u7528\u6237", (u == null ? void 0 : u.avatar) || "\u{1F464}", uid === tokenUser.uid ? 1 : 3, (u == null ? void 0 : u.onlineStatus) || 1, now);
  }
  for (const uid of memberUids) {
    if (uid !== tokenUser.uid) {
      notifyUser(uid, {
        type: "session",
        sessionId: id,
        data: { type: "session_update", data: { sessionId: id, action: "created" } }
      });
    }
  }
  return success({ group_id: id });
});

const create_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_do_post
});

const disband_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const gid = Number(body == null ? void 0 : body.group_id);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(gid);
  db.prepare("DELETE FROM group_members WHERE sessionId = ?").run(gid);
  db.prepare("DELETE FROM messages WHERE sessionId = ?").run(gid);
  return success(null);
});

const disband_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: disband_do_post
});

const infoNew_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const group_id = Number(body == null ? void 0 : body.group_id);
  const session = db.prepare("SELECT * FROM sessions WHERE id = ? AND type = 2").get(group_id);
  const members = db.prepare("SELECT * FROM group_members WHERE sessionId = ?").all(group_id);
  const mappedMembers = members.map((m) => ({
    uid: m.uid,
    username: m.username,
    avatar: m.avatar,
    role: m.role,
    onlineStatus: m.onlineStatus,
    joinTime: m.joinTime
  }));
  return success({
    group_id,
    name: (session == null ? void 0 : session.name) || "",
    avatar: (session == null ? void 0 : session.avatar) || "",
    notice: "",
    user_num: mappedMembers.length,
    members: mappedMembers
  });
});

const infoNew_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: infoNew_do_post
});

const listNew_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  const rows = db.prepare("SELECT * FROM sessions WHERE type = 2").all();
  const list = rows.map((s) => ({
    group_id: s.id,
    name: s.name,
    avatar: s.avatar,
    user_num: 1
  }));
  return success(listResponse(list, "", true));
});

const listNew_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: listNew_do_post
});

const quit_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const gid = Number(body == null ? void 0 : body.group_id);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(gid);
  db.prepare("DELETE FROM group_members WHERE sessionId = ?").run(gid);
  return success(null);
});

const quit_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: quit_do_post
});

const remove_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { group_id, uidList } = body || {};
  const gid = Number(group_id);
  const del = db.prepare("DELETE FROM group_members WHERE sessionId = ? AND uid = ?");
  for (const raw of Array.isArray(uidList) ? uidList : []) {
    del.run(gid, Number(raw));
  }
  return success(null);
});

const remove_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: remove_do_post
});

const searchPage_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const keyword = (body == null ? void 0 : body.keyword) || "";
  const rows = db.prepare("SELECT * FROM sessions WHERE type = 2 AND name LIKE ?").all(`%${keyword}%`);
  const list = rows.map((s) => ({
    group_id: s.id,
    name: s.name,
    avatar: s.avatar,
    user_num: 1
  }));
  return success(listResponse(list, "", true));
});

const searchPage_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: searchPage_do_post
});

const update_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const { group_id, name, avatar } = body || {};
  const gid = Number(group_id);
  db.prepare("UPDATE sessions SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?").run(
    name != null ? name : null,
    avatar != null ? avatar : null,
    gid
  );
  return success(null);
});

const update_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: update_do_post
});

const updateNotice_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const updateNotice_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: updateNotice_do_post
});

const clear_do_post = defineEventHandler(async (event) => {
  var _a;
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const session_id = body == null ? void 0 : body.session_id;
  const sid = Number((_a = String(session_id).split("@").pop()) == null ? void 0 : _a.split("_")[0]);
  if (sid) {
    db.prepare("DELETE FROM messages WHERE sessionId = ?").run(sid);
  }
  return success(null);
});

const clear_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: clear_do_post
});

const offlineAndTop_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const offlineAndTop_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: offlineAndTop_do_post
});

const read_do_post = defineEventHandler(async (event) => {
  var _a;
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const session_id = body == null ? void 0 : body.session_id;
  const sid = Number((_a = String(session_id).split("@").pop()) == null ? void 0 : _a.split("_")[0]);
  if (sid) {
    db.prepare("UPDATE sessions SET unread = 0 WHERE id = ?").run(sid);
  }
  return success(null);
});

const read_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: read_do_post
});

const readMsg_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const readMsg_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: readMsg_do_post
});

const remind_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const remind_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: remind_do_post
});

const remindList_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const remindList_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: remindList_do_post
});

const status_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success({ read: 0, unread: 0 });
});

const status_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: status_do_post
});

const sync_do_post = defineEventHandler(async (event) => {
  var _a;
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const session_id = body == null ? void 0 : body.session_id;
  const last_msg_id = Number(body == null ? void 0 : body.last_msg_id) || 0;
  const size = Number(body == null ? void 0 : body.size) || 20;
  const sid = Number((_a = String(session_id).split("@").pop()) == null ? void 0 : _a.split("_")[0]);
  let rows;
  if (last_msg_id > 0) {
    rows = db.prepare(
      "SELECT * FROM messages WHERE sessionId = ? AND id < ? ORDER BY id DESC LIMIT ?"
    ).all(sid, last_msg_id, size);
  } else {
    rows = db.prepare(
      "SELECT * FROM messages WHERE sessionId = ? ORDER BY id DESC LIMIT ?"
    ).all(sid, size);
  }
  rows.reverse();
  const ytList = rows.map((m) => ({
    msg_id: m.id,
    uuid: `u${m.id}`,
    seq: m.id,
    session_id: `p@${m.sessionId}_${tokenUser.uid}`,
    from_id: String(m.fromUid),
    content: m.content,
    time: m.sendTime,
    status: 2,
    type: 0,
    chat_type: "p",
    keyword: "",
    unread: 0,
    name: m.fromName,
    headUrl: m.fromAvatar,
    state: ""
  }));
  const isLast = ytList.length < size;
  const cursor = ytList.length ? String(ytList[0].msg_id) : "";
  return success(listResponse(ytList, cursor, isLast));
});

const sync_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sync_do_post
});

const top_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const top_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: top_do_post
});

const topList_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const topList_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: topList_do_post
});

const unReadNum_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  const row = db.prepare("SELECT COALESCE(SUM(unread), 0) as total FROM sessions").get();
  return success({ total: (row == null ? void 0 : row.total) || 0 });
});

const unReadNum_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: unReadNum_do_post
});

const withdraw_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const withdraw_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: withdraw_do_post
});

const emp_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const emp_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: emp_do_post
});

const listYxt_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const listYxt_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: listYxt_do_post
});

const plugin_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.id) {
    return fail("\u63D2\u4EF6ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const plugin = db.prepare("SELECT id FROM plugins WHERE id = ?").get(body.id);
  if (!plugin) {
    return fail("\u63D2\u4EF6\u4E0D\u5B58\u5728", 404);
  }
  const fields = [];
  const values = [];
  if (body.name !== void 0) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.description !== void 0) {
    fields.push("description = ?");
    values.push(body.description);
  }
  if (body.icon !== void 0) {
    fields.push("icon = ?");
    values.push(body.icon);
  }
  if (body.enabled !== void 0) {
    fields.push("enabled = ?");
    values.push(body.enabled ? 1 : 0);
  }
  fields.push("updateTime = ?");
  values.push(Date.now());
  values.push(body.id);
  db.prepare(`UPDATE plugins SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return success(null, "\u66F4\u65B0\u63D2\u4EF6\u914D\u7F6E\u6210\u529F");
});

const plugin_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: plugin_put
});

const detail_get$4 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u63D2\u4EF6ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const plugin = db.prepare("SELECT * FROM plugins WHERE id = ?").get(id);
  if (!plugin) {
    return fail("\u63D2\u4EF6\u4E0D\u5B58\u5728", 404);
  }
  return success(plugin);
});

const detail_get$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: detail_get$4
});

const install_post = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const pluginId = Number(body.pluginId);
  if (!pluginId) {
    return fail("\u63D2\u4EF6ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const plugin = db.prepare("SELECT id FROM plugins WHERE id = ?").get(pluginId);
  if (!plugin) {
    return fail("\u63D2\u4EF6\u4E0D\u5B58\u5728", 404);
  }
  const now = Date.now();
  db.prepare("UPDATE plugins SET status = 1, enabled = 1, installTime = ?, updateTime = ? WHERE id = ?").run(now, now, pluginId);
  const updated = db.prepare("SELECT * FROM plugins WHERE id = ?").get(pluginId);
  return success(updated, "\u5B89\u88C5\u63D2\u4EF6\u6210\u529F");
});

const install_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: install_post
});

const list_get$4 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const rows = db.prepare("SELECT * FROM plugins ORDER BY installTime DESC").all();
  return success(listResponse(rows));
});

const list_get$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_get$4
});

const toggle_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.id) {
    return fail("\u63D2\u4EF6ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const plugin = db.prepare("SELECT id FROM plugins WHERE id = ?").get(body.id);
  if (!plugin) {
    return fail("\u63D2\u4EF6\u4E0D\u5B58\u5728", 404);
  }
  db.prepare("UPDATE plugins SET enabled = ?, updateTime = ? WHERE id = ?").run(body.enabled ? 1 : 0, Date.now(), body.id);
  return success(null, "\u5207\u6362\u63D2\u4EF6\u72B6\u6001\u6210\u529F");
});

const toggle_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: toggle_put
});

const uninstall_delete = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u63D2\u4EF6ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const plugin = db.prepare("SELECT id FROM plugins WHERE id = ?").get(id);
  if (!plugin) {
    return fail("\u63D2\u4EF6\u4E0D\u5B58\u5728", 404);
  }
  db.prepare("UPDATE plugins SET status = 2, enabled = 0, updateTime = ? WHERE id = ?").run(Date.now(), id);
  return success(null, "\u5378\u8F7D\u63D2\u4EF6\u6210\u529F");
});

const uninstall_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: uninstall_delete
});

const robot_delete = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u5DE5\u4F5C\u6D41ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const result = db.prepare("DELETE FROM workflows WHERE id = ?").run(id);
  if (result.changes === 0) {
    return fail("\u5DE5\u4F5C\u6D41\u4E0D\u5B58\u5728", 404);
  }
  return success(null, "\u5220\u9664\u5DE5\u4F5C\u6D41\u6210\u529F");
});

const robot_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: robot_delete
});

const robot_post = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.name) {
    return fail("\u5DE5\u4F5C\u6D41\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const id = getNextId("workflows");
  const workflow = {
    id,
    name: body.name,
    description: body.description || "",
    avatar: body.avatar || "\u{1F916}",
    prompt: body.prompt || "",
    apiKey: body.apiKey || "",
    endpoint: body.endpoint || "",
    enabled: body.enabled !== void 0 ? body.enabled ? 1 : 0 : 1,
    createTime: Date.now()
  };
  db.prepare(
    "INSERT INTO workflows (id, name, description, avatar, prompt, apiKey, endpoint, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(workflow.id, workflow.name, workflow.description, workflow.avatar, workflow.prompt, workflow.apiKey, workflow.endpoint, workflow.enabled, workflow.createTime);
  return success(workflow, "\u521B\u5EFA\u5DE5\u4F5C\u6D41\u6210\u529F");
});

const robot_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: robot_post
});

const robot_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.id) {
    return fail("\u5DE5\u4F5C\u6D41ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const workflow = db.prepare("SELECT id FROM workflows WHERE id = ?").get(body.id);
  if (!workflow) {
    return fail("\u5DE5\u4F5C\u6D41\u4E0D\u5B58\u5728", 404);
  }
  const fields = [];
  const values = [];
  if (body.name !== void 0) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.description !== void 0) {
    fields.push("description = ?");
    values.push(body.description);
  }
  if (body.avatar !== void 0) {
    fields.push("avatar = ?");
    values.push(body.avatar);
  }
  if (body.prompt !== void 0) {
    fields.push("prompt = ?");
    values.push(body.prompt);
  }
  if (body.apiKey !== void 0) {
    fields.push("apiKey = ?");
    values.push(body.apiKey);
  }
  if (body.endpoint !== void 0) {
    fields.push("endpoint = ?");
    values.push(body.endpoint);
  }
  if (body.enabled !== void 0) {
    fields.push("enabled = ?");
    values.push(body.enabled ? 1 : 0);
  }
  if (fields.length > 0) {
    values.push(body.id);
    db.prepare(`UPDATE workflows SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  return success(null, "\u66F4\u65B0\u5DE5\u4F5C\u6D41\u6210\u529F");
});

const robot_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: robot_put
});

const detail_get$2 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u5DE5\u4F5C\u6D41ID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const workflow = db.prepare("SELECT * FROM workflows WHERE id = ?").get(id);
  if (!workflow) {
    return fail("\u5DE5\u4F5C\u6D41\u4E0D\u5B58\u5728", 404);
  }
  return success(workflow);
});

const detail_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: detail_get$2
});

const list_get$2 = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const rows = db.prepare("SELECT * FROM workflows ORDER BY createTime DESC").all();
  return success(listResponse(rows));
});

const list_get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_get$2
});

const schedule_delete = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u65E5\u7A0BID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const result = db.prepare("DELETE FROM schedules WHERE id = ?").run(id);
  if (result.changes === 0) {
    return fail("\u65E5\u7A0B\u4E0D\u5B58\u5728", 404);
  }
  return success(null, "\u5220\u9664\u65E5\u7A0B\u6210\u529F");
});

const schedule_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: schedule_delete
});

const schedule_post = defineEventHandler(async (event) => {
  var _a;
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.title || !body.startTime || !body.endTime) {
    return fail("\u65E5\u7A0B\u6807\u9898\u3001\u5F00\u59CB\u65F6\u95F4\u548C\u7ED3\u675F\u65F6\u95F4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const id = getNextId("schedules");
  const schedule = {
    id,
    title: body.title,
    content: body.content || "",
    startTime: body.startTime,
    endTime: body.endTime,
    allDay: body.allDay ? 1 : 0,
    remindTime: (_a = body.remindTime) != null ? _a : 10,
    type: body.type || "meeting",
    completed: body.completed ? 1 : 0,
    createTime: Date.now()
  };
  db.prepare(
    "INSERT INTO schedules (id, title, content, startTime, endTime, allDay, remindTime, type, completed, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(schedule.id, schedule.title, schedule.content, schedule.startTime, schedule.endTime, schedule.allDay, schedule.remindTime, schedule.type, schedule.completed, schedule.createTime);
  return success(schedule, "\u521B\u5EFA\u65E5\u7A0B\u6210\u529F");
});

const schedule_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: schedule_post
});

const schedule_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  if (!body.id) {
    return fail("\u65E5\u7A0BID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const schedule = db.prepare("SELECT id FROM schedules WHERE id = ?").get(body.id);
  if (!schedule) {
    return fail("\u65E5\u7A0B\u4E0D\u5B58\u5728", 404);
  }
  const fields = [];
  const values = [];
  if (body.title !== void 0) {
    fields.push("title = ?");
    values.push(body.title);
  }
  if (body.content !== void 0) {
    fields.push("content = ?");
    values.push(body.content);
  }
  if (body.startTime !== void 0) {
    fields.push("startTime = ?");
    values.push(body.startTime);
  }
  if (body.endTime !== void 0) {
    fields.push("endTime = ?");
    values.push(body.endTime);
  }
  if (body.allDay !== void 0) {
    fields.push("allDay = ?");
    values.push(body.allDay ? 1 : 0);
  }
  if (body.remindTime !== void 0) {
    fields.push("remindTime = ?");
    values.push(body.remindTime);
  }
  if (body.type !== void 0) {
    fields.push("type = ?");
    values.push(body.type);
  }
  if (body.completed !== void 0) {
    fields.push("completed = ?");
    values.push(body.completed ? 1 : 0);
  }
  if (fields.length > 0) {
    values.push(body.id);
    db.prepare(`UPDATE schedules SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }
  return success(null, "\u66F4\u65B0\u65E5\u7A0B\u6210\u529F");
});

const schedule_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: schedule_put
});

const detail_get = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const query = getQuery$1(event);
  const id = Number(query.id);
  if (!id) {
    return fail("\u65E5\u7A0BID\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const schedule = db.prepare("SELECT * FROM schedules WHERE id = ?").get(id);
  if (!schedule) {
    return fail("\u65E5\u7A0B\u4E0D\u5B58\u5728", 404);
  }
  return success(schedule);
});

const detail_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: detail_get
});

const list_get = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const user = verifyToken(authHeader);
  if (!user) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const rows = db.prepare("SELECT * FROM schedules ORDER BY startTime ASC").all();
  return success(listResponse(rows));
});

const list_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_get
});

const del_post = defineEventHandler(async (event) => {
  var _a;
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const session_id = body == null ? void 0 : body.session_id;
  const sid = Number((_a = String(session_id).split("@").pop()) == null ? void 0 : _a.split("_")[0]);
  if (sid) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
  }
  return success(null);
});

const del_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: del_post
});

const list_post$2 = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const uid = tokenUser.uid;
  const memberSessions = db.prepare(
    "SELECT sessionId FROM group_members WHERE uid = ?"
  ).all(uid);
  const sessionIds = memberSessions.map((m) => m.sessionId);
  let rows;
  if (sessionIds.length > 0) {
    const placeholders = sessionIds.map(() => "?").join(",");
    rows = db.prepare(
      `SELECT * FROM sessions WHERE id IN (${placeholders}) ORDER BY time DESC`
    ).all(...sessionIds);
  } else {
    rows = [];
  }
  const ytList = rows.map((s) => ({
    session_id: `p@${s.id}_${uid}`,
    from_id: String(s.id),
    time: s.time,
    chat_type: s.type === 2 ? "g" : "p",
    chat_name: s.name,
    type: 0,
    content: s.lastMsg,
    unread_num: s.unread,
    head: 0,
    headUrl: s.avatar,
    sign: "",
    mobile: "",
    state: -1,
    online: "",
    frequent: 0,
    notice: "",
    user_num: s.type === 2 ? 1 : 0
  }));
  return success(listResponse(ytList, "", true));
});

const list_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$2
});

const close_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const close_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: close_post
});

const list_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const list_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post
});

const open_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const open_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: open_post
});

const reset_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event);
  return success(null);
});

const reset_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: reset_post
});

const info_get = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const tokenUser = verifyToken(authHeader);
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const user = db.prepare("SELECT * FROM users WHERE uid = ?").get(tokenUser.uid);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  const { password: _, ...userInfo } = user;
  return success(userInfo, "\u83B7\u53D6\u7528\u6237\u4FE1\u606F\u6210\u529F");
});

const info_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: info_get
});

const info_put = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  const tokenUser = verifyToken(authHeader);
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  const body = await readBody(event);
  const fields = [];
  const values = [];
  if (body.name !== void 0) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.avatar !== void 0) {
    fields.push("avatar = ?");
    values.push(body.avatar);
  }
  if (body.phone !== void 0) {
    fields.push("phone = ?");
    values.push(body.phone);
  }
  fields.push("lastOptTime = ?");
  values.push(Date.now());
  values.push(tokenUser.uid);
  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE uid = ?`).run(...values);
  const user = db.prepare("SELECT * FROM users WHERE uid = ?").get(tokenUser.uid);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  const { password: _, ...userInfo } = user;
  return success(userInfo, "\u66F4\u65B0\u6210\u529F");
});

const info_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: info_put
});

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { account, password } = body;
  if (!account || !password) {
    return fail("\u8D26\u53F7\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const user = db.prepare(
    "SELECT * FROM users WHERE email = ? OR phone = ? OR name = ?"
  ).get(account, account, account);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  if (!comparePassword(password, user.password)) {
    return fail("\u5BC6\u7801\u9519\u8BEF", 401);
  }
  const token = generateToken(user.uid);
  db.prepare("UPDATE users SET onlineStatus = 1, lastOptTime = ? WHERE uid = ?").run(Date.now(), user.uid);
  const { password: _, ...userInfo } = user;
  userInfo.onlineStatus = 1;
  return success({ userInfo, token }, "\u767B\u5F55\u6210\u529F");
});

const login_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: login_post
});

const logout_post = defineEventHandler((event) => {
  const authHeader = getHeader(event, "authorization");
  const tokenUser = verifyToken(authHeader);
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  db.prepare("UPDATE users SET onlineStatus = 2 WHERE uid = ?").run(tokenUser.uid);
  return success(null, "\u9000\u51FA\u767B\u5F55\u6210\u529F");
});

const logout_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: logout_post
});

const onlines_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success({ list: [] });
});

const onlines_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: onlines_do_post
});

const onlineStatus_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success({ online: 1 });
});

const onlineStatus_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: onlineStatus_post
});

const register_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return fail("\u7528\u6237\u540D\u3001\u90AE\u7BB1\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const existing = db.prepare("SELECT uid FROM users WHERE email = ?").get(email);
  if (existing) {
    return fail("\u8BE5\u90AE\u7BB1\u5DF2\u88AB\u6CE8\u518C", 409);
  }
  const uid = getNextId("users");
  const hashedPassword = hashPassword(password);
  db.prepare(
    "INSERT INTO users (uid, name, avatar, email, phone, password, onlineStatus, lastOptTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(uid, name, "\u{1F464}", email, "", hashedPassword, 1, Date.now());
  const userInfo = { uid, name, avatar: "\u{1F464}", email, phone: "", onlineStatus: 1, lastOptTime: Date.now() };
  return success(userInfo, "\u6CE8\u518C\u6210\u529F");
});

const register_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: register_post
});

const resetPassword_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, code, password } = body;
  if (!email || !code || !password) {
    return fail("\u90AE\u7BB1\u3001\u9A8C\u8BC1\u7801\u548C\u65B0\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const record = verifyCodes.get(email);
  if (!record) {
    return fail("\u8BF7\u5148\u53D1\u9001\u9A8C\u8BC1\u7801", 400);
  }
  if (Date.now() > record.expires) {
    verifyCodes.delete(email);
    return fail("\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u53D1\u9001", 400);
  }
  if (record.code !== code) {
    return fail("\u9A8C\u8BC1\u7801\u4E0D\u6B63\u786E", 400);
  }
  const user = db.prepare("SELECT uid FROM users WHERE email = ?").get(email);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  const hashedPassword = hashPassword(password);
  db.prepare("UPDATE users SET password = ? WHERE uid = ?").run(hashedPassword, user.uid);
  verifyCodes.delete(email);
  return success(null, "\u5BC6\u7801\u91CD\u7F6E\u6210\u529F");
});

const resetPassword_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: resetPassword_post
});

const sendCode_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;
  if (!email) {
    return fail("\u90AE\u7BB1\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const user = db.prepare("SELECT uid FROM users WHERE email = ?").get(email);
  if (!user) {
    return fail("\u8BE5\u90AE\u7BB1\u672A\u6CE8\u518C", 404);
  }
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  verifyCodes.set(email, { code, expires: Date.now() + 6e5 });
  console.log(`[VerifyCode] ${email} \u9A8C\u8BC1\u7801: ${code}`);
  return success(null, "\u9A8C\u8BC1\u7801\u5DF2\u53D1\u9001");
});

const sendCode_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sendCode_post
});

const meetingInfo_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  await readBody(event).catch(() => ({}));
  return success(listResponse([], "", true));
});

const meetingInfo_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: meetingInfo_post
});

const login_do_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { account, password, deviceId } = body || {};
  if (!account || !password) {
    return fail("\u8D26\u53F7\u548C\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const user = db.prepare(
    "SELECT * FROM users WHERE email = ? OR phone = ? OR name = ?"
  ).get(account, account, account);
  if (!user) {
    return fail("\u7528\u6237\u4E0D\u5B58\u5728", 404);
  }
  if (!comparePassword(password, user.password)) {
    return fail("\u5BC6\u7801\u9519\u8BEF", 401);
  }
  const token = generateToken(user.uid);
  db.prepare("UPDATE users SET onlineStatus = 1, lastOptTime = ? WHERE uid = ?").run(Date.now(), user.uid);
  const userInfo = {
    uid: String(user.uid),
    name: user.name,
    headUrl: user.avatar,
    mobile: user.phone,
    email: user.email,
    sign: "",
    online: String(user.onlineStatus)
  };
  return success({ userInfo, token, deviceId: deviceId || "" }, "\u767B\u5F55\u6210\u529F");
});

const login_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: login_do_post
});

const logout_do_post = defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, "authorization"));
  if (!tokenUser) {
    return fail("\u672A\u767B\u5F55\u6216\u767B\u5F55\u5DF2\u8FC7\u671F", 401);
  }
  db.prepare("UPDATE users SET onlineStatus = 2 WHERE uid = ?").run(tokenUser.uid);
  return success(null, "\u9000\u51FA\u767B\u5F55\u6210\u529F");
});

const logout_do_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: logout_do_post
});
//# sourceMappingURL=index.mjs.map
