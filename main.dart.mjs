// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  // `loadDynamicModule` is a JS function that takes two string names matching,
  //   in order, a wasm file produced by the dart2wasm compiler during dynamic
  //   module compilation and a corresponding js file produced by the same
  //   compilation. It should return a JS Array containing 2 elements. The first
  //   should be the bytes for the wasm module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The second
  //   should be the result of using the JS 'import' API on the js file path.
  async instantiate(additionalImports, {loadDeferredWasm, loadDynamicModule} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            _4: (o, c) => o instanceof c,
      _5: o => Object.keys(o),
      _8: (o, a) => o + a,
      _36: x0 => new Array(x0),
      _38: x0 => x0.length,
      _40: (x0,x1) => x0[x1],
      _41: (x0,x1,x2) => { x0[x1] = x2 },
      _43: x0 => new Promise(x0),
      _45: (x0,x1,x2) => new DataView(x0,x1,x2),
      _47: x0 => new Int8Array(x0),
      _48: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _49: x0 => new Uint8Array(x0),
      _51: x0 => new Uint8ClampedArray(x0),
      _53: x0 => new Int16Array(x0),
      _55: x0 => new Uint16Array(x0),
      _57: x0 => new Int32Array(x0),
      _59: x0 => new Uint32Array(x0),
      _61: x0 => new Float32Array(x0),
      _63: x0 => new Float64Array(x0),
      _65: (x0,x1,x2) => x0.call(x1,x2),
      _67: (x0,x1) => x0.call(x1),
      _70: (decoder, codeUnits) => decoder.decode(codeUnits),
      _71: () => new TextDecoder("utf-8", {fatal: true}),
      _72: () => new TextDecoder("utf-8", {fatal: false}),
      _73: (s) => +s,
      _74: x0 => new Uint8Array(x0),
      _75: (x0,x1,x2) => x0.set(x1,x2),
      _76: (x0,x1) => x0.transferFromImageBitmap(x1),
      _77: x0 => x0.arrayBuffer(),
      _78: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._78(f,arguments.length,x0) }),
      _79: x0 => new window.FinalizationRegistry(x0),
      _80: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      _81: (x0,x1) => x0.unregister(x1),
      _82: (x0,x1,x2) => x0.slice(x1,x2),
      _83: (x0,x1) => x0.decode(x1),
      _84: (x0,x1) => x0.segment(x1),
      _85: () => new TextDecoder(),
      _86: (x0,x1) => x0.get(x1),
      _87: x0 => x0.buffer,
      _88: x0 => x0.wasmMemory,
      _89: () => globalThis.window._flutter_skwasmInstance,
      _90: x0 => x0.rasterStartMilliseconds,
      _91: x0 => x0.rasterEndMilliseconds,
      _92: x0 => x0.imageBitmaps,
      _196: x0 => x0.stopPropagation(),
      _197: x0 => x0.preventDefault(),
      _199: x0 => x0.remove(),
      _200: (x0,x1) => x0.append(x1),
      _201: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _246: x0 => x0.unlock(),
      _247: x0 => x0.getReader(),
      _248: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _249: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _250: (x0,x1) => x0.item(x1),
      _251: x0 => x0.next(),
      _252: x0 => x0.now(),
      _253: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._253(f,arguments.length,x0) }),
      _254: (x0,x1) => x0.addListener(x1),
      _255: (x0,x1) => x0.removeListener(x1),
      _256: (x0,x1) => x0.matchMedia(x1),
      _257: (x0,x1) => x0.revokeObjectURL(x1),
      _258: x0 => x0.close(),
      _259: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _260: x0 => new window.ImageDecoder(x0),
      _261: x0 => ({frameIndex: x0}),
      _262: (x0,x1) => x0.decode(x1),
      _263: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._263(f,arguments.length,x0) }),
      _264: (x0,x1) => x0.getModifierState(x1),
      _265: (x0,x1) => x0.removeProperty(x1),
      _266: (x0,x1) => x0.prepend(x1),
      _267: x0 => new Intl.Locale(x0),
      _268: x0 => x0.disconnect(),
      _269: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._269(f,arguments.length,x0) }),
      _270: (x0,x1) => x0.getAttribute(x1),
      _271: (x0,x1) => x0.contains(x1),
      _272: (x0,x1) => x0.querySelector(x1),
      _273: x0 => x0.blur(),
      _274: x0 => x0.hasFocus(),
      _275: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _276: (x0,x1) => x0.hasAttribute(x1),
      _277: (x0,x1) => x0.getModifierState(x1),
      _278: (x0,x1) => x0.createTextNode(x1),
      _279: (x0,x1) => x0.appendChild(x1),
      _280: (x0,x1) => x0.removeAttribute(x1),
      _281: x0 => x0.getBoundingClientRect(),
      _282: (x0,x1) => x0.observe(x1),
      _283: x0 => x0.disconnect(),
      _284: (x0,x1) => x0.closest(x1),
      _707: () => globalThis.window.flutterConfiguration,
      _709: x0 => x0.assetBase,
      _714: x0 => x0.canvasKitMaximumSurfaces,
      _715: x0 => x0.debugShowSemanticsNodes,
      _716: x0 => x0.hostElement,
      _717: x0 => x0.multiViewEnabled,
      _718: x0 => x0.nonce,
      _720: x0 => x0.fontFallbackBaseUrl,
      _730: x0 => x0.console,
      _731: x0 => x0.devicePixelRatio,
      _732: x0 => x0.document,
      _733: x0 => x0.history,
      _734: x0 => x0.innerHeight,
      _735: x0 => x0.innerWidth,
      _736: x0 => x0.location,
      _737: x0 => x0.navigator,
      _738: x0 => x0.visualViewport,
      _739: x0 => x0.performance,
      _741: x0 => x0.URL,
      _743: (x0,x1) => x0.getComputedStyle(x1),
      _744: x0 => x0.screen,
      _745: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._745(f,arguments.length,x0) }),
      _746: (x0,x1) => x0.requestAnimationFrame(x1),
      _751: (x0,x1) => x0.warn(x1),
      _753: (x0,x1) => x0.debug(x1),
      _754: x0 => globalThis.parseFloat(x0),
      _755: () => globalThis.window,
      _756: () => globalThis.Intl,
      _757: () => globalThis.Symbol,
      _758: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      _760: x0 => x0.clipboard,
      _761: x0 => x0.maxTouchPoints,
      _762: x0 => x0.vendor,
      _763: x0 => x0.language,
      _764: x0 => x0.platform,
      _765: x0 => x0.userAgent,
      _766: (x0,x1) => x0.vibrate(x1),
      _767: x0 => x0.languages,
      _768: x0 => x0.documentElement,
      _769: (x0,x1) => x0.querySelector(x1),
      _772: (x0,x1) => x0.createElement(x1),
      _775: (x0,x1) => x0.createEvent(x1),
      _776: x0 => x0.activeElement,
      _779: x0 => x0.head,
      _780: x0 => x0.body,
      _782: (x0,x1) => { x0.title = x1 },
      _785: x0 => x0.visibilityState,
      _786: () => globalThis.document,
      _787: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._787(f,arguments.length,x0) }),
      _788: (x0,x1) => x0.dispatchEvent(x1),
      _796: x0 => x0.target,
      _798: x0 => x0.timeStamp,
      _799: x0 => x0.type,
      _801: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _808: x0 => x0.firstChild,
      _812: x0 => x0.parentElement,
      _814: (x0,x1) => { x0.textContent = x1 },
      _815: x0 => x0.parentNode,
      _816: x0 => x0.nextSibling,
      _817: (x0,x1) => x0.removeChild(x1),
      _818: x0 => x0.isConnected,
      _826: x0 => x0.clientHeight,
      _827: x0 => x0.clientWidth,
      _828: x0 => x0.offsetHeight,
      _829: x0 => x0.offsetWidth,
      _830: x0 => x0.id,
      _831: (x0,x1) => { x0.id = x1 },
      _834: (x0,x1) => { x0.spellcheck = x1 },
      _835: x0 => x0.tagName,
      _836: x0 => x0.style,
      _838: (x0,x1) => x0.querySelectorAll(x1),
      _839: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _840: (x0,x1) => { x0.tabIndex = x1 },
      _841: x0 => x0.tabIndex,
      _842: (x0,x1) => x0.focus(x1),
      _843: x0 => x0.scrollTop,
      _844: (x0,x1) => { x0.scrollTop = x1 },
      _845: x0 => x0.scrollLeft,
      _846: (x0,x1) => { x0.scrollLeft = x1 },
      _847: x0 => x0.classList,
      _849: (x0,x1) => { x0.className = x1 },
      _851: (x0,x1) => x0.getElementsByClassName(x1),
      _852: x0 => x0.click(),
      _853: (x0,x1) => x0.attachShadow(x1),
      _856: x0 => x0.computedStyleMap(),
      _857: (x0,x1) => x0.get(x1),
      _863: (x0,x1) => x0.getPropertyValue(x1),
      _864: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _865: x0 => x0.offsetLeft,
      _866: x0 => x0.offsetTop,
      _867: x0 => x0.offsetParent,
      _869: (x0,x1) => { x0.name = x1 },
      _870: x0 => x0.content,
      _871: (x0,x1) => { x0.content = x1 },
      _875: (x0,x1) => { x0.src = x1 },
      _876: x0 => x0.naturalWidth,
      _877: x0 => x0.naturalHeight,
      _881: (x0,x1) => { x0.crossOrigin = x1 },
      _883: (x0,x1) => { x0.decoding = x1 },
      _884: x0 => x0.decode(),
      _889: (x0,x1) => { x0.nonce = x1 },
      _894: (x0,x1) => { x0.width = x1 },
      _896: (x0,x1) => { x0.height = x1 },
      _899: (x0,x1) => x0.getContext(x1),
      _960: x0 => x0.width,
      _961: x0 => x0.height,
      _963: (x0,x1) => x0.fetch(x1),
      _964: x0 => x0.status,
      _965: x0 => x0.headers,
      _966: x0 => x0.body,
      _967: x0 => x0.arrayBuffer(),
      _970: x0 => x0.read(),
      _971: x0 => x0.value,
      _972: x0 => x0.done,
      _979: x0 => x0.name,
      _980: x0 => x0.x,
      _981: x0 => x0.y,
      _984: x0 => x0.top,
      _985: x0 => x0.right,
      _986: x0 => x0.bottom,
      _987: x0 => x0.left,
      _997: x0 => x0.height,
      _998: x0 => x0.width,
      _999: x0 => x0.scale,
      _1000: (x0,x1) => { x0.value = x1 },
      _1003: (x0,x1) => { x0.placeholder = x1 },
      _1005: (x0,x1) => { x0.name = x1 },
      _1006: x0 => x0.selectionDirection,
      _1007: x0 => x0.selectionStart,
      _1008: x0 => x0.selectionEnd,
      _1011: x0 => x0.value,
      _1013: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1014: x0 => x0.readText(),
      _1015: (x0,x1) => x0.writeText(x1),
      _1017: x0 => x0.altKey,
      _1018: x0 => x0.code,
      _1019: x0 => x0.ctrlKey,
      _1020: x0 => x0.key,
      _1021: x0 => x0.keyCode,
      _1022: x0 => x0.location,
      _1023: x0 => x0.metaKey,
      _1024: x0 => x0.repeat,
      _1025: x0 => x0.shiftKey,
      _1026: x0 => x0.isComposing,
      _1028: x0 => x0.state,
      _1029: (x0,x1) => x0.go(x1),
      _1031: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1032: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1033: x0 => x0.pathname,
      _1034: x0 => x0.search,
      _1035: x0 => x0.hash,
      _1039: x0 => x0.state,
      _1042: (x0,x1) => x0.createObjectURL(x1),
      _1044: x0 => new Blob(x0),
      _1046: x0 => new MutationObserver(x0),
      _1047: (x0,x1,x2) => x0.observe(x1,x2),
      _1048: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1048(f,arguments.length,x0,x1) }),
      _1051: x0 => x0.attributeName,
      _1052: x0 => x0.type,
      _1053: x0 => x0.matches,
      _1054: x0 => x0.matches,
      _1058: x0 => x0.relatedTarget,
      _1060: x0 => x0.clientX,
      _1061: x0 => x0.clientY,
      _1062: x0 => x0.offsetX,
      _1063: x0 => x0.offsetY,
      _1066: x0 => x0.button,
      _1067: x0 => x0.buttons,
      _1068: x0 => x0.ctrlKey,
      _1072: x0 => x0.pointerId,
      _1073: x0 => x0.pointerType,
      _1074: x0 => x0.pressure,
      _1075: x0 => x0.tiltX,
      _1076: x0 => x0.tiltY,
      _1077: x0 => x0.getCoalescedEvents(),
      _1080: x0 => x0.deltaX,
      _1081: x0 => x0.deltaY,
      _1082: x0 => x0.wheelDeltaX,
      _1083: x0 => x0.wheelDeltaY,
      _1084: x0 => x0.deltaMode,
      _1091: x0 => x0.changedTouches,
      _1094: x0 => x0.clientX,
      _1095: x0 => x0.clientY,
      _1098: x0 => x0.data,
      _1101: (x0,x1) => { x0.disabled = x1 },
      _1103: (x0,x1) => { x0.type = x1 },
      _1104: (x0,x1) => { x0.max = x1 },
      _1105: (x0,x1) => { x0.min = x1 },
      _1106: x0 => x0.value,
      _1107: (x0,x1) => { x0.value = x1 },
      _1108: x0 => x0.disabled,
      _1109: (x0,x1) => { x0.disabled = x1 },
      _1111: (x0,x1) => { x0.placeholder = x1 },
      _1112: (x0,x1) => { x0.name = x1 },
      _1115: (x0,x1) => { x0.autocomplete = x1 },
      _1116: x0 => x0.selectionDirection,
      _1117: x0 => x0.selectionStart,
      _1119: x0 => x0.selectionEnd,
      _1122: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1123: (x0,x1) => x0.add(x1),
      _1126: (x0,x1) => { x0.noValidate = x1 },
      _1127: (x0,x1) => { x0.method = x1 },
      _1128: (x0,x1) => { x0.action = x1 },
      _1129: (x0,x1) => new OffscreenCanvas(x0,x1),
      _1135: (x0,x1) => x0.getContext(x1),
      _1137: x0 => x0.convertToBlob(),
      _1154: x0 => x0.orientation,
      _1155: x0 => x0.width,
      _1156: x0 => x0.height,
      _1157: (x0,x1) => x0.lock(x1),
      _1176: x0 => new ResizeObserver(x0),
      _1179: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1179(f,arguments.length,x0,x1) }),
      _1187: x0 => x0.length,
      _1188: x0 => x0.iterator,
      _1189: x0 => x0.Segmenter,
      _1190: x0 => x0.v8BreakIterator,
      _1191: (x0,x1) => new Intl.Segmenter(x0,x1),
      _1194: x0 => x0.language,
      _1195: x0 => x0.script,
      _1196: x0 => x0.region,
      _1214: x0 => x0.done,
      _1215: x0 => x0.value,
      _1216: x0 => x0.index,
      _1220: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _1221: (x0,x1) => x0.adoptText(x1),
      _1222: x0 => x0.first(),
      _1223: x0 => x0.next(),
      _1224: x0 => x0.current(),
      _1238: x0 => x0.hostElement,
      _1239: x0 => x0.viewConstraints,
      _1242: x0 => x0.maxHeight,
      _1243: x0 => x0.maxWidth,
      _1244: x0 => x0.minHeight,
      _1245: x0 => x0.minWidth,
      _1246: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1246(f,arguments.length,x0) }),
      _1247: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1247(f,arguments.length,x0) }),
      _1248: (x0,x1) => ({addView: x0,removeView: x1}),
      _1251: x0 => x0.loader,
      _1252: () => globalThis._flutter,
      _1253: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1254: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1254(f,arguments.length,x0) }),
      _1255: f => finalizeWrapper(f, function() { return dartInstance.exports._1255(f,arguments.length) }),
      _1256: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _1259: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1259(f,arguments.length,x0) }),
      _1260: x0 => ({runApp: x0}),
      _1262: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1262(f,arguments.length,x0,x1) }),
      _1263: x0 => x0.length,
      _1264: () => globalThis.window.ImageDecoder,
      _1265: x0 => x0.tracks,
      _1267: x0 => x0.completed,
      _1269: x0 => x0.image,
      _1275: x0 => x0.displayWidth,
      _1276: x0 => x0.displayHeight,
      _1277: x0 => x0.duration,
      _1280: x0 => x0.ready,
      _1281: x0 => x0.selectedTrack,
      _1282: x0 => x0.repetitionCount,
      _1283: x0 => x0.frameCount,
      _1326: (x0,x1,x2) => x0.open(x1,x2),
      _1327: x0 => x0.reload(),
      _1333: (x0,x1) => x0.createElement(x1),
      _1339: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1340: (x0,x1) => x0.querySelector(x1),
      _1341: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1341(f,arguments.length,x0) }),
      _1342: (x0,x1) => x0.removeChild(x1),
      _1343: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1343(f,arguments.length,x0) }),
      _1344: (x0,x1) => x0.appendChild(x1),
      _1345: () => new Map(),
      _1346: (x0,x1,x2) => x0.set(x1,x2),
      _1347: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      _1348: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1348(f,arguments.length,x0,x1) }),
      _1349: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      _1350: x0 => x0.pause(),
      _1351: x0 => x0.play(),
      _1352: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1352(f,arguments.length,x0) }),
      _1353: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1353(f,arguments.length,x0) }),
      _1354: (x0,x1) => x0.append(x1),
      _1355: x0 => x0.getVideoTracks(),
      _1356: x0 => x0.getSupportedConstraints(),
      _1357: x0 => ({video: x0}),
      _1358: x0 => ({facingMode: x0}),
      _1359: (x0,x1) => x0.getUserMedia(x1),
      _1360: x0 => ({type: x0}),
      _1361: (x0,x1) => new Blob(x0,x1),
      _1362: x0 => globalThis.URL.createObjectURL(x0),
      _1363: (x0,x1) => x0.getElementById(x1),
      _1364: (x0,x1) => x0.createElement(x1),
      _1365: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1366: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _1367: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1367(f,arguments.length,x0) }),
      _1368: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1369: x0 => x0.remove(),
      _1370: x0 => x0.click(),
      _1371: () => ({}),
      _1372: x0 => globalThis.pdfjsLib.getDocument(x0),
      _1373: (x0,x1) => x0.getContext(x1),
      _1374: (x0,x1) => x0.getPage(x1),
      _1375: (x0,x1) => x0.getViewport(x1),
      _1376: (x0,x1) => x0.render(x1),
      _1377: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1377(f,arguments.length,x0) }),
      _1378: (x0,x1) => x0.toBlob(x1),
      _1379: () => new FileReader(),
      _1380: (x0,x1) => x0.readAsArrayBuffer(x1),
      _1381: x0 => x0.cleanup(),
      _1382: x0 => x0.destroy(),
      _1383: (x0,x1) => { x0.module = x1 },
      _1384: (x0,x1) => { x0.exports = x1 },
      _1385: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1386: () => globalThis.Notification.requestPermission(),
      _1392: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1392(f,arguments.length,x0) }),
      _1393: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1393(f,arguments.length,x0) }),
      _1394: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1394(f,arguments.length,x0) }),
      _1395: (x0,x1) => x0.replaceChildren(x1),
      _1396: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1396(f,arguments.length,x0) }),
      _1397: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1397(f,arguments.length,x0) }),
      _1398: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1398(f,arguments.length,x0) }),
      _1399: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1399(f,arguments.length,x0) }),
      _1400: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1400(f,arguments.length,x0) }),
      _1401: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1401(f,arguments.length,x0) }),
      _1402: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1402(f,arguments.length,x0) }),
      _1403: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1403(f,arguments.length,x0) }),
      _1404: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1404(f,arguments.length,x0) }),
      _1405: (x0,x1) => x0.end(x1),
      _1406: x0 => x0.load(),
      _1407: (x0,x1) => x0.removeAttribute(x1),
      _1408: (x0,x1) => x0.setSinkId(x1),
      _1409: x0 => x0.decode(),
      _1410: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1411: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1412: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1412(f,arguments.length,x0) }),
      _1413: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1413(f,arguments.length,x0) }),
      _1414: x0 => x0.send(),
      _1415: () => new XMLHttpRequest(),
      _1416: (x0,x1) => x0.getItem(x1),
      _1417: (x0,x1) => x0.removeItem(x1),
      _1418: (x0,x1,x2) => x0.setItem(x1,x2),
      _1419: (x0,x1) => x0.item(x1),
      _1421: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1421(f,arguments.length,x0) }),
      _1422: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1422(f,arguments.length,x0) }),
      _1423: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1423(f,arguments.length,x0) }),
      _1424: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1424(f,arguments.length,x0) }),
      _1425: x0 => new Blob(x0),
      _1428: (x0,x1,x2,x3,x4,x5,x6,x7) => ({apiKey: x0,authDomain: x1,databaseURL: x2,projectId: x3,storageBucket: x4,messagingSenderId: x5,measurementId: x6,appId: x7}),
      _1429: (x0,x1) => globalThis.firebase_core.initializeApp(x0,x1),
      _1430: x0 => globalThis.firebase_core.getApp(x0),
      _1431: () => globalThis.firebase_core.getApp(),
      _1432: (x0,x1,x2) => globalThis.firebase_core.registerVersion(x0,x1,x2),
      _1434: x0 => globalThis.firebase_messaging.getMessaging(x0),
      _1436: (x0,x1) => globalThis.firebase_messaging.getToken(x0,x1),
      _1438: (x0,x1) => globalThis.firebase_messaging.onMessage(x0,x1),
      _1439: (x0,x1) => ({next: x0,error: x1}),
      _1442: x0 => ({vapidKey: x0}),
      _1444: x0 => x0.title,
      _1445: x0 => x0.body,
      _1446: x0 => x0.image,
      _1447: x0 => x0.messageId,
      _1448: x0 => x0.collapseKey,
      _1449: x0 => x0.fcmOptions,
      _1450: x0 => x0.notification,
      _1451: x0 => x0.data,
      _1452: x0 => x0.from,
      _1453: x0 => x0.analyticsLabel,
      _1454: x0 => x0.link,
      _1455: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1455(f,arguments.length,x0) }),
      _1456: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1456(f,arguments.length,x0) }),
      _1458: () => globalThis.firebase_core.SDK_VERSION,
      _1464: x0 => x0.apiKey,
      _1466: x0 => x0.authDomain,
      _1468: x0 => x0.databaseURL,
      _1470: x0 => x0.projectId,
      _1472: x0 => x0.storageBucket,
      _1474: x0 => x0.messagingSenderId,
      _1476: x0 => x0.measurementId,
      _1478: x0 => x0.appId,
      _1480: x0 => x0.name,
      _1481: x0 => x0.options,
      _1482: (x0,x1) => x0.debug(x1),
      _1483: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1483(f,arguments.length,x0) }),
      _1484: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1484(f,arguments.length,x0,x1) }),
      _1485: (x0,x1) => ({createScript: x0,createScriptURL: x1}),
      _1486: (x0,x1,x2) => x0.createPolicy(x1,x2),
      _1487: (x0,x1) => x0.createScriptURL(x1),
      _1488: (x0,x1,x2) => x0.createScript(x1,x2),
      _1489: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1489(f,arguments.length,x0) }),
      _1491: x0 => x0.barcodeFormat,
      _1492: x0 => x0.text,
      _1493: x0 => x0.rawBytes,
      _1494: x0 => x0.resultPoints,
      _1496: Date.now,
      _1498: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1499: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1500: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1501: () => typeof dartUseDateNowForTicks !== "undefined",
      _1502: () => 1000 * performance.now(),
      _1503: () => Date.now(),
      _1504: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1505: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1506: () => new WeakMap(),
      _1507: (map, o) => map.get(o),
      _1508: (map, o, v) => map.set(o, v),
      _1509: x0 => new WeakRef(x0),
      _1510: x0 => x0.deref(),
      _1517: () => globalThis.WeakRef,
      _1521: s => JSON.stringify(s),
      _1522: s => printToConsole(s),
      _1523: (o, p, r) => o.replaceAll(p, () => r),
      _1524: (o, p, r) => o.replace(p, () => r),
      _1525: Function.prototype.call.bind(String.prototype.toLowerCase),
      _1526: s => s.toUpperCase(),
      _1527: s => s.trim(),
      _1528: s => s.trimLeft(),
      _1529: s => s.trimRight(),
      _1530: (string, times) => string.repeat(times),
      _1531: Function.prototype.call.bind(String.prototype.indexOf),
      _1532: (s, p, i) => s.lastIndexOf(p, i),
      _1533: (string, token) => string.split(token),
      _1534: Object.is,
      _1535: o => o instanceof Array,
      _1536: (a, i) => a.push(i),
      _1537: (a, i) => a.splice(i, 1)[0],
      _1539: (a, l) => a.length = l,
      _1540: a => a.pop(),
      _1541: (a, i) => a.splice(i, 1),
      _1542: (a, s) => a.join(s),
      _1543: (a, s, e) => a.slice(s, e),
      _1545: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1546: a => a.length,
      _1548: (a, i) => a[i],
      _1549: (a, i, v) => a[i] = v,
      _1551: o => {
        if (o instanceof ArrayBuffer) return 0;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 1;
        }
        return 2;
      },
      _1552: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1554: o => o instanceof Uint8Array,
      _1555: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1556: o => o instanceof Int8Array,
      _1557: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1558: o => o instanceof Uint8ClampedArray,
      _1559: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1560: o => o instanceof Uint16Array,
      _1561: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1562: o => o instanceof Int16Array,
      _1563: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1564: o => o instanceof Uint32Array,
      _1565: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1566: o => o instanceof Int32Array,
      _1567: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1569: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1570: o => o instanceof Float32Array,
      _1571: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1572: o => o instanceof Float64Array,
      _1573: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1574: (t, s) => t.set(s),
      _1575: l => new DataView(new ArrayBuffer(l)),
      _1576: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1577: o => o.byteLength,
      _1578: o => o.buffer,
      _1579: o => o.byteOffset,
      _1580: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1581: (b, o) => new DataView(b, o),
      _1582: (b, o, l) => new DataView(b, o, l),
      _1583: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1584: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1585: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1586: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1587: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1588: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1589: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1590: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1591: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1592: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1593: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1594: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1597: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1598: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1599: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1600: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1601: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1602: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1615: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1616: (handle) => clearTimeout(handle),
      _1617: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1618: (handle) => clearInterval(handle),
      _1619: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1620: () => Date.now(),
      _1621: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1622: (x0,x1) => x0.exec(x1),
      _1623: (x0,x1) => x0.test(x1),
      _1624: x0 => x0.pop(),
      _1626: o => o === undefined,
      _1628: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1630: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1631: o => o instanceof RegExp,
      _1632: (l, r) => l === r,
      _1633: o => o,
      _1634: o => o,
      _1635: o => o,
      _1636: b => !!b,
      _1637: o => o.length,
      _1639: (o, i) => o[i],
      _1640: f => f.dartFunction,
      _1641: () => ({}),
      _1642: () => [],
      _1644: () => globalThis,
      _1645: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1646: (o, p) => p in o,
      _1647: (o, p) => o[p],
      _1648: (o, p, v) => o[p] = v,
      _1649: (o, m, a) => o[m].apply(o, a),
      _1651: o => String(o),
      _1652: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      _1653: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1653(f,arguments.length,x0) }),
      _1654: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1654(f,arguments.length,x0,x1) }),
      _1655: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      _1656: o => [o],
      _1657: (o0, o1) => [o0, o1],
      _1658: (o0, o1, o2) => [o0, o1, o2],
      _1659: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      _1660: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1661: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1662: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1663: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1664: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1665: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1666: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1667: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1668: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1669: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1670: x0 => new ArrayBuffer(x0),
      _1671: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1673: x0 => x0.index,
      _1674: x0 => x0.groups,
      _1675: x0 => x0.flags,
      _1676: x0 => x0.multiline,
      _1677: x0 => x0.ignoreCase,
      _1678: x0 => x0.unicode,
      _1679: x0 => x0.dotAll,
      _1680: (x0,x1) => { x0.lastIndex = x1 },
      _1681: (o, p) => p in o,
      _1682: (o, p) => o[p],
      _1683: (o, p, v) => o[p] = v,
      _1684: (o, p) => delete o[p],
      _1685: () => new XMLHttpRequest(),
      _1686: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1690: x0 => x0.send(),
      _1692: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1692(f,arguments.length,x0) }),
      _1693: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1693(f,arguments.length,x0) }),
      _1694: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1695: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1701: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      _1703: () => new AbortController(),
      _1704: x0 => x0.abort(),
      _1705: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      _1706: (x0,x1) => globalThis.fetch(x0,x1),
      _1707: (x0,x1) => x0.get(x1),
      _1708: f => finalizeWrapper(f, function(x0,x1,x2) { return dartInstance.exports._1708(f,arguments.length,x0,x1,x2) }),
      _1709: (x0,x1) => x0.forEach(x1),
      _1710: x0 => x0.getReader(),
      _1711: x0 => x0.cancel(),
      _1712: x0 => x0.read(),
      _1713: x0 => x0.attachStreamToVideo,
      _1715: x0 => x0.decodeContinuously,
      _1719: x0 => x0.reset,
      _1721: x0 => x0.stopContinuousDecode,
      _1723: x0 => x0.stream,
      _1724: x0 => x0.videoElement,
      _1725: (x0,x1) => x0.key(x1),
      _1727: (x0,x1) => { x0.data = x1 },
      _1728: (x0,x1) => { x0.scale = x1 },
      _1729: (x0,x1) => { x0.canvasContext = x1 },
      _1730: (x0,x1) => { x0.viewport = x1 },
      _1731: (x0,x1) => { x0.cMapUrl = x1 },
      _1732: (x0,x1) => { x0.cMapPacked = x1 },
      _1733: x0 => x0.promise,
      _1734: x0 => x0.numPages,
      _1735: x0 => x0.width,
      _1736: x0 => x0.height,
      _1737: x0 => x0.promise,
      _1739: x0 => x0.facingMode,
      _1740: x0 => x0.getSettings(),
      _1741: (x0,x1) => ({width: x0,height: x1}),
      _1742: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      _1743: x0 => x0.trustedTypes,
      _1744: (x0,x1) => { x0.text = x1 },
      _1745: x0 => x0.random(),
      _1746: (x0,x1) => x0.getRandomValues(x1),
      _1747: () => globalThis.crypto,
      _1748: () => globalThis.Math,
      _1756: Function.prototype.call.bind(Number.prototype.toString),
      _1757: Function.prototype.call.bind(BigInt.prototype.toString),
      _1758: Function.prototype.call.bind(Number.prototype.toString),
      _1759: (d, digits) => d.toFixed(digits),
      _1763: () => globalThis.document,
      _1769: (x0,x1) => { x0.height = x1 },
      _1771: (x0,x1) => { x0.width = x1 },
      _1780: x0 => x0.style,
      _1783: x0 => x0.src,
      _1784: (x0,x1) => { x0.src = x1 },
      _1785: x0 => x0.naturalWidth,
      _1786: x0 => x0.naturalHeight,
      _1802: x0 => x0.status,
      _1803: (x0,x1) => { x0.responseType = x1 },
      _1805: x0 => x0.response,
      _1806: x0 => x0.x,
      _1807: x0 => x0.y,
      _1856: (x0,x1) => { x0.responseType = x1 },
      _1857: x0 => x0.response,
      _1904: (x0,x1) => { x0.lang = x1 },
      _1917: (x0,x1) => { x0.draggable = x1 },
      _1933: x0 => x0.style,
      _1946: (x0,x1) => { x0.oncancel = x1 },
      _1952: (x0,x1) => { x0.onchange = x1 },
      _1992: (x0,x1) => { x0.onerror = x1 },
      _2008: (x0,x1) => { x0.onload = x1 },
      _2032: (x0,x1) => { x0.onpause = x1 },
      _2034: (x0,x1) => { x0.onplay = x1 },
      _2290: (x0,x1) => { x0.target = x1 },
      _2292: (x0,x1) => { x0.download = x1 },
      _2317: (x0,x1) => { x0.href = x1 },
      _2410: (x0,x1) => { x0.src = x1 },
      _2421: (x0,x1) => { x0.width = x1 },
      _2423: (x0,x1) => { x0.height = x1 },
      _2505: x0 => x0.videoWidth,
      _2506: x0 => x0.videoHeight,
      _2535: x0 => x0.error,
      _2536: x0 => x0.src,
      _2537: (x0,x1) => { x0.src = x1 },
      _2545: (x0,x1) => { x0.preload = x1 },
      _2546: x0 => x0.buffered,
      _2549: x0 => x0.currentTime,
      _2550: (x0,x1) => { x0.currentTime = x1 },
      _2551: x0 => x0.duration,
      _2552: x0 => x0.paused,
      _2556: (x0,x1) => { x0.playbackRate = x1 },
      _2567: (x0,x1) => { x0.controls = x1 },
      _2569: (x0,x1) => { x0.volume = x1 },
      _2586: x0 => x0.code,
      _2587: x0 => x0.message,
      _2661: x0 => x0.length,
      _2857: (x0,x1) => { x0.accept = x1 },
      _2871: x0 => x0.files,
      _2897: (x0,x1) => { x0.multiple = x1 },
      _2915: (x0,x1) => { x0.type = x1 },
      _3165: (x0,x1) => { x0.src = x1 },
      _3167: (x0,x1) => { x0.type = x1 },
      _3171: (x0,x1) => { x0.async = x1 },
      _3173: (x0,x1) => { x0.defer = x1 },
      _3175: (x0,x1) => { x0.crossOrigin = x1 },
      _3177: (x0,x1) => { x0.text = x1 },
      _3209: x0 => x0.width,
      _3210: (x0,x1) => { x0.width = x1 },
      _3211: x0 => x0.height,
      _3212: (x0,x1) => { x0.height = x1 },
      _3633: () => globalThis.window,
      _3673: x0 => x0.document,
      _3676: x0 => x0.location,
      _3695: x0 => x0.navigator,
      _3957: x0 => x0.trustedTypes,
      _3958: x0 => x0.sessionStorage,
      _3959: x0 => x0.localStorage,
      _4067: x0 => x0.mediaDevices,
      _4083: x0 => x0.userAgent,
      _4084: x0 => x0.vendor,
      _4291: x0 => x0.length,
      _6195: x0 => x0.type,
      _6196: x0 => x0.target,
      _6236: x0 => x0.signal,
      _6297: x0 => x0.firstChild,
      _6308: () => globalThis.document,
      _6389: x0 => x0.body,
      _6391: x0 => x0.head,
      _6722: (x0,x1) => { x0.id = x1 },
      _6746: (x0,x1) => { x0.innerHTML = x1 },
      _6749: x0 => x0.children,
      _8068: x0 => x0.value,
      _8070: x0 => x0.done,
      _8250: x0 => x0.size,
      _8251: x0 => x0.type,
      _8258: x0 => x0.name,
      _8259: x0 => x0.lastModified,
      _8264: x0 => x0.length,
      _8269: x0 => x0.result,
      _8766: x0 => x0.url,
      _8768: x0 => x0.status,
      _8770: x0 => x0.statusText,
      _8771: x0 => x0.headers,
      _8772: x0 => x0.body,
      _9574: x0 => x0.label,
      _9596: x0 => x0.facingMode,
      _9810: x0 => x0.width,
      _9812: x0 => x0.height,
      _9818: x0 => x0.facingMode,
      _10896: (x0,x1) => { x0.border = x1 },
      _11174: (x0,x1) => { x0.display = x1 },
      _11338: (x0,x1) => { x0.height = x1 },
      _11532: (x0,x1) => { x0.objectFit = x1 },
      _11662: (x0,x1) => { x0.pointerEvents = x1 },
      _11960: (x0,x1) => { x0.transform = x1 },
      _11964: (x0,x1) => { x0.transformOrigin = x1 },
      _12028: (x0,x1) => { x0.width = x1 },
      _12396: x0 => x0.name,
      _13112: () => globalThis.console,
      _13140: x0 => x0.message,
      _13142: x0 => x0.name,
      _13143: x0 => x0.message,
      _13144: x0 => x0.code,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      S: new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
