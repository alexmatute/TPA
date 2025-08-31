/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/pro/_acf-blocks.js":
/*!******************************************!*\
  !*** ./assets/src/js/pro/_acf-blocks.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
(($, undefined) => {
  // Dependencies.
  const {
    BlockControls,
    InspectorControls,
    InnerBlocks,
    useBlockProps,
    AlignmentToolbar,
    BlockVerticalAlignmentToolbar
  } = wp.blockEditor;
  const {
    ToolbarGroup,
    ToolbarButton,
    Placeholder,
    Spinner
  } = wp.components;
  const {
    Fragment
  } = wp.element;
  const {
    Component
  } = React;
  const {
    useSelect
  } = wp.data;
  const {
    createHigherOrderComponent
  } = wp.compose;

  // Potentially experimental dependencies.
  const BlockAlignmentMatrixToolbar = wp.blockEditor.__experimentalBlockAlignmentMatrixToolbar || wp.blockEditor.BlockAlignmentMatrixToolbar;
  // Gutenberg v10.x begins transition from Toolbar components to Control components.
  const BlockAlignmentMatrixControl = wp.blockEditor.__experimentalBlockAlignmentMatrixControl || wp.blockEditor.BlockAlignmentMatrixControl;
  const BlockFullHeightAlignmentControl = wp.blockEditor.__experimentalBlockFullHeightAligmentControl || wp.blockEditor.__experimentalBlockFullHeightAlignmentControl || wp.blockEditor.BlockFullHeightAlignmentControl;
  const useInnerBlocksProps = wp.blockEditor.__experimentalUseInnerBlocksProps || wp.blockEditor.useInnerBlocksProps;

  /**
   * Storage for registered block types.
   *
   * @since ACF 5.8.0
   * @var object
   */
  const blockTypes = {};

  /**
   * Data storage for Block Instances and their DynamicHTML components.
   * This is temporarily stored on the ACF object, but this will be replaced later.
   * Developers should not rely on reading or using any aspect of acf.blockInstances.
   *
   * @since ACF 6.3
   */
  acf.blockInstances = {};

  /**
   * Returns a block type for the given name.
   *
   * @date	20/2/19
   * @since	ACF 5.8.0
   *
   * @param	string name The block name.
   * @return	(object|false)
   */
  function getBlockType(name) {
    return blockTypes[name] || false;
  }

  /**
   * Returns a block version for a given block name
   *
   * @date 8/6/22
   * @since ACF 6.0
   *
   * @param string name The block name
   * @return int
   */
  function getBlockVersion(name) {
    const blockType = getBlockType(name);
    return blockType.acf_block_version || 1;
  }

  /**
   * Returns a block's validate property. Default true.
   *
   * @since ACF 6.3
   *
   * @param string name The block name
   * @return boolean
   */
  function blockSupportsValidation(name) {
    const blockType = getBlockType(name);
    return blockType.validate;
  }

  /**
   * Returns true if a block (identified by client ID) is nested in a query loop block.
   *
   * @date 17/1/22
   * @since ACF 5.12
   *
   * @param {string} clientId A block client ID
   * @return boolean
   */
  function isBlockInQueryLoop(clientId) {
    const parents = wp.data.select('core/block-editor').getBlockParents(clientId);
    const parentsData = wp.data.select('core/block-editor').getBlocksByClientId(parents);
    return parentsData.filter(block => block.name === 'core/query').length;
  }

  /**
   * Returns true if we're currently inside the WP 5.9+ site editor.
   *
   * @date 08/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isSiteEditor() {
    return document.querySelectorAll('iframe[name="editor-canvas"]').length > 0;
  }

  /**
   * Returns true if the block editor is currently showing the desktop device type preview.
   *
   * This function will always return true in the site editor as it uses the
   * edit-post store rather than the edit-site store.
   *
   * @date 15/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isDesktopPreviewDeviceType() {
    const editPostStore = select('core/edit-post');

    // Return true if the edit post store isn't available (such as in the widget editor)
    if (!editPostStore) return true;

    // Check if function exists (experimental or not) and return true if it's Desktop, or doesn't exist.
    if (editPostStore.__experimentalGetPreviewDeviceType) {
      return 'Desktop' === editPostStore.__experimentalGetPreviewDeviceType();
    } else if (editPostStore.getPreviewDeviceType) {
      return 'Desktop' === editPostStore.getPreviewDeviceType();
    } else {
      return true;
    }
  }

  /**
   * Returns true if the block editor is currently in template edit mode.
   *
   * @date 16/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isEditingTemplate() {
    const editPostStore = select('core/edit-post');

    // Return false if the edit post store isn't available (such as in the widget editor)
    if (!editPostStore) return false;

    // Return false if the function doesn't exist
    if (!editPostStore.isEditingTemplate) return false;
    return editPostStore.isEditingTemplate();
  }

  /**
   * Returns true if we're currently inside an iFramed non-desktop device preview type (WP5.9+)
   *
   * @date 15/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isiFramedMobileDevicePreview() {
    return $('iframe[name=editor-canvas]').length && !isDesktopPreviewDeviceType();
  }

  /**
   * Registers a block type.
   *
   * @date	19/2/19
   * @since	ACF 5.8.0
   *
   * @param	object blockType The block type settings localized from PHP.
   * @return	object The result from wp.blocks.registerBlockType().
   */
  function registerBlockType(blockType) {
    // Bail early if is excluded post_type.
    const allowedTypes = blockType.post_types || [];
    if (allowedTypes.length) {
      // Always allow block to appear on "Edit reusable Block" screen.
      allowedTypes.push('wp_block');

      // Check post type.
      const postType = acf.get('postType');
      if (!allowedTypes.includes(postType)) {
        return false;
      }
    }

    // Handle svg HTML.
    if (typeof blockType.icon === 'string' && blockType.icon.substr(0, 4) === '<svg') {
      const iconHTML = blockType.icon;
      blockType.icon = /*#__PURE__*/React.createElement(Div, null, iconHTML);
    }

    // Remove icon if empty to allow for default "block".
    // Avoids JS error preventing block from being registered.
    if (!blockType.icon) {
      delete blockType.icon;
    }

    // Check category exists and fallback to "common".
    const category = wp.blocks.getCategories().filter(({
      slug
    }) => slug === blockType.category).pop();
    if (!category) {
      //console.warn( `The block "${blockType.name}" is registered with an unknown category "${blockType.category}".` );
      blockType.category = 'common';
    }

    // Merge in block settings before local additions.
    blockType = acf.parseArgs(blockType, {
      title: '',
      name: '',
      category: '',
      api_version: 2,
      acf_block_version: 1
    });

    // Remove all empty attribute defaults from PHP values to allow serialisation.
    // https://github.com/WordPress/gutenberg/issues/7342
    for (const key in blockType.attributes) {
      if ('default' in blockType.attributes[key] && blockType.attributes[key].default.length === 0) {
        delete blockType.attributes[key].default;
      }
    }

    // Apply anchor supports to avoid block editor default writing to ID.
    if (blockType.supports.anchor) {
      blockType.attributes.anchor = {
        type: 'string'
      };
    }

    // Append edit and save functions.
    let ThisBlockEdit = BlockEdit;
    let ThisBlockSave = BlockSave;

    // Apply alignText functionality.
    if (blockType.supports.alignText || blockType.supports.align_text) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'align_text', 'string');
      ThisBlockEdit = withAlignTextComponent(ThisBlockEdit, blockType);
    }

    // Apply alignContent functionality.
    if (blockType.supports.alignContent || blockType.supports.align_content) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'align_content', 'string');
      ThisBlockEdit = withAlignContentComponent(ThisBlockEdit, blockType);
    }

    // Apply fullHeight functionality.
    if (blockType.supports.fullHeight || blockType.supports.full_height) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'full_height', 'boolean');
      ThisBlockEdit = withFullHeightComponent(ThisBlockEdit, blockType.blockType);
    }

    // Set edit and save functions.
    blockType.edit = props => {
      // Ensure we remove our save lock if a block is removed.
      wp.element.useEffect(() => {
        return () => {
          if (!wp.data.dispatch('core/editor')) return;
          wp.data.dispatch('core/editor').unlockPostSaving('acf/block/' + props.clientId);
        };
      }, []);
      return /*#__PURE__*/React.createElement(ThisBlockEdit, props);
    };
    blockType.save = () => /*#__PURE__*/React.createElement(ThisBlockSave, null);

    // Add to storage.
    blockTypes[blockType.name] = blockType;

    // Register with WP.
    const result = wp.blocks.registerBlockType(blockType.name, blockType);

    // Fix bug in 'core/anchor/attribute' filter overwriting attribute.
    // Required for < WP5.9
    // See https://github.com/WordPress/gutenberg/issues/15240
    if (result.attributes.anchor) {
      result.attributes.anchor = {
        type: 'string'
      };
    }

    // Return result.
    return result;
  }

  /**
   * Returns the wp.data.select() response with backwards compatibility.
   *
   * @date	17/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string selector The selector name.
   * @return	mixed
   */
  function select(selector) {
    if (selector === 'core/block-editor') {
      return wp.data.select('core/block-editor') || wp.data.select('core/editor');
    }
    return wp.data.select(selector);
  }

  /**
   * Returns the wp.data.dispatch() response with backwards compatibility.
   *
   * @date	17/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string selector The selector name.
   * @return	mixed
   */
  function dispatch(selector) {
    return wp.data.dispatch(selector);
  }

  /**
   * Returns an array of all blocks for the given args.
   *
   * @date	27/2/19
   * @since	ACF 5.7.13
   *
   * @param	{object} args An object of key=>value pairs used to filter results.
   * @return	array.
   */
  function getBlocks(args) {
    let blocks = [];

    // Local function to recurse through all child blocks and add to the blocks array.
    const recurseBlocks = block => {
      blocks.push(block);
      select('core/block-editor').getBlocks(block.clientId).forEach(recurseBlocks);
    };

    // Trigger initial recursion for parent level blocks.
    select('core/block-editor').getBlocks().forEach(recurseBlocks);

    // Loop over args and filter.
    for (const k in args) {
      blocks = blocks.filter(({
        attributes
      }) => attributes[k] === args[k]);
    }

    // Return results.
    return blocks;
  }

  /**
   * Storage for the AJAX queue.
   *
   * @const {array}
   */
  const ajaxQueue = {};

  /**
   * Storage for cached AJAX requests for block content.
   *
   * @since ACF 5.12
   * @const {array}
   */
  const fetchCache = {};

  /**
   * Fetches a JSON result from the AJAX API.
   *
   * @date	28/2/19
   * @since	ACF 5.7.13
   *
   * @param	object block The block props.
   * @query	object The query args used in AJAX callback.
   * @return	object The AJAX promise.
   */
  function fetchBlock(args) {
    const {
      attributes = {},
      context = {},
      query = {},
      clientId = null,
      delay = 0
    } = args;

    // Build a unique queue ID from block data, including the clientId for edit forms.
    const queueId = md5(JSON.stringify({
      ...attributes,
      ...context,
      ...query
    }));
    const data = ajaxQueue[queueId] || {
      query: {},
      timeout: false,
      promise: $.Deferred(),
      started: false
    };

    // Append query args to storage.
    data.query = {
      ...data.query,
      ...query
    };
    if (data.started) return data.promise;

    // Set fresh timeout.
    clearTimeout(data.timeout);
    data.timeout = setTimeout(() => {
      data.started = true;
      if (fetchCache[queueId]) {
        ajaxQueue[queueId] = null;
        data.promise.resolve.apply(fetchCache[queueId][0], fetchCache[queueId][1]);
      } else {
        $.ajax({
          url: acf.get('ajaxurl'),
          dataType: 'json',
          type: 'post',
          cache: false,
          data: acf.prepareForAjax({
            action: 'acf/ajax/fetch-block',
            block: JSON.stringify(attributes),
            clientId: clientId,
            context: JSON.stringify(context),
            query: data.query
          })
        }).always(() => {
          // Clean up queue after AJAX request is complete.
          ajaxQueue[queueId] = null;
        }).done(function () {
          fetchCache[queueId] = [this, arguments];
          data.promise.resolve.apply(this, arguments);
        }).fail(function () {
          data.promise.reject.apply(this, arguments);
        });
      }
    }, delay);

    // Update storage.
    ajaxQueue[queueId] = data;

    // Return promise.
    return data.promise;
  }

  /**
   * Returns true if both object are the same.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	object obj1
   * @param	object obj2
   * @return	bool
   */
  function compareObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Converts HTML into a React element.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	string html The HTML to convert.
   * @param	int acfBlockVersion The ACF block version number.
   * @return	object Result of React.createElement().
   */
  acf.parseJSX = (html, acfBlockVersion) => {
    // Apply a temporary wrapper for the jQuery parse to prevent text nodes triggering errors.
    html = '<div>' + html + '</div>';
    // Correctly balance InnerBlocks tags for jQuery's initial parse.
    html = html.replace(/<InnerBlocks([^>]+)?\/>/, '<InnerBlocks$1></InnerBlocks>');
    return parseNode($(html)[0], acfBlockVersion, 0).props.children;
  };

  /**
   * Converts a DOM node into a React element.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	DOM node The DOM node.
   * @param	int acfBlockVersion The ACF block version number.
   * @param	int level The recursion level.
   * @return	object Result of React.createElement().
   */
  function parseNode(node, acfBlockVersion, level = 0) {
    // Get node name.
    const nodeName = parseNodeName(node.nodeName.toLowerCase(), acfBlockVersion);
    if (!nodeName) {
      return null;
    }

    // Get node attributes in React friendly format.
    const nodeAttrs = {};
    if (level === 1 && nodeName !== 'ACFInnerBlocks') {
      // Top level (after stripping away the container div), create a ref for passing through to ACF's JS API.
      nodeAttrs.ref = React.createRef();
    }
    acf.arrayArgs(node.attributes).map(parseNodeAttr).forEach(({
      name,
      value
    }) => {
      nodeAttrs[name] = value;
    });
    if ('ACFInnerBlocks' === nodeName) {
      return /*#__PURE__*/React.createElement(ACFInnerBlocks, nodeAttrs);
    }

    // Define args for React.createElement().
    const args = [nodeName, nodeAttrs];
    acf.arrayArgs(node.childNodes).forEach(child => {
      if (child instanceof Text) {
        const text = child.textContent;
        if (text) {
          args.push(text);
        }
      } else {
        args.push(parseNode(child, acfBlockVersion, level + 1));
      }
    });

    // Return element.
    return React.createElement.apply(this, args);
  }

  /**
   * Converts a node or attribute name into it's JSX compliant name
   *
   * @date     05/07/2021
   * @since    ACF 5.9.8
   *
   * @param    string name The node or attribute name.
   * @return  string
   */
  function getJSXName(name) {
    const replacement = acf.isget(acf, 'jsxNameReplacements', name);
    if (replacement) return replacement;
    return name;
  }

  /**
   * Converts the given name into a React friendly name or component.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	string name The node name in lowercase.
   * @param	int acfBlockVersion The ACF block version number.
   * @return	mixed
   */
  function parseNodeName(name, acfBlockVersion) {
    switch (name) {
      case 'innerblocks':
        if (acfBlockVersion < 2) {
          return InnerBlocks;
        }
        return 'ACFInnerBlocks';
      case 'script':
        return Script;
      case '#comment':
        return null;
      default:
        // Replace names for JSX counterparts.
        name = getJSXName(name);
    }
    return name;
  }

  /**
   * Functional component for ACFInnerBlocks.
   *
   * @since ACF 6.0.0
   *
   * @param obj props element properties.
   * @return DOM element
   */
  function ACFInnerBlocks(props) {
    const {
      className = 'acf-innerblocks-container'
    } = props;
    const innerBlockProps = useInnerBlocksProps({
      className: className
    }, props);
    return /*#__PURE__*/React.createElement("div", innerBlockProps, innerBlockProps.children);
  }

  /**
   * Converts the given attribute into a React friendly name and value object.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	obj nodeAttr The node attribute.
   * @return	obj
   */
  function parseNodeAttr(nodeAttr) {
    let name = nodeAttr.name;
    let value = nodeAttr.value;

    // Allow overrides for third party libraries who might use specific attributes.
    let shortcut = acf.applyFilters('acf_blocks_parse_node_attr', false, nodeAttr);
    if (shortcut) return shortcut;
    switch (name) {
      // Class.
      case 'class':
        name = 'className';
        break;

      // Style.
      case 'style':
        const css = {};
        value.split(';').forEach(s => {
          const pos = s.indexOf(':');
          if (pos > 0) {
            let ruleName = s.substr(0, pos).trim();
            const ruleValue = s.substr(pos + 1).trim();

            // Rename core properties, but not CSS variables.
            if (ruleName.charAt(0) !== '-') {
              ruleName = acf.strCamelCase(ruleName);
            }
            css[ruleName] = ruleValue;
          }
        });
        value = css;
        break;

      // Default.
      default:
        // No formatting needed for "data-x" attributes.
        if (name.indexOf('data-') === 0) {
          break;
        }

        // Replace names for JSX counterparts.
        name = getJSXName(name);

        // Convert JSON values.
        const c1 = value.charAt(0);
        if (c1 === '[' || c1 === '{') {
          value = JSON.parse(value);
        }

        // Convert bool values.
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
        break;
    }
    return {
      name,
      value
    };
  }

  /**
   * Higher Order Component used to set default block attribute values.
   *
   * By modifying block attributes directly, instead of defining defaults in registerBlockType(),
   * WordPress will include them always within the saved block serialized JSON.
   *
   * @date	31/07/2020
   * @since	ACF 5.9.0
   *
   * @param	Component BlockListBlock The BlockListBlock Component.
   * @return	Component
   */
  const withDefaultAttributes = createHigherOrderComponent(BlockListBlock => class WrappedBlockEdit extends Component {
    constructor(props) {
      super(props);

      // Extract vars.
      const {
        name,
        attributes
      } = this.props;

      // Only run on ACF Blocks.
      const blockType = getBlockType(name);
      if (!blockType) {
        return;
      }

      // Check and remove any empty string attributes to match PHP behaviour.
      Object.keys(attributes).forEach(key => {
        if (attributes[key] === '') {
          delete attributes[key];
        }
      });

      // Backward compatibility attribute replacement.
      const upgrades = {
        full_height: 'fullHeight',
        align_content: 'alignContent',
        align_text: 'alignText'
      };
      Object.keys(upgrades).forEach(key => {
        if (attributes[key] !== undefined) {
          attributes[upgrades[key]] = attributes[key];
        } else if (attributes[upgrades[key]] === undefined) {
          //Check for a default
          if (blockType[key] !== undefined) {
            attributes[upgrades[key]] = blockType[key];
          }
        }
        delete blockType[key];
        delete attributes[key];
      });

      // Set default attributes for those undefined.
      for (let attribute in blockType.attributes) {
        if (attributes[attribute] === undefined && blockType[attribute] !== undefined) {
          attributes[attribute] = blockType[attribute];
        }
      }
    }
    render() {
      return /*#__PURE__*/React.createElement(BlockListBlock, this.props);
    }
  }, 'withDefaultAttributes');
  wp.hooks.addFilter('editor.BlockListBlock', 'acf/with-default-attributes', withDefaultAttributes);

  /**
   * The BlockSave functional component.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   */
  function BlockSave() {
    return /*#__PURE__*/React.createElement(InnerBlocks.Content, null);
  }

  /**
   * The BlockEdit component.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   */
  class BlockEdit extends Component {
    constructor(props) {
      super(props);
      this.setup();
    }
    setup() {
      const {
        name,
        attributes,
        clientId
      } = this.props;
      const blockType = getBlockType(name);

      // Restrict current mode.
      function restrictMode(modes) {
        if (!modes.includes(attributes.mode)) {
          attributes.mode = modes[0];
        }
      }
      if (isBlockInQueryLoop(clientId) || isSiteEditor()) {
        restrictMode(['preview']);
      } else {
        switch (blockType.mode) {
          case 'edit':
            restrictMode(['edit', 'preview']);
            break;
          case 'preview':
            restrictMode(['preview', 'edit']);
            break;
          default:
            restrictMode(['auto']);
            break;
        }
      }
    }
    render() {
      const {
        name,
        attributes,
        setAttributes,
        clientId
      } = this.props;
      const blockType = getBlockType(name);
      const forcePreview = isBlockInQueryLoop(clientId) || isSiteEditor();
      let {
        mode
      } = attributes;
      if (forcePreview) {
        mode = 'preview';
      }

      // Show toggle only for edit/preview modes and for blocks not in a query loop/FSE.
      let showToggle = blockType.supports.mode;
      if (mode === 'auto' || forcePreview) {
        showToggle = false;
      }

      // Configure toggle variables.
      const toggleText = mode === 'preview' ? acf.__('Switch to Edit') : acf.__('Switch to Preview');
      const toggleIcon = mode === 'preview' ? 'edit' : 'welcome-view-site';
      function toggleMode() {
        setAttributes({
          mode: mode === 'preview' ? 'edit' : 'preview'
        });
      }

      // Return template.
      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, null, showToggle && /*#__PURE__*/React.createElement(ToolbarGroup, null, /*#__PURE__*/React.createElement(ToolbarButton, {
        className: "components-icon-button components-toolbar__control",
        label: toggleText,
        icon: toggleIcon,
        onClick: toggleMode
      }))), /*#__PURE__*/React.createElement(InspectorControls, null, mode === 'preview' && /*#__PURE__*/React.createElement("div", {
        className: "acf-block-component acf-block-panel"
      }, /*#__PURE__*/React.createElement(BlockForm, this.props))), /*#__PURE__*/React.createElement(BlockBody, this.props));
    }
  }

  /**
   * The BlockBody functional component.
   *
   * @since	ACF 5.7.12
   */
  function BlockBody(props) {
    const {
      attributes,
      isSelected,
      name,
      clientId
    } = props;
    const {
      mode
    } = attributes;
    const index = useSelect(select => {
      const rootClientId = select('core/block-editor').getBlockRootClientId(clientId);
      return select('core/block-editor').getBlockIndex(clientId, rootClientId);
    });
    let showForm = true;
    let additionalClasses = 'acf-block-component acf-block-body';
    if (mode === 'auto' && !isSelected || mode === 'preview') {
      additionalClasses += ' acf-block-preview';
      showForm = false;
    }

    // Setup block cache if required, and update mode.
    if (!(clientId in acf.blockInstances)) {
      acf.blockInstances[clientId] = {
        validation_errors: false,
        mode: mode
      };
    }
    acf.blockInstances[clientId].mode = mode;
    if (!isSelected) {
      if (blockSupportsValidation(name) && acf.blockInstances[clientId].validation_errors) {
        additionalClasses += ' acf-block-has-validation-error';
      }
      acf.blockInstances[clientId].has_been_deselected = true;
    }
    if (getBlockVersion(name) > 1) {
      return /*#__PURE__*/React.createElement("div", useBlockProps({
        className: additionalClasses
      }), showForm ? /*#__PURE__*/React.createElement(BlockForm, _extends({}, props, {
        index: index
      })) : /*#__PURE__*/React.createElement(BlockPreview, _extends({}, props, {
        index: index
      })));
    } else {
      return /*#__PURE__*/React.createElement("div", useBlockProps(), /*#__PURE__*/React.createElement("div", {
        className: "acf-block-component acf-block-body"
      }, showForm ? /*#__PURE__*/React.createElement(BlockForm, _extends({}, props, {
        index: index
      })) : /*#__PURE__*/React.createElement(BlockPreview, _extends({}, props, {
        index: index
      }))));
    }
  }

  /**
   * A react component to append HTMl.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string children The html to insert.
   * @return	void
   */
  class Div extends Component {
    render() {
      return /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: this.props.children
        }
      });
    }
  }

  /**
   * A react Component for inline scripts.
   *
   * This Component uses a combination of React references and jQuery to append the
   * inline <script> HTML each time the component is rendered.
   *
   * @date	29/05/2020
   * @since	ACF 5.9.0
   *
   * @param	type Var Description.
   * @return	type Description.
   */
  class Script extends Component {
    render() {
      return /*#__PURE__*/React.createElement("div", {
        ref: el => this.el = el
      });
    }
    setHTML(html) {
      $(this.el).html(`<script>${html}</script>`);
    }
    componentDidUpdate() {
      this.setHTML(this.props.children);
    }
    componentDidMount() {
      this.setHTML(this.props.children);
    }
  }

  /**
   * DynamicHTML Class.
   *
   * A react componenet to load and insert dynamic HTML.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	void
   * @return	void
   */
  class DynamicHTML extends Component {
    constructor(props) {
      super(props);

      // Bind callbacks.
      this.setRef = this.setRef.bind(this);

      // Define default props and call setup().
      this.id = '';
      this.el = false;
      this.subscribed = true;
      this.renderMethod = 'jQuery';
      this.passedValidation = false;
      this.setup(props);

      // Load state.
      this.loadState();
    }
    setup(props) {
      const constructor = this.constructor.name;
      const clientId = props.clientId;
      if (!(clientId in acf.blockInstances)) {
        acf.blockInstances[clientId] = {
          validation_errors: false,
          mode: props.mode
        };
      }
      if (!(constructor in acf.blockInstances[clientId])) {
        acf.blockInstances[clientId][constructor] = {};
      }
    }
    fetch() {
      // Do nothing.
    }
    maybePreload(blockId, clientId, form) {
      acf.debug('Preload check', blockId, clientId, form);
      if (!isBlockInQueryLoop(this.props.clientId)) {
        const preloadedBlocks = acf.get('preloadedBlocks');
        const modeText = form ? 'form' : 'preview';
        if (preloadedBlocks && preloadedBlocks[blockId]) {
          // Ensure we only preload the correct block state (form or preview).
          if (form && !preloadedBlocks[blockId].form || !form && preloadedBlocks[blockId].form) {
            acf.debug('Preload failed: state not preloaded.');
            return false;
          }

          // Set HTML to the preloaded version.
          preloadedBlocks[blockId].html = preloadedBlocks[blockId].html.replaceAll(blockId, clientId);

          // Replace blockId in errors.
          if (preloadedBlocks[blockId].validation && preloadedBlocks[blockId].validation.errors) {
            preloadedBlocks[blockId].validation.errors = preloadedBlocks[blockId].validation.errors.map(error => {
              error.input = error.input.replaceAll(blockId, clientId);
              return error;
            });
          }

          // Return preloaded object.
          acf.debug('Preload successful', preloadedBlocks[blockId]);
          return preloadedBlocks[blockId];
        }
      }
      acf.debug('Preload failed: not preloaded.');
      return false;
    }
    loadState() {
      const client = acf.blockInstances[this.props.clientId] || {};
      this.state = client[this.constructor.name] || {};
    }
    setState(state) {
      acf.blockInstances[this.props.clientId][this.constructor.name] = {
        ...this.state,
        ...state
      };

      // Update component state if subscribed.
      // - Allows AJAX callback to update store without modifying state of an unmounted component.
      if (this.subscribed) {
        super.setState(state);
      }
      acf.debug('SetState', Object.assign({}, this), this.props.clientId, this.constructor.name, Object.assign({}, acf.blockInstances[this.props.clientId][this.constructor.name]));
    }
    setHtml(html) {
      html = html ? html.trim() : '';

      // Bail early if html has not changed.
      if (html === this.state.html) {
        return;
      }

      // Update state.
      const state = {
        html
      };
      if (this.renderMethod === 'jsx') {
        state.jsx = acf.parseJSX(html, getBlockVersion(this.props.name));

        // Handle templates which don't contain any valid JSX parsable elements.
        if (!state.jsx) {
          console.warn('Your ACF block template contains no valid HTML elements. Appending a empty div to prevent React JS errors.');
          state.html += '<div></div>';
          state.jsx = acf.parseJSX(state.html, getBlockVersion(this.props.name));
        }

        // If we've got an object (as an array) find the first valid React ref.
        if (Array.isArray(state.jsx)) {
          let refElement = state.jsx.find(element => React.isValidElement(element));
          state.ref = refElement.ref;
        } else {
          state.ref = state.jsx.ref;
        }
        state.$el = $(this.el);
      } else {
        state.$el = $(html);
      }
      this.setState(state);
    }
    setRef(el) {
      this.el = el;
    }
    render() {
      // Render JSX.
      if (this.state.jsx) {
        // If we're a v2+ block, use the jsx element itself as our ref.
        if (getBlockVersion(this.props.name) > 1) {
          this.setRef(this.state.jsx);
          return this.state.jsx;
        } else {
          return /*#__PURE__*/React.createElement("div", {
            ref: this.setRef
          }, this.state.jsx);
        }
      }

      // Return HTML.
      return /*#__PURE__*/React.createElement("div", {
        ref: this.setRef
      }, /*#__PURE__*/React.createElement(Placeholder, null, /*#__PURE__*/React.createElement(Spinner, null)));
    }
    shouldComponentUpdate({
      index
    }, {
      html
    }) {
      if (index !== this.props.index) {
        this.componentWillMove();
      }
      return html !== this.state.html;
    }
    display(context) {
      // This method is called after setting new HTML and the Component render.
      // The jQuery render method simply needs to move $el into place.
      if (this.renderMethod === 'jQuery') {
        const $el = this.state.$el;
        const $prevParent = $el.parent();
        const $thisParent = $(this.el);

        // Move $el into place.
        $thisParent.html($el);

        // Special case for reusable blocks.
        // Multiple instances of the same reusable block share the same block id.
        // This causes all instances to share the same state (cool), which unfortunately
        // pulls $el back and forth between the last rendered reusable block.
        // This simple fix leaves a "clone" behind :)
        if ($prevParent.length && $prevParent[0] !== $thisParent[0]) {
          $prevParent.html($el.clone());
        }
      }

      // Lock block if required.
      if (this.getValidationErrors() && this.isNotNewlyAdded()) {
        this.lockBlockForSaving();
      } else {
        this.unlockBlockForSaving();
      }

      // Call context specific method.
      switch (context) {
        case 'append':
          this.componentDidAppend();
          break;
        case 'remount':
          this.componentDidRemount();
          break;
      }
    }
    validate() {
      // Do nothing.
    }
    componentDidMount() {
      // Fetch on first load.
      if (this.state.html === undefined) {
        this.fetch();

        // Or remount existing HTML.
      } else {
        this.display('remount');
      }
    }
    componentDidUpdate(prevProps, prevState) {
      // HTML has changed.
      this.display('append');
    }
    componentDidAppend() {
      acf.doAction('append', this.state.$el);
    }
    componentWillUnmount() {
      acf.doAction('unmount', this.state.$el);

      // Unsubscribe this component from state.
      this.subscribed = false;
    }
    componentDidRemount() {
      this.subscribed = true;

      // Use setTimeout to avoid incorrect timing of events.
      // React will unmount and mount components in DOM order.
      // This means a new component can be mounted before an old one is unmounted.
      // ACF shares $el across new/old components which is un-React-like.
      // This timout ensures that unmounting occurs before remounting.
      setTimeout(() => {
        acf.doAction('remount', this.state.$el);
      });
    }
    componentWillMove() {
      acf.doAction('unmount', this.state.$el);
      setTimeout(() => {
        acf.doAction('remount', this.state.$el);
      });
    }
    isNotNewlyAdded() {
      return acf.blockInstances[this.props.clientId].has_been_deselected || false;
    }
    hasShownValidation() {
      return acf.blockInstances[this.props.clientId].shown_validation || false;
    }
    setShownValidation() {
      acf.blockInstances[this.props.clientId].shown_validation = true;
    }
    setValidationErrors(errors) {
      acf.blockInstances[this.props.clientId].validation_errors = errors;
    }
    getValidationErrors() {
      return acf.blockInstances[this.props.clientId].validation_errors;
    }
    getMode() {
      return acf.blockInstances[this.props.clientId].mode;
    }
    lockBlockForSaving() {
      if (!wp.data.dispatch('core/editor')) return;
      wp.data.dispatch('core/editor').lockPostSaving('acf/block/' + this.props.clientId);
    }
    unlockBlockForSaving() {
      if (!wp.data.dispatch('core/editor')) return;
      wp.data.dispatch('core/editor').unlockPostSaving('acf/block/' + this.props.clientId);
    }
    displayValidation($formEl) {
      if (!blockSupportsValidation(this.props.name)) {
        acf.debug('Block does not support validation');
        return;
      }
      if (!$formEl || $formEl.hasClass('acf-empty-block-fields')) {
        acf.debug('There is no edit form available to validate.');
        return;
      }
      const errors = this.getValidationErrors();
      acf.debug('Starting handle validation', Object.assign({}, this), Object.assign({}, $formEl), errors);
      this.setShownValidation();
      let validator = acf.getBlockFormValidator($formEl);
      validator.clearErrors();
      acf.doAction('blocks/validation/pre_apply', errors);
      if (errors) {
        validator.addErrors(errors);
        validator.showErrors('after');
        this.lockBlockForSaving();
      } else {
        // remove previous error message
        if (validator.has('notice')) {
          validator.get('notice').update({
            type: 'success',
            text: acf.__('Validation successful'),
            timeout: 1000
          });
          validator.set('notice', null);
        }
        this.unlockBlockForSaving();
      }
      acf.doAction('blocks/validation/post_apply', errors);
    }
  }

  /**
   * BlockForm Class.
   *
   * A react componenet to handle the block form.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string id the block id.
   * @return	void
   */
  class BlockForm extends DynamicHTML {
    setup(props) {
      this.id = `BlockForm-${props.clientId}`;
      super.setup(props);
    }
    fetch(validate_only = false, data = false) {
      // Extract props.
      const {
        context,
        clientId,
        name
      } = this.props;
      let {
        attributes
      } = this.props;
      let query = {
        form: true
      };
      if (validate_only) {
        query = {
          validate: true
        };
        attributes.data = data;
      }
      const hash = createBlockAttributesHash(attributes, context);
      acf.debug('BlockForm fetch', attributes, query);

      // Try preloaded data first.
      const preloaded = this.maybePreload(hash, clientId, true);
      if (preloaded) {
        this.setHtml(acf.applyFilters('blocks/form/render', preloaded.html, true));
        if (preloaded.validation) this.setValidationErrors(preloaded.validation.errors);
        return;
      }
      if (!blockSupportsValidation(name)) {
        query.validate = false;
      }

      // Request AJAX and update HTML on complete.
      fetchBlock({
        attributes,
        context,
        clientId,
        query
      }).done(({
        data
      }) => {
        acf.debug('fetch block form promise');
        if (!data) {
          this.setHtml(`<div class="acf-block-fields acf-fields acf-empty-block-fields">${acf.__('Error loading block form')}</div>`);
          return;
        }
        if (data.form) {
          this.setHtml(acf.applyFilters('blocks/form/render', data.form.replaceAll(data.clientId, clientId), false));
        }
        if (data.validation) this.setValidationErrors(data.validation.errors);
        if (this.isNotNewlyAdded()) {
          acf.debug("Block has already shown it's invalid. The form needs to show validation errors");
          this.validate();
        }
      });
    }
    validate(loadState = true) {
      if (loadState) {
        this.loadState();
      }
      acf.debug('BlockForm calling validate with state', Object.assign({}, this));
      super.displayValidation(this.state.$el);
    }
    shouldComponentUpdate(nextProps, nextState) {
      if (blockSupportsValidation(this.props.name) && this.state.$el && this.isNotNewlyAdded() && !this.hasShownValidation()) {
        this.validate(false); // Shouldn't update state in shouldComponentUpdate.
      }
      return super.shouldComponentUpdate(nextProps, nextState);
    }
    componentWillUnmount() {
      super.componentWillUnmount();

      //TODO: either delete this, or clear validations here (if that's a sensible idea)

      acf.debug('BlockForm Component did unmount');
    }
    componentDidRemount() {
      super.componentDidRemount();
      acf.debug('BlockForm component did remount');
      const {
        $el
      } = this.state;
      if (blockSupportsValidation(this.props.name) && this.isNotNewlyAdded()) {
        acf.debug("Block has already shown it's invalid. The form needs to show validation errors");
        this.validate();
      }

      // Make sure our on append events are registered.
      if ($el.data('acf-events-added') !== true) {
        this.componentDidAppend();
      }
    }
    componentDidAppend() {
      super.componentDidAppend();
      acf.debug('BlockForm component did append');

      // Extract props.
      const {
        attributes,
        setAttributes,
        clientId,
        name
      } = this.props;
      const thisBlockForm = this;
      const {
        $el
      } = this.state;

      // Callback for updating block data and validation status if we're in an edit only mode.
      function serializeData(silent = false) {
        const data = acf.serialize($el, `acf-block_${clientId}`);
        if (silent) {
          attributes.data = data;
        } else {
          setAttributes({
            data
          });
        }
        if (blockSupportsValidation(name) && !silent && thisBlockForm.getMode() === 'edit') {
          acf.debug('No block preview currently available. Need to trigger a validation only fetch.');
          thisBlockForm.fetch(true, data);
        }
      }

      // Add events.
      let timeout = false;
      $el.on('change keyup', () => {
        clearTimeout(timeout);
        timeout = setTimeout(serializeData, 300);
      });

      // Log initialization for remount check on the persistent element.
      $el.data('acf-events-added', true);

      // Ensure newly added block is saved with data.
      // Do it silently to avoid triggering a preview render.
      if (!attributes.data) {
        serializeData(true);
      }
    }
  }

  /**
   * BlockPreview Class.
   *
   * A react componenet to handle the block preview.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string id the block id.
   * @return	void
   */
  class BlockPreview extends DynamicHTML {
    setup(props) {
      const blockType = getBlockType(props.name);
      const contextPostId = acf.isget(this.props, 'context', 'postId');
      this.id = `BlockPreview-${props.clientId}`;
      super.setup(props);

      // Apply the contextPostId to the ID if set to stop query loop ID duplication.
      if (contextPostId) {
        this.id = `BlockPreview-${props.clientId}-${contextPostId}`;
      }
      if (blockType.supports.jsx) {
        this.renderMethod = 'jsx';
      }
    }
    fetch(args = {}) {
      const {
        attributes = this.props.attributes,
        clientId = this.props.clientId,
        context = this.props.context,
        delay = 0
      } = args;
      const {
        name
      } = this.props;

      // Remember attributes used to fetch HTML.
      this.setState({
        prevAttributes: attributes,
        prevContext: context
      });
      const hash = createBlockAttributesHash(attributes, context);

      // Try preloaded data first.
      let preloaded = this.maybePreload(hash, clientId, false);
      if (preloaded) {
        if (getBlockVersion(name) == 1) {
          preloaded.html = '<div class="acf-block-preview">' + preloaded.html + '</div>';
        }
        this.setHtml(acf.applyFilters('blocks/preview/render', preloaded.html, true));
        if (preloaded.validation) this.setValidationErrors(preloaded.validation.errors);
        return;
      }
      let query = {
        preview: true
      };
      if (!blockSupportsValidation(name)) {
        query.validate = false;
      }

      // Request AJAX and update HTML on complete.
      fetchBlock({
        attributes,
        context,
        clientId,
        query,
        delay
      }).done(({
        data
      }) => {
        if (!data) {
          this.setHtml(`<div class="acf-block-fields acf-fields acf-empty-block-fields">${acf.__('Error previewing block')}</div>`);
          return;
        }
        let replaceHtml = data.preview.replaceAll(data.clientId, clientId);
        if (getBlockVersion(name) == 1) {
          replaceHtml = '<div class="acf-block-preview">' + replaceHtml + '</div>';
        }
        acf.debug('fetch block render promise');
        this.setHtml(acf.applyFilters('blocks/preview/render', replaceHtml, false));
        if (data.validation) {
          this.setValidationErrors(data.validation.errors);
        }
        if (this.isNotNewlyAdded()) {
          this.validate();
        }
      });
    }
    validate() {
      // Check we've got a block form for this instance.
      const client = acf.blockInstances[this.props.clientId] || {};
      const blockFormState = client.BlockForm || false;
      if (blockFormState) {
        super.displayValidation(blockFormState.$el);
      }
    }
    componentDidAppend() {
      super.componentDidAppend();
      this.renderBlockPreviewEvent();
    }
    shouldComponentUpdate(nextProps, nextState) {
      const nextAttributes = nextProps.attributes;
      const thisAttributes = this.props.attributes;

      // Update preview if block data has changed.
      if (!compareObjects(nextAttributes, thisAttributes) || !compareObjects(nextProps.context, this.props.context)) {
        let delay = 0;

        // Delay fetch when editing className or anchor to simulate consistent logic to custom fields.
        if (nextAttributes.className !== thisAttributes.className) {
          delay = 300;
        }
        if (nextAttributes.anchor !== thisAttributes.anchor) {
          delay = 300;
        }
        acf.debug('Triggering fetch from block preview shouldComponentUpdate');
        this.fetch({
          attributes: nextAttributes,
          context: nextProps.context,
          delay
        });
      }
      return super.shouldComponentUpdate(nextProps, nextState);
    }
    renderBlockPreviewEvent() {
      // Extract props.
      const {
        attributes,
        name
      } = this.props;
      const {
        $el,
        ref
      } = this.state;
      var blockElement;

      // Generate action friendly type.
      const type = attributes.name.replace('acf/', '');
      if (ref && ref.current) {
        // We've got a react ref from a JSX container. Use the parent as the blockElement
        blockElement = $(ref.current).parent();
      } else if (getBlockVersion(name) == 1) {
        blockElement = $el;
      } else {
        blockElement = $el.parents('.acf-block-preview');
      }

      // Do action.
      acf.doAction('render_block_preview', blockElement, attributes);
      acf.doAction(`render_block_preview/type=${type}`, blockElement, attributes);
    }
    componentDidRemount() {
      super.componentDidRemount();
      acf.debug('Checking if fetch is required in BlockPreview componentDidRemount', Object.assign({}, this.state.prevAttributes), Object.assign({}, this.props.attributes), Object.assign({}, this.state.prevContext), Object.assign({}, this.props.context));

      // Update preview if data has changed since last render (changing from "edit" to "preview").
      if (!compareObjects(this.state.prevAttributes, this.props.attributes) || !compareObjects(this.state.prevContext, this.props.context)) {
        acf.debug('Triggering block preview fetch from componentDidRemount');
        this.fetch();
      }

      // Fire the block preview event so blocks can reinit JS elements.
      // React reusing DOM elements covers any potential race condition from the above fetch.
      this.renderBlockPreviewEvent();
    }
  }

  /**
   * Initializes ACF Blocks logic and registration.
   *
   * @since ACF 5.9.0
   */
  function initialize() {
    // Add support for WordPress versions before 5.2.
    if (!wp.blockEditor) {
      wp.blockEditor = wp.editor;
    }

    // Register block types.
    const blockTypes = acf.get('blockTypes');
    if (blockTypes) {
      blockTypes.map(registerBlockType);
    }
  }

  // Run the initialize callback during the "prepare" action.
  // This ensures that all localized data is available and that blocks are registered before the WP editor has been instantiated.
  acf.addAction('prepare', initialize);

  /**
   * Returns a valid vertical alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A vertical alignment.
   * @return	string
   */
  function validateVerticalAlignment(align) {
    const ALIGNMENTS = ['top', 'center', 'bottom'];
    const DEFAULT = 'top';
    return ALIGNMENTS.includes(align) ? align : DEFAULT;
  }

  /**
   * Returns a valid horizontal alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A horizontal alignment.
   * @return	string
   */
  function validateHorizontalAlignment(align) {
    const ALIGNMENTS = ['left', 'center', 'right'];
    const DEFAULT = acf.get('rtl') ? 'right' : 'left';
    return ALIGNMENTS.includes(align) ? align : DEFAULT;
  }

  /**
   * Returns a valid matrix alignment.
   *
   * Written for "upgrade-path" compatibility from vertical alignment to matrix alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A matrix alignment.
   * @return	string
   */
  function validateMatrixAlignment(align) {
    const DEFAULT = 'center center';
    if (align) {
      const [y, x] = align.split(' ');
      return `${validateVerticalAlignment(y)} ${validateHorizontalAlignment(x)}`;
    }
    return DEFAULT;
  }

  /**
   * A higher order component adding alignContent editing functionality.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withAlignContentComponent(OriginalBlockEdit, blockType) {
    // Determine alignment vars
    let type = blockType.supports.align_content || blockType.supports.alignContent;
    let AlignmentComponent;
    let validateAlignment;
    switch (type) {
      case 'matrix':
        AlignmentComponent = BlockAlignmentMatrixControl || BlockAlignmentMatrixToolbar;
        validateAlignment = validateMatrixAlignment;
        break;
      default:
        AlignmentComponent = BlockVerticalAlignmentToolbar;
        validateAlignment = validateVerticalAlignment;
        break;
    }

    // Ensure alignment component exists.
    if (AlignmentComponent === undefined) {
      console.warn(`The "${type}" alignment component was not found.`);
      return OriginalBlockEdit;
    }

    // Ensure correct block attribute data is sent in intial preview AJAX request.
    blockType.alignContent = validateAlignment(blockType.alignContent);

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          alignContent
        } = attributes;
        function onChangeAlignContent(alignContent) {
          setAttributes({
            alignContent: validateAlignment(alignContent)
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(AlignmentComponent, {
          label: acf.__('Change content alignment'),
          value: validateAlignment(alignContent),
          onChange: onChangeAlignContent
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * A higher order component adding alignText editing functionality.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withAlignTextComponent(OriginalBlockEdit, blockType) {
    const validateAlignment = validateHorizontalAlignment;

    // Ensure correct block attribute data is sent in intial preview AJAX request.
    blockType.alignText = validateAlignment(blockType.alignText);

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          alignText
        } = attributes;
        function onChangeAlignText(alignText) {
          setAttributes({
            alignText: validateAlignment(alignText)
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(AlignmentToolbar, {
          value: validateAlignment(alignText),
          onChange: onChangeAlignText
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * A higher order component adding full height support.
   *
   * @date	19/07/2021
   * @since	ACF 5.10.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withFullHeightComponent(OriginalBlockEdit, blockType) {
    if (!BlockFullHeightAlignmentControl) return OriginalBlockEdit;

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          fullHeight
        } = attributes;
        function onToggleFullHeight(fullHeight) {
          setAttributes({
            fullHeight
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(BlockFullHeightAlignmentControl, {
          isActive: fullHeight,
          onToggle: onToggleFullHeight
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * Appends a backwards compatibility attribute for conversion.
   *
   * @since	ACF 6.0
   *
   * @param	object attributes The block type attributes.
   * @return	object
   */
  function addBackCompatAttribute(attributes, new_attribute, type) {
    attributes[new_attribute] = {
      type: type
    };
    return attributes;
  }

  /**
   * Create a block hash from attributes
   *
   * @since ACF 6.0
   *
   * @param object attributes The block type attributes.
   * @param object context The current block context object.
   * @return string
   */
  function createBlockAttributesHash(attributes, context) {
    attributes['_acf_context'] = sortObjectByKey(context);
    return md5(JSON.stringify(sortObjectByKey(attributes)));
  }

  /**
   * Key sort an object
   *
   * @since ACF 6.3.1
   *
   * @param object toSort The object to be sorted
   * @return object
   */
  function sortObjectByKey(toSort) {
    return Object.keys(toSort).sort().reduce((acc, currValue) => {
      acc[currValue] = toSort[currValue];
      return acc;
    }, {});
  }
})(jQuery);

