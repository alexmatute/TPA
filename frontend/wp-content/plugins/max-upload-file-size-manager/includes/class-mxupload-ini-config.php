<?php

/**
 * This is helper file.
 *
 * @package Max Upload File Size Manager
 * @since 1.0
 */


defined('ABSPATH') || exit;

/**
 * MXupload Card_Helper.
 */
class MXUPLOAD_Card_Helper
{

	/**
	 * Constructor.
	 * Initializes and adds functions to filter and action hooks.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {}

	/**
	 * Initialize the plugin by retrieving the plugin information.
	 *
	 * This method is responsible for calling the function that fetches
	 * and processes the necessary plugin information when the plugin is initialized.
	 */
	public function init()
	{
		$this->get_plugin_information();
		$this->php_init_config();
	}

	/**
	 * Retrieve the arguments for the plugins to fetch information.
	 *
	 * This method returns an array of plugin arguments that will be used
	 * to retrieve information about the plugins via the WordPress Plugin API.
	 *
	 * @return array An array of plugin arguments.
	 */
	public static function get_plugin_args()
	{

		return array(

			array(
				'slug'   => 'wc-order-analytics-add-on',
				'fields' => array(
					'short_description' => true,
					'icons'             => true,
					'sections'          => false,
					'rating'            => false,
					'ratings'           => false,
					'downloaded'        => true,
					'last_updated'      => false,
					'added'             => false,
					'tags'              => false,
					'homepage'          => false,
					'donate_link'       => false,
				),
			),
			array(
                'slug'   => 'flagged-phone-field',
                'fields' => array(
                    'short_description' => true,
                    'icons'             => true,
                    'sections'          => false,
                    'rating'            => false,
                    'ratings'           => false,
                    'downloaded'        => true,
                    'last_updated'      => false,
                    'added'             => false,
                    'tags'              => false,
                    'homepage'          => false,
                    'donate_link'       => false,
                ),
            )
		);
	}

	/**
	 * Fetch and process plugin information.
	 *
	 * This method uses the WordPress Plugin API to retrieve information about
	 * the plugins specified in the get_plugin_args method. It processes the
	 * response and returns an array of plugin data.
	 *
	 * @return array An array of plugin data including title, download link,
	 *               description, icons, and slug. If an error occurs, the array
	 *               contains an error message.
	 */

	public function get_plugin_information()
	{

		$cached_data = get_transient('mxupload_plugin_data');

		if ($cached_data !== false) {
			return $cached_data;
		}

		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$plugins = self::get_plugin_args();
		$data    = array();

		foreach ($plugins as $plugin) {

			$pinfo = plugins_api('plugin_information', $plugin);

			if (! is_wp_error($pinfo)) {
				$data[] = array(
					'title'       => $pinfo->name,
					'download'    => $pinfo->download_link,
					'description' => $pinfo->short_description,
					'icons'       => $pinfo->icons['1x'],
					'slug'        => $pinfo->slug,
				);
			}
		}

		// Cache data for 7 days.
		set_transient('mxupload_plugin_data', $data, 60 * 60 * 24 * 7);

		return $data;
	}

