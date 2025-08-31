<?php

/**
 * This configuration sets the maximum allowed size for file uploads.
 *
 * @package Max Upload File Size Manager
 * @since 1.0
 */

// Addon Main Class.
defined('ABSPATH') || exit;

/**
 * Manage the mxupload admin.
 */
class MXUPLOAD_Admin_Main
{

	/**
	 * MXUPLOAD_Admin_Main instance.
	 *
	 * @since  1.0.0
	 * @access private
	 * @static
	 * @var MXUPLOAD_Admin_Main
	 */
	private static $instance = false;

	/**
	 * Maximum upload size.
	 *
	 * @var int
	 */
	protected $max_upload_size;
	public $ajax_timelimit = 20;

	/**
	 * Get the instance.
	 *
	 * Returns the current instance, creates one if it
	 * doesn't exist. Ensures only one instance of
	 * MXUPLOAD_Admin_Main is loaded or can be loaded.
	 *
	 * @return MXUPLOAD_Admin_Main
	 * @since 1.0.0
	 * @static
	 *
	 */
	public static function get_instance()
	{

		if (! self::$instance) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 * Initializes and adds functions to filter and action hooks.
	 *
	 * @since 1.0.0
	 */
	public function __construct()
	{

		// save default before we filter it.
		$this->max_upload_size = wp_max_upload_size();
		add_action('admin_menu', array($this, 'add_admin_menu'));
		add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
		add_action('mxupload_settings_content', array($this, 'settings_content'));
		add_action('mxupload_storage_analysis_content', array($this, 'storage_analysis_content'));
		add_action('mxupload_php_ini_config_content', array($this, 'php_config_content'));
		add_action('mxupload_about_us_content', array($this, 'about_us_content'));
		add_action('admin_init', array($this, 'user_role_save_settings'));
		add_filter('plupload_init', array($this, 'filter_plupload_settings'));
		add_filter('upload_post_params', array($this, 'filter_plupload_params'));
		add_filter('plupload_default_settings', array($this, 'filter_plupload_settings'));
		add_filter('plupload_default_params', array($this, 'filter_plupload_params'));
		add_filter('upload_size_limit', array($this, 'filter_upload_size_limit'));
		add_action('wp_ajax_mxupload_chunker', array($this, 'ajax_chunk_receiver'));


		add_action('wp_ajax_mxupload_file_scan', array($this, 'mxupload_file_scan'));
		add_filter('cron_schedules', array($this, 'mxupload_set_schedule'), 10, 1);
		add_action('wp', array($this, 'mxupload_scheduled_event'));
		add_action('mxupload_refresh_analysis', array($this, 'mxupload_update_store_analysis'));
	}

	/**
	 * Styles for the settings page.
	 *
	 * @since 2.0
	 */
	public function enqueue_assets()
	{
		// Enqueue Style.
		// wp_enqueue_style( 'fonts-style', 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap', array(), wp_get_theme()->get( '1.0.0' ), 'all' );
		wp_enqueue_style('mxupload-style-admin', MXUPLOAD_PLUGIN_URL . '/assets/css/mxupload-style.css', array(), wp_get_theme()->get('Version'), 'all');

		// Enqueue Script.
		wp_enqueue_script('mxupload-chart-script', MXUPLOAD_PLUGIN_URL . '/assets/js/chart.js', array(), wp_get_theme()->get('Version'), true);
		wp_enqueue_script('analytics-script', MXUPLOAD_PLUGIN_URL . '/assets/js/mxupload-scripts.js', array('jquery'), wp_get_theme()->get('Version'), true);

		wp_localize_script('analytics-script', 'mxupload_ajax', array(
			'ajax_url' => admin_url('admin-ajax.php'),
			'nonce'    => wp_create_nonce('mxupload_ajax_nonce'),
		));
	}

	/**
	 * Registers a new menu page.
	 *
	 * @since 2.0
	 */
	public function add_admin_menu()
	{
		add_menu_page(
			esc_html__('MxUpload', 'max-upload-file-size-manager'),
			esc_html__('MxUpload', 'max-upload-file-size-manager'),
			'manage_options',
			'bfs-mxupload',
			array($this, 'settings'),
			'dashicons-cloud-upload'
		);
	}
	/**
	 * Displays the settings page for the plugin.
	 *
	 * This function retrieves the settings navigation and settings page content,
	 * then includes the necessary file to display the settings page interface.
	 *
	 * @return void
	 */
	public function settings()
	{
		$settings        = $this->get_settings_nav();
		$settings_option = $this->settings_page();
		include MXUPLOAD_ABSPATH . '/admin/mx-settings.php';
	}

	/**
	 * Create a new settings navigation menu under Settings.
	 *
	 * @since 1.0
	 */
	public function get_settings_nav()
	{

		return array(
			array(
				'id'    => 'mxupload_settings',
				'title' => esc_html__('Settings', 'max-upload-file-size-manager'),
				'desc'  => esc_html__('Set file upload limits', 'max-upload-file-size-manager'),
				'icon'  => MXUPLOAD_PLUGIN_URL . '/assets/img/setting-icone.png',
			),
			array(
				'id'    => 'mxupload_storage_analysis',
				'title' => esc_html__('Storage Usage Analysis', 'max-upload-file-size-manager'),
				'desc'  => esc_html__('Overview of your storage usage analysis', 'max-upload-file-size-manager'),
				'icon'  => MXUPLOAD_PLUGIN_URL . '/assets/img/storage.png',
			),
			array(
				'id'    => 'mxupload_php_ini_config',
				'title' => esc_html__('Php ini Config', 'max-upload-file-size-manager'),
				'desc'  => esc_html__('Show all php config details', 'max-upload-file-size-manager'),
				'icon'  => MXUPLOAD_PLUGIN_URL . '/assets/img/config.png',
			),
			array(
				'id'    => 'mxupload_about_us',
				'title' => esc_html__('About Us', 'max-upload-file-size-manager'),
				'desc'  => esc_html__('More about information', 'max-upload-file-size-manager'),
				'icon'  => MXUPLOAD_PLUGIN_URL . '/assets/img/about.png',
			),
		);
	}

	/**
	 * The content of settings nav.
	 *
	 * @since 1.0
	 */
	public function settings_content()
	{
		include MXUPLOAD_ABSPATH . '/admin/mxupload-size-content.php';
	}

	/**
	 * Displays the storage analyasis content page for the plugin.
	 */
	public function storage_analysis_content()
	{
		include MXUPLOAD_ABSPATH . '/admin/mxupload-storage-analysis-content.php';
	}

	/**
	 * Displays the php config page for the plugin.
	 */
	public function php_config_content()
	{
		$php_status      = new MXUPLOAD_Card_Helper();
		$php_config_data = $php_status->php_init_config();
		include MXUPLOAD_ABSPATH . '/admin/mxupload-php-config.php';
	}

	/**
	 * Displays the about us page for the plugin.
	 */
	public function about_us_content()
	{
		$obj_card_helper = new MXUPLOAD_Card_Helper();
		$plugin_data     = $obj_card_helper->get_plugin_information();
		include MXUPLOAD_ABSPATH . '/admin/mxupload-about-us-content.php';
	}

	/**
	 * The following function get all user roles and associated settings.
	 *
	 * @return array $all_user_role_sources An array of user roles with their upload limits and settings.
	 */
	public static function get_all_user_role()
	{
		$user_roles            = get_editable_roles();
		$all_user_role_sources = array();
		$mxsetting             = get_option('mxsetting');
		$by_role               = isset($mxsetting['by_role']) ? $mxsetting['by_role'] : '';
		$default_limit         = 2 * 1024 * 1024; // Default limit is 2MB
		$all_user_array        = isset($mxsetting['upload_size']['all_user']) ? $mxsetting['upload_size']['all_user'] : array();
		$all_user_format       = isset($all_user_array['format']) ? $all_user_array['format'] : 'mb';
		$all_user_limit        = isset($all_user_array['limit']) ? $all_user_array['limit'] : $default_limit;

		if ('mb' === $all_user_format) {
			$all_user_limit = $all_user_limit / (1024 * 1024);
		} elseif ('gb' === $all_user_format) {
			$all_user_limit = $all_user_limit / (1024 * 1024 * 1024);
		}

		// Add field for all users.
		$all_users_source = array(
			'position'         => 1,
			'label'            => __('All Users', 'max-upload-file-size-manager'),
			'name'             => 'mxsetting[upload_size][all_user][format]',
			'class'            => 'mxupload-limit-wrapper',
			'type'             => 'select',
			'option'           => array(
				'mb' => __('MB', 'max-upload-file-size-manager'),
				'gb' => __('GB', 'max-upload-file-size-manager'),
			),
			'input_before'     => '<input class="bfs upload_limit bfs_formate" name="mxsetting[upload_size][all_user][limit]" type="number" min="1" value="' . $all_user_limit . '" />',
			'label_wrap_after' => '<div class="bfs-info">Maximum Upload Size (default is 2 MB) <p><img src=" ' . MXUPLOAD_PLUGIN_URL . 'assets/img/about.png " alt="img"><span>Default size is defined by your hosting provider</span></p></div>',
			'value'            => $all_user_format,
		);

		$all_user_role_sources[] = $all_users_source;

		foreach ($user_roles as $role => $user_role) {
			$user_role_name = isset($user_role['name']) ? $user_role['name'] : '';
			$user_role_array = isset($mxsetting['upload_size'][$role]) ? $mxsetting['upload_size'][$role] : array();
			$role_format = isset($user_role_array['format']) ? $user_role_array['format'] : 'mb';
			$role_limit = isset($user_role_array['limit']) ? $user_role_array['limit'] : $default_limit;

			if ('mb' === $role_format) {
				$role_limit = $role_limit / (1024 * 1024);
			} elseif ('gb' === $role_format) {
				$role_limit = $role_limit / (1024 * 1024 * 1024);
			}

			$user_role_source = array(
				'position'         => 1,
				'label'            => sprintf(
					/* translators: %s: User role name */
					'%s',
					$user_role_name
				),
				'name'             => 'mxsetting[upload_size][' . $role . '][format]',
				'class'            => 'mxupload-limit-wrapper',
				'type'             => 'select',
				'option'           => array(
					'mb' => esc_html__('MB', 'max-upload-file-size-manager'),
					'gb' => esc_html__('GB', 'max-upload-file-size-manager'),
				),
				'input_before'     => '<input class="bfs upload_limit bfs_formate" name="mxsetting[upload_size][' . $role . '][limit]" type="number" min="1" value="' . $role_limit . '" />',
				'label_wrap_after' => '<div class="bfs-info">Maximum Upload Size (default is 2 MB) <p><img src=" ' . MXUPLOAD_PLUGIN_URL . 'assets/img/about.png " alt="img"><span>Default size is defined by your hosting provider</span></p></div>',
				'value'            => $role_format,
			);

			$all_user_role_sources[] = $user_role_source;
		}
		return $all_user_role_sources;
	}

	/**
	 * The following function saves the maximum upload size setting field.
	 */
	public function user_role_save_settings()
	{
		if (isset($_POST['mxsetting'])) {
			if (! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mxupload_nonce'])), 'mxupload_nonce_action')) {
				add_action('admin_notices', array($this, 'display_nonce_verification_failed_notice'));
				return;
			}

			$sanitized_data = array();
			foreach ($_POST['mxsetting'] as $key => $value) {
				$sanitized_data[$key] = sanitize_text_field($value);
			}
			update_option('mxupload_settings', $sanitized_data);
			add_action('admin_notices', array($this, 'display_settings_saved_notice'));
		}
	}

	/**
	 * Success message.
	 */
	public function display_settings_saved_notice()
	{
?>
		<div class="notice notice-success-wrapper is-dismissible">
			<p><?php echo esc_html__('Settings saved successfully.', 'max-upload-file-size-manager'); ?></p>
		</div>
	<?php
	}

	/**
	 * Nonce error heading message.
	 */
	public function display_nonce_verification_failed_notice()
	{
	?>
		<div class="notice notice-error-wrapper is-dismissible ">
			<p><?php echo esc_html__('Nonce verification failed. Please try again.', 'max-upload-file-size-manager'); ?></p>
		</div>
		<?php
	}

	/**
	 * AJAX chunk receiver.
	 *
	 * Ajax callback for plupload to handle chunked uploads.
	 * Based on code by Davit Barbakadze
	 *
	 * Mirrors /wp-admin/async-upload.php
	 *
	 * @since 1.2.0
	 */
	
	 public function ajax_chunk_receiver() {
		global $wp_filesystem;
	
		// Include required WordPress files for filesystem API.
		if ( ! function_exists( 'request_filesystem_credentials' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
	
		// Initialize WP_Filesystem.
		$creds = request_filesystem_credentials( site_url() );
		if ( ! WP_Filesystem( $creds ) ) {
			wp_die( esc_html__( 'Failed to initialize filesystem API.', 'max-upload-file-size-manager' ) );
		}
	
		// Check that we have an upload and there are no errors.
		if ( empty( $_FILES ) || $_FILES['async-upload']['error'] ) {
			die();
		}
	
		if ( ! is_user_logged_in() || ! current_user_can( 'upload_files' ) ) {
			wp_die( esc_html__( 'Sorry, you are not allowed to upload files.', 'max-upload-file-size-manager' ) );
		}
	
		check_admin_referer( 'media-form' );
	
		// Get file chunks and parameters.
		$chunk             = isset( $_REQUEST['chunk'] ) ? intval( $_REQUEST['chunk'] ) : 0;
		$current_part      = $chunk + 1;
		$chunks            = isset( $_REQUEST['chunks'] ) ? intval( $_REQUEST['chunks'] ) : 0;
		$file_name         = isset( $_REQUEST['name'] ) ? sanitize_file_name( $_REQUEST['name'] ) : sanitize_file_name( $_FILES['async-upload']['name'] );
		$mxupload_temp_dir = apply_filters( 'mxupload_temp_dir', wp_upload_dir()['basedir'] . '/max-upload-file-size-manager' );
	
		// Only run on the first chunk.
		if ( $chunk === 0 ) {
			if ( ! $wp_filesystem->is_dir( $mxupload_temp_dir ) ) {
				$wp_filesystem->mkdir( $mxupload_temp_dir );
			}
	
			// Protect temp directory from browsing.
			$index_pathname = $mxupload_temp_dir . '/index.php';
			if ( ! $wp_filesystem->exists( $index_pathname ) ) {
				$wp_filesystem->put_contents( $index_pathname, "<?php\n// Silence is golden.\n", FS_CHMOD_FILE );
			}
	
			// Scan temp dir for files older than 24 hours and delete them.
			$files = glob( $mxupload_temp_dir . '/*.part' );
			if ( is_array( $files ) ) {
				foreach ( $files as $file ) {
					if ( @filemtime( $file ) < time() - DAY_IN_SECONDS ) {
						$wp_filesystem->delete( $file );
					}
				}
			}
		}
	
		$file_path = sprintf( '%s/%d-%s.part', $mxupload_temp_dir, get_current_blog_id(), sha1( $file_name ) );
	
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$size = $wp_filesystem->exists( $file_path ) ? size_format( $wp_filesystem->size( $file_path ), 3 ) : '0 B';
			error_log( "mxupload: Processing \"$file_name\" part $current_part of $chunks as $file_path. $size processed so far." );
		}
	
		$mxupload_max_upload_size = $this->get_upload_limit();
	
		if ( $wp_filesystem->exists( $file_path ) &&
			 $wp_filesystem->size( $file_path ) + filesize( $_FILES['async-upload']['tmp_name'] ) > $mxupload_max_upload_size ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( "mxupload: File size limit exceeded." );
			}
	
			$wp_filesystem->delete( $file_path );
	
			echo wp_json_encode( [
				'success' => false,
				'data'    => [
					'message'   => __( 'The file size has exceeded the maximum file size setting.', 'max-upload-file-size-manager' ),
					'file_name' => $file_name,
				],
			] );
			wp_die();
		}
	
		// Handle file writing using WP_Filesystem.
		$file_content = $wp_filesystem->get_contents( $_FILES['async-upload']['tmp_name'] );
	
		if ( $file_content ) {
			$existing_content = $chunk === 0 ? '' : $wp_filesystem->get_contents( $file_path );
			$new_content = $existing_content . $file_content;
	
			$wp_filesystem->put_contents( $file_path, $new_content, FS_CHMOD_FILE );
		} else {
			$wp_filesystem->delete( $file_path );
			wp_die( esc_html__( 'Error reading uploaded file.', 'max-upload-file-size-manager' ) );
		}
	
		// Handle the final chunk.
		if ( ! $chunks || $chunk === $chunks - 1 ) {
			$_FILES['async-upload']['tmp_name'] = $file_path;
			$_FILES['async-upload']['name']     = $file_name;
			$_FILES['async-upload']['size']     = $wp_filesystem->size( $file_path );
			$wp_filetype                        = wp_check_filetype_and_ext( $file_path, $file_name );
			$_FILES['async-upload']['type']     = $wp_filetype['type'];
	
			$this->wp_ajax_upload_attachment();
			die( '0' );
		}
	
		die();
	}
	
	
	
	/**
	 * Copied from wp-admin/includes/ajax-actions.php because we have to override the args for
	 * the media_handle_upload function. As of WP 6.0.1
	 */
	function wp_ajax_upload_attachment() 	{

		check_ajax_referer('media-form');

		if (! current_user_can('upload_files')) {
			echo wp_json_encode(
				array(
					'success' => false,
					'data'    => array(
						'message'   => esc_html__('Sorry, you are not allowed to upload files.','max-upload-file-size-manager'),
						'file_name' => sanitize_file_name(esc_html($_FILES['async-upload']['name'])),
					),
				)
			);

			wp_die();
		}

		if (isset($_REQUEST['post_id'])) {
			$post_id = (int) $_REQUEST['post_id'];

			if (! current_user_can('edit_post', $post_id)) {
				echo wp_json_encode(
					array(
						'success' => false,
						'data'    => array(
							'message'   => esc_html__('Sorry, you are not allowed to attach files to this post.','max-upload-file-size-manager'),
							'file_name' => sanitize_file_name(esc_html($_FILES['async-upload']['name'])),
						),
					)
				);

				wp_die();
			}
		} else {
			$post_id = null;
		}

		// Sanitize, Escape and Validate $_REQUEST['post_data'] as it is being used directly.
		$post_data = ! empty($_REQUEST['post_data']) ? _wp_get_allowed_postdata(_wp_translate_postdata(false, array_map('sanitize_text_field', array_map('wp_unslash', (array) $_REQUEST['post_data'])))) : array();

		if (is_wp_error($post_data)) {
			wp_die( esc_html( $post_data->get_error_message() ) );
		}

		// If the context is custom header or background, make sure the uploaded file is an image.
		if (isset($post_data['context']) && in_array($post_data['context'], array('custom-header', 'custom-background'), true)) {
			$wp_filetype = wp_check_filetype_and_ext(
				wp_unslash( sanitize_file_name( wp_normalize_path( $_FILES['async-upload']['tmp_name'] ) ) ),
				wp_unslash( sanitize_file_name( wp_normalize_path( $_FILES['async-upload']['name'] ) ) )
			);

			if (! wp_match_mime_types('image', $wp_filetype['type'])) {
				echo wp_json_encode(
					array(
						'success' => false,
						'data'    => array(
							'message'   => esc_html__('The uploaded file is not a valid image. Please try again.','max-upload-file-size-manager'),
							'file_name' => sanitize_file_name(esc_html($_FILES['async-upload']['name'])),
						),
					)
				);
				wp_die();
			}
		}

		// this is the modded function from wp-admin/includes/ajax-actions.php.
		$attachment_id = media_handle_upload(
			'async-upload',
			$post_id,
			$post_data,
			array(
				'action'    => 'wp_handle_sideload',
				'test_form' => false
			)
		);

		if (is_wp_error($attachment_id)) {
			echo wp_json_encode(
				array(
					'success' => false,
					'data'    => array(
						'message'   => $attachment_id->get_error_message(),
						'file_name' => sanitize_file_name(esc_html($_FILES['async-upload']['name'])),
					),
				)
			);

			wp_die();
		}

		if (isset($post_data['context']) && isset($post_data['theme'])) {
			if ('custom-background' === $post_data['context']) {
				update_post_meta($attachment_id, '_wp_attachment_is_custom_background', $post_data['theme']);
			}

			if ('custom-header' === $post_data['context']) {
				update_post_meta($attachment_id, '_wp_attachment_is_custom_header', $post_data['theme']);
			}
		}

		$attachment = wp_prepare_attachment_for_js($attachment_id);
		if (! $attachment) {
			wp_die();
		}

		echo wp_json_encode(
			array(
				'success' => true,
				'data'    => $attachment,
			)
		);

		wp_die();
	}

	/**
	 * Filter plupload params.
	 *
	 * @since 1.2.0
	 */
	public function filter_plupload_params($plupload_params)
	{

		$plupload_params['action'] = 'mxupload_chunker';
		return $plupload_params;
	}

	/**
	 * Filters Plupload settings.
	 *
	 * Adjusts the settings for Plupload, including chunk size and retries.
	 *
	 * @since 1.0.0
	 *
	 * @param array $plupload_settings An array of Plupload settings to be filtered.
	 * @return array Filtered Plupload settings.
	 */
	public function filter_plupload_settings($plupload_settings)
	{

		$max_chunk = (MB_IN_BYTES * 20);

		if ($max_chunk > $this->max_upload_size) {
			$default_chunk = ($this->max_upload_size * 0.8) / KB_IN_BYTES;
		} else {
			$default_chunk = $max_chunk / KB_IN_BYTES;
		}

		if (! defined('MXUPLOAD_BIG_FILE_UPLOADS_CHUNK_SIZE_KB')) {
			define('MXUPLOAD_BIG_FILE_UPLOADS_CHUNK_SIZE_KB', $default_chunk);
		}

		if (! defined('MXUPLOAD_BIG_FILE_UPLOADS_RETRIES')) {
			define('MXUPLOAD_BIG_FILE_UPLOADS_RETRIES', 1);
		}

		$plupload_settings['url']                      = admin_url('admin-ajax.php');
		$plupload_settings['filters']['max_file_size'] = $this->filter_upload_size_limit('') . 'b';
		$plupload_settings['chunk_size']               = MXUPLOAD_BIG_FILE_UPLOADS_CHUNK_SIZE_KB . 'kb';
		$plupload_settings['max_retries']              = MXUPLOAD_BIG_FILE_UPLOADS_RETRIES;

		return $plupload_settings;
	}

	/**
	 * Returns the maximum upload size.
	 *
	 * Retrieves the free space of the temporary directory.
	 *
	 * @since 1.0.0
	 *
	 * @param bool $unused Unused parameter; can be true or false.
	 * @return int Free disk space in bytes.
	 */
	public function filter_upload_size_limit($unused)
	{
		return $this->get_upload_limit();
	}

	/**
	 * Return the maximum upload limit in bytes for the current user.
	 *
	 * @since 2.0
	 *
	 * @return integer
	 */
	public function get_upload_limit()
	{
		$settings = $this->mxupload_settings();

		if ($settings['by_role'] && is_user_logged_in()) {
			$limit = 0;
			$user  = wp_get_current_user();
			foreach ((array) $user->roles as $role) {
				if (isset($settings['upload_size'][$role]['limit']) && $settings['upload_size'][$role]['limit'] > $limit) {
					$limit = $settings['upload_size'][$role]['limit'];
				}
			}
			if ($limit) {
				return $limit;
			} else {
				return $settings['upload_size']['all_user']['limit'];
			}
		} else {
			return $settings['upload_size']['all_user']['limit'];
		}
	}

	/**
	 * Return a cleaned up settings array with defaults if needed.
	 *
	 * @since 2.0
	 *
	 * @param false $format this is return true and false
	 *
	 * @return array
	 */
	public function mxupload_settings($format = false)
	{

		$settings = get_site_option('mxsetting');
		if (! is_array($settings)) {
			$settings = array();
		}

		if (! isset($settings['by_role'])) {
			$settings['by_role'] = false;
		}

		if (! isset($settings['upload_size']) || ! is_array($settings['upload_size'])) {
			$settings['upload_size'] = array();
		}

		if (! isset($settings['upload_size']['all_user']) || ! is_array($settings['upload_size']['all_user'])) {
			$settings['upload_size']['all_user'] = array();
		}

		if (! isset($settings['upload_size']['all_user']['limit'])) {
			$settings['upload_size']['all_user']['limit'] = 0;
		}

		if (! isset($settings['upload_size']['all_user']['format'])) {
			$settings['upload_size']['all_user']['format'] = $settings['upload_size']['all_user']['limit'] >= GB_IN_BYTES ? 'gb' : 'mb';
		}

		foreach (wp_roles()->roles as $role_key => $role) {
			if (isset($role['capabilities']['upload_files']) && $role['capabilities']['upload_files']) {
				if (! isset($settings['upload_size'][$role_key]['limit'])) {
					$settings['upload_size'][$role_key]['limit'] = $this->max_upload_size;
				}
				if (! isset($settings['upload_size'][$role_key]['format'])) {
					$settings['upload_size'][$role_key]['format'] = $settings['upload_size'][$role_key]['limit'] >= GB_IN_BYTES ? 'gb' : 'mb';
				}
			}
		}

		if ($format) {
			foreach ($settings['upload_size'] as $role_key => $value) {
				$divisor                                       = ($value['format'] === 'mb' ? MB_IN_BYTES : GB_IN_BYTES);
				$settings['upload_size'][$role_key]['limit'] = round($value['limit'] / $divisor, 1);
			}
		}

		return $settings;
	}

	/**
	 * Settings page display callback.
	 *
	 * @since 2.0
	 */
	public function settings_page()
	{

		$save_error = $save_success = false;
		if (isset($_POST['mxupload-btn'])) {

			if (! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['mxupload_nonce'])), 'mxupload_nonce_action')) {
				add_action('admin_notices', array($this, 'display_nonce_verification_failed_notice'));
				return;
			}

