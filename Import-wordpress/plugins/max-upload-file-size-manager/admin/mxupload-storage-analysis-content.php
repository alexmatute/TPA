<?php

/**
 * Template Name: Storage Analysis
 * Description: This page display the storage analysis information.
 */
defined('ABSPATH') || exit;

?>
<div class="loader">
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
		<radialGradient id='a6' cx='.66' fx='.66' cy='.3125' fy='.3125' gradientTransform='scale(1.5)'>
			<stop offset='0' stop-color='#0376DA'></stop>
			<stop offset='.3' stop-color='#0376DA' stop-opacity='.9'></stop>
			<stop offset='.6' stop-color='#0376DA' stop-opacity='.6'></stop>
			<stop offset='.8' stop-color='#0376DA' stop-opacity='.3'></stop>
			<stop offset='1' stop-color='#0376DA' stop-opacity='0'></stop>
		</radialGradient>
		<circle transform-origin='center' fill='none' stroke='url(#a6)' stroke-width='15' stroke-linecap='round' stroke-dasharray='200 1000' stroke-dashoffset='0' cx='100' cy='100' r='70'>
			<animateTransform type='rotate' attributeName='transform' calcMode='spline' dur='2' values='360;0' keyTimes='0;1' keySplines='0 0 1 1' repeatCount='indefinite'></animateTransform>
		</circle>
		<circle transform-origin='center' fill='none' opacity='.2' stroke='#0376DA' stroke-width='15' stroke-linecap='round' cx='100' cy='100' r='70'></circle>
	</svg>
</div>

<?php
// Get the flag data from the site options
$flag_data = get_site_option('mxupload_flag_data');
$file_labels = array();
$file_colors = array();
$file_sizes  = array();
?>
<div class="card-section">

	<?php if (empty($flag_data)) { ?>
		<div class="card-block">
			<h2 class="main-title"><?php esc_html_e('Analyze Your Storage Usage', 'max-upload-file-size-manager'); ?></h2>
			<p class="lead"><?php esc_html_e("Run a free scan of your existing Media Library to analyze and visualize storage usage by file type.", 'max-upload-file-size-manager'); ?></p>
			<button type="button" class="btn-generate-report" data-flag="1"><?php esc_html_e('Please Generate Report', 'max-upload-file-size-manager'); ?></button>
		</div>

		<?php } else {
		$file_data_array = $this->get_filetypes(false);
		if (!empty($file_data_array)) { ?>
			<div class="card-wrapper">
				<div class="card-content-wrapper">
					<?php
					// Get the scan results from site options
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
									<th><?php esc_html_e('Label', 'max-upload-file-size-manager'); ?></th>
									<th><?php esc_html_e('Size', 'max-upload-file-size-manager'); ?></th>
									<th><?php esc_html_e('Files', 'max-upload-file-size-manager'); ?></th>
								</tr>
							</thead>
							<?php
							$file_data_array = $this->get_filetypes(false);
							if (!empty($file_data_array)) {
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
					<button type="button" class="btn-generate-report" data-flag="1"><?php esc_html_e('Regenerate Report', 'max-upload-file-size-manager'); ?></button>
				</div>

			</div>
		<?php } else { ?>
			<div class="mxupload-settings-footer">
				<button type="button" class="btn-generate-report" data-flag="1"><?php esc_html_e('Regenerate Report', 'max-upload-file-size-manager'); ?></button>
			</div>

			<p class="error-text"><?php esc_html_e('Storage Analysis Data Not Found: We have unable to retrieve the storage analysis data at the moment. Please try again later.', 'max-upload-file-size-manager'); ?></p>
		<?php } ?>
	<?php } ?>

</div>