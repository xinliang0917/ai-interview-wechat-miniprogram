

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)

(function (root, factory, globalExport) {

	var lib, env;
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['require'], function (req) {
			lib = factory(root, req);
			return lib;
		});
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.

		// use process.env (if available) for reading Opus environment settings:
		env = typeof process !== 'undefined' && process && process.env? process.env : root;
		lib = factory(env, module.require);
		module.exports = lib;
	} else {
		// Browser globals
		lib = factory(root);
		root[globalExport] = lib;
	}

}(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function (global, require) {
'use strict';

var Module = {};
Module['isReady'] = false;
Module['onready'] = null;
Module['onRuntimeInitialized'] = function(){
	Module['isReady'] = true;
	if(Module['onready']) setTimeout(Module['onready'], 0);
};

if(global && global.OPUS_SCRIPT_LOCATION){
	Module['locateFile'] = function(fileName){
		var path = global.OPUS_SCRIPT_LOCATION || '';
		if(path[fileName]) return path[fileName];
		path += path && !/\/$/.test(path)? '/' : '';
		return path + fileName;
	};
}



// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

var nodeFS;
var nodePath;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  if (!nodeFS) nodeFS = require('fs');
  if (!nodePath) nodePath = require('path');
  filename = nodePath['normalize'](filename);
  return nodeFS['readFileSync'](filename, binary ? null : 'utf8');
};

readBinary = function readBinary(filename) {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else
if (ENVIRONMENT_IS_SHELL) {

  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status) {
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = /** @type{!Console} */({});
    console.log = /** @type{!function(this:Console, ...*): undefined} */ (print);
    console.warn = console.error = /** @type{!function(this:Console, ...*): undefined} */ (typeof printErr !== 'undefined' ? printErr : print);
  }

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document !== 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {

// include: web_or_worker_shell_read.js


  read_ = function(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = function(title) { document.title = title };
} else
{
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




var STACK_ALIGN = 16;

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {
  return func;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    for (var i = 0; i < wasmTable.length; i++) {
      var item = wasmTable.get(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    wasmTable.set(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    wasmTable.set(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {

  return addFunctionWasm(func, sig);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;

// include: wasm2js.js


// wasm2js.js - enough of a polyfill for the WebAssembly object so that we can load
// wasm2js code that way.

// Emit "var WebAssembly" if definitely using wasm2js. Otherwise, in MAYBE_WASM2JS
// mode, we can't use a "var" since it would prevent normal wasm from working.
/** @suppress{duplicate, const} */
var
WebAssembly = {
  // Note that we do not use closure quoting (this['buffer'], etc.) on these
  // functions, as they are just meant for internal use. In other words, this is
  // not a fully general polyfill.
  Memory: function(opts) {
    this.buffer = new ArrayBuffer(opts['initial'] * 65536);
  },

  Module: function(binary) {
    // TODO: use the binary and info somehow - right now the wasm2js output is embedded in
    // the main JS
  },

  Instance: function(module, info) {
    // TODO: use the module and info somehow - right now the wasm2js output is embedded in
    // the main JS
    // This will be replaced by the actual wasm2js code.
    this.exports = (
// EMSCRIPTEN_START_ASM
function instantiate(asmLibraryArg) {
function Table(ret) {
  // grow method not included; table is not growable
  ret.set = function(i, func) {
    this[i] = func;
  };
  ret.get = function(i) {
    return this[i];
  };
  return ret;
}

  var bufferView;
  var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
  for (var i = 25; i >= 0; --i) {
    base64ReverseLookup[48+i] = 52+i; // '0-9'
    base64ReverseLookup[65+i] = i; // 'A-Z'
    base64ReverseLookup[97+i] = 26+i; // 'a-z'
  }
  base64ReverseLookup[43] = 62; // '+'
  base64ReverseLookup[47] = 63; // '/'
  /** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
  function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
    var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength*3>>2) - (b64[bLength-2] == '=') - (b64[bLength-1] == '=');
    for (; i < bLength; i += 4) {
      b1 = base64ReverseLookup[b64.charCodeAt(i+1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i+2)];
      uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
      if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
      if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i+3)];
    }
  }
function initActiveSegments(imports) {
  base64DecodeToExistingUint8Array(bufferView, 1024, "AwAAAAQAAAAEAAAABgAAAIP5ogBETm4A/CkVANFXJwDdNPUAYtvAADyZlQBBkEMAY1H+ALveqwC3YcUAOm4kANJNQgBJBuAACeouAByS0QDrHf4AKbEcAOg+pwD1NYIARLsuAJzphAC0JnAAQX5fANaROQBTgzkAnPQ5AItfhAAo+b0A+B87AN7/lwAPmAUAES/vAApaiwBtH20Az342AAnLJwBGT7cAnmY/AC3qXwC6J3UA5evHAD178QD3OQcAklKKAPtr6gAfsV8ACF2NADADVgB7/EYA8KtrACC8zwA29JoA46kdAF5hkQAIG+YAhZllAKAUXwCNQGgAgNj/ACdzTQAGBjEAylYVAMmocwB74mAAa4zAABnERwDNZ8MACejcAFmDKgCLdsQAphyWAESv3QAZV9EApT4FAAUH/wAzfj8AwjLoAJhP3gC7fTIAJj3DAB5r7wCf+F4ANR86AH/yygDxhx0AfJAhAGokfADVbvoAMC13ABU7QwC1FMYAwxmdAK3EwgAsTUEADABdAIZ9RgDjcS0Am8aaADNiAAC00nwAtKeXADdV1QDXPvYAoxAYAE12/ABknSoAcNerAGN8+AB6sFcAFxXnAMBJVgA71tkAp4Q4ACQjywDWincAWlQjAAAfuQDxChsAGc7fAJ8x/wBmHmoAmVdhAKz7RwB+f9gAImW3ADLoiQDmv2AA78TNAGw2CQBdP9QAFt7XAFg73gDem5IA0iIoACiG6ADiWE0AxsoyAAjjFgDgfcsAF8BQAPMdpwAY4FsALhM0AIMSYgCDSAEA9Y5bAK2wfwAe6fIASEpDABBn0wCq3dgArl9CAGphzgAKKKQA05m0AAam8gBcd38Ao8KDAGE8iACKc3gAr4xaAG/XvQAtpmMA9L/LAI2B7wAmwWcAVcpFAMrZNgAoqNIAwmGNABLJdwAEJhQAEkabAMRZxADIxUQATbKRAAAX8wDUQ60AKUnlAP3VEAAAvvwAHpTMAHDO7gATPvUA7PGAALPnwwDH+CgAkwWUAMFxPgAuCbMAC0XzAIgSnACrIHsALrWfAEeSwgB7Mi8ADFVtAHKnkABr5x8AMcuWAHkWSgBBeeIA9N+JAOiUlwDi5oQAmTGXAIjtawBfXzYAu/0OAEiatABnpGwAcXJCAI1dMgCfFbgAvOUJAI0xJQD3dDkAMAUcAA0MAQBLCGgALO5YAEeqkAB05wIAvdYkAPd9pgBuSHIAnxbvAI6UpgC0kfYA0VNRAM8K8gAgmDMA9Ut+ALJjaADdPl8AQF0DAIWJfwBVUikAN2TAAG3YEAAySDIAW0x1AE5x1ABFVG4ACwnBACr1aQAUZtUAJwedAF0EUAC0O9sA6nbFAIf5FwBJa30AHSe6AJZpKQDGzKwArRRUAJDiagCI2YkALHJQAASkvgB3B5QA8zBwAAD8JwDqcagAZsJJAGTgPQCX3YMAoz+XAEOU/QANhowAMUHeAJI5nQDdcIwAF7fnAAjfOwAVNysAXICgAFqAkwAQEZIAD+jYAGyArwDb/0sAOJAPAFkYdgBipRUAYcu7AMeJuQAQQL0A0vIEAEl1JwDrtvYA2yK7AAoUqgCJJi8AZIN2AAk7MwAOlBoAUTqqAB2jwgCv7a4AXCYSAG3CTQAtepwAwFaXAAM/gwAJ8PYAK0CMAG0xmQA5tAcADCAVANjDWwD1ksQAxq1LAE7KpQCnN80A5qk2AKuSlADdQmgAGWPeAHaM7wBoi1IA/Ns3AK6hqwDfFTEAAK6hAAz72gBkTWYA7QW3ACllMABXVr8AR/86AGr5uQB1vvMAKJPfAKuAMABmjPYABMsVAPoiBgDZ5B0APbOkAFcbjwA2zQkATkLpABO+pAAzI7UA8KoaAE9lqADSwaUACz8PAFt4zQAj+XYAe4sEAIkXcgDGplMAb27iAO/rAACbSlgAxNq3AKpmugB2z88A0QIdALHxLQCMmcEAw613AIZI2gD3XaAAxoD0AKzwLwDd7JoAP1y8ANDebQCQxx8AKtu2AKMlOgAAr5oArVOTALZXBAApLbQAS4B+ANoHpwB2qg4Ae1mhABYSKgDcty0A+uX9AInb/gCJvv0A5HZsAAap/AA+gHAAhW4VAP2H/wAoPgcAYWczACoYhgBNveoAs+evAI9tbgCVZzkAMb9bAITXSAAw3xYAxy1DACVhNQDJcM4AMMu4AL9s/QCkAKIABWzkAFrdoAAhb0cAYhLSALlchABwYUkAa1bgAJlSAQBQVTcAHtW3ADPxxAATbl8AXTDkAIUuqQAdssMAoTI2AAi3pADqsdQAFvchAI9p5AAn/3cADAOAAI1ALQBPzaAAIKWZALOi0wAvXQoAtPlCABHaywB9vtAAm9vBAKsXvQDKooEACGpcAC5VFwAnAFUAfxTwAOEHhgAUC2QAlkGNAIe+3gDa/SoAayW2AHuJNAAF8/4Aub+eAGhqTwBKKqgAT8RaAC34vADXWpgA9MeVAA1NjQAgOqYApFdfABQ/sQCAOJUAzCABAHHdhgDJ3rYAv2D1AE1lEQABB2sAjLCsALLA0ABRVUgAHvsOAJVywwCjBjsAwEA1AAbcewDgRcwATin6ANbKyADo80EAfGTeAJtk2ADZvjEApJfDAHdY1ABp48UA8NoTALo6PABGGEYAVXVfANK99QBuksYArC5dAA5E7QAcPkIAYcSHACn96QDn1vMAInzKAG+RNQAI4MUA/9eNAG5q4gCw/cYAkwjBAHxddABrrbIAzW6dAD5yewDGEWoA98+pAClz3wC1yboAtwBRAOKyDQB0uiQA5X1gAHTYigANFSwAgRgMAH5mlAABKRYAn3p2AP39vgBWRe8A2X42AOzZEwCLurkAxJf8ADGoJwDxbsMAlMU2ANioVgC0qLUAz8wOABKJLQBvVzQALFaJAJnO4wDWILkAa16qAD4qnAARX8wA/QtKAOH0+wCOO20A4oYsAOnUhAD8tKkA7+7RAC41yQAvOWEAOCFEABvZyACB/AoA+0pqAC8c2ABTtIQATpmMAFQizAAqVdwAwMbWAAsZlgAacLgAaZVkACZaYAA/Uu4AfxEPAPS1EQD8y/UANLwtADS87gDoXcwA3V5gAGeOmwCSM+8AyRe4AGFYmwDhV7wAUYPGANg+EADdcUgALRzdAK8YoQAhLEYAWfPXANl6mACeVMAAT4b6AFYG/ADlea4AiSI2ADitIgBnk9wAVeiqAIImOADK55sAUQ2kAJkzsQCp1w4AaQVIAGWy8AB/iKcAiEyXAPnRNgAhkrMAe4JKAJjPIQBAn9wA3EdVAOF0OgBn60IA/p3fAF7UXwB7Z6QAuqx6AFX2ogAriCMAQbpVAFluCAAhKoYAOUeDAInj5gDlntQASftAAP9W6QAcD8oAxVmKAJT6KwDTwcUAD8XPANtargBHxYYAhUNiACGGOwAseZQAEGGHACpMewCALBoAQ78SAIgmkAB4PIkAqMTkAOXbewDEOsIAJvTqAPdnigANkr8AZaMrAD2TsQC9fAsApFHcACfdYwBp4d0AmpQZAKgplQBozigACe20AESfIABOmMoAcIJjAH58IwAPuTIAp/WOABRW5wAh8QgAtZ0qAG9+TQClGVEAtfmrAILf1gCW3WEAFjYCAMQ6nwCDoqEAcu1tADmNegCCuKkAazJcAEYnWwAANO0A0gB3APz0VQABWU0A4HGA");
  base64DecodeToExistingUint8Array(bufferView, 3811, "QPsh+T8AAAAALUR0PgAAAICYRvg8AAAAYFHMeDsAAACAgxvwOQAAAEAgJXo4AAAAgCKC4zYAAAAAHfNpNQgAAAAEAAAA4XpUP/YoXD/8DwAAEAAAAAQAAACamVk/rkdhP/wPAAAgAAAABAAAAMHKYT/D9Wg//A8AADAAAAAIAAAAuB5lP4PAaj8EEAAAQAAAAAgAAACoxms/16NwPwQQAABQAAAAEAAAADEIbD/Xo3A/DBAAAGAAAAAQAAAA16NwP4XrcT8MEAAAgAAAABAAAAAzM3M/MzNzPwwQAACgAAAAEAAAAI/CdT+PwnU/DBAAAMAAAAAgAAAA2c53P9nOdz8UEAAAAAEAACAAAACamXk/mpl5PxQQAAAgEAAAIAAAAEARAAAgAAAAYBIAACAAAACAEwAAQAAAAAAAAAAlkeC6IOrvPwAAAAAAAPA/JZHguiDq7z/eSyvPzajvP1of/5rmPO8/Vc8Xtdqn7j++oGT2ouvtP9eQbjq4Cu0/i+jPZQcI7D+13m+04+bqP1gAdBT3quk/InJVNDFY6D9Qxa5ptfLmP1jktgHIfuU/lEUnbLsA5D9HK0pL3XziP6mj42pk9+A/qqmXpb7o3j8WxHqCSO/bP0tmzI+FCdk/P+nhV+491j/Cam59P5LTP6C+p2ppC9E/K3JfOQhbzT8nmWIvkPfIP6EHyq8X8cQ/ymKsgIxKwT8ixb5sVAq8P2GFAIUfQbY/j95wH7k1sT9DhMmeTsOpPyF7e98ReKI/80co6LznmD9Z7Q7n6XWOPyECDqFKzX4/AAAAAAAAAADBU0zOHuLvPwAAAAAAAPA/wVNMzh7i7z/PQsiaDYnvPwxt55h/9u4/iBIteTwt7j+aTfS3DDHtP7WwwLqeBuw/zJkOGWaz6j/ceSzHdT3pP1GrIrtWq+c/lTbJTdwD5j91q+ek903kP3cAm96LkOI/E4HqH0TS4D/GAMPR2TLeP1M+BFWj19o/2QhhwT+d1z+oagbhn4zUP24kfRgprdE/Wu959kMJzj8bAGArVy7JP1GWaxuQzsQ/i+xardnrwD/p1ilefgq7P98X+tRvLrU/Bg2BTAA4sD/KvUTl9C+oP6YV+O2YeKE/S/VT0nlDmD+Uz5/0jQGQPwBuNz3/qIM/3mkZRs2ZdT/ghYzL4ShjP/yp8dJNYkA/AAAAAAAAAAC5pqOQItrvPwAAAAAAAPA/uaajkCLa7z+FCxbae2nvP0RGzXjXsO4/JlPDhsC07T8z2i5dVnvsP6nOFzkTDOs/qepxIYdv6T9y5pEeCq/nP9bRacRp1OU/wKekFJXp4z85oADlSvjhP+qDG9/NCeA/VWrVMkJN3D9DXd77n6zYPw9a9sGFPtU/HwXbykMN0j+gZzcjGEHOP4yLevPh+sg/8K5IhvtMxD904ycfzDfAP+5his0ib7k/O05VygCKsz/oYS7K6FetPyQzzSoieaU/u2lt+cyCnj8iLHRvj++UPz4R3RbZjIs/XcJfm6YygT9QCLLYBQd0P4HIKr4EG2U/3O6rk6/bUj8bypqibUY3Pw==");
  base64DecodeToExistingUint8Array(bufferView, 4992, "yFEM0oT07z8AAAAAAADwP8hRDNKE9O8/9pUH6SnS7z/a08TxMpnvP9T9ENkPSu8/fp+7blvl7j9hwT+d2WvuPx3X8SV13u0/an9v7Dw+7T/J6jXBYIzsP3ckRQEuyus/Hrx+2gv56j860L80dxrqP/UlI4D+L+k/8kBDgz076D8OB1Pe2D3nP/fyr6N5OeY/TMjFIMkv5T/OuHiRbCLkP/+ZWhkBE+M/L5wx7RcD4j9j2QbNMvTgP01ahnKBz98/zY9k+zW+3T8VxjeQBbfbP+AHrag9vNk/YDMKk/PP1z/zHfzEAfTVP0qFZ/gFKtQ/5808FGBz0j+NyjQ3MtHQP9jRevDBiM4/ryd4Eiqbyz/ISJPeedrIP7XPWyMfR8Y/PVdCFB/hwz+1zQFAHajBP026kLvGNr8/LgwmONRzuz9mkgUKxAS4P4BUFsd55rQ/YkhOJm4Vsj+kFYSXhRuvP+yy6yCnlqo/l6hBRZOTpj8+eC/vWAmjP9XnrEfI3Z8/bM9NFzl2mj/08djo/8mVPw8LtaZ5x5E/VRds+h67jD/+pLEosveGPzy3lup+JYI/pfu1zFROfD9nH1R3n8J1PwXEfxU7dXA/dH+znJ1vaD/T8PMAksBhP/dS2/qnI1k/P8Gs7XlAUT/xQgCR+sJGP3uyzVM+gDw/JlGSIvCPMD/HVG5gehQhP32Jfzcgqws/8WjjiLX45D4=");
  base64DecodeToExistingUint8Array(bufferView, 5536, "oBdQ");
}

  var scratchBuffer = new ArrayBuffer(16);
  var i32ScratchView = new Int32Array(scratchBuffer);
  var f32ScratchView = new Float32Array(scratchBuffer);
  var f64ScratchView = new Float64Array(scratchBuffer);
  
  function wasm2js_scratch_load_i32(index) {
    return i32ScratchView[index];
  }
      
  function wasm2js_scratch_store_i32(index, value) {
    i32ScratchView[index] = value;
  }
      
  function wasm2js_scratch_load_f64() {
    return f64ScratchView[0];
  }
      
  function wasm2js_scratch_store_f64(value) {
    f64ScratchView[0] = value;
  }
      
function asmFunc(env) {
 var memory = env.memory;
 var buffer = memory.buffer;
 var HEAP8 = new Int8Array(buffer);
 var HEAP16 = new Int16Array(buffer);
 var HEAP32 = new Int32Array(buffer);
 var HEAPU8 = new Uint8Array(buffer);
 var HEAPU16 = new Uint16Array(buffer);
 var HEAPU32 = new Uint32Array(buffer);
 var HEAPF32 = new Float32Array(buffer);
 var HEAPF64 = new Float64Array(buffer);
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_abs = Math.abs;
 var Math_clz32 = Math.clz32;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_floor = Math.floor;
 var Math_ceil = Math.ceil;
 var Math_trunc = Math.trunc;
 var Math_sqrt = Math.sqrt;
 var abort = env.abort;
 var nan = NaN;
 var infinity = Infinity;
 var emscripten_resize_heap = env.emscripten_resize_heap;
 var emscripten_memcpy_big = env.emscripten_memcpy_big;
 var __stack_pointer = 5248928;
 var i64toi32_i32$HIGH_BITS = 0;
 // EMSCRIPTEN_START_FUNCS
function dlmalloc($0) {
 $0 = $0 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0;
 $12 = __stack_pointer - 16 | 0;
 __stack_pointer = $12;
 label$1 : {
  label$2 : {
   label$3 : {
    label$4 : {
     label$5 : {
      label$6 : {
       label$7 : {
        label$8 : {
         label$9 : {
          label$10 : {
           label$11 : {
            label$12 : {
             if ($0 >>> 0 <= 244) {
              $6 = HEAP32[1386];
              $4 = $0 >>> 0 < 11 ? 16 : $0 + 11 & -8;
              $2 = $4 >>> 3 | 0;
              $0 = $6 >>> $2 | 0;
              if ($0 & 3) {
               $4 = (($0 ^ -1) & 1) + $2 | 0;
               $3 = $4 << 3;
               $2 = HEAP32[$3 + 5592 >> 2];
               $0 = $2 + 8 | 0;
               $1 = HEAP32[$2 + 8 >> 2];
               $3 = $3 + 5584 | 0;
               label$15 : {
                if (($1 | 0) == ($3 | 0)) {
                 HEAP32[1386] = __wasm_rotl_i32(-2, $4) & $6;
                 break label$15;
                }
                HEAP32[$1 + 12 >> 2] = $3;
                HEAP32[$3 + 8 >> 2] = $1;
               }
               $1 = $4 << 3;
               HEAP32[$2 + 4 >> 2] = $1 | 3;
               $2 = $2 + $1 | 0;
               HEAP32[$2 + 4 >> 2] = HEAP32[$2 + 4 >> 2] | 1;
               break label$1;
              }
              $9 = HEAP32[1388];
              if ($9 >>> 0 >= $4 >>> 0) {
               break label$12;
              }
              if ($0) {
               $1 = $0 << $2;
               $0 = 2 << $2;
               $0 = $1 & ($0 | 0 - $0);
               $0 = ($0 & 0 - $0) - 1 | 0;
               $1 = $0;
               $0 = $0 >>> 12 & 16;
               $2 = $1 >>> $0 | 0;
               $1 = $2 >>> 5 & 8;
               $3 = $0 | $1;
               $0 = $2 >>> $1 | 0;
               $2 = $0 >>> 2 & 4;
               $1 = $3 | $2;
               $0 = $0 >>> $2 | 0;
               $2 = $0 >>> 1 & 2;
               $1 = $1 | $2;
               $0 = $0 >>> $2 | 0;
               $2 = $0 >>> 1 & 1;
               $1 = ($1 | $2) + ($0 >>> $2 | 0) | 0;
               $3 = $1 << 3;
               $2 = HEAP32[$3 + 5592 >> 2];
               $0 = HEAP32[$2 + 8 >> 2];
               $3 = $3 + 5584 | 0;
               label$18 : {
                if (($0 | 0) == ($3 | 0)) {
                 $6 = __wasm_rotl_i32(-2, $1) & $6;
                 HEAP32[1386] = $6;
                 break label$18;
                }
                HEAP32[$0 + 12 >> 2] = $3;
                HEAP32[$3 + 8 >> 2] = $0;
               }
               $0 = $2 + 8 | 0;
               HEAP32[$2 + 4 >> 2] = $4 | 3;
               $3 = $2 + $4 | 0;
               $5 = $1 << 3;
               $1 = $5 - $4 | 0;
               HEAP32[$3 + 4 >> 2] = $1 | 1;
               HEAP32[$2 + $5 >> 2] = $1;
               if ($9) {
                $5 = $9 >>> 3 | 0;
                $4 = ($5 << 3) + 5584 | 0;
                $2 = HEAP32[1391];
                $5 = 1 << $5;
                label$21 : {
                 if (!($6 & $5)) {
                  HEAP32[1386] = $5 | $6;
                  $5 = $4;
                  break label$21;
                 }
                 $5 = HEAP32[$4 + 8 >> 2];
                }
                HEAP32[$4 + 8 >> 2] = $2;
                HEAP32[$5 + 12 >> 2] = $2;
                HEAP32[$2 + 12 >> 2] = $4;
                HEAP32[$2 + 8 >> 2] = $5;
               }
               HEAP32[1391] = $3;
               HEAP32[1388] = $1;
               break label$1;
              }
              $8 = HEAP32[1387];
              if (!$8) {
               break label$12;
              }
              $0 = (0 - $8 & $8) - 1 | 0;
              $1 = $0;
              $0 = $0 >>> 12 & 16;
              $2 = $1 >>> $0 | 0;
              $1 = $2 >>> 5 & 8;
              $3 = $0 | $1;
              $0 = $2 >>> $1 | 0;
              $2 = $0 >>> 2 & 4;
              $1 = $3 | $2;
              $0 = $0 >>> $2 | 0;
              $2 = $0 >>> 1 & 2;
              $1 = $1 | $2;
              $0 = $0 >>> $2 | 0;
              $2 = $0 >>> 1 & 1;
              $3 = HEAP32[(($1 | $2) + ($0 >>> $2 | 0) << 2) + 5848 >> 2];
              $2 = (HEAP32[$3 + 4 >> 2] & -8) - $4 | 0;
              $1 = $3;
              while (1) {
               label$24 : {
                $0 = HEAP32[$1 + 16 >> 2];
                if (!$0) {
                 $0 = HEAP32[$1 + 20 >> 2];
                 if (!$0) {
                  break label$24;
                 }
                }
                $1 = (HEAP32[$0 + 4 >> 2] & -8) - $4 | 0;
                $5 = $1;
                $1 = $2 >>> 0 > $1 >>> 0;
                $2 = $1 ? $5 : $2;
                $3 = $1 ? $0 : $3;
                $1 = $0;
                continue;
               }
               break;
              }
              $10 = $3 + $4 | 0;
              if ($10 >>> 0 <= $3 >>> 0) {
               break label$11;
              }
              $11 = HEAP32[$3 + 24 >> 2];
              $5 = HEAP32[$3 + 12 >> 2];
              if (($5 | 0) != ($3 | 0)) {
               $0 = HEAP32[$3 + 8 >> 2];
               HEAP32[$0 + 12 >> 2] = $5;
               HEAP32[$5 + 8 >> 2] = $0;
               break label$2;
              }
              $1 = $3 + 20 | 0;
              $0 = HEAP32[$1 >> 2];
              if (!$0) {
               $0 = HEAP32[$3 + 16 >> 2];
               if (!$0) {
                break label$10;
               }
               $1 = $3 + 16 | 0;
              }
              while (1) {
               $7 = $1;
               $5 = $0;
               $1 = $0 + 20 | 0;
               $0 = HEAP32[$1 >> 2];
               if ($0) {
                continue;
               }
               $1 = $5 + 16 | 0;
               $0 = HEAP32[$5 + 16 >> 2];
               if ($0) {
                continue;
               }
               break;
              }
              HEAP32[$7 >> 2] = 0;
              break label$2;
             }
             $4 = -1;
             if ($0 >>> 0 > 4294967231) {
              break label$12;
             }
             $0 = $0 + 11 | 0;
             $4 = $0 & -8;
             $9 = HEAP32[1387];
             if (!$9) {
              break label$12;
             }
             $7 = 31;
             if ($4 >>> 0 <= 16777215) {
              $0 = $0 >>> 8 | 0;
              $1 = $0;
              $0 = $0 + 1048320 >>> 16 & 8;
              $2 = $1 << $0;
              $1 = $2;
              $2 = $2 + 520192 >>> 16 & 4;
              $1 = $1 << $2;
              $3 = $1;
              $1 = $1 + 245760 >>> 16 & 2;
              $0 = ($3 << $1 >>> 15 | 0) - ($0 | $2 | $1) | 0;
              $7 = ($0 << 1 | $4 >>> $0 + 21 & 1) + 28 | 0;
             }
             $2 = 0 - $4 | 0;
             $1 = HEAP32[($7 << 2) + 5848 >> 2];
             label$31 : {
              label$32 : {
               label$33 : {
                if (!$1) {
                 $0 = 0;
                 break label$33;
                }
                $0 = 0;
                $3 = $4 << (($7 | 0) == 31 ? 0 : 25 - ($7 >>> 1 | 0) | 0);
                while (1) {
                 label$36 : {
                  $6 = (HEAP32[$1 + 4 >> 2] & -8) - $4 | 0;
                  if ($6 >>> 0 >= $2 >>> 0) {
                   break label$36;
                  }
                  $5 = $1;
                  $2 = $6;
                  if ($2) {
                   break label$36;
                  }
                  $2 = 0;
                  $0 = $1;
                  break label$32;
                 }
                 $6 = HEAP32[$1 + 20 >> 2];
                 $1 = HEAP32[(($3 >>> 29 & 4) + $1 | 0) + 16 >> 2];
                 $0 = $6 ? ($6 | 0) == ($1 | 0) ? $0 : $6 : $0;
                 $3 = $3 << 1;
                 if ($1) {
                  continue;
                 }
                 break;
                }
               }
               if (!($0 | $5)) {
                $0 = 2 << $7;
                $0 = ($0 | 0 - $0) & $9;
                if (!$0) {
                 break label$12;
                }
                $0 = (0 - $0 & $0) - 1 | 0;
                $1 = $0;
                $0 = $0 >>> 12 & 16;
                $1 = $1 >>> $0 | 0;
                $3 = $1 >>> 5 & 8;
                $6 = $0 | $3;
                $0 = $1 >>> $3 | 0;
                $1 = $0 >>> 2 & 4;
                $3 = $6 | $1;
                $0 = $0 >>> $1 | 0;
                $1 = $0 >>> 1 & 2;
                $3 = $3 | $1;
                $0 = $0 >>> $1 | 0;
                $1 = $0 >>> 1 & 1;
                $0 = HEAP32[(($3 | $1) + ($0 >>> $1 | 0) << 2) + 5848 >> 2];
               }
               if (!$0) {
                break label$31;
               }
              }
              while (1) {
               $6 = (HEAP32[$0 + 4 >> 2] & -8) - $4 | 0;
               $3 = $6 >>> 0 < $2 >>> 0;
               $2 = $3 ? $6 : $2;
               $5 = $3 ? $0 : $5;
               $1 = HEAP32[$0 + 16 >> 2];
               if (!$1) {
                $1 = HEAP32[$0 + 20 >> 2];
               }
               $0 = $1;
               if ($0) {
                continue;
               }
               break;
              }
             }
             if (!$5 | HEAP32[1388] - $4 >>> 0 <= $2 >>> 0) {
              break label$12;
             }
             $7 = $4 + $5 | 0;
             if ($7 >>> 0 <= $5 >>> 0) {
              break label$11;
             }
             $8 = HEAP32[$5 + 24 >> 2];
             $3 = HEAP32[$5 + 12 >> 2];
             if (($5 | 0) != ($3 | 0)) {
              $0 = HEAP32[$5 + 8 >> 2];
              HEAP32[$0 + 12 >> 2] = $3;
              HEAP32[$3 + 8 >> 2] = $0;
              break label$3;
             }
             $1 = $5 + 20 | 0;
             $0 = HEAP32[$1 >> 2];
             if (!$0) {
              $0 = HEAP32[$5 + 16 >> 2];
              if (!$0) {
               break label$9;
              }
              $1 = $5 + 16 | 0;
             }
             while (1) {
              $6 = $1;
              $3 = $0;
              $1 = $0 + 20 | 0;
              $0 = HEAP32[$1 >> 2];
              if ($0) {
               continue;
              }
              $1 = $3 + 16 | 0;
              $0 = HEAP32[$3 + 16 >> 2];
              if ($0) {
               continue;
              }
              break;
             }
             HEAP32[$6 >> 2] = 0;
             break label$3;
            }
            $0 = HEAP32[1388];
            if ($4 >>> 0 <= $0 >>> 0) {
             $2 = HEAP32[1391];
             $1 = $0 - $4 | 0;
             label$45 : {
              if ($1 >>> 0 >= 16) {
               HEAP32[1388] = $1;
               $3 = $2 + $4 | 0;
               HEAP32[1391] = $3;
               HEAP32[$3 + 4 >> 2] = $1 | 1;
               HEAP32[$0 + $2 >> 2] = $1;
               HEAP32[$2 + 4 >> 2] = $4 | 3;
               break label$45;
              }
              HEAP32[1391] = 0;
              HEAP32[1388] = 0;
              HEAP32[$2 + 4 >> 2] = $0 | 3;
              $0 = $0 + $2 | 0;
              HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
             }
             $0 = $2 + 8 | 0;
             break label$1;
            }
            $3 = HEAP32[1389];
            if ($4 >>> 0 < $3 >>> 0) {
             $2 = $3 - $4 | 0;
             HEAP32[1389] = $2;
             $0 = HEAP32[1392];
             $1 = $4 + $0 | 0;
             HEAP32[1392] = $1;
             HEAP32[$1 + 4 >> 2] = $2 | 1;
             HEAP32[$0 + 4 >> 2] = $4 | 3;
             $0 = $0 + 8 | 0;
             break label$1;
            }
            $0 = 0;
            $9 = $4 + 47 | 0;
            $1 = $9;
            if (HEAP32[1504]) {
             $2 = HEAP32[1506];
            } else {
             HEAP32[1507] = -1;
             HEAP32[1508] = -1;
             HEAP32[1505] = 4096;
             HEAP32[1506] = 4096;
             HEAP32[1504] = $12 + 12 & -16 ^ 1431655768;
             HEAP32[1509] = 0;
             HEAP32[1497] = 0;
             $2 = 4096;
            }
            $6 = $1 + $2 | 0;
            $7 = 0 - $2 | 0;
            $5 = $6 & $7;
            if ($5 >>> 0 <= $4 >>> 0) {
             break label$1;
            }
            $2 = HEAP32[1496];
            if ($2) {
             $1 = HEAP32[1494];
             $8 = $5 + $1 | 0;
             if ($2 >>> 0 < $8 >>> 0 | $1 >>> 0 >= $8 >>> 0) {
              break label$1;
             }
            }
            if (HEAPU8[5988] & 4) {
             break label$6;
            }
            label$51 : {
             label$52 : {
              $2 = HEAP32[1392];
              if ($2) {
               $0 = 5992;
               while (1) {
                $1 = HEAP32[$0 >> 2];
                if (HEAP32[$0 + 4 >> 2] + $1 >>> 0 > $2 >>> 0 ? $1 >>> 0 <= $2 >>> 0 : 0) {
                 break label$52;
                }
                $0 = HEAP32[$0 + 8 >> 2];
                if ($0) {
                 continue;
                }
                break;
               }
              }
              $3 = sbrk(0);
              if (($3 | 0) == -1) {
               break label$7;
              }
              $6 = $5;
              $0 = HEAP32[1505];
              $2 = $0 - 1 | 0;
              if ($3 & $2) {
               $6 = ($5 - $3 | 0) + ($2 + $3 & 0 - $0) | 0;
              }
              if ($6 >>> 0 > 2147483646 | $4 >>> 0 >= $6 >>> 0) {
               break label$7;
              }
              $0 = HEAP32[1496];
              if ($0) {
               $2 = HEAP32[1494];
               $1 = $6 + $2 | 0;
               if ($0 >>> 0 < $1 >>> 0 | $2 >>> 0 >= $1 >>> 0) {
                break label$7;
               }
              }
              $0 = sbrk($6);
              if (($3 | 0) != ($0 | 0)) {
               break label$51;
              }
              break label$5;
             }
             $6 = $6 - $3 & $7;
             if ($6 >>> 0 > 2147483646) {
              break label$7;
             }
             $3 = sbrk($6);
             if (($3 | 0) == (HEAP32[$0 >> 2] + HEAP32[$0 + 4 >> 2] | 0)) {
              break label$8;
             }
             $0 = $3;
            }
            if (!(($0 | 0) == -1 | $4 + 48 >>> 0 <= $6 >>> 0)) {
             $2 = HEAP32[1506];
             $2 = $2 + ($9 - $6 | 0) & 0 - $2;
             if ($2 >>> 0 > 2147483646) {
              $3 = $0;
              break label$5;
             }
             if ((sbrk($2) | 0) != -1) {
              $6 = $2 + $6 | 0;
              $3 = $0;
              break label$5;
             }
             sbrk(0 - $6 | 0);
             break label$7;
            }
            $3 = $0;
            if (($0 | 0) != -1) {
             break label$5;
            }
            break label$7;
           }
           abort();
          }
          $5 = 0;
          break label$2;
         }
         $3 = 0;
         break label$3;
        }
        if (($3 | 0) != -1) {
         break label$5;
        }
       }
       HEAP32[1497] = HEAP32[1497] | 4;
      }
      if ($5 >>> 0 > 2147483646) {
       break label$4;
      }
      $3 = sbrk($5);
      $1 = ($3 | 0) == -1;
      $0 = sbrk(0);
      if ($1 | $3 >>> 0 >= $0 >>> 0 | ($0 | 0) == -1) {
       break label$4;
      }
      $6 = $0 - $3 | 0;
      if ($6 >>> 0 <= $4 + 40 >>> 0) {
       break label$4;
      }
     }
     $0 = HEAP32[1494] + $6 | 0;
     HEAP32[1494] = $0;
     if (HEAPU32[1495] < $0 >>> 0) {
      HEAP32[1495] = $0;
     }
     label$62 : {
      label$63 : {
       label$64 : {
        $2 = HEAP32[1392];
        if ($2) {
         $0 = 5992;
         while (1) {
          $1 = HEAP32[$0 >> 2];
          $5 = HEAP32[$0 + 4 >> 2];
          if (($1 + $5 | 0) == ($3 | 0)) {
           break label$64;
          }
          $0 = HEAP32[$0 + 8 >> 2];
          if ($0) {
           continue;
          }
          break;
         }
         break label$63;
        }
        $0 = HEAP32[1390];
        if (!($0 >>> 0 <= $3 >>> 0 ? $0 : 0)) {
         HEAP32[1390] = $3;
        }
        $0 = 0;
        HEAP32[1499] = $6;
        HEAP32[1498] = $3;
        HEAP32[1394] = -1;
        HEAP32[1395] = HEAP32[1504];
        HEAP32[1501] = 0;
        while (1) {
         $2 = $0 << 3;
         $1 = $2 + 5584 | 0;
         HEAP32[$2 + 5592 >> 2] = $1;
         HEAP32[$2 + 5596 >> 2] = $1;
         $0 = $0 + 1 | 0;
         if (($0 | 0) != 32) {
          continue;
         }
         break;
        }
        $0 = $6 - 40 | 0;
        $2 = $3 + 8 & 7 ? -8 - $3 & 7 : 0;
        $1 = $0 - $2 | 0;
        HEAP32[1389] = $1;
        $2 = $2 + $3 | 0;
        HEAP32[1392] = $2;
        HEAP32[$2 + 4 >> 2] = $1 | 1;
        HEAP32[($0 + $3 | 0) + 4 >> 2] = 40;
        HEAP32[1393] = HEAP32[1508];
        break label$62;
       }
       if (HEAP32[$0 + 12 >> 2] & 8 | ($2 >>> 0 < $1 >>> 0 | $2 >>> 0 >= $3 >>> 0)) {
        break label$63;
       }
       HEAP32[$0 + 4 >> 2] = $5 + $6;
       $0 = $2 + 8 & 7 ? -8 - $2 & 7 : 0;
       $1 = $2 + $0 | 0;
       HEAP32[1392] = $1;
       $3 = HEAP32[1389] + $6 | 0;
       $0 = $3 - $0 | 0;
       HEAP32[1389] = $0;
       HEAP32[$1 + 4 >> 2] = $0 | 1;
       HEAP32[($2 + $3 | 0) + 4 >> 2] = 40;
       HEAP32[1393] = HEAP32[1508];
       break label$62;
      }
      $5 = HEAP32[1390];
      if ($5 >>> 0 > $3 >>> 0) {
       HEAP32[1390] = $3;
      }
      $1 = $3 + $6 | 0;
      $0 = 5992;
      label$70 : {
       label$71 : {
        label$72 : {
         label$73 : {
          label$74 : {
           label$75 : {
            while (1) {
             if (HEAP32[$0 >> 2] != ($1 | 0)) {
              $0 = HEAP32[$0 + 8 >> 2];
              if ($0) {
               continue;
              }
              break label$75;
             }
             break;
            }
            if (!(HEAPU8[$0 + 12 | 0] & 8)) {
             break label$74;
            }
           }
           $0 = 5992;
           while (1) {
            $1 = HEAP32[$0 >> 2];
            if ($1 >>> 0 <= $2 >>> 0) {
             $1 = HEAP32[$0 + 4 >> 2] + $1 | 0;
             if ($1 >>> 0 > $2 >>> 0) {
              break label$73;
             }
            }
            $0 = HEAP32[$0 + 8 >> 2];
            continue;
           }
          }
          HEAP32[$0 >> 2] = $3;
          HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] + $6;
          $7 = ($3 + 8 & 7 ? -8 - $3 & 7 : 0) + $3 | 0;
          HEAP32[$7 + 4 >> 2] = $4 | 3;
          $6 = ($1 + 8 & 7 ? -8 - $1 & 7 : 0) + $1 | 0;
          $1 = ($6 - $7 | 0) - $4 | 0;
          $4 = $4 + $7 | 0;
          if (($2 | 0) == ($6 | 0)) {
           HEAP32[1392] = $4;
           $0 = HEAP32[1389] + $1 | 0;
           HEAP32[1389] = $0;
           HEAP32[$4 + 4 >> 2] = $0 | 1;
           break label$71;
          }
          if (HEAP32[1391] == ($6 | 0)) {
           HEAP32[1391] = $4;
           $0 = HEAP32[1388] + $1 | 0;
           HEAP32[1388] = $0;
           HEAP32[$4 + 4 >> 2] = $0 | 1;
           HEAP32[$0 + $4 >> 2] = $0;
           break label$71;
          }
          $0 = HEAP32[$6 + 4 >> 2];
          if (($0 & 3) == 1) {
           $9 = $0 & -8;
           label$83 : {
            if ($0 >>> 0 <= 255) {
             $8 = $0 >>> 3 | 0;
             $0 = ($8 << 3) + 5584 | 0;
             $3 = HEAP32[$6 + 8 >> 2];
             $2 = HEAP32[$6 + 12 >> 2];
             if (($3 | 0) == ($2 | 0)) {
              HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $8);
              break label$83;
             }
             HEAP32[$3 + 12 >> 2] = $2;
             HEAP32[$2 + 8 >> 2] = $3;
             break label$83;
            }
            $8 = HEAP32[$6 + 24 >> 2];
            $3 = HEAP32[$6 + 12 >> 2];
            label$86 : {
             if (($6 | 0) != ($3 | 0)) {
              $0 = HEAP32[$6 + 8 >> 2];
              HEAP32[$0 + 12 >> 2] = $3;
              HEAP32[$3 + 8 >> 2] = $0;
              break label$86;
             }
             label$89 : {
              $0 = $6 + 20 | 0;
              $2 = HEAP32[$0 >> 2];
              if ($2) {
               break label$89;
              }
              $0 = $6 + 16 | 0;
              $2 = HEAP32[$0 >> 2];
              if ($2) {
               break label$89;
              }
              $3 = 0;
              break label$86;
             }
             while (1) {
              $5 = $0;
              $3 = $2;
              $0 = $2 + 20 | 0;
              $2 = HEAP32[$0 >> 2];
              if ($2) {
               continue;
              }
              $0 = $3 + 16 | 0;
              $2 = HEAP32[$3 + 16 >> 2];
              if ($2) {
               continue;
              }
              break;
             }
             HEAP32[$5 >> 2] = 0;
            }
            if (!$8) {
             break label$83;
            }
            $2 = HEAP32[$6 + 28 >> 2];
            $0 = ($2 << 2) + 5848 | 0;
            label$91 : {
             if (HEAP32[$0 >> 2] == ($6 | 0)) {
              HEAP32[$0 >> 2] = $3;
              if ($3) {
               break label$91;
              }
              HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $2);
              break label$83;
             }
             HEAP32[(HEAP32[$8 + 16 >> 2] == ($6 | 0) ? 16 : 20) + $8 >> 2] = $3;
             if (!$3) {
              break label$83;
             }
            }
            HEAP32[$3 + 24 >> 2] = $8;
            $0 = HEAP32[$6 + 16 >> 2];
            if ($0) {
             HEAP32[$3 + 16 >> 2] = $0;
             HEAP32[$0 + 24 >> 2] = $3;
            }
            $0 = HEAP32[$6 + 20 >> 2];
            if (!$0) {
             break label$83;
            }
            HEAP32[$3 + 20 >> 2] = $0;
            HEAP32[$0 + 24 >> 2] = $3;
           }
           $6 = $6 + $9 | 0;
           $1 = $1 + $9 | 0;
          }
          HEAP32[$6 + 4 >> 2] = HEAP32[$6 + 4 >> 2] & -2;
          HEAP32[$4 + 4 >> 2] = $1 | 1;
          HEAP32[$1 + $4 >> 2] = $1;
          if ($1 >>> 0 <= 255) {
           $2 = $1 >>> 3 | 0;
           $0 = ($2 << 3) + 5584 | 0;
           $2 = 1 << $2;
           $1 = HEAP32[1386];
           label$95 : {
            if (!($2 & $1)) {
             HEAP32[1386] = $2 | $1;
             $2 = $0;
             break label$95;
            }
            $2 = HEAP32[$0 + 8 >> 2];
           }
           HEAP32[$0 + 8 >> 2] = $4;
           HEAP32[$2 + 12 >> 2] = $4;
           HEAP32[$4 + 12 >> 2] = $0;
           HEAP32[$4 + 8 >> 2] = $2;
           break label$71;
          }
          $0 = 31;
          if ($1 >>> 0 <= 16777215) {
           $0 = $1 >>> 8 | 0;
           $3 = $0;
           $0 = $0 + 1048320 >>> 16 & 8;
           $2 = $3 << $0;
           $3 = $2;
           $2 = $2 + 520192 >>> 16 & 4;
           $3 = $3 << $2;
           $5 = $3;
           $3 = $3 + 245760 >>> 16 & 2;
           $0 = ($5 << $3 >>> 15 | 0) - ($0 | $2 | $3) | 0;
           $0 = ($0 << 1 | $1 >>> $0 + 21 & 1) + 28 | 0;
          }
          HEAP32[$4 + 28 >> 2] = $0;
          HEAP32[$4 + 16 >> 2] = 0;
          HEAP32[$4 + 20 >> 2] = 0;
          $2 = ($0 << 2) + 5848 | 0;
          $3 = HEAP32[1387];
          $5 = 1 << $0;
          label$98 : {
           if (!($3 & $5)) {
            HEAP32[1387] = $3 | $5;
            HEAP32[$2 >> 2] = $4;
            break label$98;
           }
           $0 = $1 << (($0 | 0) == 31 ? 0 : 25 - ($0 >>> 1 | 0) | 0);
           $3 = HEAP32[$2 >> 2];
           while (1) {
            $2 = $3;
            if ((HEAP32[$2 + 4 >> 2] & -8) == ($1 | 0)) {
             break label$72;
            }
            $3 = $0 >>> 29 | 0;
            $0 = $0 << 1;
            $6 = ($3 & 4) + $2 | 0;
            $5 = $6 + 16 | 0;
            $3 = HEAP32[$5 >> 2];
            if ($3) {
             continue;
            }
            break;
           }
           HEAP32[$6 + 16 >> 2] = $4;
          }
          HEAP32[$4 + 24 >> 2] = $2;
          HEAP32[$4 + 12 >> 2] = $4;
          HEAP32[$4 + 8 >> 2] = $4;
          break label$71;
         }
         $0 = $6 - 40 | 0;
         $5 = $3 + 8 & 7 ? -8 - $3 & 7 : 0;
         $7 = $0 - $5 | 0;
         HEAP32[1389] = $7;
         $5 = $3 + $5 | 0;
         HEAP32[1392] = $5;
         HEAP32[$5 + 4 >> 2] = $7 | 1;
         HEAP32[($0 + $3 | 0) + 4 >> 2] = 40;
         HEAP32[1393] = HEAP32[1508];
         $0 = (($1 - 39 & 7 ? 39 - $1 & 7 : 0) + $1 | 0) - 47 | 0;
         $5 = $2 + 16 >>> 0 > $0 >>> 0 ? $2 : $0;
         HEAP32[$5 + 4 >> 2] = 27;
         $0 = HEAP32[1501];
         $7 = HEAP32[1500];
         HEAP32[$5 + 16 >> 2] = $7;
         HEAP32[$5 + 20 >> 2] = $0;
         $7 = HEAP32[1499];
         $0 = HEAP32[1498];
         HEAP32[$5 + 8 >> 2] = $0;
         HEAP32[$5 + 12 >> 2] = $7;
         HEAP32[1500] = $5 + 8;
         HEAP32[1499] = $6;
         HEAP32[1498] = $3;
         HEAP32[1501] = 0;
         $0 = $5 + 24 | 0;
         while (1) {
          HEAP32[$0 + 4 >> 2] = 7;
          $3 = $0 + 8 | 0;
          $0 = $0 + 4 | 0;
          if ($1 >>> 0 > $3 >>> 0) {
           continue;
          }
          break;
         }
         if (($2 | 0) == ($5 | 0)) {
          break label$62;
         }
         HEAP32[$5 + 4 >> 2] = HEAP32[$5 + 4 >> 2] & -2;
         $6 = $5 - $2 | 0;
         HEAP32[$2 + 4 >> 2] = $6 | 1;
         HEAP32[$5 >> 2] = $6;
         if ($6 >>> 0 <= 255) {
          $1 = $6 >>> 3 | 0;
          $0 = ($1 << 3) + 5584 | 0;
          $1 = 1 << $1;
          $3 = HEAP32[1386];
          label$103 : {
           if (!($1 & $3)) {
            HEAP32[1386] = $1 | $3;
            $1 = $0;
            break label$103;
           }
           $1 = HEAP32[$0 + 8 >> 2];
          }
          HEAP32[$0 + 8 >> 2] = $2;
          HEAP32[$1 + 12 >> 2] = $2;
          HEAP32[$2 + 12 >> 2] = $0;
          HEAP32[$2 + 8 >> 2] = $1;
          break label$62;
         }
         $0 = 31;
         HEAP32[$2 + 16 >> 2] = 0;
         HEAP32[$2 + 20 >> 2] = 0;
         if ($6 >>> 0 <= 16777215) {
          $0 = $6 >>> 8 | 0;
          $1 = $0;
          $0 = $0 + 1048320 >>> 16 & 8;
          $1 = $1 << $0;
          $3 = $1;
          $1 = $1 + 520192 >>> 16 & 4;
          $3 = $3 << $1;
          $5 = $3;
          $3 = $3 + 245760 >>> 16 & 2;
          $0 = ($5 << $3 >>> 15 | 0) - ($0 | $1 | $3) | 0;
          $0 = ($0 << 1 | $6 >>> $0 + 21 & 1) + 28 | 0;
         }
         HEAP32[$2 + 28 >> 2] = $0;
         $1 = ($0 << 2) + 5848 | 0;
         $3 = HEAP32[1387];
         $5 = 1 << $0;
         label$106 : {
          if (!($3 & $5)) {
           HEAP32[1387] = $3 | $5;
           HEAP32[$1 >> 2] = $2;
           break label$106;
          }
          $0 = $6 << (($0 | 0) == 31 ? 0 : 25 - ($0 >>> 1 | 0) | 0);
          $3 = HEAP32[$1 >> 2];
          while (1) {
           $1 = $3;
           if ((HEAP32[$1 + 4 >> 2] & -8) == ($6 | 0)) {
            break label$70;
           }
           $3 = $0 >>> 29 | 0;
           $0 = $0 << 1;
           $7 = ($3 & 4) + $1 | 0;
           $5 = $7 + 16 | 0;
           $3 = HEAP32[$5 >> 2];
           if ($3) {
            continue;
           }
           break;
          }
          HEAP32[$7 + 16 >> 2] = $2;
         }
         HEAP32[$2 + 24 >> 2] = $1;
         HEAP32[$2 + 12 >> 2] = $2;
         HEAP32[$2 + 8 >> 2] = $2;
         break label$62;
        }
        $0 = HEAP32[$2 + 8 >> 2];
        HEAP32[$0 + 12 >> 2] = $4;
        HEAP32[$2 + 8 >> 2] = $4;
        HEAP32[$4 + 24 >> 2] = 0;
        HEAP32[$4 + 12 >> 2] = $2;
        HEAP32[$4 + 8 >> 2] = $0;
       }
       $0 = $7 + 8 | 0;
       break label$1;
      }
      $0 = HEAP32[$1 + 8 >> 2];
      HEAP32[$0 + 12 >> 2] = $2;
      HEAP32[$1 + 8 >> 2] = $2;
      HEAP32[$2 + 24 >> 2] = 0;
      HEAP32[$2 + 12 >> 2] = $1;
      HEAP32[$2 + 8 >> 2] = $0;
     }
     $0 = HEAP32[1389];
     if ($4 >>> 0 >= $0 >>> 0) {
      break label$4;
     }
     $2 = $0 - $4 | 0;
     HEAP32[1389] = $2;
     $0 = HEAP32[1392];
     $1 = $4 + $0 | 0;
     HEAP32[1392] = $1;
     HEAP32[$1 + 4 >> 2] = $2 | 1;
     HEAP32[$0 + 4 >> 2] = $4 | 3;
     $0 = $0 + 8 | 0;
     break label$1;
    }
    HEAP32[__errno_location() >> 2] = 48;
    $0 = 0;
    break label$1;
   }
   label$109 : {
    if (!$8) {
     break label$109;
    }
    $1 = HEAP32[$5 + 28 >> 2];
    $0 = ($1 << 2) + 5848 | 0;
    label$110 : {
     if (HEAP32[$0 >> 2] == ($5 | 0)) {
      HEAP32[$0 >> 2] = $3;
      if ($3) {
       break label$110;
      }
      $9 = __wasm_rotl_i32(-2, $1) & $9;
      HEAP32[1387] = $9;
      break label$109;
     }
     HEAP32[(HEAP32[$8 + 16 >> 2] == ($5 | 0) ? 16 : 20) + $8 >> 2] = $3;
     if (!$3) {
      break label$109;
     }
    }
    HEAP32[$3 + 24 >> 2] = $8;
    $0 = HEAP32[$5 + 16 >> 2];
    if ($0) {
     HEAP32[$3 + 16 >> 2] = $0;
     HEAP32[$0 + 24 >> 2] = $3;
    }
    $0 = HEAP32[$5 + 20 >> 2];
    if (!$0) {
     break label$109;
    }
    HEAP32[$3 + 20 >> 2] = $0;
    HEAP32[$0 + 24 >> 2] = $3;
   }
   label$113 : {
    if ($2 >>> 0 <= 15) {
     $0 = $2 + $4 | 0;
     HEAP32[$5 + 4 >> 2] = $0 | 3;
     $0 = $0 + $5 | 0;
     HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
     break label$113;
    }
    HEAP32[$5 + 4 >> 2] = $4 | 3;
    HEAP32[$7 + 4 >> 2] = $2 | 1;
    HEAP32[$2 + $7 >> 2] = $2;
    if ($2 >>> 0 <= 255) {
     $2 = $2 >>> 3 | 0;
     $0 = ($2 << 3) + 5584 | 0;
     $2 = 1 << $2;
     $1 = HEAP32[1386];
     label$116 : {
      if (!($2 & $1)) {
       HEAP32[1386] = $2 | $1;
       $2 = $0;
       break label$116;
      }
      $2 = HEAP32[$0 + 8 >> 2];
     }
     HEAP32[$0 + 8 >> 2] = $7;
     HEAP32[$2 + 12 >> 2] = $7;
     HEAP32[$7 + 12 >> 2] = $0;
     HEAP32[$7 + 8 >> 2] = $2;
     break label$113;
    }
    $0 = 31;
    if ($2 >>> 0 <= 16777215) {
     $0 = $2 >>> 8 | 0;
     $1 = $0;
     $0 = $0 + 1048320 >>> 16 & 8;
     $1 = $1 << $0;
     $3 = $1;
     $1 = $1 + 520192 >>> 16 & 4;
     $4 = $3 << $1;
     $3 = $4;
     $4 = $4 + 245760 >>> 16 & 2;
     $0 = ($3 << $4 >>> 15 | 0) - ($0 | $1 | $4) | 0;
     $0 = ($0 << 1 | $2 >>> $0 + 21 & 1) + 28 | 0;
    }
    HEAP32[$7 + 28 >> 2] = $0;
    HEAP32[$7 + 16 >> 2] = 0;
    HEAP32[$7 + 20 >> 2] = 0;
    $1 = ($0 << 2) + 5848 | 0;
    label$119 : {
     $4 = 1 << $0;
     label$120 : {
      if (!($9 & $4)) {
       HEAP32[1387] = $4 | $9;
       HEAP32[$1 >> 2] = $7;
       break label$120;
      }
      $0 = $2 << (($0 | 0) == 31 ? 0 : 25 - ($0 >>> 1 | 0) | 0);
      $4 = HEAP32[$1 >> 2];
      while (1) {
       $1 = $4;
       if ((HEAP32[$1 + 4 >> 2] & -8) == ($2 | 0)) {
        break label$119;
       }
       $4 = $0 >>> 29 | 0;
       $0 = $0 << 1;
       $6 = ($4 & 4) + $1 | 0;
       $3 = $6 + 16 | 0;
       $4 = HEAP32[$3 >> 2];
       if ($4) {
        continue;
       }
       break;
      }
      HEAP32[$6 + 16 >> 2] = $7;
     }
     HEAP32[$7 + 24 >> 2] = $1;
     HEAP32[$7 + 12 >> 2] = $7;
     HEAP32[$7 + 8 >> 2] = $7;
     break label$113;
    }
    $0 = HEAP32[$1 + 8 >> 2];
    HEAP32[$0 + 12 >> 2] = $7;
    HEAP32[$1 + 8 >> 2] = $7;
    HEAP32[$7 + 24 >> 2] = 0;
    HEAP32[$7 + 12 >> 2] = $1;
    HEAP32[$7 + 8 >> 2] = $0;
   }
   $0 = $5 + 8 | 0;
   break label$1;
  }
  label$123 : {
   if (!$11) {
    break label$123;
   }
   $1 = HEAP32[$3 + 28 >> 2];
   $0 = ($1 << 2) + 5848 | 0;
   label$124 : {
    if (HEAP32[$0 >> 2] == ($3 | 0)) {
     HEAP32[$0 >> 2] = $5;
     if ($5) {
      break label$124;
     }
     HEAP32[1387] = __wasm_rotl_i32(-2, $1) & $8;
     break label$123;
    }
    HEAP32[(HEAP32[$11 + 16 >> 2] == ($3 | 0) ? 16 : 20) + $11 >> 2] = $5;
    if (!$5) {
     break label$123;
    }
   }
   HEAP32[$5 + 24 >> 2] = $11;
   $0 = HEAP32[$3 + 16 >> 2];
   if ($0) {
    HEAP32[$5 + 16 >> 2] = $0;
    HEAP32[$0 + 24 >> 2] = $5;
   }
   $0 = HEAP32[$3 + 20 >> 2];
   if (!$0) {
    break label$123;
   }
   HEAP32[$5 + 20 >> 2] = $0;
   HEAP32[$0 + 24 >> 2] = $5;
  }
  label$127 : {
   if ($2 >>> 0 <= 15) {
    $0 = $2 + $4 | 0;
    HEAP32[$3 + 4 >> 2] = $0 | 3;
    $0 = $0 + $3 | 0;
    HEAP32[$0 + 4 >> 2] = HEAP32[$0 + 4 >> 2] | 1;
    break label$127;
   }
   HEAP32[$3 + 4 >> 2] = $4 | 3;
   HEAP32[$10 + 4 >> 2] = $2 | 1;
   HEAP32[$2 + $10 >> 2] = $2;
   if ($9) {
    $4 = $9 >>> 3 | 0;
    $1 = ($4 << 3) + 5584 | 0;
    $0 = HEAP32[1391];
    $4 = 1 << $4;
    label$130 : {
     if (!($6 & $4)) {
      HEAP32[1386] = $4 | $6;
      $4 = $1;
      break label$130;
     }
     $4 = HEAP32[$1 + 8 >> 2];
    }
    HEAP32[$1 + 8 >> 2] = $0;
    HEAP32[$4 + 12 >> 2] = $0;
    HEAP32[$0 + 12 >> 2] = $1;
    HEAP32[$0 + 8 >> 2] = $4;
   }
   HEAP32[1391] = $10;
   HEAP32[1388] = $2;
  }
  $0 = $3 + 8 | 0;
 }
 __stack_pointer = $12 + 16 | 0;
 return $0 | 0;
}
function __rem_pio2_large($0, $1, $2, $3, $4) {
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 $8 = __stack_pointer - 560 | 0;
 __stack_pointer = $8;
 $7 = ($2 - 3 | 0) / 24 | 0;
 $19 = ($7 | 0) > 0 ? $7 : 0;
 $13 = Math_imul($19, -24) + $2 | 0;
 $12 = HEAP32[($4 << 2) + 1024 >> 2];
 $15 = $3 - 1 | 0;
 if (($12 + $15 | 0) >= 0) {
  $6 = $3 + $12 | 0;
  $2 = $19 - $15 | 0;
  $7 = 0;
  while (1) {
   $5 = ($2 | 0) < 0 ? 0 : +HEAP32[($2 << 2) + 1040 >> 2];
   HEAPF64[($8 + 320 | 0) + ($7 << 3) >> 3] = $5;
   $2 = $2 + 1 | 0;
   $7 = $7 + 1 | 0;
   if (($7 | 0) != ($6 | 0)) {
    continue;
   }
   break;
  }
 }
 $18 = $13 - 24 | 0;
 $6 = 0;
 $10 = ($12 | 0) > 0 ? $12 : 0;
 $11 = ($3 | 0) < 1;
 while (1) {
  label$6 : {
   if ($11) {
    $5 = 0;
    break label$6;
   }
   $7 = $6 + $15 | 0;
   $2 = 0;
   $5 = 0;
   while (1) {
    $5 = $5 + HEAPF64[($2 << 3) + $0 >> 3] * HEAPF64[($8 + 320 | 0) + ($7 - $2 << 3) >> 3];
    $2 = $2 + 1 | 0;
    if (($3 | 0) != ($2 | 0)) {
     continue;
    }
    break;
   }
  }
  HEAPF64[($6 << 3) + $8 >> 3] = $5;
  $2 = ($6 | 0) == ($10 | 0);
  $6 = $6 + 1 | 0;
  if (!$2) {
   continue;
  }
  break;
 }
 $23 = 47 - $13 | 0;
 $21 = 48 - $13 | 0;
 $24 = $13 - 25 | 0;
 $6 = $12;
 label$9 : {
  while (1) {
   $5 = HEAPF64[($6 << 3) + $8 >> 3];
   $2 = 0;
   $7 = $6;
   $15 = ($6 | 0) < 1;
   if (!$15) {
    while (1) {
     $10 = $2 << 2;
     $10 = $10 + ($8 + 480 | 0) | 0;
     $16 = $5;
     $9 = $5 * 5.960464477539063e-8;
     label$14 : {
      if (Math_abs($9) < 2147483648) {
       $11 = ~~$9;
       break label$14;
      }
      $11 = -2147483648;
     }
     $9 = +($11 | 0);
     $5 = $16 + $9 * -16777216;
     label$13 : {
      if (Math_abs($5) < 2147483648) {
       $11 = ~~$5;
       break label$13;
      }
      $11 = -2147483648;
     }
     HEAP32[$10 >> 2] = $11;
     $7 = $7 - 1 | 0;
     $5 = HEAPF64[($7 << 3) + $8 >> 3] + $9;
     $2 = $2 + 1 | 0;
     if (($6 | 0) != ($2 | 0)) {
      continue;
     }
     break;
    }
   }
   $5 = scalbn($5, $18);
   $5 = $5 + floor($5 * .125) * -8;
   label$17 : {
    if (Math_abs($5) < 2147483648) {
     $17 = ~~$5;
     break label$17;
    }
    $17 = -2147483648;
   }
   $5 = $5 - +($17 | 0);
   label$19 : {
    label$20 : {
     label$21 : {
      $22 = ($18 | 0) < 1;
      label$22 : {
       if (!$22) {
        $7 = ($6 << 2) + $8 | 0;
        $2 = $7 + 476 | 0;
        $11 = $2;
        $2 = HEAP32[$7 + 476 >> 2];
        $7 = $2;
        $2 = $2 >> $21;
        $7 = $7 - ($2 << $21) | 0;
        HEAP32[$11 >> 2] = $7;
        $17 = $2 + $17 | 0;
        $14 = $7 >> $23;
        break label$22;
       }
       if ($18) {
        break label$21;
       }
       $14 = HEAP32[(($6 << 2) + $8 | 0) + 476 >> 2] >> 23;
      }
      if (($14 | 0) < 1) {
       break label$19;
      }
      break label$20;
     }
     $14 = 2;
     if (!($5 >= .5 ^ 1)) {
      break label$20;
     }
     $14 = 0;
     break label$19;
    }
    $2 = 0;
    $11 = 0;
    if (!$15) {
     while (1) {
      $15 = ($8 + 480 | 0) + ($2 << 2) | 0;
      $7 = HEAP32[$15 >> 2];
      $10 = 16777215;
      label$26 : {
       label$27 : {
        if ($11) {
         break label$27;
        }
        $10 = 16777216;
        if ($7) {
         break label$27;
        }
        $11 = 0;
        break label$26;
       }
       HEAP32[$15 >> 2] = $10 - $7;
       $11 = 1;
      }
      $2 = $2 + 1 | 0;
      if (($6 | 0) != ($2 | 0)) {
       continue;
      }
      break;
     }
    }
    label$28 : {
     if ($22) {
      break label$28;
     }
     label$29 : {
      switch ($24 | 0) {
      case 0:
       $7 = ($6 << 2) + $8 | 0;
       $2 = $7 + 476 | 0;
       HEAP32[$2 >> 2] = HEAP32[$7 + 476 >> 2] & 8388607;
       break label$28;
      case 1:
       break label$29;
      default:
       break label$28;
      }
     }
     $7 = ($6 << 2) + $8 | 0;
     $2 = $7 + 476 | 0;
     HEAP32[$2 >> 2] = HEAP32[$7 + 476 >> 2] & 4194303;
    }
    $17 = $17 + 1 | 0;
    if (($14 | 0) != 2) {
     break label$19;
    }
    $5 = 1 - $5;
    $14 = 2;
    if (!$11) {
     break label$19;
    }
    $5 = $5 - scalbn(1, $18);
   }
   if ($5 == 0) {
    $7 = 0;
    label$32 : {
     $2 = $6;
     if (($12 | 0) >= ($2 | 0)) {
      break label$32;
     }
     while (1) {
      $2 = $2 - 1 | 0;
      $7 = HEAP32[($8 + 480 | 0) + ($2 << 2) >> 2] | $7;
      if (($2 | 0) > ($12 | 0)) {
       continue;
      }
      break;
     }
     if (!$7) {
      break label$32;
     }
     $13 = $18;
     while (1) {
      $13 = $13 - 24 | 0;
      $6 = $6 - 1 | 0;
      if (!HEAP32[($8 + 480 | 0) + ($6 << 2) >> 2]) {
       continue;
      }
      break;
     }
     break label$9;
    }
    $2 = 1;
    while (1) {
     $7 = $2;
     $2 = $2 + 1 | 0;
     if (!HEAP32[($8 + 480 | 0) + ($12 - $7 << 2) >> 2]) {
      continue;
     }
     break;
    }
    $10 = $6 + $7 | 0;
    while (1) {
     $7 = $3 + $6 | 0;
     $6 = $6 + 1 | 0;
     HEAPF64[($8 + 320 | 0) + ($7 << 3) >> 3] = HEAP32[($19 + $6 << 2) + 1040 >> 2];
     $2 = 0;
     $5 = 0;
     if (($3 | 0) >= 1) {
      while (1) {
       $5 = $5 + HEAPF64[($2 << 3) + $0 >> 3] * HEAPF64[($8 + 320 | 0) + ($7 - $2 << 3) >> 3];
       $2 = $2 + 1 | 0;
       if (($3 | 0) != ($2 | 0)) {
        continue;
       }
       break;
      }
     }
     HEAPF64[($6 << 3) + $8 >> 3] = $5;
     if (($6 | 0) < ($10 | 0)) {
      continue;
     }
     break;
    }
    $6 = $10;
    continue;
   }
   break;
  }
  $5 = scalbn($5, 24 - $13 | 0);
  label$39 : {
   if (!($5 >= 16777216 ^ 1)) {
    $3 = $6 << 2;
    $3 = $3 + ($8 + 480 | 0) | 0;
    $16 = $5;
    $9 = $5 * 5.960464477539063e-8;
    label$42 : {
     if (Math_abs($9) < 2147483648) {
      $2 = ~~$9;
      break label$42;
     }
     $2 = -2147483648;
    }
    $5 = $16 + +($2 | 0) * -16777216;
    label$41 : {
     if (Math_abs($5) < 2147483648) {
      $7 = ~~$5;
      break label$41;
     }
     $7 = -2147483648;
    }
    HEAP32[$3 >> 2] = $7;
    $6 = $6 + 1 | 0;
    break label$39;
   }
   if (Math_abs($5) < 2147483648) {
    $2 = ~~$5;
   } else {
    $2 = -2147483648;
   }
   $13 = $18;
  }
  HEAP32[($8 + 480 | 0) + ($6 << 2) >> 2] = $2;
 }
 $5 = scalbn(1, $13);
 label$47 : {
  if (($6 | 0) <= -1) {
   break label$47;
  }
  $2 = $6;
  while (1) {
   HEAPF64[($2 << 3) + $8 >> 3] = $5 * +HEAP32[($8 + 480 | 0) + ($2 << 2) >> 2];
   $5 = $5 * 5.960464477539063e-8;
   $3 = ($2 | 0) > 0;
   $2 = $2 - 1 | 0;
   if ($3) {
    continue;
   }
   break;
  }
  $10 = 0;
  if (($6 | 0) < 0) {
   break label$47;
  }
  $12 = ($12 | 0) > 0 ? $12 : 0;
  $7 = $6;
  while (1) {
   $0 = $10 >>> 0 > $12 >>> 0 ? $12 : $10;
   $11 = $6 - $7 | 0;
   $2 = 0;
   $5 = 0;
   while (1) {
    $5 = $5 + HEAPF64[($2 << 3) + 3808 >> 3] * HEAPF64[($2 + $7 << 3) + $8 >> 3];
    $3 = ($0 | 0) != ($2 | 0);
    $2 = $2 + 1 | 0;
    if ($3) {
     continue;
    }
    break;
   }
   HEAPF64[($8 + 160 | 0) + ($11 << 3) >> 3] = $5;
   $7 = $7 - 1 | 0;
   $2 = ($6 | 0) != ($10 | 0);
   $10 = $10 + 1 | 0;
   if ($2) {
    continue;
   }
   break;
  }
 }
 label$51 : {
  label$52 : {
   label$53 : {
    switch ($4 | 0) {
    case 3:
     label$56 : {
      if (($6 | 0) < 1) {
       break label$56;
      }
      $5 = HEAPF64[($8 + 160 | 0) + ($6 << 3) >> 3];
      $2 = $6;
      while (1) {
       $3 = $2 - 1 | 0;
       $7 = ($8 + 160 | 0) + ($3 << 3) | 0;
       $9 = HEAPF64[$7 >> 3];
       $16 = $9;
       $9 = $9 + $5;
       HEAPF64[($8 + 160 | 0) + ($2 << 3) >> 3] = $5 + ($16 - $9);
       HEAPF64[$7 >> 3] = $9;
       $7 = ($2 | 0) > 1;
       $5 = $9;
       $2 = $3;
       if ($7) {
        continue;
       }
       break;
      }
      if (($6 | 0) < 2) {
       break label$56;
      }
      $5 = HEAPF64[($8 + 160 | 0) + ($6 << 3) >> 3];
      $2 = $6;
      while (1) {
       $3 = $2 - 1 | 0;
       $7 = ($8 + 160 | 0) + ($3 << 3) | 0;
       $9 = HEAPF64[$7 >> 3];
       $16 = $9;
       $9 = $9 + $5;
       HEAPF64[($8 + 160 | 0) + ($2 << 3) >> 3] = $5 + ($16 - $9);
       HEAPF64[$7 >> 3] = $9;
       $7 = ($2 | 0) > 2;
       $5 = $9;
       $2 = $3;
       if ($7) {
        continue;
       }
       break;
      }
      if (($6 | 0) <= 1) {
       break label$56;
      }
      while (1) {
       $20 = $20 + HEAPF64[($8 + 160 | 0) + ($6 << 3) >> 3];
       $2 = ($6 | 0) > 2;
       $6 = $6 - 1 | 0;
       if ($2) {
        continue;
       }
       break;
      }
     }
     $5 = HEAPF64[$8 + 160 >> 3];
     if ($14) {
      break label$52;
     }
     HEAPF64[$1 >> 3] = $5;
     $5 = HEAPF64[$8 + 168 >> 3];
     HEAPF64[$1 + 16 >> 3] = $20;
     HEAPF64[$1 + 8 >> 3] = $5;
     break label$51;
    case 0:
     $5 = 0;
     if (($6 | 0) >= 0) {
      while (1) {
       $5 = $5 + HEAPF64[($8 + 160 | 0) + ($6 << 3) >> 3];
       $2 = ($6 | 0) > 0;
       $6 = $6 - 1 | 0;
       if ($2) {
        continue;
       }
       break;
      }
     }
     HEAPF64[$1 >> 3] = $14 ? -$5 : $5;
     break label$51;
    case 1:
    case 2:
     break label$53;
    default:
     break label$51;
    }
   }
   $5 = 0;
   if (($6 | 0) >= 0) {
    $2 = $6;
    while (1) {
     $5 = $5 + HEAPF64[($8 + 160 | 0) + ($2 << 3) >> 3];
     $3 = ($2 | 0) > 0;
     $2 = $2 - 1 | 0;
     if ($3) {
      continue;
     }
     break;
    }
   }
   HEAPF64[$1 >> 3] = $14 ? -$5 : $5;
   $5 = HEAPF64[$8 + 160 >> 3] - $5;
   $2 = 1;
   if (($6 | 0) >= 1) {
    while (1) {
     $5 = $5 + HEAPF64[($8 + 160 | 0) + ($2 << 3) >> 3];
     $3 = ($2 | 0) != ($6 | 0);
     $2 = $2 + 1 | 0;
     if ($3) {
      continue;
     }
     break;
    }
   }
   HEAPF64[$1 + 8 >> 3] = $14 ? -$5 : $5;
   break label$51;
  }
  HEAPF64[$1 >> 3] = -$5;
  $5 = HEAPF64[$8 + 168 >> 3];
  HEAPF64[$1 + 16 >> 3] = -$20;
  HEAPF64[$1 + 8 >> 3] = -$5;
 }
 __stack_pointer = $8 + 560 | 0;
 return $17 & 7;
}
function update_filter($0) {
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = Math_fround(0), $14 = Math_fround(0), $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0;
 $2 = HEAP32[$0 + 8 >> 2];
 $1 = HEAP32[$0 + 12 >> 2];
 $5 = ($2 >>> 0) / ($1 >>> 0) | 0;
 HEAP32[$0 + 36 >> 2] = $5;
 $3 = Math_imul(HEAP32[$0 + 16 >> 2], 20);
 $6 = HEAP32[$3 + 3876 >> 2];
 HEAP32[$0 + 48 >> 2] = $6;
 $11 = HEAP32[$0 + 24 >> 2];
 $4 = HEAP32[$3 + 3872 >> 2];
 HEAP32[$0 + 24 >> 2] = $4;
 HEAP32[$0 + 40 >> 2] = $2 - Math_imul($1, $5);
 $17 = HEAP32[$0 + 28 >> 2];
 label$1 : {
  label$2 : {
   label$3 : {
    if ($1 >>> 0 < $2 >>> 0) {
     HEAPF32[$0 + 44 >> 2] = Math_fround(HEAPF32[$3 + 3880 >> 2] * Math_fround($1 >>> 0)) / Math_fround($2 >>> 0);
     $3 = ($4 >>> 0) / ($1 >>> 0) | 0;
     $5 = $4 - Math_imul($3, $1) | 0;
     $4 = 4294967295 / ($2 >>> 0) | 0;
     if ($5 >>> 0 > $4 >>> 0 | $3 >>> 0 > $4 >>> 0) {
      break label$2;
     }
     $4 = Math_imul($2, $3);
     $3 = (Math_imul($2, $5) >>> 0) / ($1 >>> 0) | 0;
     if ($4 >>> 0 > ($3 ^ -1) >>> 0) {
      break label$2;
     }
     $4 = ($3 + $4 | 0) + 7 & -8;
     HEAP32[$0 + 24 >> 2] = $4;
     $3 = $1 << 1 >>> 0 < $2 >>> 0;
     $5 = $1 << 2 >>> 0 < $2 >>> 0;
     $7 = $1 << 3;
     $6 = $6 >>> $3 >>> $5 >>> ($7 >>> 0 < $2 >>> 0) | 0;
     if (!($2 >>> 0 <= $7 >>> 0 ? !($3 | $5) : 0)) {
      HEAP32[$0 + 48 >> 2] = $6;
     }
     $3 = $1 << 4 >>> 0 < $2 >>> 0;
     $2 = $6 >>> $3 | 0;
     if ($2 ? !$3 : 0) {
      break label$3;
     }
     $6 = $2 ? $2 : 1;
     HEAP32[$0 + 48 >> 2] = $6;
     break label$3;
    }
    HEAP32[$0 + 44 >> 2] = HEAP32[$3 + 3884 >> 2];
   }
   $2 = Math_imul($1, $4);
   $5 = Math_imul($4, $6) + 8 | 0;
   label$7 : {
    if ($2 >>> 0 <= $5 >>> 0) {
     $3 = 1;
     if (536870911 / ($1 >>> 0) >>> 0 >= $4 >>> 0) {
      break label$7;
     }
    }
    $3 = 0;
    $2 = $5;
    if (536870903 / ($6 >>> 0) >>> 0 < $4 >>> 0) {
     break label$2;
    }
   }
   if (HEAPU32[$0 + 80 >> 2] < $2 >>> 0) {
    $1 = dlrealloc(HEAP32[$0 + 76 >> 2], $2 << 2);
    if (!$1) {
     break label$2;
    }
    HEAP32[$0 + 80 >> 2] = $2;
    HEAP32[$0 + 76 >> 2] = $1;
   }
   $9 = $0;
   label$10 : {
    label$11 : {
     label$12 : {
      if (!$3) {
       $1 = -4;
       $2 = HEAP32[$0 + 24 >> 2];
       $6 = HEAP32[$0 + 48 >> 2];
       $4 = Math_imul($2, $6) + 4 | 0;
       if (($4 | 0) > -4) {
        break label$12;
       }
       $5 = HEAP32[$0 + 16 >> 2];
       break label$11;
      }
      $2 = HEAP32[$0 + 24 >> 2];
      $8 = HEAP32[$0 + 12 >> 2];
      if ($8) {
       $5 = ($2 | 0) / -2 | 0;
       $13 = Math_fround($8 >>> 0);
       $7 = 0;
       while (1) {
        if ($2) {
         $4 = Math_imul($2, $7);
         $14 = Math_fround(Math_fround($7 >>> 0) / $13);
         $3 = HEAP32[Math_imul(HEAP32[$0 + 16 >> 2], 20) + 3888 >> 2];
         $6 = HEAP32[$0 + 76 >> 2];
         $1 = 0;
         while (1) {
          $10 = ($1 + $4 << 2) + $6 | 0;
          $1 = $1 + 1 | 0;
          HEAPF32[$10 >> 2] = sinc(HEAPF32[$0 + 44 >> 2], Math_fround(Math_fround($5 + $1 | 0) - $14), $2, $3);
          if (($1 | 0) != ($2 | 0)) {
           continue;
          }
          break;
         }
        }
        $7 = $7 + 1 | 0;
        if (($8 | 0) != ($7 | 0)) {
         continue;
        }
        break;
       }
      }
      $1 = HEAP32[$0 + 16 >> 2] > 8 ? 1 : 2;
      break label$10;
     }
     $14 = Math_fround($2 >>> 1 >>> 0);
     $5 = HEAP32[$0 + 16 >> 2];
     $3 = HEAP32[Math_imul($5, 20) + 3888 >> 2];
     $13 = Math_fround($6 >>> 0);
     $6 = HEAP32[$0 + 76 >> 2];
     while (1) {
      HEAPF32[(($1 << 2) + $6 | 0) + 16 >> 2] = sinc(HEAPF32[$0 + 44 >> 2], Math_fround(Math_fround(Math_fround($1 | 0) / $13) - $14), $2, $3);
      $1 = $1 + 1 | 0;
      if (($4 | 0) != ($1 | 0)) {
       continue;
      }
      break;
     }
    }
    $1 = ($5 | 0) > 8 ? 3 : 4;
   }
   HEAP32[$9 + 84 >> 2] = $1;
   $1 = (HEAP32[$0 + 32 >> 2] + $2 | 0) - 1 | 0;
   $2 = HEAP32[$0 + 28 >> 2];
   if ($1 >>> 0 > $2 >>> 0) {
    $2 = HEAP32[$0 + 20 >> 2];
    if (536870911 / ($2 >>> 0) >>> 0 < $1 >>> 0) {
     break label$2;
    }
    $2 = dlrealloc(HEAP32[$0 + 72 >> 2], Math_imul($1, $2) << 2);
    if (!$2) {
     break label$2;
    }
    HEAP32[$0 + 28 >> 2] = $1;
    HEAP32[$0 + 72 >> 2] = $2;
    $2 = $1;
   }
   if (!HEAP32[$0 + 56 >> 2]) {
    $1 = Math_imul(HEAP32[$0 + 20 >> 2], $2);
    if (!$1) {
     return 0;
    }
    memset(HEAP32[$0 + 72 >> 2], 0, $1 << 2);
    return 0;
   }
   $2 = HEAP32[$0 + 24 >> 2];
   if ($11 >>> 0 < $2 >>> 0) {
    $8 = HEAP32[$0 + 20 >> 2];
    if (!$8) {
     return 0;
    }
    $18 = $11 - 1 | 0;
    $19 = ($8 << 2) - 4 | 0;
    $20 = HEAP32[$0 + 68 >> 2];
    while (1) {
     $7 = $12 << 2;
     $8 = $8 - 1 | 0;
     $15 = $8 << 2;
     $5 = $15 + $20 | 0;
     $4 = HEAP32[$5 >> 2];
     $9 = $4 << 1;
     $1 = $4 + $18 | 0;
     if ($1) {
      $3 = Math_imul($8, $17);
      $6 = Math_imul(HEAP32[$0 + 28 >> 2], $8);
      $2 = HEAP32[$0 + 72 >> 2];
      while (1) {
       $1 = $1 - 1 | 0;
       HEAP32[(($4 + $1 | 0) + $6 << 2) + $2 >> 2] = HEAP32[($1 + $3 << 2) + $2 >> 2];
       if ($1) {
        continue;
       }
       break;
      }
     }
     $16 = $19 - $7 | 0;
     $9 = $9 + $11 | 0;
     if ($4) {
      memset(HEAP32[$0 + 72 >> 2] + Math_imul(HEAP32[$0 + 28 >> 2], $16) | 0, 0, $4 << 2);
     }
     HEAP32[$5 >> 2] = 0;
     $10 = HEAP32[$0 + 24 >> 2];
     label$28 : {
      if ($10 >>> 0 > $9 >>> 0) {
       $6 = $9 - 1 | 0;
       if ($6) {
        $5 = $10 - 2 | 0;
        $7 = $9 - 2 | 0;
        $4 = Math_imul(HEAP32[$0 + 28 >> 2], $8);
        $3 = HEAP32[$0 + 72 >> 2];
        $1 = 0;
        $2 = 0;
        while (1) {
         HEAP32[(($1 + $5 | 0) + $4 << 2) + $3 >> 2] = HEAP32[(($1 + $7 | 0) + $4 << 2) + $3 >> 2];
         $1 = $2 ^ -1;
         $2 = $2 + 1 | 0;
         if (($6 | 0) != ($2 | 0)) {
          continue;
         }
         break;
        }
       }
       $1 = $10 - 1 | 0;
       if ($6 >>> 0 < $1 >>> 0) {
        memset(HEAP32[$0 + 72 >> 2] + Math_imul(HEAP32[$0 + 28 >> 2], $16) | 0, 0, $1 - $6 << 2);
       }
       $1 = HEAP32[$0 + 60 >> 2] + $15 | 0;
       HEAP32[$1 >> 2] = HEAP32[$1 >> 2] + ($10 - $9 >>> 1 | 0);
       break label$28;
      }
      $3 = $9 - $10 >>> 1 | 0;
      HEAP32[$5 >> 2] = $3;
      $1 = $3 - 1 | 0;
      $2 = HEAP32[$0 + 24 >> 2];
      if (($1 | 0) == (0 - $2 | 0)) {
       break label$28;
      }
      $1 = $1 + $2 | 0;
      $6 = $1 >>> 0 > 1 ? $1 : 1;
      $5 = Math_imul(HEAP32[$0 + 28 >> 2], $8);
      $2 = HEAP32[$0 + 72 >> 2];
      $1 = 0;
      while (1) {
       $4 = $1 + $5 | 0;
       HEAP32[($4 << 2) + $2 >> 2] = HEAP32[($3 + $4 << 2) + $2 >> 2];
       $1 = $1 + 1 | 0;
       if (($6 | 0) != ($1 | 0)) {
        continue;
       }
       break;
      }
     }
     $12 = $12 + 1 | 0;
     if ($8) {
      continue;
     }
     break;
    }
    return 0;
   }
   $1 = 0;
   if (!HEAP32[$0 + 20 >> 2] | $2 >>> 0 >= $11 >>> 0) {
    break label$1;
   }
   $12 = HEAP32[$0 + 68 >> 2];
   $7 = 0;
   while (1) {
    $8 = ($7 << 2) + $12 | 0;
    $1 = HEAP32[$8 >> 2];
    $3 = $11 - $2 >>> 1 | 0;
    HEAP32[$8 >> 2] = $3;
    $9 = $1 + $3 | 0;
    $1 = $9 - 1 | 0;
    $2 = HEAP32[$0 + 24 >> 2];
    if (($1 | 0) != (0 - $2 | 0)) {
     $1 = $1 + $2 | 0;
     $6 = $1 >>> 0 > 1 ? $1 : 1;
     $5 = Math_imul(HEAP32[$0 + 28 >> 2], $7);
     $2 = HEAP32[$0 + 72 >> 2];
     $1 = 0;
     while (1) {
      $4 = $1 + $5 | 0;
      HEAP32[($4 << 2) + $2 >> 2] = HEAP32[($3 + $4 << 2) + $2 >> 2];
      $1 = $1 + 1 | 0;
      if (($6 | 0) != ($1 | 0)) {
       continue;
      }
      break;
     }
    }
    HEAP32[$8 >> 2] = $9;
    $7 = $7 + 1 | 0;
    if ($7 >>> 0 >= HEAPU32[$0 + 20 >> 2]) {
     return 0;
    } else {
     $2 = HEAP32[$0 + 24 >> 2];
     continue;
    }
   }
  }
  HEAP32[$0 + 24 >> 2] = $11;
  HEAP32[$0 + 84 >> 2] = 5;
  $1 = 1;
 }
 return $1;
}
function dlfree($0) {
 $0 = $0 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 label$1 : {
  label$2 : {
   if (!$0) {
    break label$2;
   }
   $3 = $0 - 8 | 0;
   $1 = HEAP32[$0 - 4 >> 2];
   $0 = $1 & -8;
   $5 = $3 + $0 | 0;
   label$3 : {
    if ($1 & 1) {
     break label$3;
    }
    if (!($1 & 3)) {
     break label$2;
    }
    $1 = HEAP32[$3 >> 2];
    $3 = $3 - $1 | 0;
    $4 = HEAP32[1390];
    if ($3 >>> 0 < $4 >>> 0) {
     break label$2;
    }
    $0 = $0 + $1 | 0;
    if (HEAP32[1391] != ($3 | 0)) {
     if ($1 >>> 0 <= 255) {
      $7 = $1 >>> 3 | 0;
      $1 = ($7 << 3) + 5584 | 0;
      $6 = HEAP32[$3 + 8 >> 2];
      $2 = HEAP32[$3 + 12 >> 2];
      if (($6 | 0) == ($2 | 0)) {
       HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $7);
       break label$3;
      }
      HEAP32[$6 + 12 >> 2] = $2;
      HEAP32[$2 + 8 >> 2] = $6;
      break label$3;
     }
     $7 = HEAP32[$3 + 24 >> 2];
     $2 = HEAP32[$3 + 12 >> 2];
     label$7 : {
      if (($2 | 0) != ($3 | 0)) {
       $1 = HEAP32[$3 + 8 >> 2];
       HEAP32[$1 + 12 >> 2] = $2;
       HEAP32[$2 + 8 >> 2] = $1;
       break label$7;
      }
      label$10 : {
       $1 = $3 + 20 | 0;
       $4 = HEAP32[$1 >> 2];
       if ($4) {
        break label$10;
       }
       $1 = $3 + 16 | 0;
       $4 = HEAP32[$1 >> 2];
       if ($4) {
        break label$10;
       }
       $2 = 0;
       break label$7;
      }
      while (1) {
       $6 = $1;
       $2 = $4;
       $1 = $2 + 20 | 0;
       $4 = HEAP32[$1 >> 2];
       if ($4) {
        continue;
       }
       $1 = $2 + 16 | 0;
       $4 = HEAP32[$2 + 16 >> 2];
       if ($4) {
        continue;
       }
       break;
      }
      HEAP32[$6 >> 2] = 0;
     }
     if (!$7) {
      break label$3;
     }
     $4 = HEAP32[$3 + 28 >> 2];
     $1 = ($4 << 2) + 5848 | 0;
     label$12 : {
      if (HEAP32[$1 >> 2] == ($3 | 0)) {
       HEAP32[$1 >> 2] = $2;
       if ($2) {
        break label$12;
       }
       HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $4);
       break label$3;
      }
      HEAP32[(HEAP32[$7 + 16 >> 2] == ($3 | 0) ? 16 : 20) + $7 >> 2] = $2;
      if (!$2) {
       break label$3;
      }
     }
     HEAP32[$2 + 24 >> 2] = $7;
     $1 = HEAP32[$3 + 16 >> 2];
     if ($1) {
      HEAP32[$2 + 16 >> 2] = $1;
      HEAP32[$1 + 24 >> 2] = $2;
     }
     $1 = HEAP32[$3 + 20 >> 2];
     if (!$1) {
      break label$3;
     }
     HEAP32[$2 + 20 >> 2] = $1;
     HEAP32[$1 + 24 >> 2] = $2;
     break label$3;
    }
    $1 = HEAP32[$5 + 4 >> 2];
    if (($1 & 3) != 3) {
     break label$3;
    }
    HEAP32[1388] = $0;
    HEAP32[$5 + 4 >> 2] = $1 & -2;
    break label$1;
   }
   if ($3 >>> 0 >= $5 >>> 0) {
    break label$2;
   }
   $1 = HEAP32[$5 + 4 >> 2];
   if (!($1 & 1)) {
    break label$2;
   }
   label$15 : {
    if (!($1 & 2)) {
     if (HEAP32[1392] == ($5 | 0)) {
      HEAP32[1392] = $3;
      $0 = HEAP32[1389] + $0 | 0;
      HEAP32[1389] = $0;
      HEAP32[$3 + 4 >> 2] = $0 | 1;
      if (HEAP32[1391] != ($3 | 0)) {
       break label$2;
      }
      HEAP32[1388] = 0;
      HEAP32[1391] = 0;
      return;
     }
     if (HEAP32[1391] == ($5 | 0)) {
      HEAP32[1391] = $3;
      $0 = HEAP32[1388] + $0 | 0;
      HEAP32[1388] = $0;
      break label$1;
     }
     $0 = ($1 & -8) + $0 | 0;
     label$19 : {
      if ($1 >>> 0 <= 255) {
       $4 = HEAP32[$5 + 12 >> 2];
       $2 = HEAP32[$5 + 8 >> 2];
       $5 = $1 >>> 3 | 0;
       if (($2 | 0) == ($4 | 0)) {
        HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $5);
        break label$19;
       }
       HEAP32[$2 + 12 >> 2] = $4;
       HEAP32[$4 + 8 >> 2] = $2;
       break label$19;
      }
      $7 = HEAP32[$5 + 24 >> 2];
      $2 = HEAP32[$5 + 12 >> 2];
      label$24 : {
       if (($5 | 0) != ($2 | 0)) {
        $1 = HEAP32[$5 + 8 >> 2];
        HEAP32[$1 + 12 >> 2] = $2;
        HEAP32[$2 + 8 >> 2] = $1;
        break label$24;
       }
       label$27 : {
        $1 = $5 + 20 | 0;
        $4 = HEAP32[$1 >> 2];
        if ($4) {
         break label$27;
        }
        $1 = $5 + 16 | 0;
        $4 = HEAP32[$1 >> 2];
        if ($4) {
         break label$27;
        }
        $2 = 0;
        break label$24;
       }
       while (1) {
        $6 = $1;
        $2 = $4;
        $1 = $2 + 20 | 0;
        $4 = HEAP32[$1 >> 2];
        if ($4) {
         continue;
        }
        $1 = $2 + 16 | 0;
        $4 = HEAP32[$2 + 16 >> 2];
        if ($4) {
         continue;
        }
        break;
       }
       HEAP32[$6 >> 2] = 0;
      }
      if (!$7) {
       break label$19;
      }
      $4 = HEAP32[$5 + 28 >> 2];
      $1 = ($4 << 2) + 5848 | 0;
      label$29 : {
       if (HEAP32[$1 >> 2] == ($5 | 0)) {
        HEAP32[$1 >> 2] = $2;
        if ($2) {
         break label$29;
        }
        HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $4);
        break label$19;
       }
       HEAP32[(HEAP32[$7 + 16 >> 2] == ($5 | 0) ? 16 : 20) + $7 >> 2] = $2;
       if (!$2) {
        break label$19;
       }
      }
      HEAP32[$2 + 24 >> 2] = $7;
      $1 = HEAP32[$5 + 16 >> 2];
      if ($1) {
       HEAP32[$2 + 16 >> 2] = $1;
       HEAP32[$1 + 24 >> 2] = $2;
      }
      $1 = HEAP32[$5 + 20 >> 2];
      if (!$1) {
       break label$19;
      }
      HEAP32[$2 + 20 >> 2] = $1;
      HEAP32[$1 + 24 >> 2] = $2;
     }
     HEAP32[$3 + 4 >> 2] = $0 | 1;
     HEAP32[$0 + $3 >> 2] = $0;
     if (HEAP32[1391] != ($3 | 0)) {
      break label$15;
     }
     HEAP32[1388] = $0;
     return;
    }
    HEAP32[$5 + 4 >> 2] = $1 & -2;
    HEAP32[$3 + 4 >> 2] = $0 | 1;
    HEAP32[$0 + $3 >> 2] = $0;
   }
   if ($0 >>> 0 <= 255) {
    $1 = $0 >>> 3 | 0;
    $0 = ($1 << 3) + 5584 | 0;
    $1 = 1 << $1;
    $4 = HEAP32[1386];
    label$33 : {
     if (!($1 & $4)) {
      HEAP32[1386] = $1 | $4;
      $1 = $0;
      break label$33;
     }
     $1 = HEAP32[$0 + 8 >> 2];
    }
    HEAP32[$0 + 8 >> 2] = $3;
    HEAP32[$1 + 12 >> 2] = $3;
    HEAP32[$3 + 12 >> 2] = $0;
    HEAP32[$3 + 8 >> 2] = $1;
    return;
   }
   $1 = 31;
   HEAP32[$3 + 16 >> 2] = 0;
   HEAP32[$3 + 20 >> 2] = 0;
   if ($0 >>> 0 <= 16777215) {
    $1 = $0 >>> 8 | 0;
    $2 = $1;
    $1 = $1 + 1048320 >>> 16 & 8;
    $4 = $2 << $1;
    $2 = $4;
    $4 = $4 + 520192 >>> 16 & 4;
    $2 = $2 << $4;
    $6 = $2;
    $2 = $2 + 245760 >>> 16 & 2;
    $1 = ($6 << $2 >>> 15 | 0) - ($1 | $4 | $2) | 0;
    $1 = ($1 << 1 | $0 >>> $1 + 21 & 1) + 28 | 0;
   }
   HEAP32[$3 + 28 >> 2] = $1;
   $4 = ($1 << 2) + 5848 | 0;
   label$36 : {
    label$37 : {
     $2 = HEAP32[1387];
     $5 = 1 << $1;
     label$38 : {
      if (!($2 & $5)) {
       HEAP32[1387] = $2 | $5;
       HEAP32[$4 >> 2] = $3;
       break label$38;
      }
      $1 = $0 << (($1 | 0) == 31 ? 0 : 25 - ($1 >>> 1 | 0) | 0);
      $2 = HEAP32[$4 >> 2];
      while (1) {
       $4 = $2;
       if ((HEAP32[$2 + 4 >> 2] & -8) == ($0 | 0)) {
        break label$37;
       }
       $2 = $1 >>> 29 | 0;
       $1 = $1 << 1;
       $6 = ($2 & 4) + $4 | 0;
       $5 = $6 + 16 | 0;
       $2 = HEAP32[$5 >> 2];
       if ($2) {
        continue;
       }
       break;
      }
      HEAP32[$6 + 16 >> 2] = $3;
     }
     HEAP32[$3 + 24 >> 2] = $4;
     HEAP32[$3 + 12 >> 2] = $3;
     HEAP32[$3 + 8 >> 2] = $3;
     break label$36;
    }
    $0 = HEAP32[$4 + 8 >> 2];
    HEAP32[$0 + 12 >> 2] = $3;
    HEAP32[$4 + 8 >> 2] = $3;
    HEAP32[$3 + 24 >> 2] = 0;
    HEAP32[$3 + 12 >> 2] = $4;
    HEAP32[$3 + 8 >> 2] = $0;
   }
   $3 = HEAP32[1394] - 1 | 0;
   HEAP32[1394] = $3 ? $3 : -1;
  }
  return;
 }
 HEAP32[$3 + 4 >> 2] = $0 | 1;
 HEAP32[$0 + $3 >> 2] = $0;
}
function dispose_chunk($0, $1) {
 var $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 $5 = $0 + $1 | 0;
 label$1 : {
  label$2 : {
   $2 = HEAP32[$0 + 4 >> 2];
   if ($2 & 1) {
    break label$2;
   }
   if (!($2 & 3)) {
    break label$1;
   }
   $2 = HEAP32[$0 >> 2];
   $1 = $2 + $1 | 0;
   $0 = $0 - $2 | 0;
   if (($0 | 0) != HEAP32[1391]) {
    if ($2 >>> 0 <= 255) {
     $6 = $2 >>> 3 | 0;
     $2 = ($6 << 3) + 5584 | 0;
     $3 = HEAP32[$0 + 8 >> 2];
     $4 = HEAP32[$0 + 12 >> 2];
     if (($4 | 0) == ($3 | 0)) {
      HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $6);
      break label$2;
     }
     HEAP32[$3 + 12 >> 2] = $4;
     HEAP32[$4 + 8 >> 2] = $3;
     break label$2;
    }
    $6 = HEAP32[$0 + 24 >> 2];
    $3 = HEAP32[$0 + 12 >> 2];
    label$6 : {
     if (($3 | 0) != ($0 | 0)) {
      $2 = HEAP32[$0 + 8 >> 2];
      HEAP32[$2 + 12 >> 2] = $3;
      HEAP32[$3 + 8 >> 2] = $2;
      break label$6;
     }
     label$9 : {
      $2 = $0 + 20 | 0;
      $4 = HEAP32[$2 >> 2];
      if ($4) {
       break label$9;
      }
      $2 = $0 + 16 | 0;
      $4 = HEAP32[$2 >> 2];
      if ($4) {
       break label$9;
      }
      $3 = 0;
      break label$6;
     }
     while (1) {
      $7 = $2;
      $3 = $4;
      $2 = $3 + 20 | 0;
      $4 = HEAP32[$2 >> 2];
      if ($4) {
       continue;
      }
      $2 = $3 + 16 | 0;
      $4 = HEAP32[$3 + 16 >> 2];
      if ($4) {
       continue;
      }
      break;
     }
     HEAP32[$7 >> 2] = 0;
    }
    if (!$6) {
     break label$2;
    }
    $4 = HEAP32[$0 + 28 >> 2];
    $2 = ($4 << 2) + 5848 | 0;
    label$11 : {
     if (HEAP32[$2 >> 2] == ($0 | 0)) {
      HEAP32[$2 >> 2] = $3;
      if ($3) {
       break label$11;
      }
      HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $4);
      break label$2;
     }
     HEAP32[(HEAP32[$6 + 16 >> 2] == ($0 | 0) ? 16 : 20) + $6 >> 2] = $3;
     if (!$3) {
      break label$2;
     }
    }
    HEAP32[$3 + 24 >> 2] = $6;
    $2 = HEAP32[$0 + 16 >> 2];
    if ($2) {
     HEAP32[$3 + 16 >> 2] = $2;
     HEAP32[$2 + 24 >> 2] = $3;
    }
    $2 = HEAP32[$0 + 20 >> 2];
    if (!$2) {
     break label$2;
    }
    HEAP32[$3 + 20 >> 2] = $2;
    HEAP32[$2 + 24 >> 2] = $3;
    break label$2;
   }
   $2 = HEAP32[$5 + 4 >> 2];
   if (($2 & 3) != 3) {
    break label$2;
   }
   HEAP32[1388] = $1;
   HEAP32[$5 + 4 >> 2] = $2 & -2;
   HEAP32[$0 + 4 >> 2] = $1 | 1;
   HEAP32[$5 >> 2] = $1;
   return;
  }
  $2 = HEAP32[$5 + 4 >> 2];
  label$14 : {
   if (!($2 & 2)) {
    if (HEAP32[1392] == ($5 | 0)) {
     HEAP32[1392] = $0;
     $1 = HEAP32[1389] + $1 | 0;
     HEAP32[1389] = $1;
     HEAP32[$0 + 4 >> 2] = $1 | 1;
     if (HEAP32[1391] != ($0 | 0)) {
      break label$1;
     }
     HEAP32[1388] = 0;
     HEAP32[1391] = 0;
     return;
    }
    if (HEAP32[1391] == ($5 | 0)) {
     HEAP32[1391] = $0;
     $1 = HEAP32[1388] + $1 | 0;
     HEAP32[1388] = $1;
     HEAP32[$0 + 4 >> 2] = $1 | 1;
     HEAP32[$0 + $1 >> 2] = $1;
     return;
    }
    $1 = ($2 & -8) + $1 | 0;
    label$18 : {
     if ($2 >>> 0 <= 255) {
      $4 = HEAP32[$5 + 12 >> 2];
      $3 = HEAP32[$5 + 8 >> 2];
      $5 = $2 >>> 3 | 0;
      if (($3 | 0) == ($4 | 0)) {
       HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $5);
       break label$18;
      }
      HEAP32[$3 + 12 >> 2] = $4;
      HEAP32[$4 + 8 >> 2] = $3;
      break label$18;
     }
     $6 = HEAP32[$5 + 24 >> 2];
     $3 = HEAP32[$5 + 12 >> 2];
     label$21 : {
      if (($5 | 0) != ($3 | 0)) {
       $2 = HEAP32[$5 + 8 >> 2];
       HEAP32[$2 + 12 >> 2] = $3;
       HEAP32[$3 + 8 >> 2] = $2;
       break label$21;
      }
      label$24 : {
       $4 = $5 + 20 | 0;
       $2 = HEAP32[$4 >> 2];
       if ($2) {
        break label$24;
       }
       $4 = $5 + 16 | 0;
       $2 = HEAP32[$4 >> 2];
       if ($2) {
        break label$24;
       }
       $3 = 0;
       break label$21;
      }
      while (1) {
       $7 = $4;
       $3 = $2;
       $4 = $2 + 20 | 0;
       $2 = HEAP32[$4 >> 2];
       if ($2) {
        continue;
       }
       $4 = $3 + 16 | 0;
       $2 = HEAP32[$3 + 16 >> 2];
       if ($2) {
        continue;
       }
       break;
      }
      HEAP32[$7 >> 2] = 0;
     }
     if (!$6) {
      break label$18;
     }
     $4 = HEAP32[$5 + 28 >> 2];
     $2 = ($4 << 2) + 5848 | 0;
     label$26 : {
      if (HEAP32[$2 >> 2] == ($5 | 0)) {
       HEAP32[$2 >> 2] = $3;
       if ($3) {
        break label$26;
       }
       HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $4);
       break label$18;
      }
      HEAP32[(HEAP32[$6 + 16 >> 2] == ($5 | 0) ? 16 : 20) + $6 >> 2] = $3;
      if (!$3) {
       break label$18;
      }
     }
     HEAP32[$3 + 24 >> 2] = $6;
     $2 = HEAP32[$5 + 16 >> 2];
     if ($2) {
      HEAP32[$3 + 16 >> 2] = $2;
      HEAP32[$2 + 24 >> 2] = $3;
     }
     $2 = HEAP32[$5 + 20 >> 2];
     if (!$2) {
      break label$18;
     }
     HEAP32[$3 + 20 >> 2] = $2;
     HEAP32[$2 + 24 >> 2] = $3;
    }
    HEAP32[$0 + 4 >> 2] = $1 | 1;
    HEAP32[$0 + $1 >> 2] = $1;
    if (HEAP32[1391] != ($0 | 0)) {
     break label$14;
    }
    HEAP32[1388] = $1;
    return;
   }
   HEAP32[$5 + 4 >> 2] = $2 & -2;
   HEAP32[$0 + 4 >> 2] = $1 | 1;
   HEAP32[$0 + $1 >> 2] = $1;
  }
  if ($1 >>> 0 <= 255) {
   $2 = $1 >>> 3 | 0;
   $1 = ($2 << 3) + 5584 | 0;
   $2 = 1 << $2;
   $4 = HEAP32[1386];
   label$30 : {
    if (!($2 & $4)) {
     HEAP32[1386] = $2 | $4;
     $2 = $1;
     break label$30;
    }
    $2 = HEAP32[$1 + 8 >> 2];
   }
   HEAP32[$1 + 8 >> 2] = $0;
   HEAP32[$2 + 12 >> 2] = $0;
   HEAP32[$0 + 12 >> 2] = $1;
   HEAP32[$0 + 8 >> 2] = $2;
   return;
  }
  $2 = 31;
  HEAP32[$0 + 16 >> 2] = 0;
  HEAP32[$0 + 20 >> 2] = 0;
  if ($1 >>> 0 <= 16777215) {
   $2 = $1 >>> 8 | 0;
   $3 = $2;
   $2 = $2 + 1048320 >>> 16 & 8;
   $4 = $3 << $2;
   $3 = $4;
   $4 = $4 + 520192 >>> 16 & 4;
   $3 = $3 << $4;
   $7 = $3;
   $3 = $3 + 245760 >>> 16 & 2;
   $2 = ($7 << $3 >>> 15 | 0) - ($2 | $4 | $3) | 0;
   $2 = ($2 << 1 | $1 >>> $2 + 21 & 1) + 28 | 0;
  }
  HEAP32[$0 + 28 >> 2] = $2;
  $4 = ($2 << 2) + 5848 | 0;
  label$33 : {
   $3 = HEAP32[1387];
   $5 = 1 << $2;
   label$34 : {
    if (!($3 & $5)) {
     HEAP32[1387] = $3 | $5;
     HEAP32[$4 >> 2] = $0;
     break label$34;
    }
    $2 = $1 << (($2 | 0) == 31 ? 0 : 25 - ($2 >>> 1 | 0) | 0);
    $3 = HEAP32[$4 >> 2];
    while (1) {
     $4 = $3;
     if ((HEAP32[$3 + 4 >> 2] & -8) == ($1 | 0)) {
      break label$33;
     }
     $3 = $2 >>> 29 | 0;
     $2 = $2 << 1;
     $7 = ($3 & 4) + $4 | 0;
     $5 = $7 + 16 | 0;
     $3 = HEAP32[$5 >> 2];
     if ($3) {
      continue;
     }
     break;
    }
    HEAP32[$7 + 16 >> 2] = $0;
   }
   HEAP32[$0 + 24 >> 2] = $4;
   HEAP32[$0 + 12 >> 2] = $0;
   HEAP32[$0 + 8 >> 2] = $0;
   return;
  }
  $1 = HEAP32[$4 + 8 >> 2];
  HEAP32[$1 + 12 >> 2] = $0;
  HEAP32[$4 + 8 >> 2] = $0;
  HEAP32[$0 + 24 >> 2] = 0;
  HEAP32[$0 + 12 >> 2] = $4;
  HEAP32[$0 + 8 >> 2] = $1;
 }
}
function __rem_pio2($0, $1) {
 var $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0;
 $6 = __stack_pointer - 48 | 0;
 __stack_pointer = $6;
 label$1 : {
  label$2 : {
   wasm2js_scratch_store_f64(+$0);
   $4 = wasm2js_scratch_load_i32(1) | 0;
   $8 = wasm2js_scratch_load_i32(0) | 0;
   $3 = $4;
   $7 = $4 & 2147483647;
   label$3 : {
    if ($7 >>> 0 <= 1074752122) {
     if (($3 & 1048575) == 598523) {
      break label$3;
     }
     if ($7 >>> 0 <= 1073928572) {
      if (($4 | 0) > 0 ? 1 : ($4 | 0) >= 0) {
       $0 = $0 + -1.5707963267341256;
       $2 = $0 + -6.077100506506192e-11;
       HEAPF64[$1 >> 3] = $2;
       HEAPF64[$1 + 8 >> 3] = $0 - $2 + -6.077100506506192e-11;
       $3 = 1;
       break label$1;
      }
      $0 = $0 + 1.5707963267341256;
      $2 = $0 + 6.077100506506192e-11;
      HEAPF64[$1 >> 3] = $2;
      HEAPF64[$1 + 8 >> 3] = $0 - $2 + 6.077100506506192e-11;
      $3 = -1;
      break label$1;
     }
     if (($4 | 0) > 0 ? 1 : ($4 | 0) >= 0) {
      $0 = $0 + -3.1415926534682512;
      $2 = $0 + -1.2154201013012384e-10;
      HEAPF64[$1 >> 3] = $2;
      HEAPF64[$1 + 8 >> 3] = $0 - $2 + -1.2154201013012384e-10;
      $3 = 2;
      break label$1;
     }
     $0 = $0 + 3.1415926534682512;
     $2 = $0 + 1.2154201013012384e-10;
     HEAPF64[$1 >> 3] = $2;
     HEAPF64[$1 + 8 >> 3] = $0 - $2 + 1.2154201013012384e-10;
     $3 = -2;
     break label$1;
    }
    if ($7 >>> 0 <= 1075594811) {
     if ($7 >>> 0 <= 1075183036) {
      if (($7 | 0) == 1074977148) {
       break label$3;
      }
      if (($4 | 0) > 0 ? 1 : ($4 | 0) >= 0) {
       $0 = $0 + -4.712388980202377;
       $2 = $0 + -1.8231301519518578e-10;
       HEAPF64[$1 >> 3] = $2;
       HEAPF64[$1 + 8 >> 3] = $0 - $2 + -1.8231301519518578e-10;
       $3 = 3;
       break label$1;
      }
      $0 = $0 + 4.712388980202377;
      $2 = $0 + 1.8231301519518578e-10;
      HEAPF64[$1 >> 3] = $2;
      HEAPF64[$1 + 8 >> 3] = $0 - $2 + 1.8231301519518578e-10;
      $3 = -3;
      break label$1;
     }
     if (($7 | 0) == 1075388923) {
      break label$3;
     }
     if (($4 | 0) > 0 ? 1 : ($4 | 0) >= 0) {
      $0 = $0 + -6.2831853069365025;
      $2 = $0 + -2.430840202602477e-10;
      HEAPF64[$1 >> 3] = $2;
      HEAPF64[$1 + 8 >> 3] = $0 - $2 + -2.430840202602477e-10;
      $3 = 4;
      break label$1;
     }
     $0 = $0 + 6.2831853069365025;
     $2 = $0 + 2.430840202602477e-10;
     HEAPF64[$1 >> 3] = $2;
     HEAPF64[$1 + 8 >> 3] = $0 - $2 + 2.430840202602477e-10;
     $3 = -4;
     break label$1;
    }
    if ($7 >>> 0 > 1094263290) {
     break label$2;
    }
   }
   $2 = $0 * .6366197723675814 + 6755399441055744 + -6755399441055744;
   $9 = $0 + $2 * -1.5707963267341256;
   $11 = $2 * 6.077100506506192e-11;
   $0 = $9 - $11;
   HEAPF64[$1 >> 3] = $0;
   $10 = $7 >>> 20 | 0;
   wasm2js_scratch_store_f64(+$0);
   $5 = wasm2js_scratch_load_i32(1) | 0;
   wasm2js_scratch_load_i32(0) | 0;
   $5 = ($10 - ($5 >>> 20 & 2047) | 0) < 17;
   if (Math_abs($2) < 2147483648) {
    $3 = ~~$2;
   } else {
    $3 = -2147483648;
   }
   label$14 : {
    if ($5) {
     break label$14;
    }
    $0 = $2 * 6.077100506303966e-11;
    $12 = $9 - $0;
    $11 = $2 * 2.0222662487959506e-21 - ($9 - $12 - $0);
    $0 = $12 - $11;
    HEAPF64[$1 >> 3] = $0;
    wasm2js_scratch_store_f64(+$0);
    $5 = wasm2js_scratch_load_i32(1) | 0;
    wasm2js_scratch_load_i32(0) | 0;
    if (($10 - ($5 >>> 20 & 2047) | 0) < 50) {
     $9 = $12;
     break label$14;
    }
    $0 = $2 * 2.0222662487111665e-21;
    $9 = $12 - $0;
    $11 = $2 * 8.4784276603689e-32 - ($12 - $9 - $0);
    $0 = $9 - $11;
    HEAPF64[$1 >> 3] = $0;
   }
   HEAPF64[$1 + 8 >> 3] = $9 - $0 - $11;
   break label$1;
  }
  if ($7 >>> 0 >= 2146435072) {
   $0 = $0 - $0;
   HEAPF64[$1 >> 3] = $0;
   HEAPF64[$1 + 8 >> 3] = $0;
   $3 = 0;
   break label$1;
  }
  $5 = $4 & 1048575;
  $5 = $5 | 1096810496;
  wasm2js_scratch_store_i32(0, $8 | 0);
  wasm2js_scratch_store_i32(1, $5 | 0);
  $0 = +wasm2js_scratch_load_f64();
  $3 = 0;
  $5 = 1;
  while (1) {
   $3 = ($6 + 16 | 0) + ($3 << 3) | 0;
   if (Math_abs($0) < 2147483648) {
    $10 = ~~$0;
   } else {
    $10 = -2147483648;
   }
   $2 = +($10 | 0);
   HEAPF64[$3 >> 3] = $2;
   $0 = ($0 - $2) * 16777216;
   $3 = 1;
   $10 = $5 & 1;
   $5 = 0;
   if ($10) {
    continue;
   }
   break;
  }
  HEAPF64[$6 + 32 >> 3] = $0;
  label$20 : {
   if ($0 != 0) {
    $3 = 2;
    break label$20;
   }
   $5 = 1;
   while (1) {
    $3 = $5;
    $5 = $3 - 1 | 0;
    if (HEAPF64[($6 + 16 | 0) + ($3 << 3) >> 3] == 0) {
     continue;
    }
    break;
   }
  }
  $3 = __rem_pio2_large($6 + 16 | 0, $6, ($7 >>> 20 | 0) - 1046 | 0, $3 + 1 | 0, 1);
  $0 = HEAPF64[$6 >> 3];
  if (($4 | 0) < -1 ? 1 : ($4 | 0) <= -1) {
   HEAPF64[$1 >> 3] = -$0;
   HEAPF64[$1 + 8 >> 3] = -HEAPF64[$6 + 8 >> 3];
   $3 = 0 - $3 | 0;
   break label$1;
  }
  HEAPF64[$1 >> 3] = $0;
  HEAPF64[$1 + 8 >> 3] = HEAPF64[$6 + 8 >> 3];
 }
 __stack_pointer = $6 + 48 | 0;
 return $3;
}
function try_realloc_chunk($0, $1) {
 var $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0;
 $6 = HEAP32[$0 + 4 >> 2];
 $3 = $6 & 3;
 $5 = $6 & -8;
 $2 = $5 + $0 | 0;
 label$2 : {
  if (!$3) {
   $3 = 0;
   if ($1 >>> 0 < 256) {
    break label$2;
   }
   if ($1 + 4 >>> 0 <= $5 >>> 0) {
    $3 = $0;
    if ($5 - $1 >>> 0 <= HEAP32[1506] << 1 >>> 0) {
     break label$2;
    }
   }
   return 0;
  }
  label$5 : {
   if ($1 >>> 0 <= $5 >>> 0) {
    $3 = $5 - $1 | 0;
    if ($3 >>> 0 < 16) {
     break label$5;
    }
    HEAP32[$0 + 4 >> 2] = $6 & 1 | $1 | 2;
    $1 = $0 + $1 | 0;
    HEAP32[$1 + 4 >> 2] = $3 | 3;
    HEAP32[$2 + 4 >> 2] = HEAP32[$2 + 4 >> 2] | 1;
    dispose_chunk($1, $3);
    break label$5;
   }
   $3 = 0;
   if (HEAP32[1392] == ($2 | 0)) {
    $2 = HEAP32[1389] + $5 | 0;
    if ($2 >>> 0 <= $1 >>> 0) {
     break label$2;
    }
    HEAP32[$0 + 4 >> 2] = $6 & 1 | $1 | 2;
    $3 = $0 + $1 | 0;
    $1 = $2 - $1 | 0;
    HEAP32[$3 + 4 >> 2] = $1 | 1;
    HEAP32[1389] = $1;
    HEAP32[1392] = $3;
    break label$5;
   }
   if (HEAP32[1391] == ($2 | 0)) {
    $2 = HEAP32[1388] + $5 | 0;
    if ($2 >>> 0 < $1 >>> 0) {
     break label$2;
    }
    $3 = $2 - $1 | 0;
    label$9 : {
     if ($3 >>> 0 >= 16) {
      HEAP32[$0 + 4 >> 2] = $6 & 1 | $1 | 2;
      $1 = $0 + $1 | 0;
      HEAP32[$1 + 4 >> 2] = $3 | 1;
      $2 = $0 + $2 | 0;
      HEAP32[$2 >> 2] = $3;
      HEAP32[$2 + 4 >> 2] = HEAP32[$2 + 4 >> 2] & -2;
      break label$9;
     }
     HEAP32[$0 + 4 >> 2] = $6 & 1 | $2 | 2;
     $1 = $0 + $2 | 0;
     HEAP32[$1 + 4 >> 2] = HEAP32[$1 + 4 >> 2] | 1;
     $3 = 0;
     $1 = 0;
    }
    HEAP32[1391] = $1;
    HEAP32[1388] = $3;
    break label$5;
   }
   $4 = HEAP32[$2 + 4 >> 2];
   if ($4 & 2) {
    break label$2;
   }
   $7 = ($4 & -8) + $5 | 0;
   if ($7 >>> 0 < $1 >>> 0) {
    break label$2;
   }
   $9 = $7 - $1 | 0;
   label$11 : {
    if ($4 >>> 0 <= 255) {
     $3 = HEAP32[$2 + 12 >> 2];
     $2 = HEAP32[$2 + 8 >> 2];
     $4 = $4 >>> 3 | 0;
     $5 = ($4 << 3) + 5584 | 0;
     if (($2 | 0) == ($3 | 0)) {
      HEAP32[1386] = HEAP32[1386] & __wasm_rotl_i32(-2, $4);
      break label$11;
     }
     HEAP32[$2 + 12 >> 2] = $3;
     HEAP32[$3 + 8 >> 2] = $2;
     break label$11;
    }
    $8 = HEAP32[$2 + 24 >> 2];
    $4 = HEAP32[$2 + 12 >> 2];
    label$14 : {
     if (($4 | 0) != ($2 | 0)) {
      $3 = HEAP32[$2 + 8 >> 2];
      HEAP32[$3 + 12 >> 2] = $4;
      HEAP32[$4 + 8 >> 2] = $3;
      break label$14;
     }
     label$17 : {
      $3 = $2 + 20 | 0;
      $5 = HEAP32[$3 >> 2];
      if ($5) {
       break label$17;
      }
      $3 = $2 + 16 | 0;
      $5 = HEAP32[$3 >> 2];
      if ($5) {
       break label$17;
      }
      $4 = 0;
      break label$14;
     }
     while (1) {
      $10 = $3;
      $4 = $5;
      $3 = $4 + 20 | 0;
      $5 = HEAP32[$3 >> 2];
      if ($5) {
       continue;
      }
      $3 = $4 + 16 | 0;
      $5 = HEAP32[$4 + 16 >> 2];
      if ($5) {
       continue;
      }
      break;
     }
     HEAP32[$10 >> 2] = 0;
    }
    if (!$8) {
     break label$11;
    }
    $5 = HEAP32[$2 + 28 >> 2];
    $3 = ($5 << 2) + 5848 | 0;
    label$19 : {
     if (HEAP32[$3 >> 2] == ($2 | 0)) {
      HEAP32[$3 >> 2] = $4;
      if ($4) {
       break label$19;
      }
      HEAP32[1387] = HEAP32[1387] & __wasm_rotl_i32(-2, $5);
      break label$11;
     }
     HEAP32[(HEAP32[$8 + 16 >> 2] == ($2 | 0) ? 16 : 20) + $8 >> 2] = $4;
     if (!$4) {
      break label$11;
     }
    }
    HEAP32[$4 + 24 >> 2] = $8;
    $3 = HEAP32[$2 + 16 >> 2];
    if ($3) {
     HEAP32[$4 + 16 >> 2] = $3;
     HEAP32[$3 + 24 >> 2] = $4;
    }
    $2 = HEAP32[$2 + 20 >> 2];
    if (!$2) {
     break label$11;
    }
    HEAP32[$4 + 20 >> 2] = $2;
    HEAP32[$2 + 24 >> 2] = $4;
   }
   if ($9 >>> 0 <= 15) {
    HEAP32[$0 + 4 >> 2] = $6 & 1 | $7 | 2;
    $1 = $0 + $7 | 0;
    HEAP32[$1 + 4 >> 2] = HEAP32[$1 + 4 >> 2] | 1;
    break label$5;
   }
   HEAP32[$0 + 4 >> 2] = $6 & 1 | $1 | 2;
   $1 = $0 + $1 | 0;
   HEAP32[$1 + 4 >> 2] = $9 | 3;
   $2 = $0 + $7 | 0;
   HEAP32[$2 + 4 >> 2] = HEAP32[$2 + 4 >> 2] | 1;
   dispose_chunk($1, $9);
  }
  $3 = $0;
 }
 return $3;
}
function speex_resampler_process_float($0, $1, $2, $3, $4, $5) {
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0;
 $8 = __stack_pointer - 16 | 0;
 __stack_pointer = $8;
 $16 = HEAP32[$0 + 24 >> 2];
 $17 = $16 - 1 | 0;
 $13 = HEAP32[$0 + 72 >> 2];
 $18 = HEAP32[$0 + 28 >> 2];
 $19 = Math_imul($18, $1);
 $14 = $13 + ($19 << 2) | 0;
 $20 = HEAP32[$0 + 88 >> 2];
 $11 = HEAP32[$5 >> 2];
 $12 = HEAP32[$3 >> 2];
 $6 = $1 << 2;
 $7 = $6 + HEAP32[$0 + 68 >> 2] | 0;
 label$1 : {
  if (HEAP32[$7 >> 2]) {
   HEAP32[$8 + 12 >> 2] = $11;
   HEAP32[$8 + 8 >> 2] = HEAP32[$7 >> 2];
   HEAP32[$0 + 56 >> 2] = 1;
   $9 = FUNCTION_TABLE[HEAP32[$0 + 84 >> 2]]($0, $1, $14, $8 + 8 | 0, $4, $8 + 12 | 0) | 0;
   $7 = HEAP32[$8 + 8 >> 2];
   $6 = HEAP32[$0 + 60 >> 2] + $6 | 0;
   $10 = HEAP32[$6 >> 2];
   if (($7 | 0) > ($10 | 0)) {
    HEAP32[$8 + 8 >> 2] = $10;
    $7 = $10;
   }
   HEAP32[$8 + 12 >> 2] = $9;
   HEAP32[$6 >> 2] = HEAP32[$6 >> 2] - $7;
   $7 = HEAP32[$8 + 8 >> 2];
   if (($16 | 0) >= 2) {
    $6 = 0;
    while (1) {
     HEAP32[($6 << 2) + $14 >> 2] = HEAP32[($6 + $7 << 2) + $14 >> 2];
     $6 = $6 + 1 | 0;
     if (($17 | 0) != ($6 | 0)) {
      continue;
     }
     break;
    }
   }
   $15 = HEAP32[$0 + 68 >> 2] + ($1 << 2) | 0;
   $9 = HEAP32[$15 >> 2] - $7 | 0;
   HEAP32[$15 >> 2] = $9;
   if ($9) {
    $6 = 0;
    $10 = HEAP32[$8 + 8 >> 2];
    while (1) {
     $7 = $6 + $17 | 0;
     HEAP32[($7 << 2) + $14 >> 2] = HEAP32[($7 + $10 << 2) + $14 >> 2];
     $6 = $6 + 1 | 0;
     if (($9 | 0) != ($6 | 0)) {
      continue;
     }
     break;
    }
   }
   $6 = HEAP32[$8 + 12 >> 2];
   $11 = $11 - $6 | 0;
   if (HEAP32[$15 >> 2]) {
    break label$1;
   }
   $4 = (Math_imul(HEAP32[$0 + 92 >> 2], $6) << 2) + $4 | 0;
  }
  if (!$11 | !$12) {
   break label$1;
  }
  $15 = $18 - $17 | 0;
  $18 = (($16 + $19 << 2) + $13 | 0) - 4 | 0;
  while (1) {
   $7 = $12 >>> 0 > $15 >>> 0 ? $15 : $12;
   HEAP32[$8 + 12 >> 2] = $7;
   HEAP32[$8 + 8 >> 2] = $11;
   label$9 : {
    if ($2) {
     $6 = 0;
     if (!$7) {
      break label$9;
     }
     while (1) {
      HEAP32[($6 + $17 << 2) + $14 >> 2] = HEAP32[(Math_imul($6, $20) << 2) + $2 >> 2];
      $6 = $6 + 1 | 0;
      if (($7 | 0) != ($6 | 0)) {
       continue;
      }
      break;
     }
     break label$9;
    }
    if (!$7) {
     break label$9;
    }
    memset($18, 0, $7 << 2);
   }
   HEAP32[$0 + 56 >> 2] = 1;
   $10 = HEAP32[$0 + 24 >> 2];
   $7 = HEAP32[$0 + 72 >> 2] + (Math_imul(HEAP32[$0 + 28 >> 2], $1) << 2) | 0;
   $16 = FUNCTION_TABLE[HEAP32[$0 + 84 >> 2]]($0, $1, $7, $8 + 12 | 0, $4, $8 + 8 | 0) | 0;
   $9 = HEAP32[$8 + 12 >> 2];
   $6 = HEAP32[$0 + 60 >> 2] + ($1 << 2) | 0;
   $13 = HEAP32[$6 >> 2];
   if (($9 | 0) > ($13 | 0)) {
    HEAP32[$8 + 12 >> 2] = $13;
    $9 = $13;
   }
   HEAP32[$8 + 8 >> 2] = $16;
   HEAP32[$6 >> 2] = HEAP32[$6 >> 2] - $9;
   $9 = HEAP32[$8 + 12 >> 2];
   $6 = $9;
   if (($10 | 0) >= 2) {
    $10 = $10 - 1 | 0;
    $6 = 0;
    while (1) {
     HEAP32[($6 << 2) + $7 >> 2] = HEAP32[($6 + $9 << 2) + $7 >> 2];
     $6 = $6 + 1 | 0;
     if (($10 | 0) != ($6 | 0)) {
      continue;
     }
     break;
    }
    $6 = HEAP32[$8 + 12 >> 2];
   }
   $12 = $12 - $9 | 0;
   $7 = HEAP32[$8 + 8 >> 2];
   $11 = $11 - $7 | 0;
   if (!$11) {
    break label$1;
   }
   $2 = $2 ? (Math_imul($6, $20) << 2) + $2 | 0 : 0;
   $4 = (Math_imul(HEAP32[$0 + 92 >> 2], $7) << 2) + $4 | 0;
   if ($12) {
    continue;
   }
   break;
  }
 }
 HEAP32[$3 >> 2] = HEAP32[$3 >> 2] - $12;
 HEAP32[$5 >> 2] = HEAP32[$5 >> 2] - $11;
 __stack_pointer = $8 + 16 | 0;
 $6 = HEAP32[$0 + 84 >> 2];
 return ($6 | 0) == 5;
}
function resampler_basic_interpolate_single($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = Math_fround(0), $7 = Math_fround(0), $8 = Math_fround(0), $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = Math_fround(0), $14 = Math_fround(0), $15 = Math_fround(0), $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = Math_fround(0), $22 = Math_fround(0), $23 = 0, $24 = 0, $25 = 0, $26 = Math_fround(0), $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = Math_fround(0);
 $1 = $1 << 2;
 $16 = $1 + HEAP32[$0 + 64 >> 2] | 0;
 $12 = HEAP32[$16 >> 2];
 $17 = HEAP32[$0 + 60 >> 2] + $1 | 0;
 $9 = HEAP32[$17 >> 2];
 $18 = HEAP32[$3 >> 2];
 label$1 : {
  if (($9 | 0) >= ($18 | 0)) {
   break label$1;
  }
  $23 = HEAP32[$0 + 40 >> 2];
  $24 = HEAP32[$0 + 36 >> 2];
  $25 = HEAP32[$0 + 92 >> 2];
  $3 = HEAP32[$5 >> 2];
  $19 = ($3 | 0) > 0 ? $3 : 0;
  $10 = HEAP32[$0 + 12 >> 2];
  $26 = Math_fround($10 >>> 0);
  $20 = HEAP32[$0 + 24 >> 2];
  $27 = ($20 | 0) < 1;
  while (1) {
   if (($11 | 0) == ($19 | 0)) {
    $11 = $19;
    break label$1;
   }
   $5 = HEAP32[$0 + 48 >> 2];
   $3 = Math_imul($12, $5);
   $1 = $3;
   $3 = ($3 >>> 0) / ($10 >>> 0) | 0;
   $7 = Math_fround(Math_fround($1 - Math_imul($10, $3) >>> 0) / $26);
   label$4 : {
    if ($27) {
     $8 = Math_fround(0);
     $13 = Math_fround(0);
     $14 = Math_fround(0);
     $15 = Math_fround(0);
     break label$4;
    }
    $28 = ($9 << 2) + $2 | 0;
    $29 = 4 - $3 | 0;
    $30 = HEAP32[$0 + 76 >> 2];
    $3 = 0;
    $15 = Math_fround(0);
    $14 = Math_fround(0);
    $13 = Math_fround(0);
    $8 = Math_fround(0);
    while (1) {
     $6 = HEAPF32[($3 << 2) + $28 >> 2];
     $3 = $3 + 1 | 0;
     $1 = (Math_imul($5, $3) + $29 << 2) + $30 | 0;
     $14 = Math_fround($14 + Math_fround($6 * HEAPF32[$1 >> 2]));
     $15 = Math_fround($15 + Math_fround($6 * HEAPF32[$1 + 4 >> 2]));
     $13 = Math_fround($13 + Math_fround($6 * HEAPF32[$1 - 4 >> 2]));
     $8 = Math_fround($8 + Math_fround($6 * HEAPF32[$1 - 8 >> 2]));
     if (($3 | 0) != ($20 | 0)) {
      continue;
     }
     break;
    }
   }
   $6 = Math_fround($7 * Math_fround(.16666999459266663));
   $21 = Math_fround($7 * Math_fround($7 * $6));
   $22 = Math_fround($21 - $6);
   $31 = Math_fround($22 * $8);
   $6 = Math_fround($7 * Math_fround($7 * Math_fround(.5)));
   $8 = Math_fround(Math_fround($7 + $6) - Math_fround($7 * $6));
   $6 = Math_fround(Math_fround($6 + Math_fround($7 * Math_fround(-.3333300054073334))) - $21);
   HEAPF32[(Math_imul($11, $25) << 2) + $4 >> 2] = Math_fround(Math_fround($31 + Math_fround($8 * $13)) + Math_fround($14 * Math_fround(1 - +$22 - +$8 - +$6))) + Math_fround($6 * $15);
   $3 = $12 + $23 | 0;
   $12 = $3 - ($3 >>> 0 < $10 >>> 0 ? 0 : $10) | 0;
   $11 = $11 + 1 | 0;
   $9 = ($9 + $24 | 0) + ($3 >>> 0 >= $10 >>> 0) | 0;
   if (($18 | 0) > ($9 | 0)) {
    continue;
   }
   break;
  }
 }
 HEAP32[$17 >> 2] = $9;
 HEAP32[$16 >> 2] = $12;
 return $11 | 0;
}
function resampler_basic_interpolate_double($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = Math_fround(0), $7 = 0, $8 = Math_fround(0), $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = Math_fround(0), $23 = 0, $24 = 0, $25 = 0, $26 = Math_fround(0), $27 = 0, $28 = 0, $29 = 0, $30 = 0, $31 = 0;
 $1 = $1 << 2;
 $17 = $1 + HEAP32[$0 + 64 >> 2] | 0;
 $13 = HEAP32[$17 >> 2];
 $18 = HEAP32[$0 + 60 >> 2] + $1 | 0;
 $9 = HEAP32[$18 >> 2];
 $19 = HEAP32[$3 >> 2];
 label$1 : {
  if (($9 | 0) >= ($19 | 0)) {
   break label$1;
  }
  $23 = HEAP32[$0 + 40 >> 2];
  $24 = HEAP32[$0 + 36 >> 2];
  $25 = HEAP32[$0 + 92 >> 2];
  $3 = HEAP32[$5 >> 2];
  $20 = ($3 | 0) > 0 ? $3 : 0;
  $10 = HEAP32[$0 + 12 >> 2];
  $26 = Math_fround($10 >>> 0);
  $21 = HEAP32[$0 + 24 >> 2];
  $27 = ($21 | 0) < 1;
  while (1) {
   if (($12 | 0) == ($20 | 0)) {
    $12 = $20;
    break label$1;
   }
   $5 = HEAP32[$0 + 48 >> 2];
   $3 = Math_imul($13, $5);
   $1 = $3;
   $3 = ($3 >>> 0) / ($10 >>> 0) | 0;
   $8 = Math_fround(Math_fround($1 - Math_imul($10, $3) >>> 0) / $26);
   label$4 : {
    if ($27) {
     $7 = 0;
     $11 = 0;
     $14 = 0;
     $15 = 0;
     break label$4;
    }
    $28 = ($9 << 2) + $2 | 0;
    $29 = 4 - $3 | 0;
    $30 = HEAP32[$0 + 76 >> 2];
    $3 = 0;
    $15 = 0;
    $14 = 0;
    $11 = 0;
    $7 = 0;
    while (1) {
     $6 = HEAPF32[($3 << 2) + $28 >> 2];
     $3 = $3 + 1 | 0;
     $1 = (Math_imul($5, $3) + $29 << 2) + $30 | 0;
     $14 = $14 + +Math_fround($6 * HEAPF32[$1 >> 2]);
     $15 = $15 + +Math_fround($6 * HEAPF32[$1 + 4 >> 2]);
     $11 = $11 + +Math_fround($6 * HEAPF32[$1 - 4 >> 2]);
     $7 = $7 + +Math_fround($6 * HEAPF32[$1 - 8 >> 2]);
     if (($3 | 0) != ($21 | 0)) {
      continue;
     }
     break;
    }
   }
   $6 = Math_fround($8 * Math_fround(.16666999459266663));
   $22 = Math_fround($8 * Math_fround($8 * $6));
   $16 = +Math_fround($22 - $6);
   $31 = $7 * $16;
   $6 = Math_fround($8 * Math_fround($8 * Math_fround(.5)));
   $7 = +Math_fround(Math_fround($8 + $6) - Math_fround($8 * $6));
   $11 = $31 + $11 * $7;
   $16 = 1 - $16 - $7;
   $7 = +Math_fround(Math_fround($6 + Math_fround($8 * Math_fround(-.3333300054073334))) - $22);
   HEAPF32[(Math_imul($12, $25) << 2) + $4 >> 2] = $11 + $14 * +Math_fround($16 - $7) + $15 * $7;
   $3 = $13 + $23 | 0;
   $13 = $3 - ($3 >>> 0 < $10 >>> 0 ? 0 : $10) | 0;
   $12 = $12 + 1 | 0;
   $9 = ($9 + $24 | 0) + ($3 >>> 0 >= $10 >>> 0) | 0;
   if (($19 | 0) > ($9 | 0)) {
    continue;
   }
   break;
  }
 }
 HEAP32[$18 >> 2] = $9;
 HEAP32[$17 >> 2] = $13;
 return $12 | 0;
}
function memcpy($0, $1, $2) {
 var $3 = 0, $4 = 0, $5 = 0;
 if ($2 >>> 0 >= 512) {
  emscripten_memcpy_big($0 | 0, $1 | 0, $2 | 0) | 0;
  return $0;
 }
 $4 = $0 + $2 | 0;
 label$2 : {
  if (!(($0 ^ $1) & 3)) {
   label$4 : {
    if (($2 | 0) < 1) {
     $2 = $0;
     break label$4;
    }
    if (!($0 & 3)) {
     $2 = $0;
     break label$4;
    }
    $2 = $0;
    while (1) {
     HEAP8[$2 | 0] = HEAPU8[$1 | 0];
     $1 = $1 + 1 | 0;
     $2 = $2 + 1 | 0;
     if ($4 >>> 0 <= $2 >>> 0) {
      break label$4;
     }
     if ($2 & 3) {
      continue;
     }
     break;
    }
   }
   $3 = $4 & -4;
   label$8 : {
    if ($3 >>> 0 < 64) {
     break label$8;
    }
    $5 = $3 + -64 | 0;
    if ($5 >>> 0 < $2 >>> 0) {
     break label$8;
    }
    while (1) {
     HEAP32[$2 >> 2] = HEAP32[$1 >> 2];
     HEAP32[$2 + 4 >> 2] = HEAP32[$1 + 4 >> 2];
     HEAP32[$2 + 8 >> 2] = HEAP32[$1 + 8 >> 2];
     HEAP32[$2 + 12 >> 2] = HEAP32[$1 + 12 >> 2];
     HEAP32[$2 + 16 >> 2] = HEAP32[$1 + 16 >> 2];
     HEAP32[$2 + 20 >> 2] = HEAP32[$1 + 20 >> 2];
     HEAP32[$2 + 24 >> 2] = HEAP32[$1 + 24 >> 2];
     HEAP32[$2 + 28 >> 2] = HEAP32[$1 + 28 >> 2];
     HEAP32[$2 + 32 >> 2] = HEAP32[$1 + 32 >> 2];
     HEAP32[$2 + 36 >> 2] = HEAP32[$1 + 36 >> 2];
     HEAP32[$2 + 40 >> 2] = HEAP32[$1 + 40 >> 2];
     HEAP32[$2 + 44 >> 2] = HEAP32[$1 + 44 >> 2];
     HEAP32[$2 + 48 >> 2] = HEAP32[$1 + 48 >> 2];
     HEAP32[$2 + 52 >> 2] = HEAP32[$1 + 52 >> 2];
     HEAP32[$2 + 56 >> 2] = HEAP32[$1 + 56 >> 2];
     HEAP32[$2 + 60 >> 2] = HEAP32[$1 + 60 >> 2];
     $1 = $1 - -64 | 0;
     $2 = $2 - -64 | 0;
     if ($5 >>> 0 >= $2 >>> 0) {
      continue;
     }
     break;
    }
   }
   if ($2 >>> 0 >= $3 >>> 0) {
    break label$2;
   }
   while (1) {
    HEAP32[$2 >> 2] = HEAP32[$1 >> 2];
    $1 = $1 + 4 | 0;
    $2 = $2 + 4 | 0;
    if ($3 >>> 0 > $2 >>> 0) {
     continue;
    }
    break;
   }
   break label$2;
  }
  if ($4 >>> 0 < 4) {
   $2 = $0;
   break label$2;
  }
  $3 = $4 - 4 | 0;
  if ($3 >>> 0 < $0 >>> 0) {
   $2 = $0;
   break label$2;
  }
  $2 = $0;
  while (1) {
   HEAP8[$2 | 0] = HEAPU8[$1 | 0];
   HEAP8[$2 + 1 | 0] = HEAPU8[$1 + 1 | 0];
   HEAP8[$2 + 2 | 0] = HEAPU8[$1 + 2 | 0];
   HEAP8[$2 + 3 | 0] = HEAPU8[$1 + 3 | 0];
   $1 = $1 + 4 | 0;
   $2 = $2 + 4 | 0;
   if ($3 >>> 0 >= $2 >>> 0) {
    continue;
   }
   break;
  }
 }
 if ($2 >>> 0 < $4 >>> 0) {
  while (1) {
   HEAP8[$2 | 0] = HEAPU8[$1 | 0];
   $1 = $1 + 1 | 0;
   $2 = $2 + 1 | 0;
   if (($4 | 0) != ($2 | 0)) {
    continue;
   }
   break;
  }
 }
 return $0;
}
function resampler_basic_direct_double($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 $1 = $1 << 2;
 $16 = $1 + HEAP32[$0 + 64 >> 2] | 0;
 $9 = HEAP32[$16 >> 2];
 $17 = HEAP32[$0 + 60 >> 2] + $1 | 0;
 $6 = HEAP32[$17 >> 2];
 $18 = HEAP32[$3 >> 2];
 label$1 : {
  if (($6 | 0) >= ($18 | 0)) {
   break label$1;
  }
  $13 = HEAP32[$0 + 12 >> 2];
  $20 = HEAP32[$0 + 40 >> 2];
  $21 = HEAP32[$0 + 36 >> 2];
  $22 = HEAP32[$0 + 92 >> 2];
  $23 = HEAP32[$0 + 76 >> 2];
  $3 = HEAP32[$5 >> 2];
  $19 = ($3 | 0) > 0 ? $3 : 0;
  $14 = HEAP32[$0 + 24 >> 2];
  $24 = ($14 | 0) < 1;
  while (1) {
   if (($7 | 0) == ($19 | 0)) {
    $7 = $19;
    break label$1;
   }
   $15 = 0;
   label$4 : {
    if ($24) {
     $10 = 0;
     $11 = 0;
     $12 = 0;
     break label$4;
    }
    $3 = ($6 << 2) + $2 | 0;
    $1 = (Math_imul($9, $14) << 2) + $23 | 0;
    $5 = 0;
    $12 = 0;
    $11 = 0;
    $10 = 0;
    while (1) {
     $0 = $5 << 2;
     $10 = $10 + +Math_fround(HEAPF32[$1 + $0 >> 2] * HEAPF32[$0 + $3 >> 2]);
     $8 = $0 | 12;
     $15 = $15 + +Math_fround(HEAPF32[$8 + $1 >> 2] * HEAPF32[$3 + $8 >> 2]);
     $8 = $0 | 8;
     $12 = $12 + +Math_fround(HEAPF32[$8 + $1 >> 2] * HEAPF32[$3 + $8 >> 2]);
     $0 = $0 | 4;
     $11 = $11 + +Math_fround(HEAPF32[$1 + $0 >> 2] * HEAPF32[$0 + $3 >> 2]);
     $5 = $5 + 4 | 0;
     if (($14 | 0) > ($5 | 0)) {
      continue;
     }
     break;
    }
   }
   HEAPF32[(Math_imul($7, $22) << 2) + $4 >> 2] = $10 + $11 + $12 + $15;
   $0 = $9 + $20 | 0;
   $9 = $0 - ($0 >>> 0 < $13 >>> 0 ? 0 : $13) | 0;
   $7 = $7 + 1 | 0;
   $6 = ($6 + $21 | 0) + ($0 >>> 0 >= $13 >>> 0) | 0;
   if (($18 | 0) > ($6 | 0)) {
    continue;
   }
   break;
  }
 }
 HEAP32[$17 >> 2] = $6;
 HEAP32[$16 >> 2] = $9;
 return $7 | 0;
}
function speex_resampler_init_frac($0, $1, $2, $3, $4, $5, $6) {
 var $7 = 0, $8 = 0;
 label$1 : {
  label$2 : {
   if (!(!$2 | (!$0 | !$1))) {
    if ($5 >>> 0 < 11) {
     break label$2;
    }
   }
   if (!$6) {
    break label$1;
   }
   HEAP32[$6 >> 2] = 3;
   return 0;
  }
  $7 = dlcalloc(96, 1);
  if (!$7) {
   $7 = 0;
   if (!$6) {
    break label$1;
   }
   HEAP32[$6 >> 2] = 1;
   return 0;
  }
  HEAP32[$7 >> 2] = 0;
  HEAP32[$7 + 4 >> 2] = 0;
  HEAP32[$7 + 44 >> 2] = 1065353216;
  HEAP32[$7 + 16 >> 2] = -1;
  HEAP32[$7 + 88 >> 2] = 1;
  HEAP32[$7 + 92 >> 2] = 1;
  HEAP32[$7 + 20 >> 2] = $0;
  HEAP32[$7 + 32 >> 2] = 160;
  HEAP32[$7 + 8 >> 2] = 0;
  HEAP32[$7 + 12 >> 2] = 0;
  $0 = $0 << 2;
  $8 = dlcalloc($0, 1);
  HEAP32[$7 + 60 >> 2] = $8;
  label$5 : {
   if (!$8) {
    break label$5;
   }
   $8 = dlcalloc($0, 1);
   HEAP32[$7 + 68 >> 2] = $8;
   if (!$8) {
    break label$5;
   }
   $0 = dlcalloc($0, 1);
   HEAP32[$7 + 64 >> 2] = $0;
   if (!$0) {
    break label$5;
   }
   HEAP32[$7 + 16 >> 2] = $5;
   speex_resampler_set_rate_frac($7, $1, $2, $3, $4);
   $0 = update_filter($7);
   label$6 : {
    if (!$0) {
     HEAP32[$7 + 52 >> 2] = 1;
     break label$6;
    }
    dlfree(HEAP32[$7 + 72 >> 2]);
    dlfree(HEAP32[$7 + 76 >> 2]);
    dlfree(HEAP32[$7 + 60 >> 2]);
    dlfree(HEAP32[$7 + 68 >> 2]);
    dlfree(HEAP32[$7 + 64 >> 2]);
    dlfree($7);
    $7 = 0;
   }
   if (!$6) {
    break label$1;
   }
   HEAP32[$6 >> 2] = $0;
   return $7;
  }
  if ($6) {
   HEAP32[$6 >> 2] = 1;
  }
  dlfree(HEAP32[$7 + 76 >> 2]);
  dlfree(HEAP32[$7 + 60 >> 2]);
  dlfree(HEAP32[$7 + 68 >> 2]);
  dlfree(HEAP32[$7 + 64 >> 2]);
  dlfree($7);
  $7 = 0;
 }
 return $7;
}
function speex_resampler_set_rate_frac($0, $1, $2, $3, $4) {
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 $6 = 3;
 label$1 : {
  if (!$1 | !$2) {
   break label$1;
  }
  if (!(HEAP32[$0 >> 2] != ($3 | 0) | HEAP32[$0 + 4 >> 2] != ($4 | 0) | HEAP32[$0 + 8 >> 2] != ($1 | 0))) {
   $6 = 0;
   if (HEAP32[$0 + 12 >> 2] == ($2 | 0)) {
    break label$1;
   }
  }
  HEAP32[$0 + 8 >> 2] = $1;
  HEAP32[$0 + 4 >> 2] = $4;
  HEAP32[$0 >> 2] = $3;
  $7 = HEAP32[$0 + 12 >> 2];
  HEAP32[$0 + 12 >> 2] = $2;
  $5 = $1;
  $3 = $2;
  while (1) {
   $4 = $3;
   $3 = ($5 >>> 0) % ($3 >>> 0) | 0;
   $5 = $4;
   if ($3) {
    continue;
   }
   break;
  }
  $3 = ($2 >>> 0) / ($4 >>> 0) | 0;
  HEAP32[$0 + 12 >> 2] = $3;
  HEAP32[$0 + 8 >> 2] = ($1 >>> 0) / ($4 >>> 0);
  label$4 : {
   if (!$7 | !HEAP32[$0 + 20 >> 2]) {
    break label$4;
   }
   $9 = HEAP32[$0 + 64 >> 2];
   $4 = 0;
   while (1) {
    $6 = 5;
    $2 = 4294967295 / ($3 >>> 0) | 0;
    $1 = ($4 << 2) + $9 | 0;
    $5 = HEAP32[$1 >> 2];
    $8 = $5;
    $5 = ($5 >>> 0) / ($7 >>> 0) | 0;
    $8 = $8 - Math_imul($7, $5) | 0;
    if ($2 >>> 0 < $8 >>> 0 | $2 >>> 0 < $5 >>> 0) {
     break label$1;
    }
    $5 = Math_imul($3, $5);
    $3 = (Math_imul($3, $8) >>> 0) / ($7 >>> 0) | 0;
    if ($5 >>> 0 > ($3 ^ -1) >>> 0) {
     break label$1;
    }
    $3 = $3 + $5 | 0;
    HEAP32[$1 >> 2] = $3;
    $5 = HEAP32[$0 + 12 >> 2];
    if ($5 >>> 0 <= $3 >>> 0) {
     HEAP32[$1 >> 2] = $5 - 1;
    }
    $4 = $4 + 1 | 0;
    if ($4 >>> 0 >= HEAPU32[$0 + 20 >> 2]) {
     break label$4;
    }
    $3 = HEAP32[$0 + 12 >> 2];
    continue;
   }
  }
  if (!HEAP32[$0 + 52 >> 2]) {
   return 0;
  }
  $6 = update_filter($0);
 }
 return $6;
}
function memset($0, $1, $2) {
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 label$1 : {
  if (!$2) {
   break label$1;
  }
  $3 = $0 + $2 | 0;
  HEAP8[$3 - 1 | 0] = $1;
  HEAP8[$0 | 0] = $1;
  if ($2 >>> 0 < 3) {
   break label$1;
  }
  HEAP8[$3 - 2 | 0] = $1;
  HEAP8[$0 + 1 | 0] = $1;
  HEAP8[$3 - 3 | 0] = $1;
  HEAP8[$0 + 2 | 0] = $1;
  if ($2 >>> 0 < 7) {
   break label$1;
  }
  HEAP8[$3 - 4 | 0] = $1;
  HEAP8[$0 + 3 | 0] = $1;
  if ($2 >>> 0 < 9) {
   break label$1;
  }
  $4 = 0 - $0 & 3;
  $3 = $4 + $0 | 0;
  $1 = Math_imul($1 & 255, 16843009);
  HEAP32[$3 >> 2] = $1;
  $4 = $2 - $4 & -4;
  $2 = $4 + $3 | 0;
  HEAP32[$2 - 4 >> 2] = $1;
  if ($4 >>> 0 < 9) {
   break label$1;
  }
  HEAP32[$3 + 8 >> 2] = $1;
  HEAP32[$3 + 4 >> 2] = $1;
  HEAP32[$2 - 8 >> 2] = $1;
  HEAP32[$2 - 12 >> 2] = $1;
  if ($4 >>> 0 < 25) {
   break label$1;
  }
  HEAP32[$3 + 24 >> 2] = $1;
  HEAP32[$3 + 20 >> 2] = $1;
  HEAP32[$3 + 16 >> 2] = $1;
  HEAP32[$3 + 12 >> 2] = $1;
  HEAP32[$2 - 16 >> 2] = $1;
  HEAP32[$2 - 20 >> 2] = $1;
  HEAP32[$2 - 24 >> 2] = $1;
  HEAP32[$2 - 28 >> 2] = $1;
  $6 = $3 & 4 | 24;
  $2 = $4 - $6 | 0;
  if ($2 >>> 0 < 32) {
   break label$1;
  }
  $5 = __wasm_i64_mul($1, 0, 1, 1);
  $4 = i64toi32_i32$HIGH_BITS;
  $7 = $4;
  $1 = $3 + $6 | 0;
  while (1) {
   HEAP32[$1 + 24 >> 2] = $5;
   $4 = $7;
   HEAP32[$1 + 28 >> 2] = $4;
   HEAP32[$1 + 16 >> 2] = $5;
   HEAP32[$1 + 20 >> 2] = $4;
   HEAP32[$1 + 8 >> 2] = $5;
   HEAP32[$1 + 12 >> 2] = $4;
   HEAP32[$1 >> 2] = $5;
   HEAP32[$1 + 4 >> 2] = $4;
   $1 = $1 + 32 | 0;
   $2 = $2 - 32 | 0;
   if ($2 >>> 0 > 31) {
    continue;
   }
   break;
  }
 }
 return $0;
}
function resampler_basic_direct_single($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = Math_fround(0), $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $20 = 0;
 $1 = $1 << 2;
 $11 = $1 + HEAP32[$0 + 64 >> 2] | 0;
 $8 = HEAP32[$11 >> 2];
 $12 = HEAP32[$0 + 60 >> 2] + $1 | 0;
 $6 = HEAP32[$12 >> 2];
 $13 = HEAP32[$3 >> 2];
 label$1 : {
  if (($6 | 0) >= ($13 | 0)) {
   break label$1;
  }
  $9 = HEAP32[$0 + 12 >> 2];
  $15 = HEAP32[$0 + 40 >> 2];
  $16 = HEAP32[$0 + 36 >> 2];
  $17 = HEAP32[$0 + 92 >> 2];
  $18 = HEAP32[$0 + 76 >> 2];
  $3 = HEAP32[$5 >> 2];
  $14 = ($3 | 0) > 0 ? $3 : 0;
  $1 = HEAP32[$0 + 24 >> 2];
  $19 = ($1 | 0) < 1;
  while (1) {
   if (($7 | 0) == ($14 | 0)) {
    $7 = $14;
    break label$1;
   }
   $10 = Math_fround(0);
   if (!$19) {
    $5 = ($6 << 2) + $2 | 0;
    $20 = (Math_imul($1, $8) << 2) + $18 | 0;
    $0 = 0;
    while (1) {
     $3 = $0 << 2;
     $10 = Math_fround($10 + Math_fround(HEAPF32[$20 + $3 >> 2] * HEAPF32[$3 + $5 >> 2]));
     $0 = $0 + 1 | 0;
     if (($1 | 0) != ($0 | 0)) {
      continue;
     }
     break;
    }
   }
   HEAPF32[(Math_imul($7, $17) << 2) + $4 >> 2] = $10;
   $0 = $8 + $15 | 0;
   $8 = $0 - ($0 >>> 0 < $9 >>> 0 ? 0 : $9) | 0;
   $7 = $7 + 1 | 0;
   $6 = ($6 + $16 | 0) + ($0 >>> 0 >= $9 >>> 0) | 0;
   if (($13 | 0) > ($6 | 0)) {
    continue;
   }
   break;
  }
 }
 HEAP32[$12 >> 2] = $6;
 HEAP32[$11 >> 2] = $8;
 return $7 | 0;
}
function sinc($0, $1, $2, $3) {
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = Math_fround(0), $9 = 0, $10 = Math_fround(0), $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0;
 $4 = +$1;
 $6 = Math_abs($4);
 if ($6 < 1e-6) {
  return $0;
 }
 $7 = +($2 | 0);
 if (!($7 * .5 < $6)) {
  $1 = Math_fround($0 * $1);
  $2 = HEAP32[$3 >> 2];
  $8 = Math_fround(Math_fround(Math_abs(Math_fround(($4 + $4) / $7))) * Math_fround(HEAP32[$3 + 4 >> 2]));
  $10 = Math_fround(Math_floor($8));
  label$3 : {
   if (Math_fround(Math_abs($10)) < Math_fround(2147483648)) {
    $3 = ~~$10;
    break label$3;
   }
   $3 = -2147483648;
  }
  $2 = $2 + ($3 << 3) | 0;
  $6 = HEAPF64[$2 + 8 >> 3];
  $7 = HEAPF64[$2 >> 3];
  $13 = HEAPF64[$2 + 16 >> 3];
  $9 = HEAPF64[$2 + 24 >> 3];
  $4 = +$1 * 3.141592653589793;
  $14 = sin($4) * +$0 / $4;
  $1 = Math_fround($8 - Math_fround($3 | 0));
  $0 = Math_fround($1 * $1);
  $5 = +Math_fround($1 * $0);
  $11 = $5 * .1666666667;
  $4 = +$1;
  $12 = $11 - $4 * .1666666667;
  $15 = $9 * $12;
  $9 = +$0 * .5;
  $5 = $9 + $4 - $5 * .5;
  $4 = $9 + $4 * -.3333333333 - $11;
  $8 = Math_fround($14 * ($15 + ($13 * $5 + ($7 * $4 + $6 * (1 - $12 - $5 - $4)))));
 }
 return $8;
}
function resampler_basic_zero($0, $1, $2, $3, $4, $5) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 $5 = $5 | 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0;
 $2 = $1 << 2;
 $7 = $2 + HEAP32[$0 + 64 >> 2] | 0;
 $6 = HEAP32[$7 >> 2];
 $1 = 0;
 $8 = HEAP32[$0 + 60 >> 2] + $2 | 0;
 $2 = HEAP32[$8 >> 2];
 $9 = HEAP32[$3 >> 2];
 label$1 : {
  if (($2 | 0) >= ($9 | 0)) {
   break label$1;
  }
  $3 = HEAP32[$0 + 12 >> 2];
  $10 = HEAP32[$0 + 40 >> 2];
  $11 = HEAP32[$0 + 36 >> 2];
  $12 = HEAP32[$0 + 92 >> 2];
  $1 = HEAP32[$5 >> 2];
  $5 = ($1 | 0) > 0 ? $1 : 0;
  $1 = 0;
  while (1) {
   if (($1 | 0) == ($5 | 0)) {
    $1 = $5;
    break label$1;
   }
   HEAP32[(Math_imul($1, $12) << 2) + $4 >> 2] = 0;
   $0 = $6 + $10 | 0;
   $6 = $0 - ($0 >>> 0 < $3 >>> 0 ? 0 : $3) | 0;
   $1 = $1 + 1 | 0;
   $2 = ($2 + $11 | 0) + ($0 >>> 0 >= $3 >>> 0) | 0;
   if (($9 | 0) > ($2 | 0)) {
    continue;
   }
   break;
  }
 }
 HEAP32[$8 >> 2] = $2;
 HEAP32[$7 >> 2] = $6;
 return $1 | 0;
}
function sin($0) {
 var $1 = 0, $2 = 0;
 $1 = __stack_pointer - 16 | 0;
 __stack_pointer = $1;
 wasm2js_scratch_store_f64(+$0);
 $2 = wasm2js_scratch_load_i32(1) | 0;
 wasm2js_scratch_load_i32(0) | 0;
 $2 = $2 & 2147483647;
 label$1 : {
  if ($2 >>> 0 <= 1072243195) {
   if ($2 >>> 0 < 1045430272) {
    break label$1;
   }
   $0 = __sin($0, 0, 0);
   break label$1;
  }
  if ($2 >>> 0 >= 2146435072) {
   $0 = $0 - $0;
   break label$1;
  }
  label$4 : {
   switch (__rem_pio2($0, $1) & 3) {
   case 0:
    $0 = __sin(HEAPF64[$1 >> 3], HEAPF64[$1 + 8 >> 3], 1);
    break label$1;
   case 1:
    $0 = __cos(HEAPF64[$1 >> 3], HEAPF64[$1 + 8 >> 3]);
    break label$1;
   case 2:
    $0 = -__sin(HEAPF64[$1 >> 3], HEAPF64[$1 + 8 >> 3], 1);
    break label$1;
   default:
    break label$4;
   }
  }
  $0 = -__cos(HEAPF64[$1 >> 3], HEAPF64[$1 + 8 >> 3]);
 }
 __stack_pointer = $1 + 16 | 0;
 return $0;
}
function speex_resampler_process_interleaved_float($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0;
 $7 = HEAP32[$0 + 92 >> 2];
 $8 = HEAP32[$2 >> 2];
 $9 = HEAP32[$4 >> 2];
 $5 = HEAP32[$0 + 20 >> 2];
 HEAP32[$0 + 92 >> 2] = $5;
 $10 = HEAP32[$0 + 88 >> 2];
 HEAP32[$0 + 88 >> 2] = $5;
 if ($5) {
  $5 = 0;
  while (1) {
   HEAP32[$4 >> 2] = $9;
   HEAP32[$2 >> 2] = $8;
   label$3 : {
    if ($1) {
     $6 = $5 << 2;
     speex_resampler_process_float($0, $5, $6 + $1 | 0, $2, $3 + $6 | 0, $4);
     break label$3;
    }
    speex_resampler_process_float($0, $5, 0, $2, ($5 << 2) + $3 | 0, $4);
   }
   $5 = $5 + 1 | 0;
   if ($5 >>> 0 < HEAPU32[$0 + 20 >> 2]) {
    continue;
   }
   break;
  }
 }
 HEAP32[$0 + 92 >> 2] = $7;
 HEAP32[$0 + 88 >> 2] = $10;
 return HEAP32[$0 + 84 >> 2] == 5 | 0;
}
function scalbn($0, $1) {
 label$1 : {
  if (($1 | 0) >= 1024) {
   $0 = $0 * 8.98846567431158e+307;
   if (($1 | 0) < 2047) {
    $1 = $1 - 1023 | 0;
    break label$1;
   }
   $0 = $0 * 8.98846567431158e+307;
   $1 = (($1 | 0) < 3069 ? $1 : 3069) - 2046 | 0;
   break label$1;
  }
  if (($1 | 0) > -1023) {
   break label$1;
  }
  $0 = $0 * 2.2250738585072014e-308;
  if (($1 | 0) > -2045) {
   $1 = $1 + 1022 | 0;
   break label$1;
  }
  $0 = $0 * 2.2250738585072014e-308;
  $1 = (($1 | 0) > -3066 ? $1 : -3066) + 2044 | 0;
 }
 $1 = $1 + 1023 << 20;
 wasm2js_scratch_store_i32(0, 0);
 wasm2js_scratch_store_i32(1, $1 | 0);
 return $0 * +wasm2js_scratch_load_f64();
}
function _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE($0, $1, $2, $3) {
 var $4 = 0, $5 = 0;
 $4 = $2 >>> 16 | 0;
 $5 = $0 >>> 16 | 0;
 $3 = (Math_imul($4, $5) + Math_imul($1, $2) | 0) + Math_imul($3, $0) | 0;
 $2 = $2 & 65535;
 $0 = $0 & 65535;
 $1 = Math_imul($2, $0);
 $2 = ($1 >>> 16 | 0) + Math_imul($2, $5) | 0;
 $3 = $3 + ($2 >>> 16 | 0) | 0;
 $2 = Math_imul($0, $4) + ($2 & 65535) | 0;
 i64toi32_i32$HIGH_BITS = $3 + ($2 >>> 16 | 0) | 0;
 return $1 & 65535 | $2 << 16;
}
function dlrealloc($0, $1) {
 var $2 = 0, $3 = 0;
 if (!$0) {
  return dlmalloc($1);
 }
 if ($1 >>> 0 >= 4294967232) {
  HEAP32[__errno_location() >> 2] = 48;
  return 0;
 }
 $2 = try_realloc_chunk($0 - 8 | 0, $1 >>> 0 < 11 ? 16 : $1 + 11 & -8);
 if ($2) {
  return $2 + 8 | 0;
 }
 $2 = dlmalloc($1);
 if (!$2) {
  return 0;
 }
 $3 = HEAP32[$0 - 4 >> 2];
 $3 = ($3 & 3 ? -4 : -8) + ($3 & -8) | 0;
 memcpy($2, $0, $1 >>> 0 > $3 >>> 0 ? $3 : $1);
 dlfree($0);
 return $2;
}
function sbrk($0) {
 var $1 = 0, $2 = 0;
 $1 = HEAP32[1384];
 $2 = $0 + 3 & -4;
 $0 = $1 + $2 | 0;
 label$1 : {
  if ($0 >>> 0 <= $1 >>> 0 ? ($2 | 0) >= 1 : 0) {
   break label$1;
  }
  if (__wasm_memory_size() << 16 >>> 0 < $0 >>> 0) {
   if (!(emscripten_resize_heap($0 | 0) | 0)) {
    break label$1;
   }
  }
  HEAP32[1384] = $0;
  return $1;
 }
 HEAP32[__errno_location() >> 2] = 48;
 return -1;
}
function __sin($0, $1, $2) {
 var $3 = 0, $4 = 0, $5 = 0;
 $3 = $0 * $0;
 $5 = $3 * ($3 * $3) * ($3 * 1.58969099521155e-10 + -2.5050760253406863e-8) + ($3 * ($3 * 27557313707070068e-22 + -.0001984126982985795) + .00833333333332249);
 $4 = $3 * $0;
 if (!$2) {
  return $4 * ($3 * $5 + -.16666666666666632) + $0;
 }
 return $0 - ($3 * ($1 * .5 - $4 * $5) - $1 + $4 * .16666666666666632);
}
function dlcalloc($0, $1) {
 var $2 = 0, $3 = 0, $4 = 0;
 $2 = 0;
 label$2 : {
  if (!$0) {
   break label$2;
  }
  $3 = __wasm_i64_mul($0, 0, $1, 0);
  $4 = i64toi32_i32$HIGH_BITS;
  $2 = $3;
  if (($0 | $1) >>> 0 < 65536) {
   break label$2;
  }
  $2 = $4 ? -1 : $3;
 }
 $3 = $2;
 $0 = dlmalloc($3);
 if (!(!$0 | !(HEAPU8[$0 - 4 | 0] & 3))) {
  memset($0, 0, $3);
 }
 return $0;
}
function __cos($0, $1) {
 var $2 = 0, $3 = 0, $4 = 0, $5 = 0;
 $2 = $0 * $0;
 $3 = $2 * .5;
 $4 = 1 - $3;
 $5 = 1 - $4 - $3;
 $3 = $2 * $2;
 return $4 + ($5 + ($2 * ($2 * ($2 * ($2 * 2480158728947673e-20 + -.001388888888887411) + .0416666666666666) + $3 * $3 * ($2 * ($2 * -1.1359647557788195e-11 + 2.087572321298175e-9) + -2.7557314351390663e-7)) - $0 * $1));
}
function speex_resampler_destroy($0) {
 $0 = $0 | 0;
 dlfree(HEAP32[$0 + 72 >> 2]);
 dlfree(HEAP32[$0 + 76 >> 2]);
 dlfree(HEAP32[$0 + 60 >> 2]);
 dlfree(HEAP32[$0 + 68 >> 2]);
 dlfree(HEAP32[$0 + 64 >> 2]);
 dlfree($0);
}
function speex_resampler_init($0, $1, $2, $3, $4) {
 $0 = $0 | 0;
 $1 = $1 | 0;
 $2 = $2 | 0;
 $3 = $3 | 0;
 $4 = $4 | 0;
 return speex_resampler_init_frac($0, $1, $2, $1, $2, $3, $4) | 0;
}
function __wasm_rotl_i32($0, $1) {
 var $2 = 0;
 $2 = $1 & 31;
 $1 = 0 - $1 & 31;
 return (-1 >>> $2 & $0) << $2 | (-1 << $1 & $0) >>> $1;
}



function __wasm_i64_mul($0, $1, $2, $3) {
 $3 = _ZN17compiler_builtins3int3mul3Mul3mul17h070e9a1c69faec5bE($0, $1, $2, $3);
 return $3;
}
function stackAlloc($0) {
 $0 = $0 | 0;
 $0 = __stack_pointer - $0 & -16;
 __stack_pointer = $0;
 return $0 | 0;
}
function stackRestore($0) {
 $0 = $0 | 0;
 __stack_pointer = $0;
}
function stackSave() {
 return __stack_pointer | 0;
}
function floor($0) {
 return Math_floor($0);
}
function __errno_location() {
 return 5540;
}
function __wasm_call_ctors() {}

// EMSCRIPTEN_END_FUNCS

;
 bufferView = HEAPU8;
 initActiveSegments(env);
 var FUNCTION_TABLE = Table([null, resampler_basic_direct_double, resampler_basic_direct_single, resampler_basic_interpolate_double, resampler_basic_interpolate_single, resampler_basic_zero]);
 function __wasm_memory_size() {
  return buffer.byteLength / 65536 | 0;
}
 
 return {
  "__wasm_call_ctors": __wasm_call_ctors, 
  "speex_resampler_init": speex_resampler_init, 
  "speex_resampler_destroy": speex_resampler_destroy, 
  "speex_resampler_process_interleaved_float": speex_resampler_process_interleaved_float, 
  "__errno_location": __errno_location, 
  "stackSave": stackSave, 
  "stackRestore": stackRestore, 
  "stackAlloc": stackAlloc, 
  "malloc": dlmalloc, 
  "free": dlfree, 
  "__indirect_function_table": FUNCTION_TABLE
};
}

  return asmFunc(asmLibraryArg);
}
// EMSCRIPTEN_END_ASM




)(asmLibraryArg);
  },

  instantiate: /** @suppress{checkTypes} */ function(binary, info) {
    return {
      then: function(ok) {
        var module = new WebAssembly.Module(binary);
        ok({
          'instance': new WebAssembly.Instance(module)
        });
      }
    };
  },

  RuntimeError: Error
};

// We don't need to actually download a wasm binary, mark it as present but empty.
wasmBinary = [];

// end include: wasm2js.js
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);

  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((Uint8Array|Array<number>), number)} */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (slab.subarray || slab.slice) {
    HEAPU8.set(/** @type {!Uint8Array} */(slab), ret);
  } else {
    HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
}

// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 5242880;

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216;

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js


// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536
      ,
      'maximum': INITIAL_MEMORY / 65536
    });
  }

if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['INITIAL_MEMORY'].
INITIAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);

// end include: runtime_init_memory.js

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// end include: runtime_stack_check.js
// include: runtime_assertions.js


// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;

__ATINIT__.push({ func: function() { ___wasm_call_ctors() } });

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;
  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  runtimeExited = true;
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what += '';
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what = 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  var e = new WebAssembly.RuntimeError(what);

  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


function hasPrefix(str, prefix) {
  return String.prototype.startsWith ?
      str.startsWith(prefix) :
      str.indexOf(prefix) === 0;
}

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return hasPrefix(filename, dataURIPrefix);
}

var fileURIPrefix = "file://";

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return hasPrefix(filename, fileURIPrefix);
}

// end include: URIUtils.js
var wasmBinaryFile = '<<< WASM_BINARY_FILE >>>';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }
    
  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

function instantiateSync(file, info) {
  var instance;
  var module;
  var binary;
  try {
    binary = getBinary(file);
    module = new WebAssembly.Module(binary);
    instance = new WebAssembly.Instance(module, info);
  } catch (e) {
    var str = e.toString();
    err('failed to compile wasm module: ' + str);
    if (str.indexOf('imported Memory') >= 0 ||
        str.indexOf('memory import') >= 0) {
      err('Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time).');
    }
    throw e;
  }
  return [instance, module];
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmTable = Module['asm']['__indirect_function_table'];

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  // Prefer streaming instantiation if available.

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  var result = instantiateSync(wasmBinaryFile, info);
  receiveInstance(result[0], result[1]);
  return Module['asm']; // exports were assigned here
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};






  function callRuntimeCallbacks(callbacks) {
      while(callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func === 'number') {
          if (callback.arg === undefined) {
            wasmTable.get(func)();
          } else {
            wasmTable.get(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function _emscripten_get_heap_size() {
      return HEAPU8.length;
    }
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('OOM');
    }
  function _emscripten_resize_heap(requestedSize) {
      abortOnCannotGrowMemory(requestedSize);
    }
var ASSERTIONS = false;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      // TODO: Update Node.js externs, Closure does not recognize the following Buffer.from()
      /**@suppress{checkTypes}*/
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "getTempRet0": getTempRet0,
  "memory": wasmMemory,
  "setTempRet0": setTempRet0
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = asm["__wasm_call_ctors"]

/** @type {function(...*):?} */
var _speex_resampler_init = Module["_speex_resampler_init"] = asm["speex_resampler_init"]

/** @type {function(...*):?} */
var _speex_resampler_destroy = Module["_speex_resampler_destroy"] = asm["speex_resampler_destroy"]

/** @type {function(...*):?} */
var _speex_resampler_process_interleaved_float = Module["_speex_resampler_process_interleaved_float"] = asm["speex_resampler_process_interleaved_float"]

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = asm["__errno_location"]

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = asm["stackSave"]

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = asm["stackRestore"]

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"]

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = asm["malloc"]

/** @type {function(...*):?} */
var _free = Module["_free"] = asm["free"]





// === Auto-generated postamble setup entry stuff ===



var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && noExitRuntime && status === 0) {
    return;
  }

  if (noExitRuntime) {
  } else {

    EXITSTATUS = status;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);

    ABORT = true;
  }

  quit_(status, new ExitStatus(status));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();






return Module;
}, 'SpeexResampler'));//END: UMD wrapper