			$settings_option = $this->mxupload_settings();

			if (isset($_POST['mxsetting']['by_role'])) {
				foreach (wp_roles()->roles as $role_key => $role) {
					if ($_POST['mxsetting']['upload_size'][$role_key] <= 0) {
						$save_error = true;
					} else {
						$settings_option['upload_size'][$role_key]['limit']  = absint($_POST['mxsetting']['upload_size'][$role_key]['limit'] * ($_POST['mxsetting']['upload_size'][$role_key]['format'] === 'mb' ? MB_IN_BYTES : GB_IN_BYTES));
						$settings_option['upload_size'][$role_key]['format'] = ($_POST['mxsetting']['upload_size'][$role_key]['format'] === 'mb' ? 'mb' : 'gb');
					}
				}
				$settings_option['by_role'] = true;
			} else {
				if ($_POST['mxsetting']['upload_size'] <= 0) {
					$save_error = true;
				} else {
					$settings_option['upload_size']['all_user']['limit']  = absint($_POST['mxsetting']['upload_size']['all_user']['limit'] * ($_POST['mxsetting']['upload_size']['all_user']['format'] === 'mb' ? MB_IN_BYTES : GB_IN_BYTES));
					$settings_option['upload_size']['all_user']['format'] = ($_POST['mxsetting']['upload_size']['all_user']['format'] === 'mb' ? 'mb' : 'gb');
				}

				$settings_option['by_role'] = false;
			}

