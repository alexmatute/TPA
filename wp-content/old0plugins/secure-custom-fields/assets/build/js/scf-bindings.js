/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/bindings/block-editor.js":
/*!************************************************!*\
  !*** ./assets/src/js/bindings/block-editor.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_8__);
/**
 * WordPress dependencies
 */










// These constant and the function above have been copied from Gutenberg. It should be public, eventually.

const BLOCK_BINDINGS_CONFIG = {
  'core/paragraph': {
    content: ['text', 'textarea', 'date_picker', 'number', 'range']
  },
  'core/heading': {
    content: ['text', 'textarea', 'date_picker', 'number', 'range']
  },
  'core/image': {
    id: ['image'],
    url: ['image'],
    title: ['image'],
    alt: ['image']
  },
  'core/button': {
    url: ['url'],
    text: ['text', 'checkbox', 'select', 'date_picker'],
    linkTarget: ['text', 'checkbox', 'select'],
    rel: ['text', 'checkbox', 'select']
  }
};

/**
 * Gets the bindable attributes for a given block.
 *
 * @param {string} blockName The name of the block.
 *
 * @return {string[]} The bindable attributes for the block.
 */
function getBindableAttributes(blockName) {
  const config = BLOCK_BINDINGS_CONFIG[blockName];
  return config ? Object.keys(config) : [];
}

/**
 * Add custom controls to all blocks
 */
const withCustomControls = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const bindableAttributes = getBindableAttributes(props.name);
    const {
      updateBlockBindings,
      removeAllBlockBindings
    } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockBindingsUtils)();

    // Get ACF fields for current post
    const fields = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_6__.useSelect)(select => {
      const {
        getEditedEntityRecord
      } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_7__.store);
      const {
        getCurrentPostType,
        getCurrentPostId
      } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_8__.store);
      const postType = getCurrentPostType();
      const postId = getCurrentPostId();
      if (!postType || !postId) return {};
      const record = getEditedEntityRecord('postType', postType, postId);

      // Extract fields that end with '_source' (simplified)
      const sourcedFields = {};
      Object.entries(record?.acf || {}).forEach(([key, value]) => {
        if (key.endsWith('_source')) {
          const baseFieldName = key.replace('_source', '');
          if (record?.acf.hasOwnProperty(baseFieldName)) {
            sourcedFields[baseFieldName] = value;
          }
        }
      });
      return sourcedFields;
    }, []);

    // Get filtered field options for an attribute
    const getFieldOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)((attribute = null) => {
      if (!fields || Object.keys(fields).length === 0) return [];
      const blockConfig = BLOCK_BINDINGS_CONFIG[props.name];
      let allowedTypes = null;
      if (blockConfig) {
        allowedTypes = attribute ? blockConfig[attribute] : Object.values(blockConfig).flat();
      }
      return Object.entries(fields).filter(([, fieldConfig]) => !allowedTypes || allowedTypes.includes(fieldConfig.type)).map(([fieldName, fieldConfig]) => ({
        value: fieldName,
        label: fieldConfig.label
      }));
    }, [fields, props.name]);

    // Check if all attributes use the same field types (for "all attributes" mode)
    const canUseAllAttributesMode = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
      if (!bindableAttributes || bindableAttributes.length <= 1) return false;
      const blockConfig = BLOCK_BINDINGS_CONFIG[props.name];
      if (!blockConfig) return false;
      const firstAttributeTypes = blockConfig[bindableAttributes[0]] || [];
      return bindableAttributes.every(attr => {
        const attrTypes = blockConfig[attr] || [];
        return attrTypes.length === firstAttributeTypes.length && attrTypes.every(type => firstAttributeTypes.includes(type));
      });
    }, [bindableAttributes, props.name]);

    // Track bound fields
    const [boundFields, setBoundFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});

    // Sync with current bindings
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
      const currentBindings = props.attributes?.metadata?.bindings || {};
      const newBoundFields = {};
      Object.keys(currentBindings).forEach(attribute => {
        if (currentBindings[attribute]?.args?.key) {
          newBoundFields[attribute] = currentBindings[attribute].args.key;
        }
      });
      setBoundFields(newBoundFields);
    }, [props.attributes?.metadata?.bindings]);

    // Handle field selection
    const handleFieldChange = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)((attribute, value) => {
      if (Array.isArray(attribute)) {
        // Handle multiple attributes at once
        const newBoundFields = {
          ...boundFields
        };
        const bindings = {};
        attribute.forEach(attr => {
          newBoundFields[attr] = value;
          bindings[attr] = value ? {
            source: 'acf/field',
            args: {
              key: value
            }
          } : undefined;
        });
        setBoundFields(newBoundFields);
        updateBlockBindings(bindings);
      } else {
        // Handle single attribute
        setBoundFields(prev => ({
          ...prev,
          [attribute]: value
        }));
        updateBlockBindings({
          [attribute]: value ? {
            source: 'acf/field',
            args: {
              key: value
            }
          } : undefined
        });
      }
    }, [boundFields, updateBlockBindings]);

    // Handle reset
    const handleReset = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
      removeAllBlockBindings();
      setBoundFields({});
    }, [removeAllBlockBindings]);

    // Don't show if no fields or attributes
    const fieldOptions = getFieldOptions();
    if (fieldOptions.length === 0 || !bindableAttributes) {
      return /*#__PURE__*/React.createElement(BlockEdit, props);
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, props, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanel, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Connect to a field', 'secure-custom-fields'),
      resetAll: handleReset
    }, canUseAllAttributesMode ? /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
      hasValue: () => !!boundFields[bindableAttributes[0]],
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('All attributes', 'secure-custom-fields'),
      onDeselect: () => handleFieldChange(bindableAttributes, null),
      isShownByDefault: true
    }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ComboboxControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Field', 'secure-custom-fields'),
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a field', 'secure-custom-fields'),
      options: getFieldOptions(),
      value: boundFields[bindableAttributes[0]] || '',
      onChange: value => handleFieldChange(bindableAttributes, value),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    })) : bindableAttributes.map(attribute => /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
      key: `scf-field-${attribute}`,
      hasValue: () => !!boundFields[attribute],
      label: attribute,
      onDeselect: () => handleFieldChange(attribute, null),
      isShownByDefault: true
    }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ComboboxControl, {
      label: attribute,
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a field', 'secure-custom-fields'),
      options: getFieldOptions(attribute),
      value: boundFields[attribute] || '',
      onChange: value => handleFieldChange(attribute, value),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }))))), /*#__PURE__*/React.createElement(BlockEdit, props));
  };
}, 'withCustomControls');
if (window.scf?.betaFeatures?.connect_fields) {
  (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('editor.BlockEdit', 'secure-custom-fields/with-custom-controls', withCustomControls);
}

/***/ }),

