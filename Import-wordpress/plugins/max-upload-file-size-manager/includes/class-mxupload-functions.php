<?php
// Plugin functions
defined('ABSPATH') || exit;

// convert text, title and string to slug.
function mxupload_sanitize_string($str = '')
{

	$sanitized = preg_replace('|%[a-fA-F0-9][a-fA-F0-9]|', '', $str);
	$sanitized = preg_replace('/[^A-Za-z0-9_-]/', '_', $sanitized);
	$sanitized = str_replace('__', '_', $sanitized);
	$sanitized = trim($sanitized, '_');
	return $sanitized;
}

// prefix id type class
function mxupload_field_class_builder($prefix = '', $id = '', $type = '', $class = '')
{

	// start str
	$return = "{$prefix}";

	// filed id or slug
	if (!empty($id)) {
		$return .= " {$prefix}_{$id}";
	}

	// field type
	if (!empty($type)) {
		$return .= " {$prefix}_{$type}";
	}

	// field custom class name
	if (!empty($class)) {
		$return .= " {$class}";
	}

	// return final build class list
	return trim(esc_attr($return));
}

// build label and it's class for any field
function mxupload_field_label($args)
{

	extract($args);

	$html = '';

	if (!empty($label)) {

		if ($label_wrap) {
			$html .= sprintf('<div class="%1$s">', mxupload_field_class_builder('bfs-wrapper', $id, $type));
		}

		$html .= $label_before;

		if ($required == 'y') {
			$label .= '<span class="bfs-required">*</span>';
		}

		// radio checkbox would use span, not label
		if (in_array($type, array('radio', 'checkbox', 'image', 'image_src', 'html_input', 'style'))) {
			$html .= sprintf('<span class="%1$s">%2$s</span>', mxupload_field_class_builder('bfs-label', $id, $type), $label);
		} else {
			$html .= sprintf('<label class="%1$s" for="%2$s">%3$s</label>', mxupload_field_class_builder('bfs-label', $id, $type), $id, $label);
		}

		$html .= $label_after;

		if ($label_wrap) {
			$html .= '</div>';
		}
	}

	return $html;
}

// This function show input fields without any wrapper
function mxupload_input_field_html($args = array())
{

	$args['label'] = '';
	$args['field_wrap'] = false;
	$args['label_wrap'] = false;
	$args['input_wrap'] = false;

	return mxupload_field_html($args);
}

