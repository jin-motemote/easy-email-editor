var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { useFormState, useForm, useField, Form } from "react-final-form";
import React, { useState, useCallback, useMemo, useRef, useEffect, useContext, Children, isValidElement, memo } from "react";
import { getPageIdx, getNodeIdxClassName, BasicType, AdvancedType, getNodeTypeFromClassName, JsonToMjml, I18nManager, t as t$1, createBlockDataByType, BlockManager, getIndexByIdx, getParentByIdx, getParentIdx, getValueByIdx, getChildIdx, getNodeIdxFromClassName, MERGE_TAG_CLASS_NAME, getSameParent } from "easy-email-core";
import ReactDOM, { createPortal } from "react-dom";
import mjml from "mjml-browser";
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function moveFieldState(state, source, destKey, oldState) {
  if (oldState === void 0) {
    oldState = state;
  }
  delete state.fields[source.name];
  state.fields[destKey] = _extends({}, source, {
    name: destKey,
    change: oldState.fields[destKey] && oldState.fields[destKey].change,
    blur: oldState.fields[destKey] && oldState.fields[destKey].blur,
    focus: oldState.fields[destKey] && oldState.fields[destKey].focus,
    lastFieldState: void 0
  });
  if (!state.fields[destKey].change) {
    delete state.fields[destKey].change;
  }
  if (!state.fields[destKey].blur) {
    delete state.fields[destKey].blur;
  }
  if (!state.fields[destKey].focus) {
    delete state.fields[destKey].focus;
  }
}
var escapeRegexTokens = function escapeRegexTokens2(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
var insert = function insert2(_ref, state, _ref2) {
  var name = _ref[0], index2 = _ref[1], value = _ref[2];
  var changeValue = _ref2.changeValue;
  _ref2.resetFieldState;
  changeValue(state, name, function(array) {
    var copy = [].concat(array || []);
    copy.splice(index2, 0, value);
    return copy;
  });
  var backup = _extends({}, state.fields);
  var pattern = new RegExp("^" + escapeRegexTokens(name) + "\\[(\\d+)\\](.*)");
  Object.keys(state.fields).sort().reverse().forEach(function(key) {
    var tokens = pattern.exec(key);
    if (tokens) {
      var fieldIndex = Number(tokens[1]);
      if (fieldIndex >= index2) {
        var incrementedKey = name + "[" + (fieldIndex + 1) + "]" + tokens[2];
        moveFieldState(state, backup[key], incrementedKey);
      }
    }
  });
};
var concat = function concat2(_ref, state, _ref2) {
  var name = _ref[0], value = _ref[1];
  var changeValue = _ref2.changeValue;
  changeValue(state, name, function(array) {
    return array ? [].concat(array, value) : value;
  });
};
function moveFields(name, matchPrefix, destIndex, state) {
  Object.keys(state.fields).forEach(function(key) {
    if (key.substring(0, matchPrefix.length) === matchPrefix) {
      var suffix = key.substring(matchPrefix.length);
      var destKey = name + "[" + destIndex + "]" + suffix;
      moveFieldState(state, state.fields[key], destKey);
    }
  });
}
function restoreFunctions(state, backupState) {
  Object.keys(state.fields).forEach(function(key) {
    state.fields[key] = _extends({}, state.fields[key], {
      change: state.fields[key].change || backupState.fields[key] && backupState.fields[key].change,
      blur: state.fields[key].blur || backupState.fields[key] && backupState.fields[key].blur,
      focus: state.fields[key].focus || backupState.fields[key] && backupState.fields[key].focus
    });
    if (!state.fields[key].change) {
      delete state.fields[key].change;
    }
    if (!state.fields[key].blur) {
      delete state.fields[key].blur;
    }
    if (!state.fields[key].focus) {
      delete state.fields[key].focus;
    }
  });
}
var TMP = "tmp";
var move = function move2(_ref, state, _ref2) {
  var name = _ref[0], from = _ref[1], to = _ref[2];
  var changeValue = _ref2.changeValue;
  if (from === to) {
    return;
  }
  changeValue(state, name, function(array) {
    var copy = [].concat(array || []);
    var value = copy[from];
    copy.splice(from, 1);
    copy.splice(to, 0, value);
    return copy;
  });
  var backupState = _extends({}, state, {
    fields: _extends({}, state.fields)
  });
  var fromPrefix = name + "[" + from + "]";
  moveFields(name, fromPrefix, TMP, state);
  if (from < to) {
    for (var i = from + 1; i <= to; i++) {
      var innerFromPrefix = name + "[" + i + "]";
      moveFields(name, innerFromPrefix, "" + (i - 1), state);
    }
  } else {
    for (var _i = from - 1; _i >= to; _i--) {
      var _innerFromPrefix = name + "[" + _i + "]";
      moveFields(name, _innerFromPrefix, "" + (_i + 1), state);
    }
  }
  var tmpPrefix = name + "[" + TMP + "]";
  moveFields(name, tmpPrefix, to, state);
  restoreFunctions(state, backupState);
};
var pop = function pop2(_ref, state, _ref2) {
  var name = _ref[0];
  var changeValue = _ref2.changeValue;
  var result;
  var removedIndex;
  changeValue(state, name, function(array) {
    if (array) {
      if (!array.length) {
        return [];
      }
      removedIndex = array.length - 1;
      result = array[removedIndex];
      return array.slice(0, removedIndex);
    }
  });
  if (removedIndex !== void 0) {
    var pattern = new RegExp("^" + escapeRegexTokens(name) + "\\[" + removedIndex + "].*");
    Object.keys(state.fields).forEach(function(key) {
      if (pattern.test(key)) {
        delete state.fields[key];
      }
    });
  }
  return result;
};
var push = function push2(_ref, state, _ref2) {
  var name = _ref[0], value = _ref[1];
  var changeValue = _ref2.changeValue;
  changeValue(state, name, function(array) {
    return array ? [].concat(array, [value]) : [value];
  });
};
var remove = function remove2(_ref, state, _ref2) {
  var name = _ref[0], index2 = _ref[1];
  var changeValue = _ref2.changeValue, renameField = _ref2.renameField;
  var returnValue;
  changeValue(state, name, function(array) {
    var copy = [].concat(array || []);
    returnValue = copy[index2];
    copy.splice(index2, 1);
    return copy;
  });
  var pattern = new RegExp("^" + escapeRegexTokens(name) + "\\[(\\d+)\\](.*)");
  var backup = _extends({}, state, {
    fields: _extends({}, state.fields)
  });
  Object.keys(state.fields).forEach(function(key) {
    var tokens = pattern.exec(key);
    if (tokens) {
      var fieldIndex = Number(tokens[1]);
      if (fieldIndex === index2) {
        delete state.fields[key];
      } else if (fieldIndex > index2) {
        delete state.fields[key];
        var decrementedKey = name + "[" + (fieldIndex - 1) + "]" + tokens[2];
        if (backup.fields[decrementedKey]) {
          moveFieldState(state, backup.fields[key], decrementedKey, backup);
        } else {
          renameField(state, key, decrementedKey);
        }
      }
    }
  });
  return returnValue;
};
var countBelow = function countBelow2(array, value) {
  return array.reduce(function(count2, item) {
    return item < value ? count2 + 1 : count2;
  }, 0);
};
var removeBatch = function removeBatch2(_ref, state, _ref2) {
  var name = _ref[0], indexes = _ref[1];
  var changeValue = _ref2.changeValue;
  var sortedIndexes = [].concat(indexes);
  sortedIndexes.sort();
  for (var i = 0; i < sortedIndexes.length; i++) {
    if (i > 0 && sortedIndexes[i] === sortedIndexes[i - 1]) {
      sortedIndexes.splice(i--, 1);
    }
  }
  var returnValue = [];
  changeValue(state, name, function(array) {
    returnValue = indexes.map(function(index2) {
      return array && array[index2];
    });
    if (!array || !sortedIndexes.length) {
      return array;
    }
    var copy = [].concat(array);
    var removed = [];
    sortedIndexes.forEach(function(index2) {
      copy.splice(index2 - removed.length, 1);
      removed.push(array && array[index2]);
    });
    return copy;
  });
  var pattern = new RegExp("^" + escapeRegexTokens(name) + "\\[(\\d+)\\](.*)");
  var newState = _extends({}, state, {
    fields: {}
  });
  Object.keys(state.fields).forEach(function(key) {
    var tokens = pattern.exec(key);
    if (tokens) {
      var fieldIndex = Number(tokens[1]);
      if (!~sortedIndexes.indexOf(fieldIndex)) {
        var decrementedKey = name + "[" + (fieldIndex - countBelow(sortedIndexes, fieldIndex)) + "]" + tokens[2];
        moveFieldState(newState, state.fields[key], decrementedKey, state);
      }
    } else {
      newState.fields[key] = state.fields[key];
    }
  });
  state.fields = newState.fields;
  return returnValue;
};
var shift = function shift2(_ref, state, tools) {
  var name = _ref[0];
  return remove([name, 0], state, tools);
};
var TMP$1 = "tmp";
var swap = function swap2(_ref, state, _ref2) {
  var name = _ref[0], indexA = _ref[1], indexB = _ref[2];
  var changeValue = _ref2.changeValue;
  if (indexA === indexB) {
    return;
  }
  changeValue(state, name, function(array) {
    var copy = [].concat(array || []);
    var a = copy[indexA];
    copy[indexA] = copy[indexB];
    copy[indexB] = a;
    return copy;
  });
  var backupState = _extends({}, state, {
    fields: _extends({}, state.fields)
  });
  var aPrefix = name + "[" + indexA + "]";
  var bPrefix = name + "[" + indexB + "]";
  var tmpPrefix = name + "[" + TMP$1 + "]";
  moveFields(name, aPrefix, TMP$1, state);
  moveFields(name, bPrefix, indexA, state);
  moveFields(name, tmpPrefix, indexB, state);
  restoreFunctions(state, backupState);
};
var unshift = function unshift2(_ref, state, tools) {
  var name = _ref[0], value = _ref[1];
  return insert([name, 0, value], state, tools);
};
var update = function update2(_ref, state, _ref2) {
  var name = _ref[0], index2 = _ref[1], value = _ref[2];
  var changeValue = _ref2.changeValue;
  changeValue(state, name, function(array) {
    var copy = [].concat(array || []);
    copy.splice(index2, 1, value);
    return copy;
  });
};
var mutators = {
  insert,
  concat,
  move,
  pop,
  push,
  remove,
  removeBatch,
  shift,
  swap,
  unshift,
  update
};
class EventManager {
  static on(type, handler) {
    const event = this.events[type];
    if (!event) {
      this.events[type] = [handler];
    } else {
      event.push(handler);
    }
  }
  static off(type, handler) {
    this.events[type] = this.events[type].filter((h) => h !== handler);
  }
  static exec(type, ...args) {
    const event = this.events[type];
    if (!event) {
      return true;
    }
    let next = true;
    event.forEach((handler) => {
      if (handler(...args) === false) {
        next = false;
      }
    });
    return next;
  }
}
__publicField(EventManager, "events", {});
var EventType;
(function(EventType2) {
  EventType2["FOCUS_IDX_CHANGE"] = "focusIdxChange";
  EventType2["ADD_BLOCK"] = "addBlock";
  EventType2["REMOVE_BLOCK"] = "removeBlock";
  EventType2["ACTIVE_TAB_CHANGE"] = "activeTabChange";
})(EventType || (EventType = {}));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var lodash = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
(function(module, exports) {
  (function() {
    var undefined$1;
    var VERSION = "4.17.21";
    var LARGE_ARRAY_SIZE = 200;
    var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var MAX_MEMOIZE_SIZE = 500;
    var PLACEHOLDER = "__lodash_placeholder__";
    var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
    var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
    var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
    var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
    var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
    var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
    var wrapFlags = [
      ["ary", WRAP_ARY_FLAG],
      ["bind", WRAP_BIND_FLAG],
      ["bindKey", WRAP_BIND_KEY_FLAG],
      ["curry", WRAP_CURRY_FLAG],
      ["curryRight", WRAP_CURRY_RIGHT_FLAG],
      ["flip", WRAP_FLIP_FLAG],
      ["partial", WRAP_PARTIAL_FLAG],
      ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
      ["rearg", WRAP_REARG_FLAG]
    ];
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
    var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
    var reTrimStart = /^\s+/;
    var reWhitespace = /\s/;
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
    var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
    var reEscapeChar = /\\(\\)?/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
    var reNoMatch = /($^)/;
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
    var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
    var rsApos = "['\u2019]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
    var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
    var reApos = RegExp(rsApos, "g");
    var reComboMark = RegExp(rsCombo, "g");
    var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
    var reUnicodeWord = RegExp([
      rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
      rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
      rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
      rsUpper + "+" + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join("|"), "g");
    var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
    var contextProps = [
      "Array",
      "Buffer",
      "DataView",
      "Date",
      "Error",
      "Float32Array",
      "Float64Array",
      "Function",
      "Int8Array",
      "Int16Array",
      "Int32Array",
      "Map",
      "Math",
      "Object",
      "Promise",
      "RegExp",
      "Set",
      "String",
      "Symbol",
      "TypeError",
      "Uint8Array",
      "Uint8ClampedArray",
      "Uint16Array",
      "Uint32Array",
      "WeakMap",
      "_",
      "clearTimeout",
      "isFinite",
      "parseInt",
      "setTimeout"
    ];
    var templateCounter = -1;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    var deburredLetters = {
      "\xC0": "A",
      "\xC1": "A",
      "\xC2": "A",
      "\xC3": "A",
      "\xC4": "A",
      "\xC5": "A",
      "\xE0": "a",
      "\xE1": "a",
      "\xE2": "a",
      "\xE3": "a",
      "\xE4": "a",
      "\xE5": "a",
      "\xC7": "C",
      "\xE7": "c",
      "\xD0": "D",
      "\xF0": "d",
      "\xC8": "E",
      "\xC9": "E",
      "\xCA": "E",
      "\xCB": "E",
      "\xE8": "e",
      "\xE9": "e",
      "\xEA": "e",
      "\xEB": "e",
      "\xCC": "I",
      "\xCD": "I",
      "\xCE": "I",
      "\xCF": "I",
      "\xEC": "i",
      "\xED": "i",
      "\xEE": "i",
      "\xEF": "i",
      "\xD1": "N",
      "\xF1": "n",
      "\xD2": "O",
      "\xD3": "O",
      "\xD4": "O",
      "\xD5": "O",
      "\xD6": "O",
      "\xD8": "O",
      "\xF2": "o",
      "\xF3": "o",
      "\xF4": "o",
      "\xF5": "o",
      "\xF6": "o",
      "\xF8": "o",
      "\xD9": "U",
      "\xDA": "U",
      "\xDB": "U",
      "\xDC": "U",
      "\xF9": "u",
      "\xFA": "u",
      "\xFB": "u",
      "\xFC": "u",
      "\xDD": "Y",
      "\xFD": "y",
      "\xFF": "y",
      "\xC6": "Ae",
      "\xE6": "ae",
      "\xDE": "Th",
      "\xFE": "th",
      "\xDF": "ss",
      "\u0100": "A",
      "\u0102": "A",
      "\u0104": "A",
      "\u0101": "a",
      "\u0103": "a",
      "\u0105": "a",
      "\u0106": "C",
      "\u0108": "C",
      "\u010A": "C",
      "\u010C": "C",
      "\u0107": "c",
      "\u0109": "c",
      "\u010B": "c",
      "\u010D": "c",
      "\u010E": "D",
      "\u0110": "D",
      "\u010F": "d",
      "\u0111": "d",
      "\u0112": "E",
      "\u0114": "E",
      "\u0116": "E",
      "\u0118": "E",
      "\u011A": "E",
      "\u0113": "e",
      "\u0115": "e",
      "\u0117": "e",
      "\u0119": "e",
      "\u011B": "e",
      "\u011C": "G",
      "\u011E": "G",
      "\u0120": "G",
      "\u0122": "G",
      "\u011D": "g",
      "\u011F": "g",
      "\u0121": "g",
      "\u0123": "g",
      "\u0124": "H",
      "\u0126": "H",
      "\u0125": "h",
      "\u0127": "h",
      "\u0128": "I",
      "\u012A": "I",
      "\u012C": "I",
      "\u012E": "I",
      "\u0130": "I",
      "\u0129": "i",
      "\u012B": "i",
      "\u012D": "i",
      "\u012F": "i",
      "\u0131": "i",
      "\u0134": "J",
      "\u0135": "j",
      "\u0136": "K",
      "\u0137": "k",
      "\u0138": "k",
      "\u0139": "L",
      "\u013B": "L",
      "\u013D": "L",
      "\u013F": "L",
      "\u0141": "L",
      "\u013A": "l",
      "\u013C": "l",
      "\u013E": "l",
      "\u0140": "l",
      "\u0142": "l",
      "\u0143": "N",
      "\u0145": "N",
      "\u0147": "N",
      "\u014A": "N",
      "\u0144": "n",
      "\u0146": "n",
      "\u0148": "n",
      "\u014B": "n",
      "\u014C": "O",
      "\u014E": "O",
      "\u0150": "O",
      "\u014D": "o",
      "\u014F": "o",
      "\u0151": "o",
      "\u0154": "R",
      "\u0156": "R",
      "\u0158": "R",
      "\u0155": "r",
      "\u0157": "r",
      "\u0159": "r",
      "\u015A": "S",
      "\u015C": "S",
      "\u015E": "S",
      "\u0160": "S",
      "\u015B": "s",
      "\u015D": "s",
      "\u015F": "s",
      "\u0161": "s",
      "\u0162": "T",
      "\u0164": "T",
      "\u0166": "T",
      "\u0163": "t",
      "\u0165": "t",
      "\u0167": "t",
      "\u0168": "U",
      "\u016A": "U",
      "\u016C": "U",
      "\u016E": "U",
      "\u0170": "U",
      "\u0172": "U",
      "\u0169": "u",
      "\u016B": "u",
      "\u016D": "u",
      "\u016F": "u",
      "\u0171": "u",
      "\u0173": "u",
      "\u0174": "W",
      "\u0175": "w",
      "\u0176": "Y",
      "\u0177": "y",
      "\u0178": "Y",
      "\u0179": "Z",
      "\u017B": "Z",
      "\u017D": "Z",
      "\u017A": "z",
      "\u017C": "z",
      "\u017E": "z",
      "\u0132": "IJ",
      "\u0133": "ij",
      "\u0152": "Oe",
      "\u0153": "oe",
      "\u0149": "'n",
      "\u017F": "s"
    };
    var htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    var htmlUnescapes = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'"
    };
    var stringEscapes = {
      "\\": "\\",
      "'": "'",
      "\n": "n",
      "\r": "r",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var freeParseFloat = parseFloat, freeParseInt = parseInt;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        var value = array[index2];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }
    function arrayEach(array, iteratee) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (iteratee(array[index2], index2, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEachRight(array, iteratee) {
      var length = array == null ? 0 : array.length;
      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }
    function arrayEvery(array, predicate) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (!predicate(array[index2], index2, array)) {
          return false;
        }
      }
      return true;
    }
    function arrayFilter(array, predicate) {
      var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index2 < length) {
        var value = array[index2];
        if (predicate(value, index2, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function arrayIncludesWith(array, value, comparator) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (comparator(value, array[index2])) {
          return true;
        }
      }
      return false;
    }
    function arrayMap(array, iteratee) {
      var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index2 < length) {
        result[index2] = iteratee(array[index2], index2, array);
      }
      return result;
    }
    function arrayPush(array, values) {
      var index2 = -1, length = values.length, offset = array.length;
      while (++index2 < length) {
        array[offset + index2] = values[index2];
      }
      return array;
    }
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index2 = -1, length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[++index2];
      }
      while (++index2 < length) {
        accumulator = iteratee(accumulator, array[index2], index2, array);
      }
      return accumulator;
    }
    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
      var length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }
    function arraySome(array, predicate) {
      var index2 = -1, length = array == null ? 0 : array.length;
      while (++index2 < length) {
        if (predicate(array[index2], index2, array)) {
          return true;
        }
      }
      return false;
    }
    var asciiSize = baseProperty("length");
    function asciiToArray(string) {
      return string.split("");
    }
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection2) {
        if (predicate(value, key, collection2)) {
          result = key;
          return false;
        }
      });
      return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index2 = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index2-- : ++index2 < length) {
        if (predicate(array[index2], index2, array)) {
          return index2;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index2 = fromIndex - 1, length = array.length;
      while (++index2 < length) {
        if (comparator(array[index2], value)) {
          return index2;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseMean(array, iteratee) {
      var length = array == null ? 0 : array.length;
      return length ? baseSum(array, iteratee) / length : NAN;
    }
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined$1 : object[key];
      };
    }
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index2, collection2) {
        accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index2, collection2);
      });
      return accumulator;
    }
    function baseSortBy(array, comparer) {
      var length = array.length;
      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }
    function baseSum(array, iteratee) {
      var result, index2 = -1, length = array.length;
      while (++index2 < length) {
        var current = iteratee(array[index2]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : result + current;
        }
      }
      return result;
    }
    function baseTimes(n, iteratee) {
      var index2 = -1, result = Array(n);
      while (++index2 < n) {
        result[index2] = iteratee(index2);
      }
      return result;
    }
    function baseToPairs(object, props) {
      return arrayMap(props, function(key) {
        return [key, object[key]];
      });
    }
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function charsStartIndex(strSymbols, chrSymbols) {
      var index2 = -1, length = strSymbols.length;
      while (++index2 < length && baseIndexOf(chrSymbols, strSymbols[index2], 0) > -1) {
      }
      return index2;
    }
    function charsEndIndex(strSymbols, chrSymbols) {
      var index2 = strSymbols.length;
      while (index2-- && baseIndexOf(chrSymbols, strSymbols[index2], 0) > -1) {
      }
      return index2;
    }
    function countHolders(array, placeholder) {
      var length = array.length, result = 0;
      while (length--) {
        if (array[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }
    var deburrLetter = basePropertyOf(deburredLetters);
    var escapeHtmlChar = basePropertyOf(htmlEscapes);
    function escapeStringChar(chr) {
      return "\\" + stringEscapes[chr];
    }
    function getValue(object, key) {
      return object == null ? undefined$1 : object[key];
    }
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }
    function iteratorToArray(iterator) {
      var data, result = [];
      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }
    function mapToArray(map) {
      var index2 = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index2] = [key, value];
      });
      return result;
    }
    function overArg(func, transform2) {
      return function(arg) {
        return func(transform2(arg));
      };
    }
    function replaceHolders(array, placeholder) {
      var index2 = -1, length = array.length, resIndex = 0, result = [];
      while (++index2 < length) {
        var value = array[index2];
        if (value === placeholder || value === PLACEHOLDER) {
          array[index2] = PLACEHOLDER;
          result[resIndex++] = index2;
        }
      }
      return result;
    }
    function setToArray(set) {
      var index2 = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index2] = value;
      });
      return result;
    }
    function setToPairs(set) {
      var index2 = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index2] = [value, value];
      });
      return result;
    }
    function strictIndexOf(array, value, fromIndex) {
      var index2 = fromIndex - 1, length = array.length;
      while (++index2 < length) {
        if (array[index2] === value) {
          return index2;
        }
      }
      return -1;
    }
    function strictLastIndexOf(array, value, fromIndex) {
      var index2 = fromIndex + 1;
      while (index2--) {
        if (array[index2] === value) {
          return index2;
        }
      }
      return index2;
    }
    function stringSize(string) {
      return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
    }
    function stringToArray(string) {
      return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
    }
    function trimmedEndIndex(string) {
      var index2 = string.length;
      while (index2-- && reWhitespace.test(string.charAt(index2))) {
      }
      return index2;
    }
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }
    var runInContext = function runInContext2(context) {
      context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));
      var Array2 = context.Array, Date2 = context.Date, Error2 = context.Error, Function2 = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String, TypeError2 = context.TypeError;
      var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
      var coreJsData = context["__core-js_shared__"];
      var funcToString = funcProto.toString;
      var hasOwnProperty = objectProto.hasOwnProperty;
      var idCounter = 0;
      var maskSrcKey = function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
        return uid ? "Symbol(src)_1." + uid : "";
      }();
      var nativeObjectToString = objectProto.toString;
      var objectCtorString = funcToString.call(Object2);
      var oldDash = root._;
      var reIsNative = RegExp2("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
      var Buffer2 = moduleExports ? context.Buffer : undefined$1, Symbol2 = context.Symbol, Uint8Array2 = context.Uint8Array, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : undefined$1, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined$1, symIterator = Symbol2 ? Symbol2.iterator : undefined$1, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined$1;
      var defineProperty = function() {
        try {
          var func = getNative(Object2, "defineProperty");
          func({}, "", {});
          return func;
        } catch (e) {
        }
      }();
      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date2 && Date2.now !== root.Date.now && Date2.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
      var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined$1, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
      var DataView = getNative(context, "DataView"), Map = getNative(context, "Map"), Promise2 = getNative(context, "Promise"), Set = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object2, "create");
      var metaMap = WeakMap && new WeakMap();
      var realNames = {};
      var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
      var symbolProto = Symbol2 ? Symbol2.prototype : undefined$1, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1, symbolToString = symbolProto ? symbolProto.toString : undefined$1;
      function lodash2(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, "__wrapped__")) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }
      var baseCreate = function() {
        function object() {
        }
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result2 = new object();
          object.prototype = undefined$1;
          return result2;
        };
      }();
      function baseLodash() {
      }
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }
      lodash2.templateSettings = {
        "escape": reEscape,
        "evaluate": reEvaluate,
        "interpolate": reInterpolate,
        "variable": "",
        "imports": {
          "_": lodash2
        }
      };
      lodash2.prototype = baseLodash.prototype;
      lodash2.prototype.constructor = lodash2;
      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }
      function lazyClone() {
        var result2 = new LazyWrapper(this.__wrapped__);
        result2.__actions__ = copyArray(this.__actions__);
        result2.__dir__ = this.__dir__;
        result2.__filtered__ = this.__filtered__;
        result2.__iteratees__ = copyArray(this.__iteratees__);
        result2.__takeCount__ = this.__takeCount__;
        result2.__views__ = copyArray(this.__views__);
        return result2;
      }
      function lazyReverse() {
        if (this.__filtered__) {
          var result2 = new LazyWrapper(this);
          result2.__dir__ = -1;
          result2.__filtered__ = true;
        } else {
          result2 = this.clone();
          result2.__dir__ *= -1;
        }
        return result2;
      }
      function lazyValue() {
        var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index2 = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
        if (!isArr || !isRight && arrLength == length && takeCount == length) {
          return baseWrapperValue(array, this.__actions__);
        }
        var result2 = [];
        outer:
          while (length-- && resIndex < takeCount) {
            index2 += dir;
            var iterIndex = -1, value = array[index2];
            while (++iterIndex < iterLength) {
              var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed = iteratee2(value);
              if (type == LAZY_MAP_FLAG) {
                value = computed;
              } else if (!computed) {
                if (type == LAZY_FILTER_FLAG) {
                  continue outer;
                } else {
                  break outer;
                }
              }
            }
            result2[resIndex++] = value;
          }
        return result2;
      }
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;
      function Hash(entries) {
        var index2 = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index2 < length) {
          var entry = entries[index2];
          this.set(entry[0], entry[1]);
        }
      }
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      function hashDelete(key) {
        var result2 = this.has(key) && delete this.__data__[key];
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result2 = data[key];
          return result2 === HASH_UNDEFINED ? undefined$1 : result2;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? data[key] !== undefined$1 : hasOwnProperty.call(data, key);
      }
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = nativeCreate && value === undefined$1 ? HASH_UNDEFINED : value;
        return this;
      }
      Hash.prototype.clear = hashClear;
      Hash.prototype["delete"] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      function ListCache(entries) {
        var index2 = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index2 < length) {
          var entry = entries[index2];
          this.set(entry[0], entry[1]);
        }
      }
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      function listCacheDelete(key) {
        var data = this.__data__, index2 = assocIndexOf(data, key);
        if (index2 < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index2 == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index2, 1);
        }
        --this.size;
        return true;
      }
      function listCacheGet(key) {
        var data = this.__data__, index2 = assocIndexOf(data, key);
        return index2 < 0 ? undefined$1 : data[index2][1];
      }
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      function listCacheSet(key, value) {
        var data = this.__data__, index2 = assocIndexOf(data, key);
        if (index2 < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index2][1] = value;
        }
        return this;
      }
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype["delete"] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      function MapCache(entries) {
        var index2 = -1, length = entries == null ? 0 : entries.length;
        this.clear();
        while (++index2 < length) {
          var entry = entries[index2];
          this.set(entry[0], entry[1]);
        }
      }
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          "hash": new Hash(),
          "map": new (Map || ListCache)(),
          "string": new Hash()
        };
      }
      function mapCacheDelete(key) {
        var result2 = getMapData(this, key)["delete"](key);
        this.size -= result2 ? 1 : 0;
        return result2;
      }
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }
      function mapCacheSet(key, value) {
        var data = getMapData(this, key), size2 = data.size;
        data.set(key, value);
        this.size += data.size == size2 ? 0 : 1;
        return this;
      }
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype["delete"] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      function SetCache(values2) {
        var index2 = -1, length = values2 == null ? 0 : values2.length;
        this.__data__ = new MapCache();
        while (++index2 < length) {
          this.add(values2[index2]);
        }
      }
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }
      function setCacheHas(value) {
        return this.__data__.has(value);
      }
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      function Stack3(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }
      function stackClear() {
        this.__data__ = new ListCache();
        this.size = 0;
      }
      function stackDelete(key) {
        var data = this.__data__, result2 = data["delete"](key);
        this.size = data.size;
        return result2;
      }
      function stackGet(key) {
        return this.__data__.get(key);
      }
      function stackHas(key) {
        return this.__data__.has(key);
      }
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      Stack3.prototype.clear = stackClear;
      Stack3.prototype["delete"] = stackDelete;
      Stack3.prototype.get = stackGet;
      Stack3.prototype.has = stackHas;
      Stack3.prototype.set = stackSet;
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined$1;
      }
      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }
      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }
      function assignMergeValue(object, key, value) {
        if (value !== undefined$1 && !eq(object[key], value) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined$1 && !(key in object)) {
          baseAssignValue(object, key, value);
        }
      }
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }
      function baseAggregator(collection, setter, iteratee2, accumulator) {
        baseEach(collection, function(value, key, collection2) {
          setter(accumulator, value, iteratee2(value), collection2);
        });
        return accumulator;
      }
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }
      function baseAssignValue(object, key, value) {
        if (key == "__proto__" && defineProperty) {
          defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
          });
        } else {
          object[key] = value;
        }
      }
      function baseAt(object, paths) {
        var index2 = -1, length = paths.length, result2 = Array2(length), skip = object == null;
        while (++index2 < length) {
          result2[index2] = skip ? undefined$1 : get(object, paths[index2]);
        }
        return result2;
      }
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined$1) {
            number = number <= upper ? number : upper;
          }
          if (lower !== undefined$1) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }
      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
        if (customizer) {
          result2 = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result2 !== undefined$1) {
          return result2;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result2 = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result2);
          }
        } else {
          var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || isFunc && !object) {
            result2 = isFlat || isFunc ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result2 = initCloneByTag(value, tag, isDeep);
          }
        }
        stack || (stack = new Stack3());
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result2);
        if (isSet(value)) {
          value.forEach(function(subValue) {
            result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key2) {
            result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
        }
        var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key2) {
          if (props) {
            key2 = subValue;
            subValue = value[key2];
          }
          assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
        return result2;
      }
      function baseConforms(source) {
        var props = keys(source);
        return function(object) {
          return baseConformsTo(object, source, props);
        };
      }
      function baseConformsTo(object, source, props) {
        var length = props.length;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (length--) {
          var key = props[length], predicate = source[key], value = object[key];
          if (value === undefined$1 && !(key in object) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }
      function baseDelay(func, wait, args) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return setTimeout2(function() {
          func.apply(undefined$1, args);
        }, wait);
      }
      function baseDifference(array, values2, iteratee2, comparator) {
        var index2 = -1, includes2 = arrayIncludes, isCommon = true, length = array.length, result2 = [], valuesLength = values2.length;
        if (!length) {
          return result2;
        }
        if (iteratee2) {
          values2 = arrayMap(values2, baseUnary(iteratee2));
        }
        if (comparator) {
          includes2 = arrayIncludesWith;
          isCommon = false;
        } else if (values2.length >= LARGE_ARRAY_SIZE) {
          includes2 = cacheHas;
          isCommon = false;
          values2 = new SetCache(values2);
        }
        outer:
          while (++index2 < length) {
            var value = array[index2], computed = iteratee2 == null ? value : iteratee2(value);
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed === computed) {
              var valuesIndex = valuesLength;
              while (valuesIndex--) {
                if (values2[valuesIndex] === computed) {
                  continue outer;
                }
              }
              result2.push(value);
            } else if (!includes2(values2, computed, comparator)) {
              result2.push(value);
            }
          }
        return result2;
      }
      var baseEach = createBaseEach(baseForOwn);
      var baseEachRight = createBaseEach(baseForOwnRight, true);
      function baseEvery(collection, predicate) {
        var result2 = true;
        baseEach(collection, function(value, index2, collection2) {
          result2 = !!predicate(value, index2, collection2);
          return result2;
        });
        return result2;
      }
      function baseExtremum(array, iteratee2, comparator) {
        var index2 = -1, length = array.length;
        while (++index2 < length) {
          var value = array[index2], current = iteratee2(value);
          if (current != null && (computed === undefined$1 ? current === current && !isSymbol(current) : comparator(current, computed))) {
            var computed = current, result2 = value;
          }
        }
        return result2;
      }
      function baseFill(array, value, start, end) {
        var length = array.length;
        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end === undefined$1 || end > length ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array[start++] = value;
        }
        return array;
      }
      function baseFilter(collection, predicate) {
        var result2 = [];
        baseEach(collection, function(value, index2, collection2) {
          if (predicate(value, index2, collection2)) {
            result2.push(value);
          }
        });
        return result2;
      }
      function baseFlatten(array, depth, predicate, isStrict, result2) {
        var index2 = -1, length = array.length;
        predicate || (predicate = isFlattenable);
        result2 || (result2 = []);
        while (++index2 < length) {
          var value = array[index2];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              baseFlatten(value, depth - 1, predicate, isStrict, result2);
            } else {
              arrayPush(result2, value);
            }
          } else if (!isStrict) {
            result2[result2.length] = value;
          }
        }
        return result2;
      }
      var baseFor = createBaseFor();
      var baseForRight = createBaseFor(true);
      function baseForOwn(object, iteratee2) {
        return object && baseFor(object, iteratee2, keys);
      }
      function baseForOwnRight(object, iteratee2) {
        return object && baseForRight(object, iteratee2, keys);
      }
      function baseFunctions(object, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object[key]);
        });
      }
      function baseGet(object, path) {
        path = castPath(path, object);
        var index2 = 0, length = path.length;
        while (object != null && index2 < length) {
          object = object[toKey(path[index2++])];
        }
        return index2 && index2 == length ? object : undefined$1;
      }
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result2 = keysFunc(object);
        return isArray(object) ? result2 : arrayPush(result2, symbolsFunc(object));
      }
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
      }
      function baseGt(value, other) {
        return value > other;
      }
      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }
      function baseHasIn(object, key) {
        return object != null && key in Object2(object);
      }
      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }
      function baseIntersection(arrays, iteratee2, comparator) {
        var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
        while (othIndex--) {
          var array = arrays[othIndex];
          if (othIndex && iteratee2) {
            array = arrayMap(array, baseUnary(iteratee2));
          }
          maxLength = nativeMin(array.length, maxLength);
          caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined$1;
        }
        array = arrays[0];
        var index2 = -1, seen = caches[0];
        outer:
          while (++index2 < length && result2.length < maxLength) {
            var value = array[index2], computed = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (!(seen ? cacheHas(seen, computed) : includes2(result2, computed, comparator))) {
              othIndex = othLength;
              while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed) : includes2(arrays[othIndex], computed, comparator))) {
                  continue outer;
                }
              }
              if (seen) {
                seen.push(computed);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseInverter(object, setter, iteratee2, accumulator) {
        baseForOwn(object, function(value, key, object2) {
          setter(accumulator, iteratee2(value), key, object2);
        });
        return accumulator;
      }
      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object, args);
      }
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;
        var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack3());
          return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack3());
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack3());
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      function baseIsMatch(object, source, matchData, customizer) {
        var index2 = matchData.length, length = index2, noCustomizer = !customizer;
        if (object == null) {
          return !length;
        }
        object = Object2(object);
        while (index2--) {
          var data = matchData[index2];
          if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
          }
        }
        while (++index2 < length) {
          data = matchData[index2];
          var key = data[0], objValue = object[key], srcValue = data[1];
          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack3();
            if (customizer) {
              var result2 = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result2 === undefined$1 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
              return false;
            }
          }
        }
        return true;
      }
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      function baseIsTypedArray(value) {
        return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }
      function baseIteratee(value) {
        if (typeof value == "function") {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == "object") {
          return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
        }
        return property(value);
      }
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result2 = [];
        for (var key in Object2(object)) {
          if (hasOwnProperty.call(object, key) && key != "constructor") {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object), result2 = [];
        for (var key in object) {
          if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
            result2.push(key);
          }
        }
        return result2;
      }
      function baseLt(value, other) {
        return value < other;
      }
      function baseMap(collection, iteratee2) {
        var index2 = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value, key, collection2) {
          result2[++index2] = iteratee2(value, key, collection2);
        });
        return result2;
      }
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return objValue === undefined$1 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack3());
          if (isObject(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          } else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined$1;
            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined$1;
        var isCommon = newValue === undefined$1;
        if (isCommon) {
          var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            } else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            } else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            } else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            } else {
              newValue = [];
            }
          } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            } else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          } else {
            isCommon = false;
          }
        }
        if (isCommon) {
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack["delete"](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }
      function baseNth(array, n) {
        var length = array.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array[n] : undefined$1;
      }
      function baseOrderBy(collection, iteratees, orders) {
        if (iteratees.length) {
          iteratees = arrayMap(iteratees, function(iteratee2) {
            if (isArray(iteratee2)) {
              return function(value) {
                return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
              };
            }
            return iteratee2;
          });
        } else {
          iteratees = [identity];
        }
        var index2 = -1;
        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
        var result2 = baseMap(collection, function(value, key, collection2) {
          var criteria = arrayMap(iteratees, function(iteratee2) {
            return iteratee2(value);
          });
          return { "criteria": criteria, "index": ++index2, "value": value };
        });
        return baseSortBy(result2, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }
      function basePickBy(object, paths, predicate) {
        var index2 = -1, length = paths.length, result2 = {};
        while (++index2 < length) {
          var path = paths[index2], value = baseGet(object, path);
          if (predicate(value, path)) {
            baseSet(result2, castPath(path, object), value);
          }
        }
        return result2;
      }
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      function basePullAll(array, values2, iteratee2, comparator) {
        var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index2 = -1, length = values2.length, seen = array;
        if (array === values2) {
          values2 = copyArray(values2);
        }
        if (iteratee2) {
          seen = arrayMap(array, baseUnary(iteratee2));
        }
        while (++index2 < length) {
          var fromIndex = 0, value = values2[index2], computed = iteratee2 ? iteratee2(value) : value;
          while ((fromIndex = indexOf2(seen, computed, fromIndex, comparator)) > -1) {
            if (seen !== array) {
              splice.call(seen, fromIndex, 1);
            }
            splice.call(array, fromIndex, 1);
          }
        }
        return array;
      }
      function basePullAt(array, indexes) {
        var length = array ? indexes.length : 0, lastIndex = length - 1;
        while (length--) {
          var index2 = indexes[length];
          if (length == lastIndex || index2 !== previous) {
            var previous = index2;
            if (isIndex(index2)) {
              splice.call(array, index2, 1);
            } else {
              baseUnset(array, index2);
            }
          }
        }
        return array;
      }
      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }
      function baseRange(start, end, step, fromRight) {
        var index2 = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result2 = Array2(length);
        while (length--) {
          result2[fromRight ? length : ++index2] = start;
          start += step;
        }
        return result2;
      }
      function baseRepeat(string, n) {
        var result2 = "";
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result2;
        }
        do {
          if (n % 2) {
            result2 += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);
        return result2;
      }
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + "");
      }
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);
        var index2 = -1, length = path.length, lastIndex = length - 1, nested = object;
        while (nested != null && ++index2 < length) {
          var key = toKey(path[index2]), newValue = value;
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
          }
          if (index2 != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject(objValue) ? objValue : isIndex(path[index2 + 1]) ? [] : {};
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, "toString", {
          "configurable": true,
          "enumerable": false,
          "value": constant(string),
          "writable": true
        });
      };
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      function baseSlice(array, start, end) {
        var index2 = -1, length = array.length;
        if (start < 0) {
          start = -start > length ? 0 : length + start;
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : end - start >>> 0;
        start >>>= 0;
        var result2 = Array2(length);
        while (++index2 < length) {
          result2[index2] = array[index2 + start];
        }
        return result2;
      }
      function baseSome(collection, predicate) {
        var result2;
        baseEach(collection, function(value, index2, collection2) {
          result2 = predicate(value, index2, collection2);
          return !result2;
        });
        return !!result2;
      }
      function baseSortedIndex(array, value, retHighest) {
        var low = 0, high = array == null ? low : array.length;
        if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = low + high >>> 1, computed = array[mid];
            if (computed !== null && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array, value, identity, retHighest);
      }
      function baseSortedIndexBy(array, value, iteratee2, retHighest) {
        var low = 0, high = array == null ? 0 : array.length;
        if (high === 0) {
          return 0;
        }
        value = iteratee2(value);
        var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined$1;
        while (low < high) {
          var mid = nativeFloor((low + high) / 2), computed = iteratee2(array[mid]), othIsDefined = computed !== undefined$1, othIsNull = computed === null, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? computed <= value : computed < value;
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }
      function baseSortedUniq(array, iteratee2) {
        var index2 = -1, length = array.length, resIndex = 0, result2 = [];
        while (++index2 < length) {
          var value = array[index2], computed = iteratee2 ? iteratee2(value) : value;
          if (!index2 || !eq(computed, seen)) {
            var seen = computed;
            result2[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result2;
      }
      function baseToNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      function baseToString(value) {
        if (typeof value == "string") {
          return value;
        }
        if (isArray(value)) {
          return arrayMap(value, baseToString) + "";
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : "";
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function baseUniq(array, iteratee2, comparator) {
        var index2 = -1, includes2 = arrayIncludes, length = array.length, isCommon = true, result2 = [], seen = result2;
        if (comparator) {
          isCommon = false;
          includes2 = arrayIncludesWith;
        } else if (length >= LARGE_ARRAY_SIZE) {
          var set2 = iteratee2 ? null : createSet(array);
          if (set2) {
            return setToArray(set2);
          }
          isCommon = false;
          includes2 = cacheHas;
          seen = new SetCache();
        } else {
          seen = iteratee2 ? [] : result2;
        }
        outer:
          while (++index2 < length) {
            var value = array[index2], computed = iteratee2 ? iteratee2(value) : value;
            value = comparator || value !== 0 ? value : 0;
            if (isCommon && computed === computed) {
              var seenIndex = seen.length;
              while (seenIndex--) {
                if (seen[seenIndex] === computed) {
                  continue outer;
                }
              }
              if (iteratee2) {
                seen.push(computed);
              }
              result2.push(value);
            } else if (!includes2(seen, computed, comparator)) {
              if (seen !== result2) {
                seen.push(computed);
              }
              result2.push(value);
            }
          }
        return result2;
      }
      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }
      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }
      function baseWhile(array, predicate, isDrop, fromRight) {
        var length = array.length, index2 = fromRight ? length : -1;
        while ((fromRight ? index2-- : ++index2 < length) && predicate(array[index2], index2, array)) {
        }
        return isDrop ? baseSlice(array, fromRight ? 0 : index2, fromRight ? index2 + 1 : length) : baseSlice(array, fromRight ? index2 + 1 : 0, fromRight ? length : index2);
      }
      function baseWrapperValue(value, actions) {
        var result2 = value;
        if (result2 instanceof LazyWrapper) {
          result2 = result2.value();
        }
        return arrayReduce(actions, function(result3, action) {
          return action.func.apply(action.thisArg, arrayPush([result3], action.args));
        }, result2);
      }
      function baseXor(arrays, iteratee2, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index2 = -1, result2 = Array2(length);
        while (++index2 < length) {
          var array = arrays[index2], othIndex = -1;
          while (++othIndex < length) {
            if (othIndex != index2) {
              result2[index2] = baseDifference(result2[index2] || array, arrays[othIndex], iteratee2, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
      }
      function baseZipObject(props, values2, assignFunc) {
        var index2 = -1, length = props.length, valsLength = values2.length, result2 = {};
        while (++index2 < length) {
          var value = index2 < valsLength ? values2[index2] : undefined$1;
          assignFunc(result2, props[index2], value);
        }
        return result2;
      }
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      function castFunction(value) {
        return typeof value == "function" ? value : identity;
      }
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      var castRest = baseRest;
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined$1 ? length : end;
        return !start && end >= length ? array : baseSlice(array, start, end);
      }
      var clearTimeout = ctxClearTimeout || function(id) {
        return root.clearTimeout(id);
      };
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
        buffer.copy(result2);
        return result2;
      }
      function cloneArrayBuffer(arrayBuffer) {
        var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array2(result2).set(new Uint8Array2(arrayBuffer));
        return result2;
      }
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }
      function cloneRegExp(regexp) {
        var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result2.lastIndex = regexp.lastIndex;
        return result2;
      }
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
      }
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
          var othIsDefined = other !== undefined$1, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
          if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
            return 1;
          }
          if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }
      function compareMultiple(object, other, orders) {
        var index2 = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
        while (++index2 < length) {
          var result2 = compareAscending(objCriteria[index2], othCriteria[index2]);
          if (result2) {
            if (index2 >= ordersLength) {
              return result2;
            }
            var order = orders[index2];
            return result2 * (order == "desc" ? -1 : 1);
          }
        }
        return object.index - other.index;
      }
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
        while (++leftIndex < leftLength) {
          result2[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result2[leftIndex++] = args[argsIndex++];
        }
        return result2;
      }
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
        while (++argsIndex < rangeLength) {
          result2[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result2[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result2[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result2;
      }
      function copyArray(source, array) {
        var index2 = -1, length = source.length;
        array || (array = Array2(length));
        while (++index2 < length) {
          array[index2] = source[index2];
        }
        return array;
      }
      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});
        var index2 = -1, length = props.length;
        while (++index2 < length) {
          var key = props[index2];
          var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined$1;
          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }
      function createAggregator(setter, initializer) {
        return function(collection, iteratee2) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
          return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
        };
      }
      function createAssigner(assigner) {
        return baseRest(function(object, sources) {
          var index2 = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined$1, guard = length > 2 ? sources[2] : undefined$1;
          customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined$1;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object = Object2(object);
          while (++index2 < length) {
            var source = sources[index2];
            if (source) {
              assigner(object, source, index2, customizer);
            }
          }
          return object;
        });
      }
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee2) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee2);
          }
          var length = collection.length, index2 = fromRight ? length : -1, iterable = Object2(collection);
          while (fromRight ? index2-- : ++index2 < length) {
            if (iteratee2(iterable[index2], index2, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      function createBaseFor(fromRight) {
        return function(object, iteratee2, keysFunc) {
          var index2 = -1, iterable = Object2(object), props = keysFunc(object), length = props.length;
          while (length--) {
            var key = props[fromRight ? length : ++index2];
            if (iteratee2(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object;
        };
      }
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString(string);
          var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined$1;
          var chr = strSymbols ? strSymbols[0] : string.charAt(0);
          var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
          return chr[methodName]() + trailing;
        };
      }
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
        };
      }
      function createCtor(Ctor) {
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return new Ctor();
            case 1:
              return new Ctor(args[0]);
            case 2:
              return new Ctor(args[0], args[1]);
            case 3:
              return new Ctor(args[0], args[1], args[2]);
            case 4:
              return new Ctor(args[0], args[1], args[2], args[3]);
            case 5:
              return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7:
              return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
          return isObject(result2) ? result2 : thisBinding;
        };
      }
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index2 = length, placeholder = getHolder(wrapper);
          while (index2--) {
            args[index2] = arguments[index2];
          }
          var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
          length -= holders.length;
          if (length < arity) {
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined$1, args, holders, undefined$1, undefined$1, arity - length);
          }
          var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object2(collection);
          if (!isArrayLike(collection)) {
            var iteratee2 = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) {
              return iteratee2(iterable[key], key, iterable);
            };
          }
          var index2 = findIndexFunc(collection, predicate, fromIndex);
          return index2 > -1 ? iterable[iteratee2 ? collection[index2] : index2] : undefined$1;
        };
      }
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length, index2 = length, prereq = LodashWrapper.prototype.thru;
          if (fromRight) {
            funcs.reverse();
          }
          while (index2--) {
            var func = funcs[index2];
            if (typeof func != "function") {
              throw new TypeError2(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == "wrapper") {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index2 = wrapper ? index2 : length;
          while (++index2 < length) {
            func = funcs[index2];
            var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined$1;
            if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments, value = args[0];
            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }
            var index3 = 0, result2 = length ? funcs[index3].apply(this, args) : value;
            while (++index3 < length) {
              result2 = funcs[index3].call(this, result2);
            }
            return result2;
          };
        });
      }
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined$1 : createCtor(func);
        function wrapper() {
          var length = arguments.length, args = Array2(length), index2 = length;
          while (index2--) {
            args[index2] = arguments[index2];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary2, arity - length);
          }
          var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary2 < length) {
            args.length = ary2;
          }
          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }
      function createInverter(setter, toIteratee) {
        return function(object, iteratee2) {
          return baseInverter(object, setter, toIteratee(iteratee2), {});
        };
      }
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result2;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result2 = value;
          }
          if (other !== undefined$1) {
            if (result2 === undefined$1) {
              return other;
            }
            if (typeof value == "string" || typeof other == "string") {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result2 = operator(value, other);
          }
          return result2;
        };
      }
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee2) {
              return apply(iteratee2, thisArg, args);
            });
          });
        });
      }
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? " " : baseToString(chars);
        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
      }
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
        function wrapper() {
          var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
            end = step = undefined$1;
          }
          start = toFinite(start);
          if (end === undefined$1) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? start < end ? 1 : -1 : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == "string" && typeof other == "string")) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined$1, newHoldersRight = isCurry ? undefined$1 : holders, newPartials = isCurry ? partials : undefined$1, newPartialsRight = isCurry ? undefined$1 : partials;
        bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func,
          bitmask,
          thisArg,
          newPartials,
          newHolders,
          newPartialsRight,
          newHoldersRight,
          argPos,
          ary2,
          arity
        ];
        var result2 = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result2, newData);
        }
        result2.placeholder = placeholder;
        return setWrapToString(result2, func, bitmask);
      }
      function createRound(methodName) {
        var func = Math2[methodName];
        return function(number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number)) {
            var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
            pair = (toString(value) + "e").split("e");
            return +(pair[0] + "e" + (+pair[1] - precision));
          }
          return func(number);
        };
      }
      var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function(values2) {
        return new Set(values2);
      };
      function createToPairs(keysFunc) {
        return function(object) {
          var tag = getTag(object);
          if (tag == mapTag) {
            return mapToArray(object);
          }
          if (tag == setTag) {
            return setToPairs(object);
          }
          return baseToPairs(object, keysFunc(object));
        };
      }
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary2 = ary2 === undefined$1 ? ary2 : nativeMax(toInteger(ary2), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;
        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials, holdersRight = holders;
          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);
        var newData = [
          func,
          bitmask,
          thisArg,
          partials,
          holders,
          partialsRight,
          holdersRight,
          argPos,
          ary2,
          arity
        ];
        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result2 = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result2 = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result2 = createPartial(func, bitmask, thisArg, partials);
        } else {
          result2 = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result2, newData), func, bitmask);
      }
      function customDefaultsAssignIn(objValue, srcValue, key, object) {
        if (objValue === undefined$1 || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
          return srcValue;
        }
        return objValue;
      }
      function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
        if (isObject(objValue) && isObject(srcValue)) {
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack["delete"](srcValue);
        }
        return objValue;
      }
      function customOmitClone(value) {
        return isPlainObject(value) ? undefined$1 : value;
      }
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        var arrStacked = stack.get(array);
        var othStacked = stack.get(other);
        if (arrStacked && othStacked) {
          return arrStacked == other && othStacked == array;
        }
        var index2 = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined$1;
        stack.set(array, other);
        stack.set(other, array);
        while (++index2 < arrLength) {
          var arrValue = array[index2], othValue = other[index2];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result2 = false;
            break;
          }
          if (seen) {
            if (!arraySome(other, function(othValue2, othIndex) {
              if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
              result2 = false;
              break;
            }
          } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result2 = false;
            break;
          }
        }
        stack["delete"](array);
        stack["delete"](other);
        return result2;
      }
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;
          case arrayBufferTag:
            if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
              return false;
            }
            return true;
          case boolTag:
          case dateTag:
          case numberTag:
            return eq(+object, +other);
          case errorTag:
            return object.name == other.name && object.message == other.message;
          case regexpTag:
          case stringTag:
            return object == other + "";
          case mapTag:
            var convert = mapToArray;
          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
              return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result2 = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result2;
          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index2 = objLength;
        while (index2--) {
          var key = objProps[index2];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        var objStacked = stack.get(object);
        var othStacked = stack.get(other);
        if (objStacked && othStacked) {
          return objStacked == other && othStacked == object;
        }
        var result2 = true;
        stack.set(object, other);
        stack.set(other, object);
        var skipCtor = isPartial;
        while (++index2 < objLength) {
          key = objProps[index2];
          var objValue = object[key], othValue = other[key];
          if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
          }
          if (!(compared === undefined$1 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
            result2 = false;
            break;
          }
          skipCtor || (skipCtor = key == "constructor");
        }
        if (result2 && !skipCtor) {
          var objCtor = object.constructor, othCtor = other.constructor;
          if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result2 = false;
          }
        }
        stack["delete"](object);
        stack["delete"](other);
        return result2;
      }
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten), func + "");
      }
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }
      var getData = !metaMap ? noop : function(func) {
        return metaMap.get(func);
      };
      function getFuncName(func) {
        var result2 = func.name + "", array = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array.length : 0;
        while (length--) {
          var data = array[length], otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result2;
      }
      function getHolder(func) {
        var object = hasOwnProperty.call(lodash2, "placeholder") ? lodash2 : func;
        return object.placeholder;
      }
      function getIteratee() {
        var result2 = lodash2.iteratee || iteratee;
        result2 = result2 === iteratee ? baseIteratee : result2;
        return arguments.length ? result2(arguments[0], arguments[1]) : result2;
      }
      function getMapData(map2, key) {
        var data = map2.__data__;
        return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
      }
      function getMatchData(object) {
        var result2 = keys(object), length = result2.length;
        while (length--) {
          var key = result2[length], value = object[key];
          result2[length] = [key, value, isStrictComparable(value)];
        }
        return result2;
      }
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined$1;
      }
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {
        }
        var result2 = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result2;
      }
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object2(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result2 = [];
        while (object) {
          arrayPush(result2, getSymbols(object));
          object = getPrototype(object);
        }
        return result2;
      };
      var getTag = baseGetTag;
      if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
        getTag = function(value) {
          var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined$1, ctorString = Ctor ? toSource(Ctor) : "";
          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString:
                return dataViewTag;
              case mapCtorString:
                return mapTag;
              case promiseCtorString:
                return promiseTag;
              case setCtorString:
                return setTag;
              case weakMapCtorString:
                return weakMapTag;
            }
          }
          return result2;
        };
      }
      function getView(start, end, transforms) {
        var index2 = -1, length = transforms.length;
        while (++index2 < length) {
          var data = transforms[index2], size2 = data.size;
          switch (data.type) {
            case "drop":
              start += size2;
              break;
            case "dropRight":
              end -= size2;
              break;
            case "take":
              end = nativeMin(end, start + size2);
              break;
            case "takeRight":
              start = nativeMax(start, end - size2);
              break;
          }
        }
        return { "start": start, "end": end };
      }
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);
        var index2 = -1, length = path.length, result2 = false;
        while (++index2 < length) {
          var key = toKey(path[index2]);
          if (!(result2 = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result2 || ++index2 != length) {
          return result2;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
      }
      function initCloneArray(array) {
        var length = array.length, result2 = new array.constructor(length);
        if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
          result2.index = array.index;
          result2.input = array.input;
        }
        return result2;
      }
      function initCloneObject(object) {
        return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
      }
      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);
          case boolTag:
          case dateTag:
            return new Ctor(+object);
          case dataViewTag:
            return cloneDataView(object, isDeep);
          case float32Tag:
          case float64Tag:
          case int8Tag:
          case int16Tag:
          case int32Tag:
          case uint8Tag:
          case uint8ClampedTag:
          case uint16Tag:
          case uint32Tag:
            return cloneTypedArray(object, isDeep);
          case mapTag:
            return new Ctor();
          case numberTag:
          case stringTag:
            return new Ctor(object);
          case regexpTag:
            return cloneRegExp(object);
          case setTag:
            return new Ctor();
          case symbolTag:
            return cloneSymbol(object);
        }
      }
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
        details = details.join(length > 2 ? ", " : " ");
        return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
      }
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
      }
      function isIterateeCall(value, index2, object) {
        if (!isObject(object)) {
          return false;
        }
        var type = typeof index2;
        if (type == "number" ? isArrayLike(object) && isIndex(index2, object.length) : type == "string" && index2 in object) {
          return eq(object[index2], value);
        }
        return false;
      }
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object2(object);
      }
      function isKeyable(value) {
        var type = typeof value;
        return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
      }
      function isLaziable(func) {
        var funcName = getFuncName(func), other = lodash2[funcName];
        if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      function isMasked(func) {
        return !!maskSrcKey && maskSrcKey in func;
      }
      var isMaskable = coreJsData ? isFunction : stubFalse;
      function isPrototype(value) {
        var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
        return value === proto;
      }
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue && (srcValue !== undefined$1 || key in Object2(object));
        };
      }
      function memoizeCapped(func) {
        var result2 = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });
        var cache = result2.cache;
        return result2;
      }
      function mergeData(data, source) {
        var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
        var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
        if (!(isCommon || isCombo)) {
          return data;
        }
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        value = source[7];
        if (value) {
          data[7] = value;
        }
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        if (data[9] == null) {
          data[9] = source[9];
        }
        data[0] = source[0];
        data[1] = newBitmask;
        return data;
      }
      function nativeKeysIn(object) {
        var result2 = [];
        if (object != null) {
          for (var key in Object2(object)) {
            result2.push(key);
          }
        }
        return result2;
      }
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }
      function overRest(func, start, transform3) {
        start = nativeMax(start === undefined$1 ? func.length - 1 : start, 0);
        return function() {
          var args = arguments, index2 = -1, length = nativeMax(args.length - start, 0), array = Array2(length);
          while (++index2 < length) {
            array[index2] = args[start + index2];
          }
          index2 = -1;
          var otherArgs = Array2(start + 1);
          while (++index2 < start) {
            otherArgs[index2] = args[index2];
          }
          otherArgs[start] = transform3(array);
          return apply(func, this, otherArgs);
        };
      }
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }
      function reorder(array, indexes) {
        var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
        while (length--) {
          var index2 = indexes[length];
          array[length] = isIndex(index2, arrLength) ? oldArray[index2] : undefined$1;
        }
        return array;
      }
      function safeGet(object, key) {
        if (key === "constructor" && typeof object[key] === "function") {
          return;
        }
        if (key == "__proto__") {
          return;
        }
        return object[key];
      }
      var setData = shortOut(baseSetData);
      var setTimeout2 = ctxSetTimeout || function(func, wait) {
        return root.setTimeout(func, wait);
      };
      var setToString = shortOut(baseSetToString);
      function setWrapToString(wrapper, reference, bitmask) {
        var source = reference + "";
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }
      function shortOut(func) {
        var count2 = 0, lastCalled = 0;
        return function() {
          var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
          lastCalled = stamp;
          if (remaining > 0) {
            if (++count2 >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count2 = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }
      function shuffleSelf(array, size2) {
        var index2 = -1, length = array.length, lastIndex = length - 1;
        size2 = size2 === undefined$1 ? length : size2;
        while (++index2 < size2) {
          var rand = baseRandom(index2, lastIndex), value = array[rand];
          array[rand] = array[index2];
          array[index2] = value;
        }
        array.length = size2;
        return array;
      }
      var stringToPath = memoizeCapped(function(string) {
        var result2 = [];
        if (string.charCodeAt(0) === 46) {
          result2.push("");
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result2.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
        });
        return result2;
      });
      function toKey(value) {
        if (typeof value == "string" || isSymbol(value)) {
          return value;
        }
        var result2 = value + "";
        return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
      }
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {
          }
          try {
            return func + "";
          } catch (e) {
          }
        }
        return "";
      }
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = "_." + pair[0];
          if (bitmask & pair[1] && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result2.__actions__ = copyArray(wrapper.__actions__);
        result2.__index__ = wrapper.__index__;
        result2.__values__ = wrapper.__values__;
        return result2;
      }
      function chunk(array, size2, guard) {
        if (guard ? isIterateeCall(array, size2, guard) : size2 === undefined$1) {
          size2 = 1;
        } else {
          size2 = nativeMax(toInteger(size2), 0);
        }
        var length = array == null ? 0 : array.length;
        if (!length || size2 < 1) {
          return [];
        }
        var index2 = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
        while (index2 < length) {
          result2[resIndex++] = baseSlice(array, index2, index2 += size2);
        }
        return result2;
      }
      function compact(array) {
        var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result2 = [];
        while (++index2 < length) {
          var value = array[index2];
          if (value) {
            result2[resIndex++] = value;
          }
        }
        return result2;
      }
      function concat3() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array2(length - 1), array = arguments[0], index2 = length;
        while (index2--) {
          args[index2 - 1] = arguments[index2];
        }
        return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }
      var difference = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
      });
      var differenceBy = baseRest(function(array, values2) {
        var iteratee2 = last(values2);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
      });
      var differenceWith = baseRest(function(array, values2) {
        var comparator = last(values2);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), undefined$1, comparator) : [];
      });
      function drop(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function dropRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function dropRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
      }
      function dropWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
      }
      function fill(array, value, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array, value, start, end);
      }
      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index2 = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index2 < 0) {
          index2 = nativeMax(length + index2, 0);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index2);
      }
      function findLastIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index2 = length - 1;
        if (fromIndex !== undefined$1) {
          index2 = toInteger(fromIndex);
          index2 = fromIndex < 0 ? nativeMax(length + index2, 0) : nativeMin(index2, length - 1);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index2, true);
      }
      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }
      function flattenDeep(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, INFINITY) : [];
      }
      function flattenDepth(array, depth) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array, depth);
      }
      function fromPairs(pairs) {
        var index2 = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
        while (++index2 < length) {
          var pair = pairs[index2];
          result2[pair[0]] = pair[1];
        }
        return result2;
      }
      function head(array) {
        return array && array.length ? array[0] : undefined$1;
      }
      function indexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index2 = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index2 < 0) {
          index2 = nativeMax(length + index2, 0);
        }
        return baseIndexOf(array, value, index2);
      }
      function initial(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 0, -1) : [];
      }
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
      });
      var intersectionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        if (iteratee2 === last(mapped)) {
          iteratee2 = undefined$1;
        } else {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
      });
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined$1, comparator) : [];
      });
      function join(array, separator) {
        return array == null ? "" : nativeJoin.call(array, separator);
      }
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined$1;
      }
      function lastIndexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index2 = length;
        if (fromIndex !== undefined$1) {
          index2 = toInteger(fromIndex);
          index2 = index2 < 0 ? nativeMax(length + index2, 0) : nativeMin(index2, length - 1);
        }
        return value === value ? strictLastIndexOf(array, value, index2) : baseFindIndex(array, baseIsNaN, index2, true);
      }
      function nth(array, n) {
        return array && array.length ? baseNth(array, toInteger(n)) : undefined$1;
      }
      var pull = baseRest(pullAll);
      function pullAll(array, values2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2) : array;
      }
      function pullAllBy(array, values2, iteratee2) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, getIteratee(iteratee2, 2)) : array;
      }
      function pullAllWith(array, values2, comparator) {
        return array && array.length && values2 && values2.length ? basePullAll(array, values2, undefined$1, comparator) : array;
      }
      var pullAt = flatRest(function(array, indexes) {
        var length = array == null ? 0 : array.length, result2 = baseAt(array, indexes);
        basePullAt(array, arrayMap(indexes, function(index2) {
          return isIndex(index2, length) ? +index2 : index2;
        }).sort(compareAscending));
        return result2;
      });
      function remove3(array, predicate) {
        var result2 = [];
        if (!(array && array.length)) {
          return result2;
        }
        var index2 = -1, indexes = [], length = array.length;
        predicate = getIteratee(predicate, 3);
        while (++index2 < length) {
          var value = array[index2];
          if (predicate(value, index2, array)) {
            result2.push(value);
            indexes.push(index2);
          }
        }
        basePullAt(array, indexes);
        return result2;
      }
      function reverse(array) {
        return array == null ? array : nativeReverse.call(array);
      }
      function slice(array, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
          start = 0;
          end = length;
        } else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array, start, end);
      }
      function sortedIndex(array, value) {
        return baseSortedIndex(array, value);
      }
      function sortedIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2));
      }
      function sortedIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index2 = baseSortedIndex(array, value);
          if (index2 < length && eq(array[index2], value)) {
            return index2;
          }
        }
        return -1;
      }
      function sortedLastIndex(array, value) {
        return baseSortedIndex(array, value, true);
      }
      function sortedLastIndexBy(array, value, iteratee2) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2), true);
      }
      function sortedLastIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index2 = baseSortedIndex(array, value, true) - 1;
          if (eq(array[index2], value)) {
            return index2;
          }
        }
        return -1;
      }
      function sortedUniq(array) {
        return array && array.length ? baseSortedUniq(array) : [];
      }
      function sortedUniqBy(array, iteratee2) {
        return array && array.length ? baseSortedUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function tail(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 1, length) : [];
      }
      function take(array, n, guard) {
        if (!(array && array.length)) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }
      function takeRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = guard || n === undefined$1 ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, n < 0 ? 0 : n, length);
      }
      function takeRightWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
      }
      function takeWhile(array, predicate) {
        return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
      }
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      var unionBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
      });
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });
      function uniq(array) {
        return array && array.length ? baseUniq(array) : [];
      }
      function uniqBy(array, iteratee2) {
        return array && array.length ? baseUniq(array, getIteratee(iteratee2, 2)) : [];
      }
      function uniqWith(array, comparator) {
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return array && array.length ? baseUniq(array, undefined$1, comparator) : [];
      }
      function unzip(array) {
        if (!(array && array.length)) {
          return [];
        }
        var length = 0;
        array = arrayFilter(array, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index2) {
          return arrayMap(array, baseProperty(index2));
        });
      }
      function unzipWith(array, iteratee2) {
        if (!(array && array.length)) {
          return [];
        }
        var result2 = unzip(array);
        if (iteratee2 == null) {
          return result2;
        }
        return arrayMap(result2, function(group) {
          return apply(iteratee2, undefined$1, group);
        });
      }
      var without = baseRest(function(array, values2) {
        return isArrayLikeObject(array) ? baseDifference(array, values2) : [];
      });
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });
      var xorBy = baseRest(function(arrays) {
        var iteratee2 = last(arrays);
        if (isArrayLikeObject(iteratee2)) {
          iteratee2 = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
      });
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == "function" ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });
      var zip = baseRest(unzip);
      function zipObject(props, values2) {
        return baseZipObject(props || [], values2 || [], assignValue);
      }
      function zipObjectDeep(props, values2) {
        return baseZipObject(props || [], values2 || [], baseSet);
      }
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined$1;
        iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined$1;
        return unzipWith(arrays, iteratee2);
      });
      function chain(value) {
        var result2 = lodash2(value);
        result2.__chain__ = true;
        return result2;
      }
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }
      function thru(value, interceptor) {
        return interceptor(value);
      }
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
          return baseAt(object, paths);
        };
        if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          "func": thru,
          "args": [interceptor],
          "thisArg": undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array) {
          if (length && !array.length) {
            array.push(undefined$1);
          }
          return array;
        });
      });
      function wrapperChain() {
        return chain(this);
      }
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length, value = done ? undefined$1 : this.__values__[this.__index__++];
        return { "done": done, "value": value };
      }
      function wrapperToIterator() {
        return this;
      }
      function wrapperPlant(value) {
        var result2, parent2 = this;
        while (parent2 instanceof baseLodash) {
          var clone2 = wrapperClone(parent2);
          clone2.__index__ = 0;
          clone2.__values__ = undefined$1;
          if (result2) {
            previous.__wrapped__ = clone2;
          } else {
            result2 = clone2;
          }
          var previous = clone2;
          parent2 = parent2.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result2;
      }
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            "func": thru,
            "args": [reverse],
            "thisArg": undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      var countBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          ++result2[key];
        } else {
          baseAssignValue(result2, key, 1);
        }
      });
      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }
      var find = createFind(findIndex);
      var findLast = createFind(findLastIndex);
      function flatMap(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), 1);
      }
      function flatMapDeep(collection, iteratee2) {
        return baseFlatten(map(collection, iteratee2), INFINITY);
      }
      function flatMapDepth(collection, iteratee2, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map(collection, iteratee2), depth);
      }
      function forEach(collection, iteratee2) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function forEachRight(collection, iteratee2) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee2, 3));
      }
      var groupBy = createAggregator(function(result2, value, key) {
        if (hasOwnProperty.call(result2, key)) {
          result2[key].push(value);
        } else {
          baseAssignValue(result2, key, [value]);
        }
      });
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
      }
      var invokeMap = baseRest(function(collection, path, args) {
        var index2 = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
        baseEach(collection, function(value) {
          result2[++index2] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result2;
      });
      var keyBy = createAggregator(function(result2, value, key) {
        baseAssignValue(result2, key, value);
      });
      function map(collection, iteratee2) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee2, 3));
      }
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }
      var partition = createAggregator(function(result2, value, key) {
        result2[key ? 0 : 1].push(value);
      }, function() {
        return [[], []];
      });
      function reduce(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
      }
      function reduceRight(collection, iteratee2, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
        return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
      }
      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }
      function sampleSize(collection, n, guard) {
        if (guard ? isIterateeCall(collection, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });
      var now = ctxNow || function() {
        return root.Date.now();
      };
      function after(n, func) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = func && n == null ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }
      function before(n, func) {
        var result2;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result2 = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result2;
        };
      }
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });
      var bindKey = baseRest(function(object, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object, partials, holders);
      });
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curry.placeholder;
        return result2;
      }
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result2.placeholder = curryRight.placeholder;
        return result2;
      }
      function debounce(func, wait, options) {
        var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
          leading = !!options.leading;
          maxing = "maxWait" in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        function invokeFunc(time) {
          var args = lastArgs, thisArg = lastThis;
          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result2 = func.apply(thisArg, args);
          return result2;
        }
        function leadingEdge(time) {
          lastInvokeTime = time;
          timerId = setTimeout2(timerExpired, wait);
          return leading ? invokeFunc(time) : result2;
        }
        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
          return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }
        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
          return lastCallTime === undefined$1 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
        }
        function timerExpired() {
          var time = now();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          timerId = setTimeout2(timerExpired, remainingWait(time));
        }
        function trailingEdge(time) {
          timerId = undefined$1;
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result2;
        }
        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }
        function flush() {
          return timerId === undefined$1 ? result2 : trailingEdge(now());
        }
        function debounced() {
          var time = now(), isInvoking = shouldInvoke(time);
          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;
          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              clearTimeout(timerId);
              timerId = setTimeout2(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout2(timerExpired, wait);
          }
          return result2;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }
      function memoize(func, resolver) {
        if (typeof func != "function" || resolver != null && typeof resolver != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
          if (cache.has(key)) {
            return cache.get(key);
          }
          var result2 = func.apply(this, args);
          memoized.cache = cache.set(key, result2) || cache;
          return result2;
        };
        memoized.cache = new (memoize.Cache || MapCache)();
        return memoized;
      }
      memoize.Cache = MapCache;
      function negate(predicate) {
        if (typeof predicate != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0:
              return !predicate.call(this);
            case 1:
              return !predicate.call(this, args[0]);
            case 2:
              return !predicate.call(this, args[0], args[1]);
            case 3:
              return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }
      function once(func) {
        return before(2, func);
      }
      var overArgs = castRest(function(func, transforms) {
        transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index2 = -1, length = nativeMin(args.length, funcsLength);
          while (++index2 < length) {
            args[index2] = transforms[index2].call(this, args[index2]);
          }
          return apply(func, this, args);
        });
      });
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });
      function rest(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start === undefined$1 ? start : toInteger(start);
        return baseRest(func, start);
      }
      function spread(func, start) {
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array = args[start], otherArgs = castSlice(args, 0, start);
          if (array) {
            arrayPush(otherArgs, array);
          }
          return apply(func, this, otherArgs);
        });
      }
      function throttle(func, wait, options) {
        var leading = true, trailing = true;
        if (typeof func != "function") {
          throw new TypeError2(FUNC_ERROR_TEXT);
        }
        if (isObject(options)) {
          leading = "leading" in options ? !!options.leading : leading;
          trailing = "trailing" in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
          "leading": leading,
          "maxWait": wait,
          "trailing": trailing
        });
      }
      function unary(func) {
        return ary(func, 1);
      }
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray(value) ? value : [value];
      }
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }
      function cloneWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }
      function conformsTo(object, source) {
        return source == null || baseConformsTo(object, source, keys(source));
      }
      function eq(value, other) {
        return value === other || value !== value && other !== other;
      }
      var gt = createRelationalOperation(baseGt);
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      var isArguments = baseIsArguments(function() {
        return arguments;
      }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
      };
      var isArray = Array2.isArray;
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
      }
      var isBuffer = nativeIsBuffer || stubFalse;
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
      }
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        var result2 = customizer ? customizer(value, other) : undefined$1;
        return result2 === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result2;
      }
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject(value);
      }
      function isFinite(value) {
        return typeof value == "number" && nativeIsFinite(value);
      }
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      function isInteger(value) {
        return typeof value == "number" && value == toInteger(value);
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == "object" || type == "function");
      }
      function isObjectLike(value) {
        return value != null && typeof value == "object";
      }
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }
      function isMatchWith(object, source, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return baseIsMatch(object, source, getMatchData(source), customizer);
      }
      function isNaN(value) {
        return isNumber(value) && value != +value;
      }
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error2(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }
      function isNull(value) {
        return value === null;
      }
      function isNil(value) {
        return value == null;
      }
      function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
      }
      function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
      }
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
      function isString(value) {
        return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
      }
      function isSymbol(value) {
        return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
      }
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
      function isUndefined(value) {
        return value === undefined$1;
      }
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      var lt = createRelationalOperation(baseLt);
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
        return func(value);
      }
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = value < 0 ? -1 : 1;
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }
      function toInteger(value) {
        var result2 = toFinite(value), remainder = result2 % 1;
        return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
      }
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }
      function toNumber(value) {
        if (typeof value == "number") {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = baseTrim(value);
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }
      function toSafeInteger(value) {
        return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
      }
      function toString(value) {
        return value == null ? "" : baseToString(value);
      }
      var assign = createAssigner(function(object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });
      var assignIn = createAssigner(function(object, source) {
        copyObject(source, keysIn(source), object);
      });
      var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
      });
      var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keys(source), object, customizer);
      });
      var at = flatRest(baseAt);
      function create(prototype, properties) {
        var result2 = baseCreate(prototype);
        return properties == null ? result2 : baseAssign(result2, properties);
      }
      var defaults = baseRest(function(object, sources) {
        object = Object2(object);
        var index2 = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }
        while (++index2 < length) {
          var source = sources[index2];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;
          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];
            if (value === undefined$1 || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
              object[key] = source[key];
            }
          }
        }
        return object;
      });
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });
      function findKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
      }
      function findLastKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
      }
      function forIn(object, iteratee2) {
        return object == null ? object : baseFor(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forInRight(object, iteratee2) {
        return object == null ? object : baseForRight(object, getIteratee(iteratee2, 3), keysIn);
      }
      function forOwn(object, iteratee2) {
        return object && baseForOwn(object, getIteratee(iteratee2, 3));
      }
      function forOwnRight(object, iteratee2) {
        return object && baseForOwnRight(object, getIteratee(iteratee2, 3));
      }
      function functions(object) {
        return object == null ? [] : baseFunctions(object, keys(object));
      }
      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn(object));
      }
      function get(object, path, defaultValue) {
        var result2 = object == null ? undefined$1 : baseGet(object, path);
        return result2 === undefined$1 ? defaultValue : result2;
      }
      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }
      var invert = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        result2[value] = key;
      }, constant(identity));
      var invertBy = createInverter(function(result2, value, key) {
        if (value != null && typeof value.toString != "function") {
          value = nativeObjectToString.call(value);
        }
        if (hasOwnProperty.call(result2, value)) {
          result2[value].push(key);
        } else {
          result2[value] = [key];
        }
      }, getIteratee);
      var invoke = baseRest(baseInvoke);
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }
      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }
      function mapKeys(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, iteratee2(value, key, object2), value);
        });
        return result2;
      }
      function mapValues(object, iteratee2) {
        var result2 = {};
        iteratee2 = getIteratee(iteratee2, 3);
        baseForOwn(object, function(value, key, object2) {
          baseAssignValue(result2, key, iteratee2(value, key, object2));
        });
        return result2;
      }
      var merge = createAssigner(function(object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });
      var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      });
      var omit = flatRest(function(object, paths) {
        var result2 = {};
        if (object == null) {
          return result2;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object, getAllKeysIn(object), result2);
        if (isDeep) {
          result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result2, paths[length]);
        }
        return result2;
      });
      function omitBy(object, predicate) {
        return pickBy(object, negate(getIteratee(predicate)));
      }
      var pick = flatRest(function(object, paths) {
        return object == null ? {} : basePick(object, paths);
      });
      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      function result(object, path, defaultValue) {
        path = castPath(path, object);
        var index2 = -1, length = path.length;
        if (!length) {
          length = 1;
          object = undefined$1;
        }
        while (++index2 < length) {
          var value = object == null ? undefined$1 : object[toKey(path[index2])];
          if (value === undefined$1) {
            index2 = length;
            value = defaultValue;
          }
          object = isFunction(value) ? value.call(object) : value;
        }
        return object;
      }
      function set(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }
      function setWith(object, path, value, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseSet(object, path, value, customizer);
      }
      var toPairs = createToPairs(keys);
      var toPairsIn = createToPairs(keysIn);
      function transform2(object, iteratee2, accumulator) {
        var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
        iteratee2 = getIteratee(iteratee2, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor() : [];
          } else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          } else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index2, object2) {
          return iteratee2(accumulator, value, index2, object2);
        });
        return accumulator;
      }
      function unset(object, path) {
        return object == null ? true : baseUnset(object, path);
      }
      function update3(object, path, updater) {
        return object == null ? object : baseUpdate(object, path, castFunction(updater));
      }
      function updateWith(object, path, updater, customizer) {
        customizer = typeof customizer == "function" ? customizer : undefined$1;
        return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
      }
      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }
      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn(object));
      }
      function clamp(number, lower, upper) {
        if (upper === undefined$1) {
          upper = lower;
          lower = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower !== undefined$1) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }
        return baseClamp(toNumber(number), lower, upper);
      }
      function inRange(number, start, end) {
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        number = toNumber(number);
        return baseInRange(number, start, end);
      }
      function random(lower, upper, floating) {
        if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == "boolean") {
            floating = upper;
            upper = undefined$1;
          } else if (typeof lower == "boolean") {
            floating = lower;
            lower = undefined$1;
          }
        }
        if (lower === undefined$1 && upper === undefined$1) {
          lower = 0;
          upper = 1;
        } else {
          lower = toFinite(lower);
          if (upper === undefined$1) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }
        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
        }
        return baseRandom(lower, upper);
      }
      var camelCase = createCompounder(function(result2, word, index2) {
        word = word.toLowerCase();
        return result2 + (index2 ? capitalize(word) : word);
      });
      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }
      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
      }
      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);
        var length = string.length;
        position = position === undefined$1 ? length : baseClamp(toInteger(position), 0, length);
        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }
      function escape(string) {
        string = toString(string);
        return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
      }
      function escapeRegExp(string) {
        string = toString(string);
        return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
      }
      var kebabCase = createCompounder(function(result2, word, index2) {
        return result2 + (index2 ? "-" : "") + word.toLowerCase();
      });
      var lowerCase = createCompounder(function(result2, word, index2) {
        return result2 + (index2 ? " " : "") + word.toLowerCase();
      });
      var lowerFirst = createCaseFirst("toLowerCase");
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
      }
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
      }
      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);
        var strLength = length ? stringSize(string) : 0;
        return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
      }
      function parseInt2(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
      }
      function repeat(string, n, guard) {
        if (guard ? isIterateeCall(string, n, guard) : n === undefined$1) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }
      function replace() {
        var args = arguments, string = toString(args[0]);
        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }
      var snakeCase = createCompounder(function(result2, word, index2) {
        return result2 + (index2 ? "_" : "") + word.toLowerCase();
      });
      function split(string, separator, limit) {
        if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString(string);
        if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }
      var startCase = createCompounder(function(result2, word, index2) {
        return result2 + (index2 ? " " : "") + upperFirst(word);
      });
      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }
      function template(string, options, guard) {
        var settings = lodash2.templateSettings;
        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);
        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
        var isEscaping, isEvaluating, index2 = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
        var reDelimiters = RegExp2((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
        var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);
          source += string.slice(index2, offset).replace(reUnescapedString, escapeStringChar);
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index2 = offset + match.length;
          return match;
        });
        source += "';\n";
        var variable = hasOwnProperty.call(options, "variable") && options.variable;
        if (!variable) {
          source = "with (obj) {\n" + source + "\n}\n";
        } else if (reForbiddenIdentifierChars.test(variable)) {
          throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
        }
        source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
        source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
        var result2 = attempt(function() {
          return Function2(importsKeys, sourceURL + "return " + source).apply(undefined$1, importsValues);
        });
        result2.source = source;
        if (isError(result2)) {
          throw result2;
        }
        return result2;
      }
      function toLower(value) {
        return toString(value).toLowerCase();
      }
      function toUpper(value) {
        return toString(value).toUpperCase();
      }
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return baseTrim(string);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
        return castSlice(strSymbols, start, end).join("");
      }
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.slice(0, trimmedEndIndex(string) + 1);
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
        return castSlice(strSymbols, 0, end).join("");
      }
      function trimStart(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, "");
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
        return castSlice(strSymbols, start).join("");
      }
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
        if (isObject(options)) {
          var separator = "separator" in options ? options.separator : separator;
          length = "length" in options ? toInteger(options.length) : length;
          omission = "omission" in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);
        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
        if (separator === undefined$1) {
          return result2 + omission;
        }
        if (strSymbols) {
          end += result2.length - end;
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match, substring = result2;
            if (!separator.global) {
              separator = RegExp2(separator.source, toString(reFlags.exec(separator)) + "g");
            }
            separator.lastIndex = 0;
            while (match = separator.exec(substring)) {
              var newEnd = match.index;
            }
            result2 = result2.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index2 = result2.lastIndexOf(separator);
          if (index2 > -1) {
            result2 = result2.slice(0, index2);
          }
        }
        return result2 + omission;
      }
      function unescape(string) {
        string = toString(string);
        return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
      }
      var upperCase = createCompounder(function(result2, word, index2) {
        return result2 + (index2 ? " " : "") + word.toUpperCase();
      });
      var upperFirst = createCaseFirst("toUpperCase");
      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined$1 : pattern;
        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error2(e);
        }
      });
      var bindAll = flatRest(function(object, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object, key, bind(object[key], object));
        });
        return object;
      });
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });
        return baseRest(function(args) {
          var index2 = -1;
          while (++index2 < length) {
            var pair = pairs[index2];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }
      function constant(value) {
        return function() {
          return value;
        };
      }
      function defaultTo(value, defaultValue) {
        return value == null || value !== value ? defaultValue : value;
      }
      var flow = createFlow();
      var flowRight = createFlow(true);
      function identity(value) {
        return value;
      }
      function iteratee(func) {
        return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
      }
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }
      var method = baseRest(function(path, args) {
        return function(object) {
          return baseInvoke(object, path, args);
        };
      });
      var methodOf = baseRest(function(object, args) {
        return function(path) {
          return baseInvoke(object, path, args);
        };
      });
      function mixin(object, source, options) {
        var props = keys(source), methodNames = baseFunctions(source, props);
        if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object;
          object = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain2 = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object[methodName] = func;
          if (isFunc) {
            object.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain2 || chainAll) {
                var result2 = object(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                actions.push({ "func": func, "args": arguments, "thisArg": object });
                result2.__chain__ = chainAll;
                return result2;
              }
              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }
        });
        return object;
      }
      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }
        return this;
      }
      function noop() {
      }
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }
      var over = createOver(arrayMap);
      var overEvery = createOver(arrayEvery);
      var overSome = createOver(arraySome);
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      function propertyOf(object) {
        return function(path) {
          return object == null ? undefined$1 : baseGet(object, path);
        };
      }
      var range = createRange();
      var rangeRight = createRange(true);
      function stubArray() {
        return [];
      }
      function stubFalse() {
        return false;
      }
      function stubObject() {
        return {};
      }
      function stubString() {
        return "";
      }
      function stubTrue() {
        return true;
      }
      function times(n, iteratee2) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index2 = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
        iteratee2 = getIteratee(iteratee2);
        n -= MAX_ARRAY_LENGTH;
        var result2 = baseTimes(length, iteratee2);
        while (++index2 < n) {
          iteratee2(index2);
        }
        return result2;
      }
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      var ceil = createRound("ceil");
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);
      var floor = createRound("floor");
      function max(array) {
        return array && array.length ? baseExtremum(array, identity, baseGt) : undefined$1;
      }
      function maxBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseGt) : undefined$1;
      }
      function mean(array) {
        return baseMean(array, identity);
      }
      function meanBy(array, iteratee2) {
        return baseMean(array, getIteratee(iteratee2, 2));
      }
      function min(array) {
        return array && array.length ? baseExtremum(array, identity, baseLt) : undefined$1;
      }
      function minBy(array, iteratee2) {
        return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseLt) : undefined$1;
      }
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);
      var round = createRound("round");
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);
      function sum(array) {
        return array && array.length ? baseSum(array, identity) : 0;
      }
      function sumBy(array, iteratee2) {
        return array && array.length ? baseSum(array, getIteratee(iteratee2, 2)) : 0;
      }
      lodash2.after = after;
      lodash2.ary = ary;
      lodash2.assign = assign;
      lodash2.assignIn = assignIn;
      lodash2.assignInWith = assignInWith;
      lodash2.assignWith = assignWith;
      lodash2.at = at;
      lodash2.before = before;
      lodash2.bind = bind;
      lodash2.bindAll = bindAll;
      lodash2.bindKey = bindKey;
      lodash2.castArray = castArray;
      lodash2.chain = chain;
      lodash2.chunk = chunk;
      lodash2.compact = compact;
      lodash2.concat = concat3;
      lodash2.cond = cond;
      lodash2.conforms = conforms;
      lodash2.constant = constant;
      lodash2.countBy = countBy;
      lodash2.create = create;
      lodash2.curry = curry;
      lodash2.curryRight = curryRight;
      lodash2.debounce = debounce;
      lodash2.defaults = defaults;
      lodash2.defaultsDeep = defaultsDeep;
      lodash2.defer = defer;
      lodash2.delay = delay;
      lodash2.difference = difference;
      lodash2.differenceBy = differenceBy;
      lodash2.differenceWith = differenceWith;
      lodash2.drop = drop;
      lodash2.dropRight = dropRight;
      lodash2.dropRightWhile = dropRightWhile;
      lodash2.dropWhile = dropWhile;
      lodash2.fill = fill;
      lodash2.filter = filter;
      lodash2.flatMap = flatMap;
      lodash2.flatMapDeep = flatMapDeep;
      lodash2.flatMapDepth = flatMapDepth;
      lodash2.flatten = flatten;
      lodash2.flattenDeep = flattenDeep;
      lodash2.flattenDepth = flattenDepth;
      lodash2.flip = flip;
      lodash2.flow = flow;
      lodash2.flowRight = flowRight;
      lodash2.fromPairs = fromPairs;
      lodash2.functions = functions;
      lodash2.functionsIn = functionsIn;
      lodash2.groupBy = groupBy;
      lodash2.initial = initial;
      lodash2.intersection = intersection;
      lodash2.intersectionBy = intersectionBy;
      lodash2.intersectionWith = intersectionWith;
      lodash2.invert = invert;
      lodash2.invertBy = invertBy;
      lodash2.invokeMap = invokeMap;
      lodash2.iteratee = iteratee;
      lodash2.keyBy = keyBy;
      lodash2.keys = keys;
      lodash2.keysIn = keysIn;
      lodash2.map = map;
      lodash2.mapKeys = mapKeys;
      lodash2.mapValues = mapValues;
      lodash2.matches = matches;
      lodash2.matchesProperty = matchesProperty;
      lodash2.memoize = memoize;
      lodash2.merge = merge;
      lodash2.mergeWith = mergeWith;
      lodash2.method = method;
      lodash2.methodOf = methodOf;
      lodash2.mixin = mixin;
      lodash2.negate = negate;
      lodash2.nthArg = nthArg;
      lodash2.omit = omit;
      lodash2.omitBy = omitBy;
      lodash2.once = once;
      lodash2.orderBy = orderBy;
      lodash2.over = over;
      lodash2.overArgs = overArgs;
      lodash2.overEvery = overEvery;
      lodash2.overSome = overSome;
      lodash2.partial = partial;
      lodash2.partialRight = partialRight;
      lodash2.partition = partition;
      lodash2.pick = pick;
      lodash2.pickBy = pickBy;
      lodash2.property = property;
      lodash2.propertyOf = propertyOf;
      lodash2.pull = pull;
      lodash2.pullAll = pullAll;
      lodash2.pullAllBy = pullAllBy;
      lodash2.pullAllWith = pullAllWith;
      lodash2.pullAt = pullAt;
      lodash2.range = range;
      lodash2.rangeRight = rangeRight;
      lodash2.rearg = rearg;
      lodash2.reject = reject;
      lodash2.remove = remove3;
      lodash2.rest = rest;
      lodash2.reverse = reverse;
      lodash2.sampleSize = sampleSize;
      lodash2.set = set;
      lodash2.setWith = setWith;
      lodash2.shuffle = shuffle;
      lodash2.slice = slice;
      lodash2.sortBy = sortBy;
      lodash2.sortedUniq = sortedUniq;
      lodash2.sortedUniqBy = sortedUniqBy;
      lodash2.split = split;
      lodash2.spread = spread;
      lodash2.tail = tail;
      lodash2.take = take;
      lodash2.takeRight = takeRight;
      lodash2.takeRightWhile = takeRightWhile;
      lodash2.takeWhile = takeWhile;
      lodash2.tap = tap;
      lodash2.throttle = throttle;
      lodash2.thru = thru;
      lodash2.toArray = toArray;
      lodash2.toPairs = toPairs;
      lodash2.toPairsIn = toPairsIn;
      lodash2.toPath = toPath;
      lodash2.toPlainObject = toPlainObject;
      lodash2.transform = transform2;
      lodash2.unary = unary;
      lodash2.union = union;
      lodash2.unionBy = unionBy;
      lodash2.unionWith = unionWith;
      lodash2.uniq = uniq;
      lodash2.uniqBy = uniqBy;
      lodash2.uniqWith = uniqWith;
      lodash2.unset = unset;
      lodash2.unzip = unzip;
      lodash2.unzipWith = unzipWith;
      lodash2.update = update3;
      lodash2.updateWith = updateWith;
      lodash2.values = values;
      lodash2.valuesIn = valuesIn;
      lodash2.without = without;
      lodash2.words = words;
      lodash2.wrap = wrap;
      lodash2.xor = xor;
      lodash2.xorBy = xorBy;
      lodash2.xorWith = xorWith;
      lodash2.zip = zip;
      lodash2.zipObject = zipObject;
      lodash2.zipObjectDeep = zipObjectDeep;
      lodash2.zipWith = zipWith;
      lodash2.entries = toPairs;
      lodash2.entriesIn = toPairsIn;
      lodash2.extend = assignIn;
      lodash2.extendWith = assignInWith;
      mixin(lodash2, lodash2);
      lodash2.add = add;
      lodash2.attempt = attempt;
      lodash2.camelCase = camelCase;
      lodash2.capitalize = capitalize;
      lodash2.ceil = ceil;
      lodash2.clamp = clamp;
      lodash2.clone = clone;
      lodash2.cloneDeep = cloneDeep;
      lodash2.cloneDeepWith = cloneDeepWith;
      lodash2.cloneWith = cloneWith;
      lodash2.conformsTo = conformsTo;
      lodash2.deburr = deburr;
      lodash2.defaultTo = defaultTo;
      lodash2.divide = divide;
      lodash2.endsWith = endsWith;
      lodash2.eq = eq;
      lodash2.escape = escape;
      lodash2.escapeRegExp = escapeRegExp;
      lodash2.every = every;
      lodash2.find = find;
      lodash2.findIndex = findIndex;
      lodash2.findKey = findKey;
      lodash2.findLast = findLast;
      lodash2.findLastIndex = findLastIndex;
      lodash2.findLastKey = findLastKey;
      lodash2.floor = floor;
      lodash2.forEach = forEach;
      lodash2.forEachRight = forEachRight;
      lodash2.forIn = forIn;
      lodash2.forInRight = forInRight;
      lodash2.forOwn = forOwn;
      lodash2.forOwnRight = forOwnRight;
      lodash2.get = get;
      lodash2.gt = gt;
      lodash2.gte = gte;
      lodash2.has = has;
      lodash2.hasIn = hasIn;
      lodash2.head = head;
      lodash2.identity = identity;
      lodash2.includes = includes;
      lodash2.indexOf = indexOf;
      lodash2.inRange = inRange;
      lodash2.invoke = invoke;
      lodash2.isArguments = isArguments;
      lodash2.isArray = isArray;
      lodash2.isArrayBuffer = isArrayBuffer;
      lodash2.isArrayLike = isArrayLike;
      lodash2.isArrayLikeObject = isArrayLikeObject;
      lodash2.isBoolean = isBoolean;
      lodash2.isBuffer = isBuffer;
      lodash2.isDate = isDate;
      lodash2.isElement = isElement;
      lodash2.isEmpty = isEmpty;
      lodash2.isEqual = isEqual;
      lodash2.isEqualWith = isEqualWith;
      lodash2.isError = isError;
      lodash2.isFinite = isFinite;
      lodash2.isFunction = isFunction;
      lodash2.isInteger = isInteger;
      lodash2.isLength = isLength;
      lodash2.isMap = isMap;
      lodash2.isMatch = isMatch;
      lodash2.isMatchWith = isMatchWith;
      lodash2.isNaN = isNaN;
      lodash2.isNative = isNative;
      lodash2.isNil = isNil;
      lodash2.isNull = isNull;
      lodash2.isNumber = isNumber;
      lodash2.isObject = isObject;
      lodash2.isObjectLike = isObjectLike;
      lodash2.isPlainObject = isPlainObject;
      lodash2.isRegExp = isRegExp;
      lodash2.isSafeInteger = isSafeInteger;
      lodash2.isSet = isSet;
      lodash2.isString = isString;
      lodash2.isSymbol = isSymbol;
      lodash2.isTypedArray = isTypedArray;
      lodash2.isUndefined = isUndefined;
      lodash2.isWeakMap = isWeakMap;
      lodash2.isWeakSet = isWeakSet;
      lodash2.join = join;
      lodash2.kebabCase = kebabCase;
      lodash2.last = last;
      lodash2.lastIndexOf = lastIndexOf;
      lodash2.lowerCase = lowerCase;
      lodash2.lowerFirst = lowerFirst;
      lodash2.lt = lt;
      lodash2.lte = lte;
      lodash2.max = max;
      lodash2.maxBy = maxBy;
      lodash2.mean = mean;
      lodash2.meanBy = meanBy;
      lodash2.min = min;
      lodash2.minBy = minBy;
      lodash2.stubArray = stubArray;
      lodash2.stubFalse = stubFalse;
      lodash2.stubObject = stubObject;
      lodash2.stubString = stubString;
      lodash2.stubTrue = stubTrue;
      lodash2.multiply = multiply;
      lodash2.nth = nth;
      lodash2.noConflict = noConflict;
      lodash2.noop = noop;
      lodash2.now = now;
      lodash2.pad = pad;
      lodash2.padEnd = padEnd;
      lodash2.padStart = padStart;
      lodash2.parseInt = parseInt2;
      lodash2.random = random;
      lodash2.reduce = reduce;
      lodash2.reduceRight = reduceRight;
      lodash2.repeat = repeat;
      lodash2.replace = replace;
      lodash2.result = result;
      lodash2.round = round;
      lodash2.runInContext = runInContext2;
      lodash2.sample = sample;
      lodash2.size = size;
      lodash2.snakeCase = snakeCase;
      lodash2.some = some;
      lodash2.sortedIndex = sortedIndex;
      lodash2.sortedIndexBy = sortedIndexBy;
      lodash2.sortedIndexOf = sortedIndexOf;
      lodash2.sortedLastIndex = sortedLastIndex;
      lodash2.sortedLastIndexBy = sortedLastIndexBy;
      lodash2.sortedLastIndexOf = sortedLastIndexOf;
      lodash2.startCase = startCase;
      lodash2.startsWith = startsWith;
      lodash2.subtract = subtract;
      lodash2.sum = sum;
      lodash2.sumBy = sumBy;
      lodash2.template = template;
      lodash2.times = times;
      lodash2.toFinite = toFinite;
      lodash2.toInteger = toInteger;
      lodash2.toLength = toLength;
      lodash2.toLower = toLower;
      lodash2.toNumber = toNumber;
      lodash2.toSafeInteger = toSafeInteger;
      lodash2.toString = toString;
      lodash2.toUpper = toUpper;
      lodash2.trim = trim;
      lodash2.trimEnd = trimEnd;
      lodash2.trimStart = trimStart;
      lodash2.truncate = truncate;
      lodash2.unescape = unescape;
      lodash2.uniqueId = uniqueId;
      lodash2.upperCase = upperCase;
      lodash2.upperFirst = upperFirst;
      lodash2.each = forEach;
      lodash2.eachRight = forEachRight;
      lodash2.first = head;
      mixin(lodash2, function() {
        var source = {};
        baseForOwn(lodash2, function(func, methodName) {
          if (!hasOwnProperty.call(lodash2.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }(), { "chain": false });
      lodash2.VERSION = VERSION;
      arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
        lodash2[methodName].placeholder = lodash2;
      });
      arrayEach(["drop", "take"], function(methodName, index2) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);
          var result2 = this.__filtered__ && !index2 ? new LazyWrapper(this) : this.clone();
          if (result2.__filtered__) {
            result2.__takeCount__ = nativeMin(n, result2.__takeCount__);
          } else {
            result2.__views__.push({
              "size": nativeMin(n, MAX_ARRAY_LENGTH),
              "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
            });
          }
          return result2;
        };
        LazyWrapper.prototype[methodName + "Right"] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });
      arrayEach(["filter", "map", "takeWhile"], function(methodName, index2) {
        var type = index2 + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
        LazyWrapper.prototype[methodName] = function(iteratee2) {
          var result2 = this.clone();
          result2.__iteratees__.push({
            "iteratee": getIteratee(iteratee2, 3),
            "type": type
          });
          result2.__filtered__ = result2.__filtered__ || isFilter;
          return result2;
        };
      });
      arrayEach(["head", "last"], function(methodName, index2) {
        var takeName = "take" + (index2 ? "Right" : "");
        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });
      arrayEach(["initial", "tail"], function(methodName, index2) {
        var dropName = "drop" + (index2 ? "" : "Right");
        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });
      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };
      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };
      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };
      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == "function") {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });
      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };
      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);
        var result2 = this;
        if (result2.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result2);
        }
        if (start < 0) {
          result2 = result2.takeRight(-start);
        } else if (start) {
          result2 = result2.drop(start);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
        }
        return result2;
      };
      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };
      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash2[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
        if (!lodashFunc) {
          return;
        }
        lodash2.prototype[methodName] = function() {
          var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
          var interceptor = function(value2) {
            var result3 = lodashFunc.apply(lodash2, arrayPush([value2], args));
            return isTaker && chainAll ? result3[0] : result3;
          };
          if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result2 = func.apply(value, args);
            result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined$1 });
            return new LodashWrapper(result2, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result2 = this.thru(interceptor);
          return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
        };
      });
      arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
        var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
        lodash2.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value2) {
            return func.apply(isArray(value2) ? value2 : [], args);
          });
        };
      });
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash2[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + "";
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ "name": methodName, "func": lodashFunc });
        }
      });
      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        "name": "wrapper",
        "func": undefined$1
      }];
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;
      lodash2.prototype.at = wrapperAt;
      lodash2.prototype.chain = wrapperChain;
      lodash2.prototype.commit = wrapperCommit;
      lodash2.prototype.next = wrapperNext;
      lodash2.prototype.plant = wrapperPlant;
      lodash2.prototype.reverse = wrapperReverse;
      lodash2.prototype.toJSON = lodash2.prototype.valueOf = lodash2.prototype.value = wrapperValue;
      lodash2.prototype.first = lodash2.prototype.head;
      if (symIterator) {
        lodash2.prototype[symIterator] = wrapperToIterator;
      }
      return lodash2;
    };
    var _ = runInContext();
    if (freeModule) {
      (freeModule.exports = _)._ = _;
      freeExports._ = _;
    } else {
      root._ = _;
    }
  }).call(commonjsGlobal);
})(lodash, lodash.exports);
var ActiveTabKeys;
(function(ActiveTabKeys2) {
  ActiveTabKeys2["EDIT"] = "EDIT";
  ActiveTabKeys2["MOBILE"] = "MOBILE";
  ActiveTabKeys2["PC"] = "PC";
})(ActiveTabKeys || (ActiveTabKeys = {}));
const BlocksContext = React.createContext({
  initialized: false,
  setInitialized: () => {
  },
  focusIdx: getPageIdx(),
  setFocusIdx: () => {
  },
  dragEnabled: false,
  setDragEnabled: () => {
  },
  collapsed: false,
  setCollapsed: () => {
  },
  activeTab: ActiveTabKeys.EDIT,
  setActiveTab: () => {
  },
  isPreview: false
});
const BlocksProvider = (props) => {
  const [focusIdx, setFocusIdx] = useState(getPageIdx());
  const [dragEnabled, setDragEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState(props.defaultActiveTab || ActiveTabKeys.EDIT);
  const onChangeTab = useCallback((handler) => {
    if (lodash.exports.isFunction(handler)) {
      setActiveTab((currentTab) => {
        const nextTab = handler(currentTab);
        const next = EventManager.exec(EventType.ACTIVE_TAB_CHANGE, {
          currentTab,
          nextTab
        });
        if (next)
          return nextTab;
        return currentTab;
      });
    }
    setActiveTab((currentTab) => {
      let nextTab = handler;
      const next = EventManager.exec(EventType.ACTIVE_TAB_CHANGE, {
        currentTab,
        nextTab
      });
      if (next)
        return nextTab;
      return currentTab;
    });
  }, []);
  return /* @__PURE__ */ React.createElement(BlocksContext.Provider, {
    value: {
      initialized,
      setInitialized,
      focusIdx,
      setFocusIdx,
      dragEnabled,
      setDragEnabled,
      collapsed,
      setCollapsed,
      activeTab,
      setActiveTab: onChangeTab,
      isPreview: props.isPreview
    }
  }, props.children);
};
const HoverIdxContext = React.createContext({
  hoverIdx: "",
  direction: "",
  isDragging: false,
  dataTransfer: null,
  setHoverIdx: () => {
  },
  setIsDragging: () => {
  },
  setDirection: () => {
  },
  setDataTransfer: () => {
  }
});
const HoverIdxProvider = (props) => {
  const [hoverIdx, setHoverIdx] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dataTransfer, setDataTransfer] = useState(null);
  const [direction, setDirection] = useState("");
  return /* @__PURE__ */ React.createElement(HoverIdxContext.Provider, {
    value: {
      dataTransfer,
      setDataTransfer,
      hoverIdx,
      setHoverIdx,
      isDragging,
      setIsDragging,
      direction,
      setDirection
    }
  }, props.children);
};
const defaultMergeTagGenerate = (m) => `{{${m}}}`;
const EditorPropsContext = React.createContext({
  height: "100vh",
  fontList: [],
  onAddCollection: void 0,
  onRemoveCollection: void 0,
  onUploadImage: void 0,
  autoComplete: false,
  dashed: true,
  mergeTagGenerate: defaultMergeTagGenerate,
  enabledLogic: false,
  jsonReadOnly: false,
  mjmlReadOnly: false
});
const PropsProvider = (props) => {
  const { dashed = true, mergeTagGenerate = defaultMergeTagGenerate } = props;
  const formatProps = useMemo(() => {
    return __spreadProps(__spreadValues({}, props), {
      mergeTagGenerate,
      dashed
    });
  }, [mergeTagGenerate, props, dashed]);
  return /* @__PURE__ */ React.createElement(EditorPropsContext.Provider, {
    value: formatProps
  }, props.children);
};
function useRefState(state) {
  const ref = useRef(state);
  ref.current = state;
  return ref;
}
const MAX_RECORD_SIZE = 50;
const RecordContext = React.createContext({
  records: [],
  redo: () => {
  },
  undo: () => {
  },
  reset: () => {
  },
  redoable: false,
  undoable: false
});
const RecordProvider = (props) => {
  const formState = useFormState();
  const [data, setData] = useState([]);
  const [index2, setIndex] = useState(-1);
  const indexRef = useRefState(index2);
  const statusRef = useRef(void 0);
  const currentData = useRef();
  if (index2 >= 0 && data.length > 0) {
    currentData.current = data[index2];
  }
  const form = useForm();
  const value = useMemo(() => {
    return {
      records: data,
      redo: () => {
        const nextIndex = Math.min(MAX_RECORD_SIZE - 1, index2 + 1, data.length - 1);
        statusRef.current = "redo";
        setIndex(nextIndex);
        form.reset(data[nextIndex]);
      },
      undo: () => {
        const prevIndex = Math.max(0, index2 - 1);
        statusRef.current = "undo";
        setIndex(prevIndex);
        form.reset(data[prevIndex]);
      },
      reset: () => {
        form.reset();
      },
      undoable: index2 > 0,
      redoable: index2 < data.length - 1
    };
  }, [data, form, index2]);
  useEffect(() => {
    if (statusRef.current === "redo" || statusRef.current === "undo") {
      statusRef.current = void 0;
      return;
    }
    const currentItem = currentData.current;
    const isChanged = !(currentItem && lodash.exports.isEqual(formState.values.content, currentItem.content) && formState.values.subTitle === currentItem.subTitle && formState.values.subTitle === currentItem.subTitle);
    if (isChanged) {
      currentData.current = formState.values;
      statusRef.current = "add";
      setData((oldData) => {
        const list = oldData.slice(0, indexRef.current + 1);
        const newData = [...list, lodash.exports.cloneDeep(formState.values)].slice(-MAX_RECORD_SIZE);
        return newData;
      });
      setIndex(Math.min(indexRef.current + 1, MAX_RECORD_SIZE - 1));
    }
  }, [formState, indexRef]);
  return /* @__PURE__ */ React.createElement(RecordContext.Provider, {
    value
  }, props.children);
};
const ScrollContext = React.createContext({
  scrollHeight: { current: 0 },
  viewElementRef: { current: null }
});
const ScrollProvider = (props) => {
  const scrollHeight = useRef(0);
  const viewElementRef = useRef(null);
  return /* @__PURE__ */ React.createElement(ScrollContext.Provider, {
    value: {
      scrollHeight,
      viewElementRef
    }
  }, props.children);
};
var setFieldTouched = function setFieldTouched2(args, state) {
  var name = args[0], touched = args[1];
  var field = state.fields[name];
  if (field) {
    field.touched = !!touched;
  }
};
function useFocusIdx() {
  const { focusIdx, setFocusIdx } = useContext(BlocksContext);
  return {
    focusIdx,
    setFocusIdx
  };
}
const getBlockNodeByChildEle = (target) => {
  var _a;
  if (!target)
    return null;
  if ((_a = target.classList) == null ? void 0 : _a.contains("email-block")) {
    return target;
  }
  if (target.parentNode) {
    return getBlockNodeByChildEle(target.parentNode);
  }
  return null;
};
const getEditorRoot = () => document.getElementById("VisualEditorEditMode");
const getShadowRoot = () => {
  var _a;
  return (_a = getEditorRoot()) == null ? void 0 : _a.shadowRoot;
};
const getBlockNodes = () => {
  var _a;
  return Array.from(((_a = getShadowRoot()) == null ? void 0 : _a.querySelectorAll(".email-block")) || []);
};
const getBlockNodeByIdx = (idx) => {
  if (!idx)
    return null;
  const idxClassName = getNodeIdxClassName(idx);
  const node = getBlockNodes().find((item) => {
    var _a;
    return (_a = item.classList) == null ? void 0 : _a.contains(idxClassName);
  });
  return node;
};
function getDirectionPosition(ev, deviation = 10) {
  const target = ev.target;
  const blockNode = getBlockNodeByChildEle(target);
  const position = {
    horizontal: {
      direction: "",
      isEdge: false
    },
    vertical: {
      direction: "",
      isEdge: false
    }
  };
  if (!blockNode)
    return position;
  const { top, height, left, width } = blockNode.getBoundingClientRect();
  const mouseY = ev.clientY;
  const mouseX = ev.clientX;
  if (mouseY - top <= 0.5 * height) {
    position.vertical.direction = "top";
    if (Math.abs(top - mouseY) <= deviation) {
      position.vertical.isEdge = true;
    }
  } else {
    position.vertical.direction = "bottom";
    if (Math.abs(top + height - mouseY) <= deviation) {
      position.vertical.isEdge = true;
    }
  }
  if (mouseX - left <= 0.5 * width) {
    position.horizontal.direction = "left";
    if (Math.abs(left - mouseX) <= deviation) {
      position.horizontal.isEdge = true;
    }
  } else {
    position.horizontal.direction = "right";
    if (Math.abs(left + width - mouseX) <= deviation) {
      position.horizontal.isEdge = true;
    }
  }
  return position;
}
const FIXED_CONTAINER_ID = "FIXED_CONTAINER_ID";
const EASY_EMAIL_EDITOR_ID = "easy-email-editor";
const PLUGINS_CONTAINER_ID = "easy-email-plugins";
const SYNC_SCROLL_ELEMENT_CLASS_NAME = "easy-email-sync-scroll";
const RICH_TEXT_BAR_ID = "easy-email-rich-text-bar";
const DATA_RENDER_COUNT = "data-render-count";
const DATA_ATTRIBUTE_ID = "data-tree-node-id";
const DATA_ATTRIBUTE_INDEX = "data-tree-node-index";
const DATA_ATTRIBUTE_DROP_CONTAINER = "data-drop-container";
const DATA_CONTENT_EDITABLE_TYPE = "data-content_editable-type";
const DATA_CONTENT_EDITABLE_IDX = "data-content_editable-idx";
const CONTENT_EDITABLE_CLASS_NAME = "easy-email-content_editable_text_only";
const CONTENT_EDITABLE_RICH_TEXT_CLASS_NAME = "easy-email-content_editable_rich_text";
var ContentEditableType;
(function(ContentEditableType2) {
  ContentEditableType2["RichText"] = "rich_text";
  ContentEditableType2["Text"] = "text";
})(ContentEditableType || (ContentEditableType = {}));
const getPluginElement = () => {
  var _a, _b;
  return (_b = (_a = getEditorRoot()) == null ? void 0 : _a.shadowRoot) == null ? void 0 : _b.getElementById(PLUGINS_CONTAINER_ID);
};
function scrollBlockEleIntoView({ idx }) {
  setTimeout(() => {
    const editBlock = getBlockNodeByIdx(idx);
    editBlock == null ? void 0 : editBlock.scrollIntoView({
      block: "center",
      behavior: "smooth"
    });
  }, 50);
}
function isTextBlock(blockType) {
  return blockType === BasicType.TEXT || blockType === AdvancedType.TEXT;
}
const transform = (text, id) => {
  return text.replace(/{{([\s\S]+?)}}/g, (_, $1) => {
    const input = document.createElement("input");
    input.className = "easy-email-merge-tag";
    input.value = $1;
    input.type = "button";
    if (id) {
      input.id = id;
    }
    return input.outerHTML;
  });
};
class MergeTagBadge {
  static transform(content, id) {
    const loop = (node) => {
      if (node instanceof HTMLElement) {
        if (node.textContent === node.innerHTML) {
          node.innerHTML = transform(node.innerHTML, id);
        } else {
          [...node.childNodes].forEach(loop);
        }
      } else {
        if (node.nodeType === 3 && node.textContent) {
          const div = document.createElement("div");
          div.innerHTML = transform(node.textContent, id);
          node.replaceWith(...div.childNodes);
        }
      }
    };
    const container = document.createElement("div");
    container.innerHTML = content;
    [...container.childNodes].forEach(loop);
    return container.innerHTML;
  }
  static revert(content, generateMergeTag) {
    const container = document.createElement("div");
    container.innerHTML = content;
    container.querySelectorAll(".easy-email-merge-tag").forEach((item) => {
      var _a;
      (_a = item.parentNode) == null ? void 0 : _a.replaceChild(document.createTextNode(generateMergeTag(item.value)), item);
    });
    return container.innerHTML;
  }
}
function getContentEditableType(type) {
  return `node-contenteditable-type-${type}`;
}
function getContentEditableTypeFromClassName(classList) {
  var _a;
  const arr = Array.from(lodash.exports.isString(classList) ? classList.split(" ") : classList);
  return ((_a = arr.find((item) => item.includes("node-contenteditable-type-"))) == null ? void 0 : _a.replace("node-contenteditable-type-", "")) || "";
}
function getContentEditableIdx(idx) {
  return `node-contenteditable-idx-${idx}`;
}
function getContentEditableIdxFromClassName(classList) {
  var _a;
  const arr = Array.from(lodash.exports.isString(classList) ? classList.split(" ") : classList);
  return ((_a = arr.find((item) => item.includes("node-contenteditable-idx-"))) == null ? void 0 : _a.replace("node-contenteditable-idx-", "")) || "";
}
function getContentEditableClassName(blockType, idx) {
  return [getContentEditableType(blockType), getContentEditableIdx(idx)];
}
function useEditorContext() {
  const formState = useFormState();
  const helpers = useForm();
  const { initialized, setInitialized } = useContext(BlocksContext);
  const { content } = formState.values;
  return {
    formState,
    formHelpers: helpers,
    initialized,
    setInitialized,
    pageData: content
  };
}
const FocusBlockLayoutContext = React.createContext({
  focusBlockNode: null
});
const FocusBlockLayoutProvider = (props) => {
  const [focusBlockNode, setFocusBlockNode] = useState(null);
  const { initialized } = useEditorContext();
  const { focusIdx } = useFocusIdx();
  const focusIdxRef = useRefState(focusIdx);
  const root = useMemo(() => {
    var _a;
    return initialized ? (_a = getShadowRoot()) == null ? void 0 : _a.querySelector(`[${DATA_RENDER_COUNT}]`) : null;
  }, [initialized]);
  useEffect(() => {
    if (!root)
      return;
    let lastCount = "0";
    const ms = new MutationObserver(() => {
      const currentCount = root.getAttribute(DATA_RENDER_COUNT);
      if (lastCount !== currentCount) {
        lastCount = currentCount;
        const ele = getBlockNodeByIdx(focusIdxRef.current);
        if (ele) {
          setFocusBlockNode(ele);
        }
      }
    });
    ms.observe(root, {
      attributeFilter: [DATA_RENDER_COUNT]
    });
    return () => {
      ms.disconnect();
    };
  }, [focusIdxRef, root]);
  useEffect(() => {
    if (!root)
      return;
    if (focusIdx) {
      root.setAttribute(DATA_RENDER_COUNT, (+new Date()).toString());
    }
  }, [focusIdx, root]);
  const value = useMemo(() => {
    return {
      focusBlockNode
    };
  }, [focusBlockNode]);
  return /* @__PURE__ */ React.createElement(FocusBlockLayoutContext.Provider, {
    value
  }, props.children);
};
function useEditorProps() {
  return useContext(EditorPropsContext);
}
function useLazyState(state, debounceTime) {
  const [lazyState, setLazyState] = useState(state);
  const setDebounceLazyState = useCallback(lodash.exports.debounce((s) => {
    setLazyState(s);
  }, debounceTime), []);
  useEffect(() => {
    setDebounceLazyState(state);
  }, [setDebounceLazyState, state]);
  return lazyState;
}
const domParser$1 = new DOMParser();
function getChildSelector$1(selector, index2) {
  return `${selector}-${index2}`;
}
function HtmlStringToPreviewReactNodes(content) {
  let doc = domParser$1.parseFromString(content, "text/html");
  const reactNode = /* @__PURE__ */ React.createElement(RenderReactNode$1, {
    selector: "0",
    node: doc.documentElement,
    index: 0
  });
  return reactNode;
}
const RenderReactNode$1 = React.memo(function({
  node,
  index: index2,
  selector
}) {
  var _a;
  const attributes = {
    "data-selector": selector
  };
  (_a = node.getAttributeNames) == null ? void 0 : _a.call(node).forEach((att) => {
    if (att) {
      attributes[att] = node.getAttribute(att) || "";
    }
  });
  if (node.nodeType === Node.COMMENT_NODE)
    return /* @__PURE__ */ React.createElement(React.Fragment, null);
  if (node.nodeType === Node.TEXT_NODE) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, node.textContent);
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();
    if (tagName === "meta")
      return /* @__PURE__ */ React.createElement(React.Fragment, null);
    if (tagName === "style") {
      return React.createElement(tagName, __spreadProps(__spreadValues({
        key: index2
      }, attributes), {
        dangerouslySetInnerHTML: { __html: node.textContent }
      }));
    }
    getNodeTypeFromClassName(node.classList);
    if (attributes["data-contenteditable"] === "true") {
      return React.createElement(tagName, __spreadProps(__spreadValues({
        key: performance.now()
      }, attributes), {
        style: getStyle$1(node.getAttribute("style")),
        dangerouslySetInnerHTML: { __html: node.innerHTML }
      }));
    }
    const reactNode = React.createElement(tagName, __spreadProps(__spreadValues({
      key: index2
    }, attributes), {
      style: getStyle$1(node.getAttribute("style")),
      children: node.childNodes.length === 0 ? null : [...node.childNodes].map((n, i) => /* @__PURE__ */ React.createElement(RenderReactNode$1, {
        selector: getChildSelector$1(selector, i),
        key: i,
        node: n,
        index: i
      }))
    }));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, reactNode);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null);
});
function getStyle$1(styleText) {
  if (!styleText)
    return void 0;
  return styleText.split(";").reduceRight((a, b) => {
    const arr = b.split(/\:(?!\/)/);
    if (arr.length < 2)
      return a;
    a[lodash.exports.camelCase(arr[0])] = arr[1];
    return a;
  }, {});
}
const MOBILE_WIDTH$1 = 320;
const PreviewEmailContext = React.createContext({
  html: "",
  reactNode: null,
  errMsg: "",
  mobileWidth: 320
});
const PreviewEmailProvider = (props) => {
  const { current: iframe } = useRef(document.createElement("iframe"));
  const contentWindowRef = useRef(null);
  const [mobileWidth, setMobileWidth] = useState(MOBILE_WIDTH$1);
  const { pageData } = useEditorContext();
  const { onBeforePreview, mergeTags, previewInjectData } = useEditorProps();
  const [errMsg, setErrMsg] = useState("");
  const [html, setHtml] = useState("");
  const lazyPageData = useLazyState(pageData, 0);
  const injectData = useMemo(() => {
    if (previewInjectData) {
      return previewInjectData;
    }
    if (mergeTags)
      return mergeTags;
    return {};
  }, [mergeTags, previewInjectData]);
  useEffect(() => {
    const breakpoint = parseInt(lazyPageData.data.value.breakpoint || "0");
    let adjustBreakPoint = breakpoint;
    if (breakpoint > 360) {
      adjustBreakPoint = Math.max(mobileWidth + 1, breakpoint);
    }
    const cloneData = __spreadProps(__spreadValues({}, lazyPageData), {
      data: __spreadProps(__spreadValues({}, lazyPageData.data), {
        value: __spreadProps(__spreadValues({}, lazyPageData.data.value), {
          breakpoint: adjustBreakPoint + "px"
        })
      })
    });
    let parseHtml = mjml(JsonToMjml({
      data: cloneData,
      mode: "production",
      context: cloneData,
      dataSource: lodash.exports.cloneDeep(injectData),
      keepClassName: true
    })).html;
    if (onBeforePreview) {
      try {
        const result = onBeforePreview(parseHtml, injectData);
        if (lodash.exports.isString(result)) {
          parseHtml = result;
          setHtml(parseHtml);
        } else {
          result.then((resHtml) => {
            parseHtml = resHtml;
            setHtml(parseHtml);
          });
        }
        setErrMsg("");
      } catch (error) {
        setErrMsg((error == null ? void 0 : error.message) || error);
      }
    } else {
      setHtml(parseHtml);
    }
  }, [injectData, onBeforePreview, lazyPageData, mobileWidth]);
  const htmlNode = useMemo(() => HtmlStringToPreviewReactNodes(html), [html]);
  useEffect(() => {
    if (errMsg)
      return;
    iframe.width = "400px";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.onload = (evt) => {
      var _a;
      contentWindowRef.current = (_a = evt.target) == null ? void 0 : _a.contentWindow;
    };
    document.body.appendChild(iframe);
  }, [errMsg, html, iframe]);
  useEffect(() => {
    if (!contentWindowRef.current)
      return;
    const innerBody = contentWindowRef.current.document.body;
    innerBody.innerHTML = html;
    const a = innerBody.querySelector(".mjml-body");
    if (a) {
      a.style.display = "inline-block";
      setMobileWidth(Math.max(a.clientWidth, MOBILE_WIDTH$1));
    }
  }, [html]);
  const value = useMemo(() => {
    return {
      reactNode: htmlNode,
      html,
      errMsg,
      mobileWidth
    };
  }, [errMsg, html, htmlNode, mobileWidth]);
  return /* @__PURE__ */ React.createElement(PreviewEmailContext.Provider, {
    value
  }, props.children);
};
const LanguageProvider = (props) => {
  const [count2, setCount] = useState(0);
  I18nManager.setLocaleData(props.locale || {});
  window.t = t$1;
  useEffect(() => {
    setCount((c) => c + 1);
  }, [props.locale]);
  return useMemo(() => {
    return /* @__PURE__ */ React.createElement(React.Fragment, {
      key: count2
    }, props.children);
  }, [count2, props.children]);
};
const EmailEditorProvider = (props) => {
  const {
    data,
    children,
    onSubmit = () => {
    },
    validationSchema,
    defaultActiveTab,
    isPreview
  } = props;
  const initialValues = useMemo(() => {
    return {
      subject: data.subject,
      subTitle: data.subTitle,
      content: data.content
    };
  }, [data]);
  if (!initialValues.content)
    return null;
  return /* @__PURE__ */ React.createElement(Form, {
    initialValues,
    onSubmit,
    enableReinitialize: true,
    validate: validationSchema,
    mutators: __spreadProps(__spreadValues({}, mutators), { setFieldTouched }),
    subscription: { submitting: true, pristine: true }
  }, () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(PropsProvider, __spreadValues({}, props), /* @__PURE__ */ React.createElement(LanguageProvider, {
    locale: props.locale
  }, /* @__PURE__ */ React.createElement(PreviewEmailProvider, null, /* @__PURE__ */ React.createElement(RecordProvider, null, /* @__PURE__ */ React.createElement(BlocksProvider, {
    defaultActiveTab,
    isPreview
  }, /* @__PURE__ */ React.createElement(HoverIdxProvider, null, /* @__PURE__ */ React.createElement(ScrollProvider, null, /* @__PURE__ */ React.createElement(FocusBlockLayoutProvider, null, /* @__PURE__ */ React.createElement(FormWrapper, {
    children
  }))))))))), /* @__PURE__ */ React.createElement(RegisterFields, null)));
};
function FormWrapper({ children }) {
  const data = useFormState();
  const helper = useForm();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, children(data, helper));
}
const RegisterFields = React.memo(() => {
  const { touched } = useFormState();
  const [touchedMap, setTouchedMap] = useState({});
  useEffect(() => {
    if (touched) {
      Object.keys(touched).filter((key) => touched[key]).forEach((key) => {
        setTouchedMap((obj) => {
          obj[key] = true;
          return __spreadValues({}, obj);
        });
      });
    }
  }, [touched]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, Object.keys(touchedMap).map((key) => {
    return /* @__PURE__ */ React.createElement(RegisterField, {
      key,
      name: key
    });
  }));
});
function RegisterField({ name }) {
  useField(name);
  return /* @__PURE__ */ React.createElement(React.Fragment, null);
}
function useHoverIdx() {
  const {
    hoverIdx,
    setHoverIdx,
    setIsDragging,
    isDragging,
    setDirection,
    direction
  } = useContext(HoverIdxContext);
  const setHoverIdxDebounce = useCallback(lodash.exports.debounce(setHoverIdx), [setHoverIdx]);
  const setDirectionDebounce = useCallback(lodash.exports.debounce(setDirection), [
    setDirection
  ]);
  return {
    hoverIdx,
    setHoverIdx: setHoverIdxDebounce,
    isDragging,
    setIsDragging,
    direction,
    setDirection: setDirectionDebounce
  };
}
function useDataTransfer() {
  const { dataTransfer, setDataTransfer } = useContext(HoverIdxContext);
  const setDataTransferDebounce = useCallback(lodash.exports.debounce(setDataTransfer), [
    setDataTransfer
  ]);
  return useMemo(() => ({
    dataTransfer,
    setDataTransfer: setDataTransferDebounce
  }), [dataTransfer, setDataTransferDebounce]);
}
function useBlock() {
  const {
    formState: { values },
    formHelpers: { getState, change }
  } = useEditorContext();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const { autoComplete } = useEditorProps();
  const focusBlock = lodash.exports.get(values, focusIdx);
  const { redo, undo, redoable, undoable, reset } = useContext(RecordContext);
  const addBlock = useCallback((params) => {
    console.time();
    let { type, parentIdx, positionIndex, payload } = params;
    let nextFocusIdx;
    const values2 = lodash.exports.cloneDeep(getState().values);
    const parent = lodash.exports.get(values2, parentIdx);
    if (!parent) {
      console.error(`Invalid ${type} block`);
      return;
    }
    let child = createBlockDataByType(type, payload);
    if (typeof positionIndex === "undefined") {
      positionIndex = parent.children.length;
    }
    nextFocusIdx = `${parentIdx}.children.[${positionIndex}]`;
    const block = BlockManager.getBlockByType(type);
    if (!block) {
      console.error(`Invalid ${type} block`);
      return;
    }
    const parentBlock = BlockManager.getBlockByType(parent.type);
    if (autoComplete) {
      const autoCompletePaths = BlockManager.getAutoCompletePath(type, parent.type);
      if (autoCompletePaths) {
        autoCompletePaths.forEach((item) => {
          child = createBlockDataByType(item, {
            children: [child]
          });
          nextFocusIdx += ".children.[0]";
        });
      }
    }
    if (params.canReplace) {
      const parentIndex = getIndexByIdx(parentIdx);
      const upParent = getParentByIdx(values2, parentIdx);
      if (upParent) {
        upParent.children.splice(parentIndex, 1, child);
        return change(getParentIdx(parentIdx), __spreadValues({}, upParent));
      }
    }
    const fixedBlock = BlockManager.getBlockByType(child.type);
    if (!(fixedBlock == null ? void 0 : fixedBlock.validParentType.includes(parent.type))) {
      console.error(`${block.type} cannot be used inside ${parentBlock.type}, only inside: ${block.validParentType.join(", ")}`);
      return;
    }
    parent.children.splice(positionIndex, 0, child);
    console.timeLog();
    change(parentIdx, parent);
    setFocusIdx(nextFocusIdx);
    scrollBlockEleIntoView({
      idx: nextFocusIdx
    });
    console.timeEnd();
  }, [autoComplete, change, getState, setFocusIdx]);
  const moveBlock = useCallback((sourceIdx, destinationIdx) => {
    if (sourceIdx === destinationIdx)
      return null;
    let nextFocusIdx;
    const values2 = lodash.exports.cloneDeep(getState().values);
    const source = getValueByIdx(values2, sourceIdx);
    const sourceParentIdx = getParentIdx(sourceIdx);
    const destinationParentIdx = getParentIdx(destinationIdx);
    if (!sourceParentIdx || !destinationParentIdx)
      return;
    const sourceParent = getValueByIdx(values2, sourceParentIdx);
    const destinationParent = getValueByIdx(values2, destinationParentIdx);
    const sourceIndex = getIndexByIdx(sourceIdx);
    let [removed] = sourceParent.children.splice(sourceIndex, 1);
    if (autoComplete) {
      const autoCompletePaths = BlockManager.getAutoCompletePath(source.type, destinationParent.type);
      if (autoCompletePaths) {
        autoCompletePaths.forEach((item) => {
          removed = createBlockDataByType(item, {
            children: [removed]
          });
          nextFocusIdx += ".children.[0]";
        });
      } else {
        console.error("Something when wrong");
      }
    }
    const positionIndex = getIndexByIdx(destinationIdx);
    if (sourceParent === destinationParent) {
      destinationParent.children.splice(positionIndex, 0, removed);
      nextFocusIdx = destinationParentIdx + `.children.[${destinationParent.children.findIndex((item) => item === removed)}]`;
    } else {
      destinationParent.children.splice(positionIndex, 0, removed);
      nextFocusIdx = destinationIdx;
    }
    change(getPageIdx(), __spreadValues({}, values2.content));
    setTimeout(() => {
      setFocusIdx(nextFocusIdx);
    }, 50);
    scrollBlockEleIntoView({
      idx: nextFocusIdx
    });
  }, [autoComplete, change, getState, setFocusIdx]);
  const copyBlock = useCallback((idx) => {
    let nextFocusIdx;
    const values2 = lodash.exports.cloneDeep(getState().values);
    const parentIdx = getParentIdx(idx);
    if (!parentIdx)
      return;
    const parent = lodash.exports.get(values2, getParentIdx(idx) || "");
    if (!parent) {
      console.error("Invalid block");
      return;
    }
    const copyBlock2 = lodash.exports.cloneDeep(lodash.exports.get(values2, idx));
    const index2 = getIndexByIdx(idx) + 1;
    parent.children.splice(index2, 0, copyBlock2);
    change(parentIdx, parent);
    nextFocusIdx = `${parentIdx}.children.[${index2}]`;
    setFocusIdx(nextFocusIdx);
  }, [change, getState, setFocusIdx]);
  const removeBlock = useCallback((idx) => {
    let nextFocusIdx;
    const values2 = lodash.exports.cloneDeep(getState().values);
    const block = getValueByIdx(values2, idx);
    if (!block) {
      console.error("Invalid block");
      return;
    }
    const parentIdx = getParentIdx(idx);
    const parent = lodash.exports.get(values2, getParentIdx(idx) || "");
    const blockIndex = getIndexByIdx(idx);
    if (!parentIdx || !parent) {
      if (block.type === BasicType.PAGE) {
        console.error("Page node can not remove");
        return;
      }
      console.error("Invalid block");
      return;
    }
    nextFocusIdx = parentIdx;
    parent.children.splice(blockIndex, 1);
    change(parentIdx, parent);
    setFocusIdx(nextFocusIdx);
  }, [change, getState, setFocusIdx]);
  const setValueByIdx = useCallback(lodash.exports.debounce((idx, newVal) => {
    change(idx, __spreadValues({}, newVal));
  }), [change]);
  const isExistBlock = useCallback((idx) => {
    return Boolean(lodash.exports.get(values, idx));
  }, [values]);
  const setFocusBlock = useCallback(lodash.exports.debounce((val) => {
    change(focusIdx, __spreadValues({}, val));
  }), [focusBlock, focusIdx, change]);
  const setFocusBlockValue = useCallback(lodash.exports.debounce((val) => {
    if (!focusBlock)
      return;
    focusBlock.data.value = val;
    change(focusIdx, __spreadValues({}, focusBlock));
  }), [focusBlock, focusIdx]);
  return {
    values,
    change,
    focusBlock,
    setFocusBlock,
    setFocusBlockValue,
    setValueByIdx,
    addBlock,
    moveBlock,
    copyBlock,
    removeBlock,
    isExistBlock,
    redo,
    undo,
    reset,
    redoable,
    undoable
  };
}
const BlockAvatarWrapper = (props) => {
  const { type, children, payload, action = "add", idx } = props;
  const { addBlock, moveBlock, values } = useBlock();
  const { setIsDragging, setHoverIdx } = useHoverIdx();
  const { setDataTransfer, dataTransfer } = useDataTransfer();
  const ref = useRef(null);
  const onDragStart = useCallback((ev) => {
    if (action === "add") {
      setDataTransfer({
        type,
        action,
        payload
      });
    } else {
      setDataTransfer({
        type,
        action,
        sourceIdx: idx
      });
    }
    setIsDragging(true);
  }, [action, idx, payload, setDataTransfer, setIsDragging, type]);
  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setHoverIdx("");
    if (!dataTransfer)
      return;
    if (action === "add" && !lodash.exports.isUndefined(dataTransfer.parentIdx)) {
      addBlock({
        type,
        parentIdx: dataTransfer.parentIdx,
        positionIndex: dataTransfer.positionIndex,
        payload
      });
    } else {
      if (idx && !lodash.exports.isUndefined(dataTransfer.sourceIdx) && !lodash.exports.isUndefined(dataTransfer.parentIdx) && !lodash.exports.isUndefined(dataTransfer.positionIndex)) {
        moveBlock(dataTransfer.sourceIdx, getChildIdx(dataTransfer.parentIdx, dataTransfer.positionIndex));
      }
    }
  }, [
    action,
    addBlock,
    idx,
    moveBlock,
    dataTransfer,
    payload,
    setHoverIdx,
    setIsDragging,
    type
  ]);
  useEffect(() => {
    const ele = ref.current;
    if (!ele)
      return;
    ele.addEventListener("dragend", onDragEnd);
    return () => {
      ele.removeEventListener("dragend", onDragEnd);
    };
  }, [onDragEnd]);
  return /* @__PURE__ */ React.createElement("div", {
    style: { cursor: "grab" },
    ref,
    onMouseDown: () => {
      var _a;
      (_a = window.getSelection()) == null ? void 0 : _a.removeAllRanges();
    },
    "data-type": type,
    onDragStart,
    draggable: true
  }, children);
};
function classNames(...classes) {
  return classes.filter((item) => !!item).join(" ");
}
function variationName(name, value) {
  return `${name}${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
function wrapWithComponent(element, Component, props) {
  if (element == null) {
    return null;
  }
  return isElementOfType(element, Component) ? element : /* @__PURE__ */ React.createElement(Component, __spreadValues({}, props), element);
}
const isComponent = (AComponent, AnotherComponent) => AComponent === AnotherComponent;
function isElementOfType(element, Component) {
  var _a;
  if (element == null || !isValidElement(element) || typeof element.type === "string") {
    return false;
  }
  const { type: defaultType } = element;
  const overrideType = (_a = element.props) == null ? void 0 : _a.__type__;
  const type = overrideType || defaultType;
  const Components = Array.isArray(Component) ? Component : [Component];
  return Components.some((AComponent) => typeof type !== "string" && isComponent(AComponent, type));
}
function elementChildren(children, predicate = () => true) {
  return Children.toArray(children).filter((child) => isValidElement(child) && predicate(child));
}
const Stack$1 = "_Stack_1jdgv_1";
const Item$1 = "_Item_1jdgv_8";
const noWrap = "_noWrap_1jdgv_14";
const spacingNone = "_spacingNone_1jdgv_18";
const spacingExtraTight = "_spacingExtraTight_1jdgv_28";
const spacingTight = "_spacingTight_1jdgv_38";
const spacingLoose = "_spacingLoose_1jdgv_48";
const spacingExtraLoose = "_spacingExtraLoose_1jdgv_58";
const distributionLeading = "_distributionLeading_1jdgv_68";
const distributionTrailing = "_distributionTrailing_1jdgv_72";
const distributionCenter = "_distributionCenter_1jdgv_76";
const distributionEqualSpacing = "_distributionEqualSpacing_1jdgv_80";
const distributionFill = "_distributionFill_1jdgv_84";
const distributionFillEvenly = "_distributionFillEvenly_1jdgv_88";
const alignmentLeading = "_alignmentLeading_1jdgv_98";
const alignmentTrailing = "_alignmentTrailing_1jdgv_102";
const alignmentCenter = "_alignmentCenter_1jdgv_106";
const alignmentFill = "_alignmentFill_1jdgv_110";
const alignmentBaseline = "_alignmentBaseline_1jdgv_114";
const vertical = "_vertical_1jdgv_118";
const ItemFill = "_Item-fill_1jdgv_131";
var styles$2 = {
  Stack: Stack$1,
  Item: Item$1,
  noWrap,
  spacingNone,
  spacingExtraTight,
  spacingTight,
  spacingLoose,
  spacingExtraLoose,
  distributionLeading,
  distributionTrailing,
  distributionCenter,
  distributionEqualSpacing,
  distributionFill,
  distributionFillEvenly,
  alignmentLeading,
  alignmentTrailing,
  alignmentCenter,
  alignmentFill,
  alignmentBaseline,
  vertical,
  "Item-fill": "_Item-fill_1jdgv_131",
  ItemFill
};
function Item({ children, fill }) {
  const className = classNames(styles$2.Item, fill && styles$2["Item-fill"]);
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, children);
}
const Stack = memo(function Stack2({
  children,
  vertical: vertical2,
  spacing,
  distribution,
  alignment,
  wrap
}) {
  const className = classNames(styles$2.Stack, vertical2 && styles$2.vertical, spacing && styles$2[variationName("spacing", spacing)], distribution && styles$2[variationName("distribution", distribution)], alignment && styles$2[variationName("alignment", alignment)], wrap === false && styles$2.noWrap);
  const itemMarkup = elementChildren(children).map((child, index2) => {
    const props = { key: index2 };
    return wrapWithComponent(child, Item, props);
  });
  return /* @__PURE__ */ React.createElement("div", {
    className
  }, itemMarkup);
});
Stack.Item = Item;
function classnames(...rest) {
  return rest.filter((item) => typeof item === "string").join(" ");
}
function IconFont(props) {
  var _a;
  return /* @__PURE__ */ React.createElement("div", {
    title: props.title,
    onClick: props.onClick,
    onClickCapture: props.onClickCapture,
    style: __spreadProps(__spreadValues({
      cursor: "pointer",
      pointerEvents: "auto",
      color: "inherit"
    }, props.style), {
      fontSize: props.size || ((_a = props.style) == null ? void 0 : _a.fontSize)
    }),
    className: classnames("iconfont", props.iconName)
  });
}
var index$2 = "";
const Button = (props) => {
  return /* @__PURE__ */ React.createElement("button", {
    onClick: props.onClick,
    className: classnames("easy-email-editor-button", props.noBorder && "easy-email-editor-noBorder"),
    title: props.title,
    disabled: props.disabled,
    type: "button"
  }, props.children);
};
function ToolsPanel() {
  const { redo, undo, redoable, undoable } = useBlock();
  return /* @__PURE__ */ React.createElement(Stack, null, /* @__PURE__ */ React.createElement(Button, {
    title: t("undo"),
    disabled: !undoable,
    onClick: undo
  }, /* @__PURE__ */ React.createElement(IconFont, {
    iconName: "icon-undo",
    style: {
      cursor: "inherit",
      opacity: undoable ? 1 : 0.75
    }
  })), /* @__PURE__ */ React.createElement(Button, {
    title: t("redo"),
    disabled: !redoable,
    onClick: redo
  }, /* @__PURE__ */ React.createElement(IconFont, {
    iconName: "icon-redo",
    style: {
      cursor: "inherit",
      opacity: redoable ? 1 : 0.75
    }
  })), /* @__PURE__ */ React.createElement(Stack.Item, null));
}
function useActiveTab() {
  const { activeTab, setActiveTab } = useContext(BlocksContext);
  return {
    activeTab,
    setActiveTab
  };
}
function isButtonBlock(blockType) {
  return blockType === BasicType.BUTTON || blockType === AdvancedType.BUTTON;
}
function isNavbarBlock(blockType) {
  return blockType === BasicType.NAVBAR || blockType === AdvancedType.NAVBAR;
}
const domParser = new DOMParser();
const errLog = console.error;
function getChildSelector(selector, index2) {
  return `${selector}-${index2}`;
}
console.error = (message, ...optionalParams) => {
  if (typeof message === "string" && [
    "Unsupported vendor-prefixed style property",
    "validateDOMNesting",
    "Invalid DOM",
    "You provided a `checked` prop to a form field without an `onChange` handler"
  ].some((item) => message.includes(item)))
    ;
  else {
    errLog(message, ...optionalParams);
  }
};
function HtmlStringToReactNodes(content, option) {
  let doc = domParser.parseFromString(content, "text/html");
  [...doc.getElementsByTagName("a")].forEach((node) => {
    node.setAttribute("tabIndex", "-1");
  });
  [...doc.querySelectorAll(`.${MERGE_TAG_CLASS_NAME}`)].forEach((child) => {
    const editNode = child.querySelector("div");
    if (editNode) {
      if (option.enabledMergeTagsBadge) {
        editNode.innerHTML = MergeTagBadge.transform(editNode.innerHTML);
      }
    }
  });
  const reactNode = /* @__PURE__ */ React.createElement(RenderReactNode, {
    selector: "0",
    node: doc.documentElement,
    index: 0
  });
  return reactNode;
}
const RenderReactNode = React.memo(function({
  node,
  index: index2,
  selector
}) {
  var _a;
  let newNode = node;
  if (newNode.tagName === "HTML") {
    newNode.outerHTML = node.outerHTML.replace(/html/g, "div");
  }
  const attributes = {
    "data-selector": selector
  };
  (_a = newNode.getAttributeNames) == null ? void 0 : _a.call(newNode).forEach((att) => {
    if (att) {
      attributes[att] = newNode.getAttribute(att) || "";
    }
  });
  if (newNode.nodeType === Node.COMMENT_NODE)
    return /* @__PURE__ */ React.createElement(React.Fragment, null);
  if (newNode.nodeType === Node.TEXT_NODE) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, newNode.textContent);
  }
  if (newNode.nodeType === Node.ELEMENT_NODE) {
    const tagName = newNode.tagName.toLowerCase();
    if (tagName === "meta")
      return /* @__PURE__ */ React.createElement(React.Fragment, null);
    if (tagName === "style") {
      return createElement(tagName, __spreadProps(__spreadValues({
        key: index2
      }, attributes), {
        dangerouslySetInnerHTML: { __html: newNode.textContent }
      }));
    }
    const blockType = getNodeTypeFromClassName(newNode.classList);
    const idx = getNodeIdxFromClassName(newNode.classList);
    if (blockType) {
      if (idx) {
        makeStandardContentEditable(newNode, blockType, idx);
      }
      makeBlockNodeContentEditable(newNode);
    }
    if (attributes["contenteditable"] === "true") {
      return createElement(tagName, __spreadProps(__spreadValues({
        key: performance.now()
      }, attributes), {
        style: getStyle(newNode.getAttribute("style")),
        dangerouslySetInnerHTML: { __html: newNode.innerHTML }
      }));
    }
    const reactNode = createElement(tagName, __spreadProps(__spreadValues({
      key: index2
    }, attributes), {
      style: getStyle(newNode.getAttribute("style")),
      children: newNode.childNodes.length === 0 ? null : [...newNode.childNodes].map((n, i) => /* @__PURE__ */ React.createElement(RenderReactNode, {
        selector: getChildSelector(selector, i),
        key: i,
        node: n,
        index: i
      }))
    }));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, reactNode);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null);
});
function getStyle(styleText) {
  if (!styleText)
    return void 0;
  return styleText.split(";").reduceRight((a, b) => {
    const arr = b.split(/\:(?!\/)/);
    if (arr.length < 2)
      return a;
    a[lodash.exports.camelCase(arr[0])] = arr[1];
    return a;
  }, {});
}
function createElement(type, props) {
  if ((props == null ? void 0 : props.class) && props.class.includes("email-block")) {
    const blockType = getNodeTypeFromClassName(props.class);
    if (![BasicType.TEXT].includes(blockType)) {
      props.role = "tab";
      props.tabIndex = "0";
    }
    props.key = props.key + props.class;
  }
  return React.createElement(type, props);
}
function makeBlockNodeContentEditable(node) {
  if (!(node instanceof Element))
    return;
  const type = getContentEditableTypeFromClassName(node.classList);
  const idx = getContentEditableIdxFromClassName(node.classList);
  if (isTextBlock(type)) {
    const editNode = node.querySelector("div");
    if (editNode) {
      editNode.setAttribute("contentEditable", "true");
      editNode.setAttribute(DATA_CONTENT_EDITABLE_TYPE, ContentEditableType.RichText);
      editNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
    }
  } else if (isButtonBlock(type)) {
    const editNode = node.querySelector("a") || node.querySelector("p");
    if (editNode) {
      editNode.setAttribute("contentEditable", "true");
      editNode.setAttribute(DATA_CONTENT_EDITABLE_TYPE, ContentEditableType.Text);
      editNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
    }
  } else if (isNavbarBlock(type)) {
    node.setAttribute("contentEditable", "true");
    node.setAttribute(DATA_CONTENT_EDITABLE_TYPE, ContentEditableType.Text);
    node.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
  }
  node.childNodes.forEach(makeBlockNodeContentEditable);
}
function makeStandardContentEditable(node, blockType, idx) {
  if (isTextBlock(blockType) || isButtonBlock(blockType)) {
    node.classList.add(...getContentEditableClassName(blockType, `${idx}.data.value.content`));
  }
  if (isNavbarBlock(blockType)) {
    node.querySelectorAll(".mj-link").forEach((anchor, index2) => {
      anchor.classList.add(...getContentEditableClassName(blockType, `${idx}.data.value.links.${index2}.content`));
    });
  }
}
let count = 0;
function MjmlDomRender() {
  var _a;
  const { pageData: content } = useEditorContext();
  const [pageData, setPageData] = useState(null);
  const [ref, setRef] = useState(null);
  const { dashed, mergeTags, enabledMergeTagsBadge } = useEditorProps();
  const [isTextFocus, setIsTextFocus] = useState(false);
  const isTextFocusing = document.activeElement === getEditorRoot() && ((_a = getShadowRoot().activeElement) == null ? void 0 : _a.getAttribute("contenteditable")) === "true";
  useEffect(() => {
    if (!isTextFocus && !lodash.exports.isEqual(content, pageData)) {
      setPageData(lodash.exports.cloneDeep(content));
    }
  }, [content, pageData, setPageData, isTextFocus]);
  useEffect(() => {
    setIsTextFocus(isTextFocusing);
  }, [isTextFocusing]);
  useEffect(() => {
    const onClick = (e) => {
      var _a2;
      if ((_a2 = getEditorRoot()) == null ? void 0 : _a2.contains(e.target)) {
        return;
      }
      const fixedContainer = document.getElementById(FIXED_CONTAINER_ID);
      if (fixedContainer == null ? void 0 : fixedContainer.contains(e.target)) {
        return;
      }
      setIsTextFocus(false);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);
  useEffect(() => {
    const root = getShadowRoot();
    if (!root)
      return;
    const onClick = (e) => {
      var _a2;
      const isFocusing = ((_a2 = getShadowRoot().activeElement) == null ? void 0 : _a2.getAttribute("contenteditable")) === "true";
      if (isFocusing) {
        setIsTextFocus(true);
      }
    };
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
    };
  }, []);
  const html = useMemo(() => {
    var _a2, _b;
    if (!pageData)
      return "";
    const renderHtml = mjml(JsonToMjml({
      data: pageData,
      idx: getPageIdx(),
      context: pageData,
      mode: "testing",
      dataSource: lodash.exports.cloneDeep(mergeTags)
    })).html;
    const div = document.createElement("div");
    div.innerHTML = renderHtml;
    const elements = div.getElementsByTagName("html");
    while (elements[0])
      (_b = (_a2 = elements == null ? void 0 : elements[0]) == null ? void 0 : _a2.parentNode) == null ? void 0 : _b.removeChild(elements[0]);
    let parseHtml = div.innerHTML;
    return parseHtml;
  }, [mergeTags, pageData]);
  console.log(`mjmlDomRender `, html);
  return useMemo(() => {
    return /* @__PURE__ */ React.createElement("div", __spreadProps(__spreadValues({}, {
      [DATA_RENDER_COUNT]: count++
    }), {
      "data-dashed": dashed,
      ref: setRef,
      style: {
        outline: "none",
        position: "relative"
      },
      role: "tabpanel",
      tabIndex: 0
    }), ref && createPortal(HtmlStringToReactNodes(html, {
      enabledMergeTagsBadge: Boolean(enabledMergeTagsBadge)
    }), ref));
  }, [dashed, ref, html, enabledMergeTagsBadge]);
}
const verticalBlocks = [
  BasicType.SECTION,
  BasicType.GROUP,
  AdvancedType.SECTION,
  AdvancedType.GROUP
];
const isColumnBlock = (type) => [BasicType.COLUMN, AdvancedType.COLUMN].includes(type);
function getInsertPosition(params) {
  const { idx, dragType, directionPosition, context } = params;
  let parentData = getSameParent(context, idx, dragType);
  if (!parentData)
    return null;
  const directlyParent = getParentByIdx(context, idx);
  if (directlyParent) {
    if (directionPosition.vertical.isEdge) {
      const isTop = directionPosition.vertical.direction === "top" && getIndexByIdx(idx) === 0;
      const isBottom = directionPosition.vertical.direction === "bottom" && getIndexByIdx(idx) === directlyParent.children.length - 1;
      if (isTop || isBottom) {
        const prevParent = getParentByIdx(context, parentData.parentIdx);
        if (prevParent) {
          parentData = {
            parent: prevParent,
            parentIdx: getParentIdx(parentData.parentIdx)
          };
          if (isColumnBlock(parentData.parent.type)) {
            const sectionBlock = getParentByIdx(context, parentData.parentIdx);
            if (sectionBlock) {
              parentData = {
                parent: sectionBlock,
                parentIdx: getParentIdx(parentData.parentIdx)
              };
            }
          }
        }
      }
    } else if (directionPosition.horizontal.isEdge) {
      if (isColumnBlock(parentData.parent.type)) {
        const prevParent = getParentByIdx(context, parentData.parentIdx);
        if (prevParent) {
          const isLeft = directionPosition.horizontal.direction === "left";
          console.log("idx", parentData.parentIdx);
          return {
            parentIdx: getParentIdx(parentData.parentIdx),
            insertIndex: isLeft ? getIndexByIdx(parentData.parentIdx) : getIndexByIdx(parentData.parentIdx) + 1,
            endDirection: directionPosition.horizontal.direction,
            hoverIdx: parentData.parentIdx
          };
        }
      }
    }
  }
  const insertData = getInsetParentAndIndex(context, idx, parentData.parent.type, directionPosition);
  return insertData;
}
function getInsetParentAndIndex(context, idx, type, directionPosition) {
  let hoverIdx = idx;
  let prevIdx = "";
  let parentIdx = idx;
  while (parentIdx) {
    const parent = lodash.exports.get(context, parentIdx);
    if (parent && parent.type === type) {
      const { direction, valid, isEdge } = getValidDirection(parent.type, directionPosition);
      if (!valid)
        return null;
      const isVertical = verticalBlocks.includes(parent.type);
      if (isVertical && parent.children.length > 0) {
        const isTop = directionPosition.vertical.direction === "top";
        return {
          insertIndex: isTop ? getIndexByIdx(parentIdx) : getIndexByIdx(parentIdx) + 1,
          parentIdx: getParentIdx(parentIdx),
          endDirection: directionPosition.vertical.direction,
          hoverIdx: parentIdx
        };
      }
      let insertIndex = 0;
      let endDirection = direction;
      if (prevIdx) {
        const siblingIndex = getIndexByIdx(prevIdx);
        hoverIdx = getChildIdx(parentIdx, siblingIndex);
        if (parent.children.length > 0 && /(right)|(bottom)/.test(endDirection)) {
          insertIndex = siblingIndex + 1;
        } else {
          insertIndex = siblingIndex;
        }
      } else {
        if (parent.children.length === 0) {
          endDirection = "";
        }
        if (isVertical) {
          if (direction === "left") {
            insertIndex = 0;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, 0);
              endDirection = "left";
            }
          } else {
            insertIndex = parent.children.length;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, insertIndex - 1);
              endDirection = "right";
            }
          }
        } else {
          if (direction === "top") {
            insertIndex = 0;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, 0);
              endDirection = "top";
            }
          } else {
            insertIndex = parent.children.length;
            if (parent.children.length > 0) {
              hoverIdx = getChildIdx(parentIdx, insertIndex - 1);
              endDirection = "bottom";
            }
          }
        }
      }
      return {
        insertIndex,
        parentIdx,
        endDirection,
        hoverIdx
      };
    } else {
      prevIdx = parentIdx;
      parentIdx = getParentIdx(parentIdx);
    }
  }
  return null;
}
function getValidDirection(targetType, directionPosition) {
  const isVertical = verticalBlocks.includes(targetType);
  let direction = directionPosition.vertical.direction;
  let isEdge = directionPosition.vertical.isEdge;
  if (isVertical) {
    direction = directionPosition.horizontal.direction;
    isEdge = directionPosition.horizontal.isEdge;
  }
  return {
    valid: isVertical ? Boolean(directionPosition.horizontal.direction) : Boolean(directionPosition.vertical.direction),
    direction,
    isEdge
  };
}
function useDropBlock() {
  const [ref, setRef] = useState(null);
  const { values } = useBlock();
  const { autoComplete } = useEditorProps();
  const { dataTransfer, setDataTransfer } = useDataTransfer();
  const cacheValues = useRef(values);
  const cacheDataTransfer = useRef(dataTransfer);
  useEffect(() => {
    cacheValues.current = values;
  }, [values]);
  useEffect(() => {
    cacheDataTransfer.current = dataTransfer;
  }, [dataTransfer]);
  const { setFocusIdx, focusIdx } = useFocusIdx();
  const { setHoverIdx, setDirection, isDragging, hoverIdx, direction } = useHoverIdx();
  useEffect(() => {
    if (ref) {
      let target = null;
      const onMouseDown = (ev) => {
        target = ev.target;
      };
      const onClick = (ev) => {
        ev.preventDefault();
        if (target !== ev.target)
          return;
        if (ev.target instanceof Element) {
          const target2 = getBlockNodeByChildEle(ev.target);
          if (!target2)
            return;
          const idx = getNodeIdxFromClassName(target2.classList);
          setFocusIdx(idx);
        }
      };
      ref.addEventListener("mousedown", onMouseDown);
      ref.addEventListener("click", onClick);
      return () => {
        ref.removeEventListener("mousedown", onMouseDown);
        ref.removeEventListener("click", onClick);
      };
    }
  }, [ref, setFocusIdx]);
  useEffect(() => {
    if (ref) {
      let lastHoverTarget = null;
      let lastDragover = {
        target: null,
        valid: false
      };
      const onMouseover = (ev) => {
        if (lastHoverTarget === ev.target)
          return;
        lastHoverTarget = ev.target;
        const blockNode = getBlockNodeByChildEle(ev.target);
        if (blockNode) {
          const idx = getNodeIdxFromClassName(blockNode.classList);
          setHoverIdx(idx);
        }
      };
      const onDrop = (ev) => {
        lastDragover.target = null;
      };
      const onDragOver = (ev) => {
        if (!cacheDataTransfer.current)
          return;
        lastDragover.target = ev.target;
        lastDragover.valid = false;
        const blockNode = getBlockNodeByChildEle(ev.target);
        if (blockNode) {
          const directionPosition = getDirectionPosition(ev);
          const idx = getNodeIdxFromClassName(blockNode.classList);
          const positionData = getInsertPosition({
            context: cacheValues.current,
            idx,
            directionPosition,
            dragType: cacheDataTransfer.current.type
          });
          if (positionData) {
            ev.preventDefault();
            lastDragover.valid = true;
            setDataTransfer((dataTransfer2) => {
              return __spreadProps(__spreadValues({}, dataTransfer2), {
                parentIdx: positionData.parentIdx,
                positionIndex: positionData.insertIndex
              });
            });
            setDirection(positionData.endDirection);
            setHoverIdx(positionData.hoverIdx);
          }
        }
        if (!lastDragover.valid) {
          setDirection("");
          setHoverIdx("");
          setDataTransfer((dataTransfer2) => {
            return __spreadProps(__spreadValues({}, dataTransfer2), {
              parentIdx: void 0
            });
          });
        }
      };
      const onCheckDragLeave = (ev) => {
        const dropEleList = [
          ...document.querySelectorAll(`[${DATA_ATTRIBUTE_DROP_CONTAINER}="true"]`)
        ];
        const target = ev.target;
        const isDropContainer = dropEleList.some((ele) => ele.contains(target));
        if (!isDropContainer) {
          setDirection("");
          setHoverIdx("");
          setDataTransfer((dataTransfer2) => {
            return __spreadProps(__spreadValues({}, dataTransfer2), {
              parentIdx: void 0
            });
          });
        }
      };
      ref.addEventListener("mouseover", onMouseover);
      ref.addEventListener("drop", onDrop);
      ref.addEventListener("dragover", onDragOver);
      window.addEventListener("dragover", onCheckDragLeave);
      return () => {
        ref.removeEventListener("mouseover", onMouseover);
        ref.removeEventListener("drop", onDrop);
        ref.removeEventListener("dragover", onDragOver);
        window.removeEventListener("dragover", onCheckDragLeave);
      };
    }
  }, [
    autoComplete,
    cacheDataTransfer,
    ref,
    setDataTransfer,
    setDirection,
    setHoverIdx
  ]);
  useEffect(() => {
    if (!ref)
      return;
    const onMouseOut = (ev) => {
      if (!isDragging) {
        ev.stopPropagation();
        setHoverIdx("");
      }
    };
    ref.addEventListener("mouseout", onMouseOut);
    return () => {
      ref.removeEventListener("mouseout", onMouseOut);
    };
  }, [isDragging, ref, setHoverIdx]);
  useEffect(() => {
    if (ref) {
      ref.setAttribute("data-dragging", String(isDragging));
      ref.setAttribute("data-direction", direction || "none");
    }
  }, [direction, isDragging, ref]);
  useEffect(() => {
    if (ref) {
      ref.setAttribute("data-hoverIdx", hoverIdx);
    }
  }, [hoverIdx, ref]);
  useEffect(() => {
    if (ref) {
      ref.setAttribute("data-focusIdx", focusIdx);
    }
  }, [focusIdx, ref]);
  return useMemo(() => ({
    setRef
  }), [setRef]);
}
var lib = {};
Object.defineProperty(lib, "__esModule", {
  value: true
});
var IS_MAC = typeof window != "undefined" && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
var MODIFIERS = {
  alt: "altKey",
  control: "ctrlKey",
  meta: "metaKey",
  shift: "shiftKey"
};
var ALIASES = {
  add: "+",
  break: "pause",
  cmd: "meta",
  command: "meta",
  ctl: "control",
  ctrl: "control",
  del: "delete",
  down: "arrowdown",
  esc: "escape",
  ins: "insert",
  left: "arrowleft",
  mod: IS_MAC ? "meta" : "control",
  opt: "alt",
  option: "alt",
  return: "enter",
  right: "arrowright",
  space: " ",
  spacebar: " ",
  up: "arrowup",
  win: "meta",
  windows: "meta"
};
var CODES = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  control: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  escape: 27,
  " ": 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  arrowleft: 37,
  arrowup: 38,
  arrowright: 39,
  arrowdown: 40,
  insert: 45,
  delete: 46,
  meta: 91,
  numlock: 144,
  scrolllock: 145,
  ";": 186,
  "=": 187,
  ",": 188,
  "-": 189,
  ".": 190,
  "/": 191,
  "`": 192,
  "[": 219,
  "\\": 220,
  "]": 221,
  "'": 222
};
for (var f = 1; f < 20; f++) {
  CODES["f" + f] = 111 + f;
}
function isHotkey(hotkey, options, event) {
  if (options && !("byKey" in options)) {
    event = options;
    options = null;
  }
  if (!Array.isArray(hotkey)) {
    hotkey = [hotkey];
  }
  var array = hotkey.map(function(string) {
    return parseHotkey(string, options);
  });
  var check = function check2(e) {
    return array.some(function(object) {
      return compareHotkey(object, e);
    });
  };
  var ret = event == null ? check : check(event);
  return ret;
}
function isCodeHotkey(hotkey, event) {
  return isHotkey(hotkey, event);
}
function isKeyHotkey(hotkey, event) {
  return isHotkey(hotkey, { byKey: true }, event);
}
function parseHotkey(hotkey, options) {
  var byKey = options && options.byKey;
  var ret = {};
  hotkey = hotkey.replace("++", "+add");
  var values = hotkey.split("+");
  var length = values.length;
  for (var k in MODIFIERS) {
    ret[MODIFIERS[k]] = false;
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = void 0;
  try {
    for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var value = _step.value;
      var optional = value.endsWith("?") && value.length > 1;
      if (optional) {
        value = value.slice(0, -1);
      }
      var name = toKeyName(value);
      var modifier = MODIFIERS[name];
      if (value.length > 1 && !modifier && !ALIASES[value] && !CODES[name]) {
        throw new TypeError('Unknown modifier: "' + value + '"');
      }
      if (length === 1 || !modifier) {
        if (byKey) {
          ret.key = name;
        } else {
          ret.which = toKeyCode(value);
        }
      }
      if (modifier) {
        ret[modifier] = optional ? null : true;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  return ret;
}
function compareHotkey(object, event) {
  for (var key in object) {
    var expected = object[key];
    var actual = void 0;
    if (expected == null) {
      continue;
    }
    if (key === "key" && event.key != null) {
      actual = event.key.toLowerCase();
    } else if (key === "which") {
      actual = expected === 91 && event.which === 93 ? 91 : event.which;
    } else {
      actual = event[key];
    }
    if (actual == null && expected === false) {
      continue;
    }
    if (actual !== expected) {
      return false;
    }
  }
  return true;
}
function toKeyCode(name) {
  name = toKeyName(name);
  var code = CODES[name] || name.toUpperCase().charCodeAt(0);
  return code;
}
function toKeyName(name) {
  name = name.toLowerCase();
  name = ALIASES[name] || name;
  return name;
}
var _default = lib.default = isHotkey;
lib.isHotkey = isHotkey;
lib.isCodeHotkey = isCodeHotkey;
lib.isKeyHotkey = isKeyHotkey;
lib.parseHotkey = parseHotkey;
lib.compareHotkey = compareHotkey;
lib.toKeyCode = toKeyCode;
lib.toKeyName = toKeyName;
function isContentEditFocus() {
  var _a, _b, _c, _d, _e;
  const isShadowRootFocus = document.activeElement === getEditorRoot();
  if (isShadowRootFocus) {
    if (((_c = (_b = (_a = getEditorRoot()) == null ? void 0 : _a.shadowRoot) == null ? void 0 : _b.activeElement) == null ? void 0 : _c.getAttribute("contenteditable")) === "true") {
      return true;
    }
  } else {
    if (["input", "textarea"].includes(((_d = document.activeElement) == null ? void 0 : _d.tagName.toLocaleLowerCase()) || "") || ((_e = document.activeElement) == null ? void 0 : _e.getAttribute("contenteditable")) === "true") {
      return true;
    }
  }
  return false;
}
function useHotKeys() {
  const { redo, undo, removeBlock } = useBlock();
  const { focusIdx, setFocusIdx } = useFocusIdx();
  const {
    formState: { values }
  } = useEditorContext();
  getShadowRoot();
  useEffect(() => {
    const onKeyDown = (ev) => {
      if (isContentEditFocus())
        return;
      if (_default("mod+z", ev)) {
        ev.preventDefault();
        undo();
      }
      if (_default("mod+y", ev) || _default("mod+shift+z", ev)) {
        ev.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [redo, undo]);
  useEffect(() => {
    const onKeyDown = (ev) => {
      const isShadowRootFocus = document.activeElement === getEditorRoot();
      if (!isShadowRootFocus)
        return;
      if (isContentEditFocus())
        return;
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focusIdx, removeBlock]);
  useEffect(() => {
    const onKeyDown = (ev) => {
      const isShadowRootFocus = document.activeElement === getEditorRoot();
      if (!isShadowRootFocus)
        return;
      if (_default("tab", ev) || _default("shift+tab", ev)) {
        setTimeout(() => {
          const activeElement = getShadowRoot().activeElement;
          if (activeElement instanceof HTMLElement) {
            const blockNode = getBlockNodeByChildEle(activeElement);
            if (blockNode) {
              const idx = getNodeIdxFromClassName(blockNode.classList);
              setFocusIdx(idx);
            }
          }
        }, 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focusIdx, removeBlock, setFocusIdx, values]);
}
function useDomScrollHeight() {
  return useContext(ScrollContext);
}
const offsetTop = 50;
const SyncScrollShadowDom = (props) => {
  const [root, setRoot] = useState(null);
  const [ref, setRef] = useState(null);
  const { viewElementRef } = useDomScrollHeight();
  const { activeTab } = useActiveTab();
  const _a = props, { isActive } = _a, rest = __objRest(_a, ["isActive"]);
  const setFirstVisibleEle = useCallback(lodash.exports.debounce((root2) => {
    if (!root2.shadowRoot)
      return;
    const { left, width, top: containerTop } = root2.getBoundingClientRect();
    const ele = root2.shadowRoot.elementFromPoint(left + width / 2, containerTop + offsetTop);
    const findSelectorNode = (ele2) => {
      if (ele2.getAttribute("data-selector")) {
        return ele2;
      }
      if (ele2.parentNode instanceof Element) {
        return findSelectorNode(ele2.parentNode);
      }
      return null;
    };
    const selectorNode = ele && findSelectorNode(ele);
    viewElementRef.current = null;
    if (selectorNode) {
      const { top: selectorEleTop } = selectorNode.getBoundingClientRect();
      let selectorDiffTop = selectorEleTop - containerTop;
      const selector = selectorNode.getAttribute("data-selector");
      if (selector) {
        viewElementRef.current = {
          selector: selector || "",
          top: selectorDiffTop
        };
      }
    }
  }, 200), [viewElementRef]);
  useEffect(() => {
    if (!isActive || !root)
      return;
    const viewElement = viewElementRef.current;
    const scrollEle = root.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`);
    if (!scrollEle)
      return;
    if (viewElement) {
      const viewElementNode = root.querySelector(`[data-selector="${viewElement == null ? void 0 : viewElement.selector}"]`);
      if (viewElementNode && scrollEle) {
        viewElementNode.scrollIntoView();
        scrollEle.scrollTo(0, scrollEle.scrollTop - viewElement.top);
      }
    } else {
      scrollEle.scrollTo(0, 0);
    }
  }, [root, viewElementRef, activeTab, isActive]);
  useEffect(() => {
    if (ref) {
      const root2 = ref.attachShadow({ mode: "open" });
      setRoot(root2);
      if (!ref.shadowRoot)
        return;
      const onScroll = () => {
        if (!ref.shadowRoot)
          return;
        setFirstVisibleEle(ref);
      };
      ref.shadowRoot.addEventListener("scroll", onScroll, true);
      return () => {
        var _a2;
        (_a2 = ref.shadowRoot) == null ? void 0 : _a2.removeEventListener("scroll", onScroll, true);
      };
    }
  }, [ref, setFirstVisibleEle]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", __spreadProps(__spreadValues({}, rest), {
    ref: setRef
  }), root && ReactDOM.createPortal(props.children, root)));
};
var iconfontText = '@font-face{font-family:"iconfont";src:url(data:font/woff2;base64,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) format("woff2"),url(data:font/woff;base64,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) format("woff"),url(data:font/ttf;base64,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YwBvAG4AZgBvAG4AdABpAGMAbwBuAGYAbwBuAHQAVgBlAHIAcwBpAG8AbgAgADEALgAwAGkAYwBvAG4AZgBvAG4AdABHAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAHMAdgBnADIAdAB0AGYAIABmAHIAbwBtACAARgBvAG4AdABlAGwAbABvACAAcAByAG8AagBlAGMAdAAuAGgAdAB0AHAAOgAvAC8AZgBvAG4AdABlAGwAbABvAC4AYwBvAG0AAAIAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATwECAQMBBAEFAQYBBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQEyATMBNAE1ATYBNwE4ATkBOgE7ATwBPQE+AT8BQAFBAUIBQwFEAUUBRgFHAUgBSQFKAUsBTAFNAU4BTwFQAAVjbGVhcgxyZW1vdmUtY3ljbGUGcmVtb3ZlBGRhc2gHZGlzYWJsZQ5hcnJvd190b3ByaWdodAhkYXRhYmFzZQhiZy1jb2xvcgdoZWFkaW5nBGxvZ28HYWRkcmVzcwpmb250LWNvbG9yBHVuZG8EcmVkbwptZXJnZS10YWdzB2RpdmlkZXIGbGF5b3V0BmNvbHVtbgRwYWdlB2VsZW1lbnQFbGF5ZXIGdW5saW5rBWNsb3NlC2ZvbnQtZmFtaWx5BGJvbGQGaXRhbGljBGxpbmUNc3RyaWtldGhyb3VnaAl1bmRlcmxpbmUHbGlzdC1vbAdsaXN0LXVsCmFsaWduLWxlZnQMYWxpZ24tY2VudGVyC2FsaWduLXJpZ2h0BmVkaXRvcgZtb2JpbGUHZGVza3RvcARtb3JlDHRleHQtcm91bmRlZAZidXR0b24DZXllDWV5ZS1pbnZpc2libGULYm90dG9tLWxlZnQFZW1vamkEbGluawtsaW5lLWhlaWdodAVzdGFydAtiYWNrLXBhcmVudARtb3ZlBnNvY2lhbAhjYXJvdXNlbARoZXJvB3NwYWNpbmcJYWNjb3JkaW9uBm5hdmJhcgRodG1sA2RvdARkcmFnCWFkZC1jeWNsZQxtaW51cy1zcXVhcmULcGx1cy1zcXVhcmUFcmlnaHQEbGVmdARoZWxwBWdyb3VwAnVwBGRvd24Hd3JhcHBlcgZudW1iZXIDaW1nBHRleHQHc2VjdGlvbgNhZGQKY29sbGVjdGlvbgZkZWxldGUGYm90dG9tBGNvcHkDdG9wAAAAAAA=) format("truetype")}.iconfont{font-family:"iconfont"!important;font-size:16px;font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.icon-clear:before{content:"\\e6d3"}.icon-remove-cycle:before{content:"\\e604"}.icon-remove:before{content:"\\e709"}.icon-dash:before{content:"\\e7fc"}.icon-disable:before{content:"\\e638"}.icon-arrow_topright:before{content:"\\e6b4"}.icon-database:before{content:"\\e685"}.icon-bg-color:before{content:"\\e72c"}.icon-heading:before{content:"\\f00f"}.icon-logo:before{content:"\\e602"}.icon-address:before{content:"\\e62c"}.icon-font-color:before{content:"\\eb34"}.icon-undo:before{content:"\\e6f0"}.icon-redo:before{content:"\\e6f1"}.icon-merge-tags:before{content:"\\e608"}.icon-divider:before{content:"\\e609"}.icon-layout:before{content:"\\e600"}.icon-column:before{content:"\\e663"}.icon-page:before{content:"\\e643"}.icon-element:before{content:"\\ecb0"}.icon-layer:before{content:"\\e649"}.icon-unlink:before{content:"\\f314"}.icon-close:before{content:"\\e646"}.icon-font-family:before{content:"\\e648"}.icon-bold:before{content:"\\e7cc"}.icon-italic:before{content:"\\e7cf"}.icon-line:before{content:"\\e7fd"}.icon-strikethrough:before{content:"\\e7f9"}.icon-underline:before{content:"\\e911"}.icon-list-ol:before{content:"\\e76e"}.icon-list-ul:before{content:"\\e71d"}.icon-align-left:before{content:"\\e605"}.icon-align-center:before{content:"\\e642"}.icon-align-right:before{content:"\\eca2"}.icon-editor:before{content:"\\e6e8"}.icon-mobile:before{content:"\\e627"}.icon-desktop:before{content:"\\e842"}.icon-more:before{content:"\\e6cb"}.icon-text-rounded:before{content:"\\e6aa"}.icon-button:before{content:"\\ed65"}.icon-eye:before{content:"\\e78f"}.icon-eye-invisible:before{content:"\\e641"}.icon-bottom-left:before{content:"\\e6a4"}.icon-emoji:before{content:"\\e78d"}.icon-link:before{content:"\\e7e2"}.icon-line-height:before{content:"\\eaf1"}.icon-start:before{content:"\\e603"}.icon-back-parent:before{content:"\\e706"}.icon-move:before{content:"\\e6ff"}.icon-social:before{content:"\\e7a1"}.icon-carousel:before{content:"\\eb5c"}.icon-hero:before{content:"\\e69f"}.icon-spacing:before{content:"\\e606"}.icon-accordion:before{content:"\\ecbc"}.icon-navbar:before{content:"\\e800"}.icon-html:before{content:"\\e634"}.icon-dot:before{content:"\\e63f"}.icon-drag:before{content:"\\e8ec"}.icon-add-cycle:before{content:"\\e9d5"}.icon-minus-square:before{content:"\\e70b"}.icon-plus-square:before{content:"\\e732"}.icon-right:before{content:"\\e71c"}.icon-left:before{content:"\\e6ed"}.icon-help:before{content:"\\e752"}.icon-group:before{content:"\\ef7b"}.icon-up:before{content:"\\e65d"}.icon-down:before{content:"\\e624"}.icon-wrapper:before{content:"\\e677"}.icon-number:before{content:"\\e7f8"}.icon-img:before{content:"\\e61b"}.icon-text:before{content:"\\e695"}.icon-section:before{content:"\\e669"}.icon-add:before{content:"\\e647"}.icon-collection:before{content:"\\e601"}.icon-delete:before{content:"\\e625"}.icon-bottom:before{content:"\\e637"}.icon-copy:before{content:"\\e866"}.icon-top:before{content:"\\e640"}\n';
var styles$1 = ".mj-accordion-content{display:block!important}[data-dashed=true] .email-block{outline:1px dashed rgba(170,170,170,.7);outline-offset:-2px}.node-type-page{min-height:100%;padding-bottom:100px}.node-type-page *{user-select:none}:not(.email-block){-webkit-user-drag:none;cursor:default}.email-block:focus-visible,[contenteditable=true]{outline:none}\n";
function ShadowStyle() {
  const {
    interactiveStyle: {
      hoverColor = "rgb(var(--primary-4, #1890ff))",
      selectedColor = "rgb(var(--primary-6, #1890ff))"
    } = {}
  } = useEditorProps();
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, iconfontText), /* @__PURE__ */ React.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: `
            * {
              --hover-color: ${hoverColor};
              --selected-color: ${selectedColor};
            }

            :host(*){
              all: initial;
            }

            .shadow-container {
              overflow: overlay !important;
            }
            .shadow-container::-webkit-scrollbar {
              -webkit-appearance: none;
              width: 8px;
            }
            .shadow-container::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.5);
              box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
              -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
            }


            ${styles$1}

            `
    }
  }));
}
function EditEmailPreview() {
  useHotKeys();
  const [containerRef, setContainerRef] = useState(null);
  const { setRef } = useDropBlock();
  const { activeTab } = useActiveTab();
  const { setInitialized } = useEditorContext();
  useEffect(() => {
    setRef(containerRef);
  }, [containerRef, setRef]);
  useEffect(() => {
    if (containerRef) {
      setInitialized(true);
    }
  }, [containerRef, setInitialized]);
  return useMemo(() => /* @__PURE__ */ React.createElement(SyncScrollShadowDom, __spreadProps(__spreadValues({
    isActive: activeTab === ActiveTabKeys.EDIT,
    id: "VisualEditorEditMode"
  }, {
    [DATA_ATTRIBUTE_DROP_CONTAINER]: "true"
  }), {
    style: {
      height: "100%",
      zIndex: 10,
      position: "relative",
      outline: "none"
    }
  }), /* @__PURE__ */ React.createElement("div", {
    id: "easy-email-plugins",
    style: {
      position: "relative"
    }
  }), /* @__PURE__ */ React.createElement("div", {
    className: classnames("shadow-container", SYNC_SCROLL_ELEMENT_CLASS_NAME),
    style: {
      height: "100%",
      overflowY: "auto",
      zIndex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 40,
      paddingBottom: 40,
      boxSizing: "border-box"
    },
    ref: setContainerRef
  }, /* @__PURE__ */ React.createElement(MjmlDomRender, null)), /* @__PURE__ */ React.createElement(ShadowStyle, null)), [activeTab]);
}
var index$1 = "";
const Tabs = (props) => {
  const [activeTab, setActiveTab] = useState(props.defaultActiveTab || "");
  const onClick = useCallback((nextTab) => {
    var _a, _b;
    if (!props.onBeforeChange) {
      setActiveTab(nextTab);
      (_a = props.onChange) == null ? void 0 : _a.call(props, nextTab);
    }
    if (props.onBeforeChange) {
      const next = props.onBeforeChange(activeTab, nextTab);
      if (next) {
        setActiveTab(nextTab);
        (_b = props.onChange) == null ? void 0 : _b.call(props, nextTab);
      }
    }
  }, [activeTab, props]);
  useEffect(() => {
    if (props.activeTab) {
      setActiveTab(props.activeTab);
    }
  }, [props.activeTab]);
  return /* @__PURE__ */ React.createElement("div", {
    style: props.style,
    className: props.className
  }, /* @__PURE__ */ React.createElement("div", {
    className: "easy-email-editor-tabWrapper"
  }, /* @__PURE__ */ React.createElement(Stack, {
    distribution: "equalSpacing",
    alignment: "center"
  }, /* @__PURE__ */ React.createElement(Stack, {
    alignment: "center"
  }, React.Children.map(props.children, (item, index2) => {
    if (!item)
      return null;
    return /* @__PURE__ */ React.createElement("div", {
      key: item.key,
      onClick: () => onClick(item.key),
      className: classnames("easy-email-editor-tabItem", !activeTab && index2 === 0 && "easy-email-editor-tabActiveItem", activeTab === item.key && "easy-email-editor-tabActiveItem")
    }, /* @__PURE__ */ React.createElement(Button, {
      noBorder: true
    }, item.props.tab));
  })), props.tabBarExtraContent)), React.Children.map(props.children, (item, index2) => {
    if (!item)
      return null;
    const visible = !activeTab && index2 === 0 || item.key === activeTab;
    return /* @__PURE__ */ React.createElement("div", {
      style: {
        display: visible ? void 0 : "none",
        height: "calc(100% - 50px)"
      }
    }, item);
  }));
};
const TabPane = (props) => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, props.children);
};
var index = "";
var iconfont = "";
window.global = window;
const EmailEditor = ({ extraTop }) => {
  const { height: containerHeight } = useEditorProps();
  const { setActiveTab, activeTab } = useActiveTab();
  const { isPreview } = useContext(BlocksContext);
  const fixedContainer = useMemo(() => {
    return createPortal(/* @__PURE__ */ React.createElement("div", {
      id: FIXED_CONTAINER_ID
    }), document.body);
  }, []);
  const onBeforeChangeTab = useCallback((currentTab, nextTab) => {
    return EventManager.exec(EventType.ACTIVE_TAB_CHANGE, { currentTab, nextTab });
  }, []);
  const onChangeTab = useCallback((nextTab) => {
    setActiveTab(nextTab);
  }, [setActiveTab]);
  return useMemo(() => /* @__PURE__ */ React.createElement("div", {
    id: EASY_EMAIL_EDITOR_ID,
    style: {
      display: "flex",
      flex: "1",
      overflow: "hidden",
      justifyContent: "center",
      minWidth: 640,
      height: containerHeight
    }
  }, /* @__PURE__ */ React.createElement(Tabs, {
    activeTab,
    onBeforeChange: onBeforeChangeTab,
    onChange: onChangeTab,
    style: { height: "100%", width: "100%" },
    tabBarExtraContent: isPreview ? null : /* @__PURE__ */ React.createElement(ToolsPanel, null)
  }, !isPreview && /* @__PURE__ */ React.createElement(TabPane, {
    style: { height: "calc(100% - 50px)" },
    tab: /* @__PURE__ */ React.createElement(Stack, {
      spacing: "tight"
    }, /* @__PURE__ */ React.createElement(IconFont, {
      iconName: "icon-editor"
    })),
    key: ActiveTabKeys.EDIT
  }, extraTop, /* @__PURE__ */ React.createElement(EditEmailPreview, null))), fixedContainer), [
    activeTab,
    containerHeight,
    fixedContainer,
    onBeforeChangeTab,
    onChangeTab,
    extraTop,
    isPreview
  ]);
};
var iphoneFrame = "data:image/png;base64,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ggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAcAgCACHgAAggh4AAAIIuABACCIgAeAApBDwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQQQ8AAAEEfAAABBEwAMAQBABDwAAQXoH/GQy2SoAAMBStICflh5Go9FmAQAAblSH35PSz9QKDQAALE/v7ZUW8LPSw9nZ2U4BAADm0Svga3tPx/WHXgG/sbExKQAAwI1qOw8ygf+59FBfALiIFQAA5lDbea/0MBqNpuP6Q68JfPVJAQAA5tF3+P3z+PT09Kj0UF9FTAoAAHCj2s59h9+z8cbGRq8JfJ3g9/o2AAAA3BV927kN38evXr3qNYGvtnZ2dn5TAACAa3VnwPddoZmNp1Xpf5TkpwUAALjWxsZG782Vmu5HFzdympYexuPxfgEAAK5Vh977pYf6359vzoy7d34qPQywjA8AALda32YejUb/DPiLd3p8sv3JZOI8eAAAuEJr5dbMpZ/zoft5wJ+enh6W/pxGAwAAV9jY2NgvPV0c/34e8G0ZvvS8kHU8Hj8oAADAO87Ozj4v/cxqsx+2J+NLn7TvcZJfFAAA4Cr7pYfLrf4m4Eej0Q+ln63JZLJfAACAN7pGnpQeLrf6m4C/2KnpwxoNAAC8rTZy702Vy9esvgn4bqem1x589YXTaAAA4C37pZ9pd83qufGvfvFZ6WdrY2PDFB4AAMr5+szD0nN9pjq8/M5bAV9H889LT/VzuJgVAADK+e76EOszb12r+usJfO/jJLubOu0XAAC4w2oT7w1w86Z2fORbQ/a3Ar7+Yov3vms0LeK/LQAAcIeNx+OvSn/vbMj8egI/yBpNN4WfFAAAuIO6Fn5Yeqpt/s5w/Z2AH+g0mhbxTwoAANxBdfo+xEbK9OLuq2997ms++HHpyS48AAB30VDT99rTj676+SsDvo7qvyvDTOHtwgMAcKcMtYny6tWrw6t+/sqAbxeznp2d/VB6MoUHAOAuaee+D3DyTPO07c9c9QvXrdCUGvBPywDG4/ETd2cFAOC2a8070O5724h5dN2vXRvwbWG+Rvxh6W8y1F8EAADWVXds5KT01Br8uun7+e9zw3/8qAzja6s0AADcVt2FqwdlADc1+HsDfsApvFUaAABupW515scygG76fvi+j3lvwHefZKgpvFUaAABuna5xJ2UAtb2/vOljNm76gNlsNt3a2tofjUaT0t/vtre3f3n58uVfCwAAhNvd3W177wdlGE9PTk6e3fRBN07gm3leCXyAb+u3GfYKAAAEG3LvvXnfyTOXzRXw3VWwQ63StB2h77u/MAAAxGkt2+29D3WN56P3nTxz2VwB33R3Z52WYUxGo9H3LmoFACDNpYtWJ2UY06615zJ3wLe7s9ZP/E0ZSA34vXYyTQEAgCBdw07KQGoXt+n7bN6Pv/Ei1stms9nft7e32/76b8swfls/3+Tly5c/FAAAWHO7u7st3v9YhvP0+Pj4g1bV557AX6hT+HZB69yvEObwsPtCAADA2uqa9WEZznTeC1cv++CA71ZphjyVphHxAACsrQXE+8XqzLR8oA9aobnQrdJs16e/K8PZa+s5m5ub/1M//z8KAACsWLtg9d69e/9Vhl2baR4fHx//Z/kIHzyBv1Cn8AdluFNpLjwYj8d/c8QkAACr1pq0TsnbaTMPyrCmXUt/lFHpoTv/8m9luPMvL7S/1Gcf8y0FAADoq914tN27qAx42kynraN/2qdzP3oC37TfeMijJS9pLwxOdnd3vy4AALBEtUG/Gvic9zfqRP+bvkPqj9qBv2w2mx1tb2+3Sf5+Gd6/1c+9tbm5+b/24gEAWKRu3/0/6tOD+viXMrxHx8fHc9+w6Tq9Vmgu29nZeVpfUXxRFsNKDQAAC1PjfX/oGzT9SrtodZDtksECvr1iaUv+7Q6rZXEOasg//pA7VQEAwHVaw9Zw/7Y+Xdjq9tnZ2dHJycmnZSC9duAva1Fd/3CfleFPprnsoF00e//+/YcFAAB66Kbu7UCWRV53Oa2N/IcyoMEm8Be6k2kWsvR/Wf1CHNbHl9ZqAAD4EC3cR6PRt/WxXxZrIWvggwd8s6yI7zxtt6AV8gAAvE93rvuTJYR7s7BrOBcS8M2SI7552u3HHxUAAOgsceJ+YaEHsCws4JsVRPz5ak39PZ+9ePHiaQEA4E5qF6fWNw/aKYlLDPdm4acnLjTgm+5bFd8v+HSaq0zr47B+AZ/Vr99hAQDg1usuTP28Pn1YH1tlidppM+1Ql0WfmLjwgL+w4HPibzItr2P+h/bWMZQAALdDN2nfW1W0X6jh/qw+vl5GZy4t4Jvd3d2D+ubbsmJtzaa+mDiqQf+X+u6RC2ABADK07Y7yOth/X5tub8nrMddpd1g9KEuy1IBv6tf8Yf2C/7ms6NXRNdoZ9kct6uvzX2rYt7ezi4fABwBYvG6aftGIk/ao3dje/6S22qRbyV6rhqx/pm+Wfe3l0gO+WcXFrQAAMKCFX6x6ncHuxPoh2l+0/oXb7WQfFwAAyPK4teyqtjRWMoG/rFupaXvxkwIAAOtrVsP9y9rtz8sKbZQVm81mR5ubm+10mO0VHDUJAADzeN6tzKz8pqErn8BfZhoPAMCaaavf36x66n7Zyifwl3XT+Gd1Ev9/9d39AgAAq/OoW5lZ+dT9srWawF/W3cH1YIU3fwIA4A5q9wyqjy/X9SjxtQ34C13IP1mTQ/oBALilunB/VLv9sKyxtQ/4C7Xj92vEfyvkAQAYUkq4X4gJ+AtWawAAGMCsvD5Z5llKuF+IC/gLLeTrm32n1gAA8AFauLcbMX1Xw31WAsUG/GXdes3D+vi8vrtVAADgn1qoP6vR/jxt2n6VWxHwl9WYf1BDvj1+X0zmAQDuqjfRXt8epU7br3LrAv6yGvN74/F4/+zs7PPuLq+m8wAAt9OsNt9Rbb4farQf3YZJ+3VudcD/Wlu1qUG/V//ntpj/pIt6AACytFif1pZrN1j6qQb74brdbGmR7lTAX6VN6eubrRb25fWE/jf1H8Sk/Vr9RzG5+LACAMAyTNsPtcfaysus9lh7/5c2VS+v12KO1vUGS8vy/7n73lJMYJO6AAAAAElFTkSuQmCC";
function usePreviewEmail() {
  return useContext(PreviewEmailContext);
}
const SyncScrollIframeComponent = ({ children, title, windowRef, isActive, style }) => {
  const [mountNode, setMountNode] = useState(null);
  const [contentWindow, setContentWindow] = useState(null);
  const { viewElementRef } = useDomScrollHeight();
  const [ref, setRef] = useState(null);
  const setFirstVisibleEle = useCallback(lodash.exports.debounce((root) => {
    if (!ref)
      return;
    const { top: containerTop } = ref.getBoundingClientRect();
    const ele = root.elementFromPoint(0, 10);
    const findSelectorNode = (ele2) => {
      if (ele2.getAttribute("data-selector")) {
        return ele2;
      }
      if (ele2.parentNode instanceof Element) {
        return findSelectorNode(ele2.parentNode);
      }
      return null;
    };
    const selectorNode = ele && findSelectorNode(ele);
    viewElementRef.current = null;
    if (selectorNode) {
      const { top: selectorEleTop } = selectorNode.getBoundingClientRect();
      let selectorDiffTop = selectorEleTop - containerTop;
      const selector = selectorNode.getAttribute("data-selector");
      if (selector) {
        viewElementRef.current = {
          selector: selector || "",
          top: selectorDiffTop
        };
      }
    }
  }, 200), [viewElementRef, ref]);
  const onLoad = useCallback((evt) => {
    var _a;
    const contentWindow2 = (_a = evt.target) == null ? void 0 : _a.contentWindow;
    if (!contentWindow2)
      return;
    windowRef == null ? void 0 : windowRef(contentWindow2);
    const innerBody = contentWindow2.document.body;
    innerBody.style.backgroundColor = "transparent";
    setMountNode(innerBody);
    setContentWindow(contentWindow2);
  }, [windowRef]);
  useEffect(() => {
    if (!isActive || !mountNode)
      return;
    const viewElement = viewElementRef.current;
    const scrollEle = mountNode.querySelector(`.${SYNC_SCROLL_ELEMENT_CLASS_NAME}`);
    if (!scrollEle)
      return;
    if (viewElement) {
      const viewElementNode = mountNode.querySelector(`[data-selector="${viewElement == null ? void 0 : viewElement.selector}"]`);
      if (viewElementNode && scrollEle) {
        viewElementNode.scrollIntoView();
        scrollEle.scrollTo(0, scrollEle.scrollTop - viewElement.top);
      }
    } else {
      scrollEle.scrollTo(0, 0);
    }
  }, [viewElementRef, mountNode, isActive]);
  useEffect(() => {
    if (!(contentWindow == null ? void 0 : contentWindow.document.documentElement))
      return;
    const onScroll = () => {
      if (!isActive)
        return;
      setFirstVisibleEle(contentWindow.document);
    };
    contentWindow.addEventListener("scroll", onScroll, true);
    return () => {
      contentWindow == null ? void 0 : contentWindow.removeEventListener("scroll", onScroll, true);
    };
  }, [contentWindow, isActive, setFirstVisibleEle]);
  console.log("sync scroll iframe render", children);
  return useMemo(() => {
    return /* @__PURE__ */ React.createElement("iframe", {
      ref: setRef,
      title,
      srcDoc: "<!doctype html> <div></div>",
      style,
      onLoad
    }, mountNode && createPortal(children, mountNode));
  }, [title, style, onLoad, mountNode, children]);
};
const MOBILE_WIDTH = 320;
const MOBILE_Height = 640;
function MobileEmailPreview() {
  const { mobileWidth } = usePreviewEmail();
  const { activeTab } = useActiveTab();
  const { errMsg, reactNode } = usePreviewEmail();
  const isActive = activeTab === ActiveTabKeys.MOBILE;
  if (errMsg) {
    return /* @__PURE__ */ React.createElement("div", {
      style: { textAlign: "center", fontSize: 24, color: "red" }
    }, errMsg);
  }
  return /* @__PURE__ */ React.createElement("div", {
    className: "easy-email-overlay",
    style: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "auto",
      padding: "10px 0px",
      boxSizing: "border-box"
    }
  }, /* @__PURE__ */ React.createElement("div", {
    style: {
      position: "relative",
      margin: "auto",
      padding: "6px 6.8px 2px 6.8px"
    }
  }, /* @__PURE__ */ React.createElement("div", {
    style: {
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      position: "absolute",
      padding: "6px 6.8px 2px 6.8px",
      backgroundImage: `url(${iphoneFrame})`,
      backgroundSize: "100% 100%",
      zIndex: 10,
      pointerEvents: "none"
    }
  }), /* @__PURE__ */ React.createElement("div", {
    style: {
      width: MOBILE_WIDTH,
      height: MOBILE_Height
    }
  }, /* @__PURE__ */ React.createElement("div", {
    style: {
      height: MOBILE_Height / (MOBILE_WIDTH / mobileWidth),
      width: mobileWidth,
      boxSizing: "content-box",
      borderRadius: 30,
      border: "none",
      transform: `scale(${MOBILE_WIDTH / mobileWidth})`,
      transformOrigin: "left top",
      overflow: "hidden"
    }
  }, /* @__PURE__ */ React.createElement(SyncScrollIframeComponent, {
    isActive,
    style: {
      border: "none",
      height: "100%",
      width: "100%"
    }
  }, /* @__PURE__ */ React.createElement("style", null, `
            *::-webkit-scrollbar {
              -webkit-appearance: none;
              width: 0px;
            }
          `), /* @__PURE__ */ React.createElement("div", {
    className: classnames("preview-container", SYNC_SCROLL_ELEMENT_CLASS_NAME),
    style: {
      height: "100%",
      overflow: "auto",
      margin: "auto"
    }
  }, reactNode))))));
}
function DesktopEmailPreview() {
  const { activeTab } = useActiveTab();
  const { errMsg, reactNode } = usePreviewEmail();
  const { pageData } = useEditorContext();
  const fonts = useMemo(() => {
    return pageData.data.value.fonts || [];
  }, [pageData.data.value.fonts]);
  const isActive = activeTab === ActiveTabKeys.PC;
  if (errMsg) {
    return /* @__PURE__ */ React.createElement("div", {
      style: { textAlign: "center", fontSize: 24, color: "red" }
    }, errMsg);
  }
  return /* @__PURE__ */ React.createElement("div", {
    style: {
      height: "100%"
    }
  }, /* @__PURE__ */ React.createElement(SyncScrollShadowDom, {
    isActive,
    style: {
      border: "none",
      height: "100%",
      width: "100%"
    }
  }, /* @__PURE__ */ React.createElement("style", null, `
                .preview-container {
                  overflow: overlay !important;
                }
                *::-webkit-scrollbar {
                  -webkit-appearance: none;
                  width: 0px;
                }
                *::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.5);
                  box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                  -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
                }
              `), /* @__PURE__ */ React.createElement("div", {
    className: classnames("preview-container", SYNC_SCROLL_ELEMENT_CLASS_NAME),
    style: {
      height: "100%",
      overflow: "auto",
      margin: "auto",
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 40,
      paddingBottom: 140,
      boxSizing: "border-box"
    }
  }, reactNode), createPortal(/* @__PURE__ */ React.createElement(React.Fragment, null, fonts.map((item, index2) => /* @__PURE__ */ React.createElement("link", {
    key: index2,
    href: item.href,
    rel: "stylesheet",
    type: "text/css"
  }))), document.body)));
}
function useFocusBlockLayout() {
  return useContext(FocusBlockLayoutContext);
}
const strong = "_strong_w3zbz_1";
const subdued = "_subdued_w3zbz_5";
const largest = "_largest_w3zbz_9";
const extraLarge = "_extraLarge_w3zbz_13";
const large = "_large_w3zbz_9";
const normal = "_normal_w3zbz_21";
const small = "_small_w3zbz_25";
const smallest = "_smallest_w3zbz_29";
var styles = {
  strong,
  subdued,
  largest,
  extraLarge,
  large,
  normal,
  small,
  smallest
};
const TextStyle = (props) => {
  const { variation = "", size = "small" } = props;
  return /* @__PURE__ */ React.createElement("span", {
    className: classnames(styles[variation], styles[size] || size)
  }, props.children);
};
export { ActiveTabKeys, BlockAvatarWrapper, CONTENT_EDITABLE_CLASS_NAME, CONTENT_EDITABLE_RICH_TEXT_CLASS_NAME, ContentEditableType, DATA_ATTRIBUTE_DROP_CONTAINER, DATA_ATTRIBUTE_ID, DATA_ATTRIBUTE_INDEX, DATA_CONTENT_EDITABLE_IDX, DATA_CONTENT_EDITABLE_TYPE, DATA_RENDER_COUNT, DesktopEmailPreview, EASY_EMAIL_EDITOR_ID, EditEmailPreview, EmailEditor, EmailEditorProvider, EventManager, FIXED_CONTAINER_ID, IconFont, MergeTagBadge, MobileEmailPreview, PLUGINS_CONTAINER_ID, RICH_TEXT_BAR_ID, SYNC_SCROLL_ELEMENT_CLASS_NAME, Stack, TextStyle, getBlockNodeByChildEle, getBlockNodeByIdx, getBlockNodes, getContentEditableClassName, getDirectionPosition, getEditorRoot, getPluginElement, getShadowRoot, isTextBlock, scrollBlockEleIntoView, useActiveTab, useBlock, useDataTransfer, useDomScrollHeight, useEditorContext, useEditorProps, useFocusBlockLayout, useFocusIdx, useHoverIdx, useLazyState, useRefState };
//# sourceMappingURL=index.js.map
