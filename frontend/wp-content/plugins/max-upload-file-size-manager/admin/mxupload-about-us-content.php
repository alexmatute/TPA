<?php

/**
 * Template Name: MX Upload About Us
 * Description: This is a page template for MX Upload About Us page.
 */
defined('ABSPATH') || exit;

?>
<div class="mxupload-about-block">
	<div class="mxupload-about-wrapper">
		<div class="mxupload-abount-content">
			<div class="mxupload-about-content-wrap">
				<h3 class="mxupload-heading"><?php esc_html_e('Welcome to BrainFleck Solutions', 'max-upload-file-size-manager'); ?></h3>
				<p><?php esc_html_e('At ', 'max-upload-file-size-manager'); ?> <strong><a href="https://brainfleck.com/" target="_blank"><?php esc_html_e('BrainFleck Solutions, ', 'max-upload-file-size-manager'); ?></a></strong><?php esc_html_e('we specialize in creating cutting-edge digital solutions designed to elevate your business.', 'max-upload-file-size-manager'); ?> </p>
				<p><?php esc_html_e('From dynamic website development to innovative custom applications, our experienced team is dedicated to delivering excellence tailored to your needs. team excels in website development, custom software solutions, and seamless integrations, all tailored to meet your unique goals. With a focus on innovation, we leverage the latest technologies to create scalable, user-friendly solutions that not only enhance your online presence but also deliver real results.', 'max-upload-file-size-manager'); ?> </p>
				<p><?php esc_html_e('Explore how we can take your digital strategy to the next level at', 'max-upload-file-size-manager'); ?> <strong><a href="https://brainfleck.com/" target="_blank"><?php esc_html_e('BrainFleck Solutions', 'max-upload-file-size-manager'); ?></a></strong> </p>
			</div>
			<div class="mxupload-bfs-image">
				<div class="mxupload-image-block">
					<a href="https://brainfleck.com/" target="_blank">
						<img src="<?php echo esc_url(MXUPLOAD_PLUGIN_URL . '/assets/img/logo-white.png'); ?>" alt="Site Logo" />
					</a>
				</div>
			</div>
		</div>

		<?php
		// Plugin List Template
		// This template is used to display plugin list.
		if (isset($plugin_data) && is_array($plugin_data) && !empty($plugin_data)) : ?>
			<div class="mxupload-plists">
				<?php
				foreach ($plugin_data as $plugin_info) {
					$plugin_name        = isset($plugin_info['title']) ? $plugin_info['title'] : '';
					$plugin_download    = isset($plugin_info['download']) ? $plugin_info['download'] : '';
					$plugin_description = isset($plugin_info['description']) ? $plugin_info['description'] : '';
					$plugin_icons       = isset($plugin_info['icons']) ? $plugin_info['icons'] : '';
					$plugin_slug        = isset($plugin_info['slug']) ? $plugin_info['slug'] : '';

					// Check if the plugin is installed.
					$is_installed     = MXUPLOAD_Admin_Main::is_plugin_installed($plugin_slug);
					$plugin_main_file = MXUPLOAD_Admin_Main::find_plugin_main_file($plugin_slug);
					$is_active        = is_plugin_active($plugin_main_file);

					if ($is_installed) {
						if ($is_active) {
							$button_text  = 'Active';
							$button_label = 'Activated';
							$button_class = 'button-disabled';
							$button_url   = '#';
						} else {
							$button_text  = 'Activate Now';
							$button_label = 'Installed';
							$button_class = 'activate-now button';
							$button_url   = wp_nonce_url(
								self_admin_url('plugins.php?action=activate&plugin=' . $plugin_main_file),
								'activate-plugin_' . $plugin_main_file
							);
						}
					} else {
						$button_text  = 'Download';
						$button_label = 'Not Installed';
						$button_class = 'install-now button';
						$button_url   = wp_nonce_url(
							self_admin_url('update.php?action=install-plugin&plugin=' . $plugin_slug),
							'install-plugin_' . $plugin_slug
						);
					}
				?>
					<div class="mxupload-plist">
						<div class="text-with-media">
							<img src="<?php echo esc_url($plugin_icons); ?>" alt="<?php echo esc_attr($plugin_name); ?>" width="128" height="128" />
							<div class="mxupload-heading-wrapper">
								<h4 class="plugin-heading"><?php echo esc_html($plugin_name); ?></h4>
								<p class="plugin-short-info"><?php esc_html_e('Status : ', 'max-upload-file-size-manager'); ?><?php echo esc_html($button_label); ?></p>
							</div>
						</div>
						<p class="mxupload-description"><?php echo wp_kses_post($plugin_description); ?></p>
						<a href="<?php echo esc_url($button_url); ?>" class="btn-download btn-primary <?php echo esc_attr($button_class); ?>"><?php echo esc_html($button_text); ?></a>
					</div>
				<?php } ?>
			</div>
		<?php endif; ?>
	</div>
</div>