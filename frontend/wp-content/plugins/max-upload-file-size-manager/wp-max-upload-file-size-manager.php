<?php

/**
 * Plugin Name: Max Upload File Size Manager
 * Plugin URI: 
 * Description: This plugin is used to manage maximum upload file size.
 * Version: 1.0.0
 * Requires at least: 6.3
 * Tested up to: 6.7
 * Requires PHP: 7.4
 * Author: BrainFleck Solution
 * Author URI: https://brainfleck.com/
 * Network: true
 * Text Domain: max-upload-file-size-manager
 * License: GPLv2 or later
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

defined('ABSPATH') || exit;

define('MXUPLOAD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MXUPLOAD_VERSION', '1.0.0');
define('MXUPLOAD_TEMPLATE_PATH', untrailingslashit(plugin_dir_path(__FILE__)) . '/templates/');
define('MXUPLOAD_PLUGIN_PATH', untrailingslashit(plugins_url(basename(plugin_dir_path(__FILE__)), basename(__FILE__))));
define('MXUPLOAD_MAIN_FILE', __FILE__);
define('MXUPLOAD_ABSPATH', dirname(__FILE__) . '/');
define('MXUPLOAD_TEXT', 'max-upload-file-size-manager');
define('MXUPLOAD_MAIN_FILE_NAME', basename(__FILE__));
define('MXUPLOAD_MAIN_DIR_NAME', basename(dirname(__FILE__)));
define('MXUPLOAD_UPLOAD_DIR', wp_upload_dir()['basedir']);
define('MXUPLOAD_TD', 'max-upload-file-size-manager');


// Include the main plugin class.
if (! class_exists('MXUPLOAD_Report_Main', false)) {
  include_once MXUPLOAD_ABSPATH . '/includes/class-mxupload.php';

  /**
   * Main instance function.
   */
  function mxupload()
  {
    return MXUPLOAD_Report_Main::instance();
  }
  mxupload();
}
