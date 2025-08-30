<?php

/**
 * Template Name: Maximum Upload Size
 * Description: This page display the maximum upload size settings.
 */

defined('ABSPATH') || exit;

?>

<div class="mxupload-size-wrapper">
    <div class="mxupload-size-text">
        <h2 class="mxupload-heading"><?php esc_html_e('Maximum Upload Size', 'max-upload-file-size-manager'); ?></h2>
        <p><strong><?php esc_html_e('Max Upload File Size Manager', 'max-upload-file-size-manager'); ?> </strong><?php esc_html_e(' empowers you to effortlessly overcome the 2 GB upload limit set by your hosting provider. Upload large files seamlessly. You can easily configure the maximum file size users are allowed to upload, setting limits in Megabytes (MB) or Gigabytes (GB) according to your hosting capabilities. Plus, with our customizable user role feature, you can define unique maximum file sizes for each user role, enhancing your upload management experience!', 'max-upload-file-size-manager'); ?></p>

    </div>

    <?php
    // Get the maximum upload size settings
    $mxsetting = get_option('mxsetting');
    $by_role   = isset($mxsetting['by_role']) ? $mxsetting['by_role'] : 0;
    ?>
    <div class="mxupload-size-settings <?php if ($by_role) echo 'is-active'; ?>">

        <div class="mxupload-byrole">
            <div class="custom-control custom-switch">
                <input type="checkbox" name="mxsetting[by_role]" class="custom-control-input" id="customSwitch_role" value="1" <?php if ($by_role) echo 'checked'; ?>>
                <label class="custom-control-label" for="customSwitch_role"><?php esc_html_e('Customize by user role', 'max-upload-file-size-manager'); ?></label>
            </div>
        </div>
        <?php

        // Get all user roles with their upload limits and settings
        $user_roles = MXUPLOAD_Admin_Main::get_all_user_role();
        $count = count($user_roles);

        // Define allowed tags and attributes for wp_kses()
        $allowed_tags = [
            'div'    => ['class' => []],
            'span'   => ['class' => [], 'style' => []],
            'a'      => ['href' => [], 'title' => [], 'class' => []],
            'p'      => ['class' => [], 'style' => []],
            'strong' => [],
            'em'     => [],
            'br'     => [],
            'ul'     => ['class' => []],
            'li'     => ['class' => []],
            'input'  => [
                'type' => [],
                'name' => [],
                'value' => [],
                'class' => [],
                'id' => [],
                'placeholder' => [],
                'checked' => true // Set to true for boolean attributes
            ],
            'select'   => ['name' => [], 'class' => [], 'id' => []],
            'option'   => ['value' => [], 'selected' => true],
            'optgroup' => ['label' => []],
            // Add any other tags and attributes you need to allow here
        ];

        foreach ($user_roles as $key => $user_role) {
            // Check if it's the first array
            if ($key === 0) {
                echo wp_kses(mxupload_field_html($user_role), $allowed_tags);
            } else {
                if ($key === 1) {
                    echo '<div class="user-role-wrapper">';
                }
                echo wp_kses(mxupload_field_html($user_role), $allowed_tags);
                if ($key === $count - 1) {
                    echo '</div>';
                }
            }
        }
        ?>
    </div>
</div>