function mxupload_field_html($args = array())
{

	if (! is_array($args)) {
		return;
	}

	$_args = $args;

	// List of all default arguments
	$defaults = array(
		'label' 			=> '',
		'name' 				=> '',
		'type'				=> 'html',
		'html'				=> '',
		'desc'				=> '',
		'error_message' 	=> '',
		'default' 			=> '',
		'value' 			=> '',
		'required' 			=> 'n',
		'placeholder'		=> '',
		'readonly'			=> '',

		'id' 				=> '',
		'class'				=> '',
		'style' 			=> '',
		'attrs' 			=> array(),

		'before'			=> '',
		'after'				=> '',

		'field_wrap'		=> true,
		'field_before'		=> '',
		'field_after'		=> '',

		'label_wrap'		=> true,
		'label_wrap_before' => '',
		'label_wrap_after'  => '',
		'label_before'		=> '',
		'label_after'		=> '',

		'input_wrap'		=> true,
		'input_wrap_before'	=> '',
		'input_wrap_class'	=> '',
		'input_wrap_attr'	=> '',
		'input_before'		=> '',
		'input_after'		=> '',
		'input_class'		=> '',
		'input_html'		=> '',
		'input_attr'		=> '',
		'input_style'		=> ''
	);

	$args = wp_parse_args($args, $defaults);

	if (empty($args['id']) && false !== $args['id']) {
		$args['id'] = mxupload_sanitize_string($args['name']);
	}

	extract($args);

	if ('' === $value) {
		$value = $default;
	}

	if (! isset($attr)) {
		$attr = '';
	}
	if (! empty($style)) {
		$attrs['style'] = $style;
	}
	foreach ($attrs as $an => $av) {
		$attr .= ' ' . $an . '="' . esc_attr($av) . '"';
	}

	$input_attrs = array();
	if (! empty($placeholder)) {
		$input_attrs['placeholder'] = $placeholder;
	}
	if (! empty($readonly)) {
		$input_attrs['readonly'] = 'readonly';
	}
	if (! empty($input_style)) {
		$input_attrs['style'] = $input_style;
	}

	foreach ($input_attrs as $an => $av) {
		$input_attr .= ' ' . $an . '="' . esc_attr($av) . '"';
	}

	// simply include a pre option for combo fields.
	if (in_array($type, array('select', 'select_multi', 'select2', 'checkbox', 'radio'))) {
		if (isset($option_pre) && !empty($option_pre) && is_array($option_pre)) {
			$_option = $option_pre;
			if (! empty($option)) {
				foreach ($option as $k => $v) {
					$_option[$k] = $v;
				}
			}
			$option = $_option;
		}
	}

	// escape text and hidden field values to pass double or single quote
	if (in_array($type, array('hidden', 'text'))) {
		$value = esc_attr($value);
	}

	$html .= $before;

	if (! in_array($type, array('html', 'hidden')) && $field_wrap) {
		$html .= sprintf('<div class="%1$s"%2$s>', mxupload_field_class_builder('bfsw', $id, $type, $class), $attr);
	}

	$html .= $field_before;

	switch ($type):

		case "hidden":
			$html .= sprintf('<input class="%1$s %5$s" id="%2$s" name="%3$s" value="%4$s" type="hidden" />', mxupload_field_class_builder('bfs', $id, $type), $id, $name, $value, $input_class);
			break;

		case "text":
		case "email":
		case "password":
		case "number":
		case "url":

		case "image":
		case "image_src":
		case "text_combo":

		case "view":
		case "html_input":

		case "textarea":
		case "select":
		case "select_multi":
		case "select2":
		case "radio":
		case "checkbox":

			// label
			$html .= $label_wrap_before;
			$html .= mxupload_field_label($args);

			// description
			if (! empty($desc)) {
				$html .= sprintf('<div class="%1$s">%2$s</div>', mxupload_field_class_builder('bfsdw bfs-meta-description', $id, $type), $desc);
			}

			$html .= $label_wrap_after;

			// input
			$html .= $input_wrap_before;
			if ($input_wrap) {
				$html .= sprintf('<div class="%1$s %2$s"%3$s>', mxupload_field_class_builder('bfsew', $id, $type), $input_wrap_class, $input_wrap_attr);
			}

			$html .= $input_before;

			if (in_array($type, array('text', 'email', 'password', 'number', 'url'))) {
				$html .= sprintf(
					'<input class="%1$s %5$s" id="%2$s" name="%3$s" value="%4$s" type="%7$s"%6$s />',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$value,
					$input_class,
					$input_attr,
					$type
				);
			} elseif ($type == 'view') {
				$html .= $value;
			} elseif ($type == 'image') {
				$image = '';
				if (!isset($size)) {
					$size = 'thumbnail';
				}

				if (isset($src_url) && !empty($src_url)) {
					$image = sprintf('<img src="%s" />', $src_url);
				}
				if ($value) {
					$icon = ! wp_attachment_is_image($value);
					if ($img = wp_get_attachment_image($value, $size, $icon)) {
						$image = $img;
					}
				}

				if (! isset($submit) || empty($submit)) {
					$submit = ' file';
				}

				$html .= sprintf(
					'<input class="%1$s %5$s" id="%2$s_input" name="%3$s" value="%4$s" type="hidden" />
				<div id="%2$s_img" data-size="%8$s">%6$s</div>
				<a href="#" rel="%2$s" class="button bfs_image_btn" data-field="id">Choose%7$s</a>
				<a href="#" rel="%2$s" class="button bfs_image_remove_btn" data-field="id">Remove%7$s</a>',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$value,
					$input_class,
					$image,
					$submit,
					$size
				);
			} elseif ($type == 'image_src') {
				$image = '';
				if ($value) {
					$image = sprintf('<img src="%s" class="image_preview" />', $value);
				}

				$html .= sprintf(
					'<input class="%1$s %5$s" rel="%2$s" id="%2$s_input" name="%3$s" value="%4$s" type="text" />
				<div id="%2$s_img" data-size="full">%6$s</div>
				<a href="#" rel="%2$s" class="button bfs_image_btn" data-field="url">Choose file</a>
				<a href="#" rel="%2$s" class="button bfs_image_remove_btn" data-field="url">Remove file</a>',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$value,
					$input_class,
					$image
				);
			} elseif ($type == 'textarea') {
				$html .= sprintf(
					'<textarea id="%2$s" class="%1$s %5$s" name="%3$s"%6$s>%4$s</textarea>',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$value,
					$input_class,
					$input_attr
				);
			} else if ($type == 'select') {

				$html .= sprintf(
					'<select class="%1$s %5$s" id="%2$s" name="%3$s"%4$s>',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$input_attr,
					$input_class
				);

				foreach ($option as $key => $label) {
					if (empty($label)) {
						continue;
					} elseif (is_array($label) && isset($label['optgroup_open'])) {
						$html .= $label['optgroup_open'];
						continue;
					} elseif (is_array($label) && isset($label['optgroup_close'])) {
						$html .= $label['optgroup_close'];
						continue;
					}

					$child_input_attr = '';
					$child_input_class = '';
					$_label = $label;

					if (is_array($_label) && isset($_label['child_input_before'])) {
						$html .= $_label['child_input_before'];
					}

					if (isset($label->id) && isset($label->name)) {
						$key = $label->id;
						$label = $label->name;
					} elseif (isset($label['key']) && isset($label['name'])) {
						$key = $label['key'];
						$label = $label['name'];
						$child_input_attr = isset($_label['input_attr']) ? $_label['input_attr'] : '';
						$child_input_class = isset($_label['input_class']) ? $_label['input_class'] : '';
					} elseif (is_array($label)) {
						$child_input_attr = isset($label['attr']) ? $label['attr'] : '';
						$label = $l['label'];
					}

					$selected = esc_attr($value) == esc_attr($key) ? ' selected="selected"' : '';
					$html .= sprintf(
						'<option value="%1$s"%2$s class="%4$s" %5$s>%3$s</option>',
						$key,
						$selected,
						$label,
						$child_input_class,
						$child_input_attr
					);

					if (is_array($_label) && isset($_label['child_input_after'])) {
						$html .= $_label['child_input_after'];
					}
				}
				$html .= '</select>';
			} elseif ($type == 'select_multi') {
				if (! is_array($value)) {
					$value = (array) $value;
				}

				$html .= sprintf(
					'<select class="%1$s %5$s" id="%2$s" name="%3$s[]"%4$s multiple="multiple">',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$input_attr,
					$input_class
				);

				foreach ($option as $k => $l) {

					$_attr = '';
					if (isset($label->id) && isset($label->name)) {
						$k = $label->id;
						$l = $label->name;
					} elseif (isset($l['key']) && isset($l['name'])) {
						$k = $l['key'];
						$l = $l['name'];
					} elseif (is_array($l)) {
						$_attr = isset($l['attr']) ? $l['attr'] : '';
						$l = $l['label'];
					}

					$sel = in_array($k, $value) ? ' selected="selected"' : '';

					$html .= sprintf('<option value="%1$s"%2$s%4$s>%3$s</option>', $k, $sel, $l, $_attr);
				}
				$html .= '</select>';
			} elseif ($type == 'select2') {
				if (! is_array($value)) {
					$value = (array) $value;
				}

				$html .= sprintf(
					'<select class="%1$s %5$s" id="%2$s" name="%3$s"%4$s multiple="multiple">',
					mxupload_field_class_builder('bfs', $id, $type),
					$id,
					$name,
					$input_attr,
					$input_class
				);

				foreach ($option as $key => $label) {

					$_attr = '';
					if (isset($label->id) && isset($label->name)) {
						$key = $label->id;
						$label = $label->name;
					} elseif (isset($label['key']) && isset($label['name'])) {
						$key = $label['key'];
						$label = $label['name'];
					} elseif (is_array($label)) {
						$_attr = isset($label['attr']) ? $label['attr'] : '';
						$label = isset($label['label']) ? $label['label'] : '';
					}

					$html .= sprintf('<option value="%1$s"%2$s%4$s>%3$s</option>', $key, $sel, $label, $_attr);
				}
				$html .= '</select>';
			} elseif ($type == 'radio') {

				foreach ($option as $key => $label) {
					if (empty($label)) {
						continue;
					}

					$child_input_attr = '';
					$child_input_class = '';
					$_label = $label;

					if (is_array($_label) && isset($_label['child_input_before'])) {
						$html .= $_label['child_input_before'];
					}
					if (isset($label->id) && isset($label->name)) {
						$key = $label->id;
						$label = $label->name;
					} elseif (isset($label['key']) && isset($label['name'])) {
						$key = $label['key'];
						$label = $label['name'];
						$child_input_attr = isset($_label['input_attr']) ? $_label['input_attr'] : '';
						$child_input_class = isset($_label['input_class']) ? $_label['input_class'] : '';
					} elseif (is_array($label)) {
						$child_input_attr = isset($label['attr']) ? $label['attr'] : '';
						$label = $l['label'];
					}

					$checked = $value == $key ? ' checked="checked"' : '';
					$html .= sprintf(
						'<label for="%1$s_%2$s"><input id="%1$s_%2$s" class="%6$s" name="%3$s" value="%2$s" type="radio"%4$s%7$s /> %5$s</label>',
						$id,
						$key,
						$name,
						$checked,
						$label,
						$child_input_class,
						$child_input_attr
					);

					if (is_array($_label) && isset($_label['child_input_after'])) {
						$html .= $_label['child_input_after'];
					}
				}
			} elseif ($type == 'checkbox') {
				foreach ($option as $key => $label) {
					$_attr = '';
					if (is_array($label) && isset($label['child_input_before'])) {
						$html .= $label['child_input_before'];
					}

					if (isset($label->id) && isset($label->name)) {
						$key = $label->id;
						$label = $label->name;
					} elseif (isset($label['key']) && isset($label['name'])) {
						$input_class = isset($label['class']) ? $label['class'] : '';
						$_attr = isset($label['attr']) ? $label['attr'] : '';
						$key = $label['key'];
						$label = $label['name'];
					} elseif (is_array($label)) {
						$_attr = isset($label['attr']) ? $label['attr'] : '';
						$label = $label['label'];
					}

					$sel = is_array($value) && in_array($key, $value) ? ' checked="checked"' : '';
					$html .= sprintf(
						'<label class="%6$s"><input id="%1$s_%2$s" name="%3$s[]" value="%2$s" type="checkbox"%4$s%6$s%7$s /> %5$s</label>',
						$id,
						$key,
						$name,
						$sel,
						$label,
						$input_class,
						$_attr
					);
				}
			} elseif (! empty($input_html)) {
				$html .= $input_html;
			}

			if (! empty($error_message)) {
				$html .= sprintf('<div class="%1$s">%2$s</div>', mxupload_field_class_builder('bfsdw bfs-error-message', $id, $type), $error_message);
			}

			$html .= $input_after;

			if ($input_wrap) {
				$html .= '</div>';
			}
			break;

		default:
			$html .= apply_filters("mxupload_form_field_input_{$type}", '', compact(array_keys($args)), $_args);
			break;

	endswitch;

	$html .= $field_after;

	if (isset($desc_after)) {
		if (! empty($desc_after)) {
			$html .= sprintf('<div class="%1$s">%2$s</div>', mxupload_field_class_builder('bfsdaw', $id, $type), $desc_after);
		}
	}

	if (! in_array($type, array('html', 'hidden')) && $field_wrap) {
		$html .= '</div>';
	}

	$html = apply_filters('bfs_form_field_' . $type, $html, compact(array_keys($args)), $_args);

	return $html;
}