	public function php_init_config()
	{

		// Read plugin header data.
		$mxupload_plugin_data = get_plugin_data(MXUPLOAD_PLUGIN_URL);

		// Minimum PHP version.
		$mxupload_current_php_version = phpversion();
		$mxupload_minimum_php_version = $mxupload_plugin_data['RequiresPHP'] ? $mxupload_plugin_data['RequiresPHP'] : '5.6';
		$mxupload_php_version_status  = $mxupload_current_php_version < $mxupload_minimum_php_version ? 0 : 1;

		// Minimum WordPress Version.
		$mxupload_wp_current_version = get_bloginfo('version');
		$mxupload_minimum_wp_version = $mxupload_plugin_data['RequiresWP'] ? $mxupload_plugin_data['RequiresWP'] : '4.4';
		$mxupload_wp_version_status  = $mxupload_wp_current_version < $mxupload_minimum_wp_version ? 0 : 1;

		// PHP Limit Time
		$mxupload_php_minimum_limit_time = '120';
		$mxupload_php_current_limit_time = ini_get('max_execution_time');
		$mxupload_php_limit_time_status = $mxupload_php_minimum_limit_time <= $mxupload_php_current_limit_time ? 1 : 0;

		$zip_extension = in_array('zip', get_loaded_extensions());
		$mbstring_extension = in_array('mbstring', get_loaded_extensions());
		$dom_extension = in_array('dom', get_loaded_extensions());

		$ini_size = ini_get('upload_max_filesize');

		if (! $ini_size) {
			$ini_size = 'unknown';
		} elseif (is_numeric($ini_size)) {
			$ini_size .= ' bytes';
		} else {
			$ini_size .= 'B';
		}

		/**
		 * Get the maximum file upload size allowed by the server and WordPress
		 */
		$maxupload_size = wp_max_upload_size();
		$maxupload_size_mb = $maxupload_size / (1024 * 1024);
		$maxupload_size_gb = $maxupload_size / (1024 * 1024 * 1024);

		if ($maxupload_size_gb >= 1) {
			$maxupload_size_display = sprintf('%.2f GB', $maxupload_size_gb);
		} else {
			$maxupload_size_display = sprintf('%.2f MB', $maxupload_size_mb);
		}

		$system_status = array(

			array(
				'title'           => esc_html__('PHP Version', 'max-upload-file-size-manager'),
				'version'         => esc_html__('Current Version :  ', 'max-upload-file-size-manager') . $mxupload_current_php_version,
				'status'          => $mxupload_php_version_status,
				'success_message' => esc_html__('- ok', 'max-upload-file-size-manager'),
				'error_message' => esc_html__('Recommend Version : ', 'max-upload-file-size-manager') . $mxupload_minimum_php_version,
			),

			array(
				'title'           => esc_html__('WordPress Version', 'max-upload-file-size-manager'),
				'version'         => $mxupload_wp_current_version,
				'status'          => $mxupload_wp_version_status,
				'success_message' => esc_html__('- ok', 'max-upload-file-size-manager'),
				'error_message' => esc_html__('Recommend : ', 'max-upload-file-size-manager') . $mxupload_minimum_wp_version,
			),

			array(
				'title'           => esc_html__('Maximum Upload Limit set by WordPress', 'max-upload-file-size-manager'),
				'version'         => '2MB',
				'status'          => '1',
				'success_message' => esc_html__('- ok', 'max-upload-file-size-manager'),
				'error_message' => esc_html__('Recommend : ', 'max-upload-file-size-manager'),
			),

			array(
				'title'           => esc_html__('Maximum Upload Limit Set By Hosting Provider', 'max-upload-file-size-manager'),
				'version'         => $maxupload_size_display,
				'status'          => '1',
				'success_message' => esc_html__('- ok', 'max-upload-file-size-manager'),
				'error_message' => esc_html__('Recommend :  ', 'max-upload-file-size-manager'),
			),

			array(
				'title'           => esc_html__('PHP Limit Time', 'max-upload-file-size-manager'),
				'version'         => esc_html__('Current Limit Time: ', 'max-upload-file-size-manager') . $mxupload_php_current_limit_time,
				'status'          => $mxupload_php_limit_time_status,
				'success_message' => esc_html__('- Ok', 'max-upload-file-size-manager'),
				'error_message' => esc_html__('Recommend : ', 'max-upload-file-size-manager') . $mxupload_php_minimum_limit_time,
			),

			array(
				'title'           => esc_html__('zipArchive Extension', 'max-upload-file-size-manager'),
				'version'         => '',
				'status'          => $zip_extension,
				'success_message' => esc_html__('Enable', 'max-upload-file-size-manager'),
				'error_message'   => esc_html__('Please enable zip extension from hosting.', 'max-upload-file-size-manager'),
			),

			array(
				'title'           => esc_html__('MBString extension', 'max-upload-file-size-manager'),
				'version'         => '',
				'status'          => $mbstring_extension,
				'success_message' => esc_html__('Enable', 'max-upload-file-size-manager'),
				'error_message'   => esc_html__('Please enable MBString extension from hosting.', 'max-upload-file-size-manager'),
			),

			array(
				'title'           => esc_html__('Dom extension', 'max-upload-file-size-manager'),
				'version'         => '',
				'status'          => $dom_extension,
				'success_message' => esc_html__('Enable', 'max-upload-file-size-manager'),
				'error_message'   => esc_html__('Dom extension is not enable from hosting.', 'max-upload-file-size-manager'),
			),

		);

		return $system_status;
	}
}

new MXUPLOAD_Card_Helper();
