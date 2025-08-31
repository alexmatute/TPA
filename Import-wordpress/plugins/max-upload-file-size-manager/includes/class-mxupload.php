<?php

/**
 *  Addon Main Class
 */
defined('ABSPATH') || exit;

/**
 * Main Class
 */
class MXUPLOAD_Report_Main
{

	/**
	 * Created Instance for main class
	 *
	 * @var Object
	 */
	protected static $_instance = null;

	/**
	 * Constructor
	 */
	public function __construct()
	{

		$this->includes();
	}

	/**
	 * Instance function
	 */
	public static function instance()
	{
		if (is_null(self::$_instance)) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	public function includes()
	{

		if (! class_exists('WCOAA_Admin_Main', false)) {
			include_once MXUPLOAD_ABSPATH . 'includes/class-mxupload-functions.php';
			include_once MXUPLOAD_ABSPATH . 'includes/class-mxupload-settings.php';
			include_once MXUPLOAD_ABSPATH . 'includes/class-mxupload-storage-analysis.php';
			include_once MXUPLOAD_ABSPATH . 'includes/class-mxupload-ini-config.php';
		}
	}
}