/***/ }),

/***/ "./assets/src/js/pro/_acf-jsx-names.js":
/*!*********************************************!*\
  !*** ./assets/src/js/pro/_acf-jsx-names.js ***!
  \*********************************************/
/***/ (() => {

(function ($, undefined) {
  acf.jsxNameReplacements = {
    'accent-height': 'accentHeight',
    accentheight: 'accentHeight',
    'accept-charset': 'acceptCharset',
    acceptcharset: 'acceptCharset',
    accesskey: 'accessKey',
    'alignment-baseline': 'alignmentBaseline',
    alignmentbaseline: 'alignmentBaseline',
    allowedblocks: 'allowedBlocks',
    allowfullscreen: 'allowFullScreen',
    allowreorder: 'allowReorder',
    'arabic-form': 'arabicForm',
    arabicform: 'arabicForm',
    attributename: 'attributeName',
    attributetype: 'attributeType',
    autocapitalize: 'autoCapitalize',
    autocomplete: 'autoComplete',
    autocorrect: 'autoCorrect',
    autofocus: 'autoFocus',
    autoplay: 'autoPlay',
    autoreverse: 'autoReverse',
    autosave: 'autoSave',
    basefrequency: 'baseFrequency',
    'baseline-shift': 'baselineShift',
    baselineshift: 'baselineShift',
    baseprofile: 'baseProfile',
    calcmode: 'calcMode',
    'cap-height': 'capHeight',
    capheight: 'capHeight',
    cellpadding: 'cellPadding',
    cellspacing: 'cellSpacing',
    charset: 'charSet',
    class: 'className',
    classid: 'classID',
    classname: 'className',
    'clip-path': 'clipPath',
    'clip-rule': 'clipRule',
    clippath: 'clipPath',
    clippathunits: 'clipPathUnits',
    cliprule: 'clipRule',
    'color-interpolation': 'colorInterpolation',
    'color-interpolation-filters': 'colorInterpolationFilters',
    'color-profile': 'colorProfile',
    'color-rendering': 'colorRendering',
    colorinterpolation: 'colorInterpolation',
    colorinterpolationfilters: 'colorInterpolationFilters',
    colorprofile: 'colorProfile',
    colorrendering: 'colorRendering',
    colspan: 'colSpan',
    contenteditable: 'contentEditable',
    contentscripttype: 'contentScriptType',
    contentstyletype: 'contentStyleType',
    contextmenu: 'contextMenu',
    controlslist: 'controlsList',
    crossorigin: 'crossOrigin',
    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
    datetime: 'dateTime',
    defaultchecked: 'defaultChecked',
    defaultvalue: 'defaultValue',
    diffuseconstant: 'diffuseConstant',
    disablepictureinpicture: 'disablePictureInPicture',
    disableremoteplayback: 'disableRemotePlayback',
    'dominant-baseline': 'dominantBaseline',
    dominantbaseline: 'dominantBaseline',
    edgemode: 'edgeMode',
    'enable-background': 'enableBackground',
    enablebackground: 'enableBackground',
    enctype: 'encType',
    enterkeyhint: 'enterKeyHint',
    externalresourcesrequired: 'externalResourcesRequired',
    'fill-opacity': 'fillOpacity',
    'fill-rule': 'fillRule',
    fillopacity: 'fillOpacity',
    fillrule: 'fillRule',
    filterres: 'filterRes',
    filterunits: 'filterUnits',
    'flood-color': 'floodColor',
    'flood-opacity': 'floodOpacity',
    floodcolor: 'floodColor',
    floodopacity: 'floodOpacity',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-size-adjust': 'fontSizeAdjust',
    'font-stretch': 'fontStretch',
    'font-style': 'fontStyle',
    'font-variant': 'fontVariant',
    'font-weight': 'fontWeight',
    fontfamily: 'fontFamily',
    fontsize: 'fontSize',
    fontsizeadjust: 'fontSizeAdjust',
    fontstretch: 'fontStretch',
    fontstyle: 'fontStyle',
    fontvariant: 'fontVariant',
    fontweight: 'fontWeight',
    for: 'htmlFor',
    foreignobject: 'foreignObject',
    formaction: 'formAction',
    formenctype: 'formEncType',
    formmethod: 'formMethod',
    formnovalidate: 'formNoValidate',
    formtarget: 'formTarget',
    frameborder: 'frameBorder',
    'glyph-name': 'glyphName',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    glyphname: 'glyphName',
    glyphorientationhorizontal: 'glyphOrientationHorizontal',
    glyphorientationvertical: 'glyphOrientationVertical',
    glyphref: 'glyphRef',
    gradienttransform: 'gradientTransform',
    gradientunits: 'gradientUnits',
    'horiz-adv-x': 'horizAdvX',
    'horiz-origin-x': 'horizOriginX',
    horizadvx: 'horizAdvX',
    horizoriginx: 'horizOriginX',
    hreflang: 'hrefLang',
    htmlfor: 'htmlFor',
    'http-equiv': 'httpEquiv',
    httpequiv: 'httpEquiv',
    'image-rendering': 'imageRendering',
    imagerendering: 'imageRendering',
    innerhtml: 'innerHTML',
    inputmode: 'inputMode',
    itemid: 'itemID',
    itemprop: 'itemProp',
    itemref: 'itemRef',
    itemscope: 'itemScope',
    itemtype: 'itemType',
    kernelmatrix: 'kernelMatrix',
    kernelunitlength: 'kernelUnitLength',
    keyparams: 'keyParams',
    keypoints: 'keyPoints',
    keysplines: 'keySplines',
    keytimes: 'keyTimes',
    keytype: 'keyType',
    lengthadjust: 'lengthAdjust',
    'letter-spacing': 'letterSpacing',
    letterspacing: 'letterSpacing',
    'lighting-color': 'lightingColor',
    lightingcolor: 'lightingColor',
    limitingconeangle: 'limitingConeAngle',
    marginheight: 'marginHeight',
    marginwidth: 'marginWidth',
    'marker-end': 'markerEnd',
    'marker-mid': 'markerMid',
    'marker-start': 'markerStart',
    markerend: 'markerEnd',
    markerheight: 'markerHeight',
    markermid: 'markerMid',
    markerstart: 'markerStart',
    markerunits: 'markerUnits',
    markerwidth: 'markerWidth',
    maskcontentunits: 'maskContentUnits',
    maskunits: 'maskUnits',
    maxlength: 'maxLength',
    mediagroup: 'mediaGroup',
    minlength: 'minLength',
    nomodule: 'noModule',
    novalidate: 'noValidate',
    numoctaves: 'numOctaves',
    'overline-position': 'overlinePosition',
    'overline-thickness': 'overlineThickness',
    overlineposition: 'overlinePosition',
    overlinethickness: 'overlineThickness',
    'paint-order': 'paintOrder',
    paintorder: 'paintOrder',
    'panose-1': 'panose1',
    pathlength: 'pathLength',
    patterncontentunits: 'patternContentUnits',
    patterntransform: 'patternTransform',
    patternunits: 'patternUnits',
    playsinline: 'playsInline',
    'pointer-events': 'pointerEvents',
    pointerevents: 'pointerEvents',
    pointsatx: 'pointsAtX',
    pointsaty: 'pointsAtY',
    pointsatz: 'pointsAtZ',
    preservealpha: 'preserveAlpha',
    preserveaspectratio: 'preserveAspectRatio',
    primitiveunits: 'primitiveUnits',
    radiogroup: 'radioGroup',
    readonly: 'readOnly',
    referrerpolicy: 'referrerPolicy',
    refx: 'refX',
    refy: 'refY',
    'rendering-intent': 'renderingIntent',
    renderingintent: 'renderingIntent',
    repeatcount: 'repeatCount',
    repeatdur: 'repeatDur',
    requiredextensions: 'requiredExtensions',
    requiredfeatures: 'requiredFeatures',
    rowspan: 'rowSpan',
    'shape-rendering': 'shapeRendering',
    shaperendering: 'shapeRendering',
    specularconstant: 'specularConstant',
    specularexponent: 'specularExponent',
    spellcheck: 'spellCheck',
    spreadmethod: 'spreadMethod',
    srcdoc: 'srcDoc',
    srclang: 'srcLang',
    srcset: 'srcSet',
    startoffset: 'startOffset',
    stddeviation: 'stdDeviation',
    stitchtiles: 'stitchTiles',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    stopcolor: 'stopColor',
    stopopacity: 'stopOpacity',
    'strikethrough-position': 'strikethroughPosition',
    'strikethrough-thickness': 'strikethroughThickness',
    strikethroughposition: 'strikethroughPosition',
    strikethroughthickness: 'strikethroughThickness',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity',
    'stroke-width': 'strokeWidth',
    strokedasharray: 'strokeDasharray',
    strokedashoffset: 'strokeDashoffset',
    strokelinecap: 'strokeLinecap',
    strokelinejoin: 'strokeLinejoin',
    strokemiterlimit: 'strokeMiterlimit',
    strokeopacity: 'strokeOpacity',
    strokewidth: 'strokeWidth',
    suppresscontenteditablewarning: 'suppressContentEditableWarning',
    suppresshydrationwarning: 'suppressHydrationWarning',
    surfacescale: 'surfaceScale',
    systemlanguage: 'systemLanguage',
    tabindex: 'tabIndex',
    tablevalues: 'tableValues',
    targetx: 'targetX',
    targety: 'targetY',
    templatelock: 'templateLock',
    'text-anchor': 'textAnchor',
    'text-decoration': 'textDecoration',
    'text-rendering': 'textRendering',
    textanchor: 'textAnchor',
    textdecoration: 'textDecoration',
    textlength: 'textLength',
    textrendering: 'textRendering',
    'underline-position': 'underlinePosition',
    'underline-thickness': 'underlineThickness',
    underlineposition: 'underlinePosition',
    underlinethickness: 'underlineThickness',
    'unicode-bidi': 'unicodeBidi',
    'unicode-range': 'unicodeRange',
    unicodebidi: 'unicodeBidi',
    unicoderange: 'unicodeRange',
    'units-per-em': 'unitsPerEm',
    unitsperem: 'unitsPerEm',
    usemap: 'useMap',
    'v-alphabetic': 'vAlphabetic',
    'v-hanging': 'vHanging',
    'v-ideographic': 'vIdeographic',
    'v-mathematical': 'vMathematical',
    valphabetic: 'vAlphabetic',
    'vector-effect': 'vectorEffect',
    vectoreffect: 'vectorEffect',
    'vert-adv-y': 'vertAdvY',
    'vert-origin-x': 'vertOriginX',
    'vert-origin-y': 'vertOriginY',
    vertadvy: 'vertAdvY',
    vertoriginx: 'vertOriginX',
    vertoriginy: 'vertOriginY',
    vhanging: 'vHanging',
    videographic: 'vIdeographic',
    viewbox: 'viewBox',
    viewtarget: 'viewTarget',
    vmathematical: 'vMathematical',
    'word-spacing': 'wordSpacing',
    wordspacing: 'wordSpacing',
    'writing-mode': 'writingMode',
    writingmode: 'writingMode',
    'x-height': 'xHeight',
    xchannelselector: 'xChannelSelector',
    xheight: 'xHeight',
    'xlink:actuate': 'xlinkActuate',
    'xlink:arcrole': 'xlinkArcrole',
    'xlink:href': 'xlinkHref',
    'xlink:role': 'xlinkRole',
    'xlink:show': 'xlinkShow',
    'xlink:title': 'xlinkTitle',
    'xlink:type': 'xlinkType',
    xlinkactuate: 'xlinkActuate',
    xlinkarcrole: 'xlinkArcrole',
    xlinkhref: 'xlinkHref',
    xlinkrole: 'xlinkRole',
    xlinkshow: 'xlinkShow',
    xlinktitle: 'xlinkTitle',
    xlinktype: 'xlinkType',
    'xml:base': 'xmlBase',
    'xml:lang': 'xmlLang',
    'xml:space': 'xmlSpace',
    xmlbase: 'xmlBase',
    xmllang: 'xmlLang',
    'xmlns:xlink': 'xmlnsXlink',
    xmlnsxlink: 'xmlnsXlink',
    xmlspace: 'xmlSpace',
    ychannelselector: 'yChannelSelector',
    zoomandpan: 'zoomAndPan'
  };
})(jQuery);

/***/ }),

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/***/ ((module) => {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/md5/md5.js":
/*!*********************************!*\
  !*** ./node_modules/md5/md5.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(){
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8),
      isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js"),
      bin = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin),

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


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
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*********************************************!*\
  !*** ./assets/src/js/pro/acf-pro-blocks.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_acf-jsx-names.js */ "./assets/src/js/pro/_acf-jsx-names.js");
/* harmony import */ var _acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _acf_blocks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_acf-blocks.js */ "./assets/src/js/pro/_acf-blocks.js");
/* harmony import */ var _acf_blocks_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_acf_blocks_js__WEBPACK_IMPORTED_MODULE_1__);


})();

/******/ })()
;
//# sourceMappingURL=acf-pro-blocks.js.map