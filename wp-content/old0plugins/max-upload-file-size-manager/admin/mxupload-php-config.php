<?php

/**
 * Template Name: PHP Config
 * Description: This page display the php config information.
 */

defined('ABSPATH') || exit;
?>

<div class="php-section">
    <table>
        <thead>
            <tr>
                <th><?php esc_html_e('Title', 'max-upload-file-size-manager'); ?></th>
                <th><?php esc_html_e('Status', 'max-upload-file-size-manager'); ?></th>
                <th><?php esc_html_e('Message', 'max-upload-file-size-manager'); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($php_config_data as $php_data) {
                $title           = isset($php_data['title']) ? $php_data['title'] : '';
                $version         = isset($php_data['version']) ? $php_data['version'] : '';
                $status          = isset($php_data['status']) ? $php_data['status'] : '';
                $success_message = isset($php_data['success_message']) ? $php_data['success_message'] : '';
                $error_message   = isset($php_data['error_message']) ? $php_data['error_message'] : '';
            ?>
                <tr>
                    <td><?php echo esc_html($title); ?></td>
                    <td>
                        <?php if (1 == $status) { ?>
                            <span class="success-icon">
                                <svg class="svg-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M341.6 780.1c39.5-88.9 82.1-174.6 127.8-257.4 45.7-82.6 94.7-161 147.3-235.3 52.6-74.3 92.8-125.1 120.4-152.7s46.8-43.7 57.5-48.4c10.6-4.7 34-9.6 70.3-14.7s61.1-7.7 74.6-7.7c8.5 0 12.9 3.3 12.9 9.8 0 4.1-1.5 8.1-4.6 11.9-3 3.9-11.9 12.4-26.5 25.3-73.7 68.6-154.8 169.6-243.1 303.4C589.8 548.2 516 688.6 456.5 835.8c-24.1 58.8-40.5 94-49.5 105.8-9 12.3-37.3 18.3-84.9 18.3-34.2 0-54.7-3.5-61.4-10.4s-20.2-25.8-40.7-56.8c-33.4-51.6-72-100.5-115.4-146.4-22-23.1-32.9-40.7-32.9-52.5 0-16.2 11.9-32.8 36-49.8 23.9-16.9 43.8-25.3 59.7-25.3 20.3 0 45.3 11.2 74.9 33.5 29.6 22.9 62.7 65.4 99.3 127.9z" />
                                </svg>
                            </span>
                        <?php } else { ?>
                            <span class="dashicons dashicons-warning"></span>
                        <?php }; ?>
                    </td>
                    <td>
                        <?php if (1 == $status) { ?>
                            <p class="mxupload_status_message">
                                <?php echo esc_html($version); ?> <?php echo esc_html($success_message); ?>
                            </p>
                        <?php } else { ?>
                            <?php echo esc_html($version); ?>
                            <p class="mxupload_status_message"><?php echo esc_html($error_message); ?></p>
                        <?php }; ?>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>
</div>