			if (! $save_error) {
				update_site_option('mxsetting', $settings_option);
				$save_success = true;
			}
		}
		return get_option(true);
	}

	function get_filetypes_list()
	{
		$extensions = array_keys(wp_get_mime_types());
		$list       = [];
		foreach (array_keys(wp_get_ext_types()) as $key) {
			$list[$key] = [];
		}

		foreach ($extensions as $extension) {
			$type = wp_ext2type(explode('|', $extension)[0]);
			if ($type) {
				$list[$type][$extension] = ['label' => str_replace('|', '/', $extension), 'custom' => false];
			} else {
				$list['other'][$extension] = ['label' => str_replace('|', '/', $extension), 'custom' => false];
			}
		}

		$list['image']['heif']     = ['label' => 'heif', 'custom' => true];
		$list['image']['webp']     = ['label' => 'webp', 'custom' => true];
		$list['image']['svg|svgz'] = ['label' => 'svg/svgz', 'custom' => true];
		$list['image']['apng']     = ['label' => 'apng', 'custom' => true];
		$list['image']['avif']     = ['label' => 'avif', 'custom' => true];

		$list['interactive']['keynote'] = ['label' => 'keynote', 'custom' => true];

		return $list;
	}

	/**
	 * Add to the list of common file extensions and their types.
	 *
	 * @return array[] Multi-dimensional array of file extensions types keyed by the type of file.
	 */
	function filter_ext_types($types)
	{
		return array_merge_recursive(
			$types,
			array(
				'image'       => array('webp', 'svg', 'svgz', 'apng', 'avif'),
				'audio'       => array('ra', 'ram', 'mid', 'midi', 'wax'),
				'video'       => array('webm', 'wmx', 'wm'),
				'document'    => array('wri', 'mpp', 'dotx', 'onetoc', 'onetoc2', 'onetmp', 'onepkg', 'odg', 'odc', 'odf'),
				'spreadsheet' => array('odb', 'xla', 'xls', 'xlt', 'xlw', 'mdb', 'xltx', 'xltm', 'xlam', 'odb'),
				'interactive' => array('pot', 'potx', 'potm', 'ppam'),
				'text'        => array('ics', 'rtx', 'vtt', 'dfxp', 'log', 'conf', 'text', 'def', 'list', 'ini'),
				'application' => array('class', 'exe'),
			)
		);
	}

	public function mxupload_run_scan()
	{

		$path = $this->get_upload_dir_root();
		$file_scan = new MXUPLOAD_File_Scan($path);
		$file_scan->start();
	}

	/**
	 * AJAX handler for the filesystem scanner popup.
	 *
	 * @since 2.0
	 */
	public function mxupload_file_scan()
	{

		if (! isset($_POST['nonce']) || ! wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'mxupload_ajax_nonce')) {
			add_action('admin_notices', array($this, 'display_nonce_verification_failed_notice'));
			return;
		}

		// $flagData = isset($_POST['flagData']) ? $_POST['flagData'] : '';
		$flagData = '';
		if (isset($_POST['flagData'])) {
			$flagData = sanitize_text_field(wp_unslash($_POST['flagData']));
			// Validate the data if necessary, e.g., check for expected format or values
		}
		update_site_option('mxupload_flag_data', $flagData);

		$path = $this->get_upload_dir_root();
		$remaining_dirs = [];

		// Validate path is within uploads dir to prevent path traversal
		if (isset($_POST['remaining_dirs']) && is_array($_POST['remaining_dirs'])) {
			foreach (array_map('sanitize_text_field', wp_unslash($_POST['remaining_dirs'])) as $dir) {
				$realpath = realpath($path . $dir);
				if (0 === strpos($realpath, $path)) {
					$remaining_dirs[] = esc_attr($dir);
				}
			}
		}

		$file_scan = new MXUPLOAD_File_Scan($path, $this->ajax_timelimit, $remaining_dirs);
		$file_scan->start();
		$file_count     = number_format_i18n($file_scan->get_total_files());
		$file_size      = size_format($file_scan->get_total_size(), 2);
		$remaining_dirs = $file_scan->paths_left;
		$is_done        = $file_scan->is_done;

		$data = compact('file_count', 'file_size', 'is_done', 'remaining_dirs');

		$file_labels = array();
		$file_colors = array();
		$file_sizes  = array();

		$file_data_array = $this->get_filetypes(false);

		if (! empty($file_data_array)) :
			ob_start();
		?>
			<div class="card-section">
				<div class="card-wrapper">
					<div class="card-content-wrapper">
						<?php
						$scan_results = get_site_option('mxupload_file_scan');
						if (isset($scan_results['scan_finished']) && $scan_results['scan_finished']) {
							if (isset($scan_results['types'])) {
								$total_files   = array_sum(wp_list_pluck($scan_results['types'], 'files'));
								$total_storage = array_sum(wp_list_pluck($scan_results['types'], 'size'));
							} else {
								$total_files   = 0;
								$total_storage = 0;
							}
						?>
							<p class="mx-heading"><?php esc_html_e("Total Bytes / Files", 'max-upload-file-size-manager'); ?></p>
							<span class="mx-text"><?php echo esc_html(size_format($total_storage, 2)); ?> / <small class="text-muted"> <?php echo esc_html(number_format_i18n($total_files)); ?></small></span>
						<?php } ?>

						<div class="card-file-details">
							<table>
								<thead>
									<tr>
										<th>Label</th>
										<th>Size</th>
										<th>Files</th>
									</tr>
								</thead>
								<?php

								if (! empty($file_data_array)) {
									foreach ($file_data_array as $file_data) {
										$file_label = isset($file_data->label) ? $file_data->label : '';
										$file_color = isset($file_data->color) ? $file_data->color : '';
										$file_size  = isset($file_data->size) ? $file_data->size : '';
										$file_decimal = isset($file_data->files) ? $file_data->files : '';

										$file_labels[] = $file_label;
										$file_colors[] = $file_color;
										$file_sizes[] = $file_decimal;
								?>
										<tr>
											<td>
												<span class="mxupload-color" style='background-color: <?php echo esc_html($file_color); ?> '></span>
												<p class="file-label"><?php echo esc_html($file_label); ?></p>
											</td>
											<td><?php echo esc_html(size_format($file_size, 2)); ?> </td>
											<td><?php echo esc_html(number_format_i18n($file_decimal)); ?></td>
										</tr>
								<?php
									}
								}
								?>
							</table>
						</div>
					</div>

					<div class="mxupload-doughnut-wrapper" 
					data-labels="<?php echo esc_attr(wp_json_encode($file_labels)); ?>"
					data-colors="<?php echo esc_attr(wp_json_encode($file_colors)); ?>"
					data-sizes="<?php echo esc_attr(wp_json_encode($file_sizes)); ?>"
					total-files='<?php echo esc_attr(number_format_i18n($total_files)); ?>' 
					total-storage='<?php echo esc_attr(size_format($total_storage, 2)); ?>'>
						<canvas id="mxupload-doughnut-chart"></canvas>
					</div>

					<div class="mxupload-settings-footer">
						<button type="button" class="btn-generate-report" data-flag="1"><?php esc_html_e('Please Regenerate Report', 'max-upload-file-size-manager'); ?></button>
					</div>

				</div>
			</div>