/***/ "./assets/src/js/bindings/sources.js":
/*!*******************************************!*\
  !*** ./assets/src/js/bindings/sources.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__);
/**
 * WordPress dependencies.
 */



/**
 * Get the SCF fields from the post entity.
 *
 * @param {Object} post The post entity object.
 * @returns {Object} The SCF fields object with source data.
 */
const getSCFFields = post => {
  if (!post?.acf) {
    return {};
  }

  // Extract only the _source fields which contain the formatted data
  const sourceFields = {};
  Object.entries(post.acf).forEach(([key, value]) => {
    if (key.endsWith('_source')) {
      // Remove the _source suffix to get the field name
      const fieldName = key.replace('_source', '');
      sourceFields[fieldName] = value;
    }
  });
  return sourceFields;
};

/**
 * Resolve image attribute values from an image object.
 *
 * @param {Object} imageObj The image object from SCF field data.
 * @param {string} attribute The attribute to resolve.
 * @returns {string} The resolved attribute value.
 */
const resolveImageAttribute = (imageObj, attribute) => {
  if (!imageObj) return '';
  switch (attribute) {
    case 'url':
      return imageObj.url || '';
    case 'alt':
      return imageObj.alt || '';
    case 'title':
      return imageObj.title || '';
    case 'id':
      return imageObj.id || imageObj.ID || '';
    default:
      return '';
  }
};

/**
 * Process a single field binding and return its resolved value.
 *
 * @param {string} attribute The attribute being bound.
 * @param {Object} args The binding arguments.
 * @param {Object} scfFields The SCF fields object.
 * @returns {string} The resolved field value.
 */
const processFieldBinding = (attribute, args, scfFields) => {
  const fieldName = args?.key;
  const fieldConfig = scfFields[fieldName];
  if (!fieldConfig) {
    return '';
  }
  const fieldType = fieldConfig.type;
  const fieldValue = fieldConfig.formatted_value;
  switch (fieldType) {
    case 'image':
      return resolveImageAttribute(fieldValue, attribute);
    case 'checkbox':
      // For checkbox fields, join array values or return as string
      if (Array.isArray(fieldValue)) {
        return fieldValue.join(', ');
      }
      return fieldValue ? fieldValue.toString() : '';
    case 'number':
    case 'range':
      return fieldValue ? fieldValue.toString() : '';
    case 'date_picker':
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
    case 'select':
    default:
      return fieldValue ? fieldValue.toString() : '';
  }
};
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockBindingsSource)({
  name: 'acf/field',
  label: 'SCF Fields',
  getValues({
    context,
    bindings,
    select
  }) {
    const {
      getEditedEntityRecord
    } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__.store);
    const post = context?.postType && context?.postId ? getEditedEntityRecord('postType', context.postType, context.postId) : undefined;
    const scfFields = getSCFFields(post);
    const result = {};
    Object.entries(bindings).forEach(([attribute, {
      args
    } = {}]) => {
      const value = processFieldBinding(attribute, args, scfFields);
      result[attribute] = value;
    });
    return result;
  },
  canUserEditValue() {
    return false;
  }
});

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/core-data":
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["coreData"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/editor":
/*!********************************!*\
  !*** external ["wp","editor"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["editor"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ./assets/src/js/bindings/index.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _sources_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sources.js */ "./assets/src/js/bindings/sources.js");
/* harmony import */ var _block_editor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block-editor.js */ "./assets/src/js/bindings/block-editor.js");


})();

/******/ })()
;
//# sourceMappingURL=scf-bindings.js.map