<?php
			$html_content = ob_get_clean();
		endif;


		// Return the data and the HTML content
		$data['html_content'] = $html_content;
		wp_send_json_success($data);
	}

	/**
	 * Get data array of filescan results.
	 *
	 * @since 2.0
	 *
	 * @param false $is_chart If data should be formatted for chart.
	 *
	 * @return array
	 */
	public function get_filetypes($is_chart = false)
	{

		$results = get_site_option('mxupload_file_scan');
		if (isset($results['types'])) {
			$types = $results['types'];
		} else {
			$types = [];
		}

		$data = [];
		foreach ($types as $type => $meta) {
			$data[$type] = (object) [
				'color' => $this->get_file_type_format($type, 'color'),
				'label' => $this->get_file_type_format($type, 'label'),
				'size'  => $meta->size,
				'files' => $meta->files,
			];
		}

		$chart = [];
		if ($is_chart) {
			foreach ($data as $item) {
				$chart['datasets'][0]['data'][]            = $item->size;
				$chart['datasets'][0]['backgroundColor'][] = $item->color;
				/* translators: %s: file type label, %s: number of files, %s: total size of files */
				$chart['labels'][] = sprintf(
					/* translators: %1$s: file type label, %2$s: number of files, %3$s: total size of files */
					'%1$s: %2$s %4$s, %3$s %5$s',
					$item->label,
					number_format_i18n($item->files),
					size_format($item->size, 1),
					_n('file', 'files', $item->files, 'max-upload-file-size-manager'),
					__('totalling', 'max-upload-file-size-manager')
				);
			}

			$total_size     = array_sum(wp_list_pluck($data, 'size'));
			$total_files    = array_sum(wp_list_pluck($data, 'files'));
			/* translators: %s: total size of files, %s: total number of files */
			$chart['total'] = sprintf(
				/* translators: %s: total size of files, %s: total number of files */
				sprintf(_n('%1$s / %2$s File', '%1$s / %2$s Files', $total_files, 'max-upload-file-size-manager'), number_format_i18n($total_files), 
				size_format($total_size, 2),
				number_format_i18n($total_files)
			));

			return $chart;
		}

		return $data;
	}

	/**
	 * Get HTML format details for a filetype.
	 *
	 * @since 2.0
	 *
	 * @param string $type
	 * @param string $key
	 *
	 * @return mixed
	 */
	public function get_file_type_format($type, $key)
	{
		$labels = [
			'image'    => ['color' => '#0376DA', 'label' => esc_html__('Images', 'max-upload-file-size-manager')],
			'audio'    => ['color' => '#00A167', 'label' => esc_html__('Audio', 'max-upload-file-size-manager')],
			'video'    => ['color' => '#F9C225', 'label' => esc_html__('Video', 'max-upload-file-size-manager')],
			'document' => ['color' => '#CE0C50', 'label' => esc_html__('Documents', 'max-upload-file-size-manager')],
			'archive'  => ['color' => '#EC008C', 'label' => esc_html__('Archives', 'max-upload-file-size-manager')],
			'code'     => ['color' => '#4056B1', 'label' => esc_html__('Code', 'max-upload-file-size-manager')],
			'other'    => ['color' => '#7A3889', 'label' => esc_html__('Other', 'max-upload-file-size-manager')],
		];

		if (isset($labels[$type])) {
			return $labels[$type][$key];
		} else {
			return $labels['other'][$key];
		}
	}

	/**
	 * Get the file type category for a given extension.
	 *
	 * @since 2.0
	 *
	 * @param string $filename
	 *
	 * @return string
	 */
	public function get_file_type($filename)
	{
		$extensions = [
			'image'    => ['jpg', 'jpeg', 'jpe', 'gif', 'png', 'bmp', 'tif', 'tiff', 'ico', 'svg', 'svgz', 'webp'],
			'audio'    => ['aac', 'ac3', 'aif', 'aiff', 'flac', 'm3a', 'm4a', 'm4b', 'mka', 'mp1', 'mp2', 'mp3', 'ogg', 'oga', 'ram', 'wav', 'wma'],
			'video'    => ['3g2', '3gp', '3gpp', 'asf', 'avi', 'divx', 'dv', 'flv', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'mpv', 'ogm', 'ogv', 'qt', 'rm', 'vob', 'wmv', 'webm'],
			'document' => [
				'log',
				'asc',
				'csv',
				'tsv',
				'txt',
				'doc',
				'docx',
				'docm',
				'dotm',
				'odt',
				'pages',
				'pdf',
				'xps',
				'oxps',
				'rtf',
				'wp',
				'wpd',
				'psd',
				'xcf',
				'swf',
				'key',
				'ppt',
				'pptx',
				'pptm',
				'pps',
				'ppsx',
				'ppsm',
				'sldx',
				'sldm',
				'odp',
				'numbers',
				'ods',
				'xls',
				'xlsx',
				'xlsm',
				'xlsb',
			],
			'archive'  => ['bz2', 'cab', 'dmg', 'gz', 'rar', 'sea', 'sit', 'sqx', 'tar', 'tgz', 'zip', '7z', 'data', 'bin', 'bak'],
			'code'     => ['css', 'htm', 'html', 'php', 'js', 'md'],
		];

		$ext = preg_replace('/^.+?\.([^.]+)$/', '$1', $filename);
		if (! empty($ext)) {
			$ext = strtolower($ext);
			foreach ($extensions as $type => $exts) {
				if (in_array($ext, $exts, true)) {
					return $type;
				}
			}
		}

		return 'other';
	}

	/**
	 * Get root upload dir for multisite. Based on _wp_upload_dir().
	 *
	 * @since 2.0
	 *
	 * @return string Uploads base directory
	 */
	public function get_upload_dir_root() {
		// Use the wp_upload_dir() function to get the uploads directory path
		$upload_dir = wp_upload_dir();
		$upload_path = trim(get_option('upload_path'));
	
		// If no upload path is set, use the default upload directory and add custom folder
		if (empty($upload_path) || 'wp-content/uploads' === $upload_path) {
			$dir = $upload_dir['basedir'] . '/max-upload-file-size-manager';
		} elseif (0 !== strpos($upload_path, ABSPATH)) {
			// If the upload path is not absolute, join it with ABSPATH
			$dir = path_join(ABSPATH, $upload_path);
		} else {
			// If the upload path is already absolute
			$dir = $upload_path;
		}
	
		// Honor the value of UPLOADS constant, if set and ms-files rewriting is disabled
		if (defined('UPLOADS') && !is_multisite() && !get_site_option('ms_files_rewriting')) {
			$dir = ABSPATH . UPLOADS;
		}
	
		// Handle multisite uploads directory correctly
		if (is_multisite()) {
			if (get_site_option('ms_files_rewriting') && defined('UPLOADS') && !ms_is_switched()) {
				$dir = ABSPATH . untrailingslashit(UPLOADBLOGSDIR);
			} elseif (!get_site_option('ms_files_rewriting')) {
				$dir = ABSPATH . UPLOADS;
			}
		}
	
		// Return the basedir, which is the root of the upload directory or the custom path
		return $dir;
	}
	

	public function mxupload_set_schedule()
	{
		$time = 60;
		$schedules['mxupload_set_crone_time'] = array(
			'interval' => $time,
			'display'  => esc_html__('Mx Uplaod x Minutes', 'max-upload-file-size-manager'),
		);
		return $schedules;
	}

	public function mxupload_scheduled_event()
	{
		if (! wp_next_scheduled('mxupload_refresh_analysis')) {
			wp_schedule_event(time(), 'mxupload_set_crone_time', 'mxupload_refresh_analysis');
		}
	}

	public function mxupload_update_store_analysis()
	{
		$this->mxupload_run_scan();
	}

	public static function is_plugin_installed($slug)
	{
		$all_plugins = get_plugins();
		foreach ($all_plugins as $plugin_path => $plugin_info) {
			if (strpos($plugin_path, $slug) !== false) {
				return true;
			}
		}

		return false;
	}

	public static function find_plugin_main_file($slug)
	{
		if (!function_exists('get_plugins')) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$all_plugins = get_plugins();
		foreach ($all_plugins as $plugin_path => $plugin_info) {
			$path_parts = explode('/', $plugin_path);
			if (!empty($path_parts) && $path_parts[0] === $slug) {
				return $plugin_path;
			}
		}
		return false;
	}
}
new MXUPLOAD_Admin_Main();
