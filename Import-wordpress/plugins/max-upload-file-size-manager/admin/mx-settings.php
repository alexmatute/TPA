<?php

/**
 * Template Name: MX Upload Settings
 * Description: This is a page template for MX Upload Settings page.
 */
defined('ABSPATH') || exit;

$settings = $this->get_settings_nav();

?>
<div id="mxupload-settings-wrapper" class="mxupload-settings-wrappper">

    <div class="mxupload-settings-banner">
        <div class="logo-title-content">
            <div class="logo">
                <a href="https://brainfleck.com/" target="_blank">
                    <img src="<?php echo esc_url(MXUPLOAD_PLUGIN_URL . '/assets/img/bfs-icon.jpg'); ?>" alt="img" />
                </a>
            </div>
            <div class="banner-title">
                <h1><?php esc_html_e('Max Upload File Size Manager', 'max-upload-file-size-manager'); ?></h1>
            </div>
        </div>
        <div class="review-content">
            <h2><?php esc_html_e('Do you like this plugin?', 'max-upload-file-size-manager'); ?></h2>
            <p><?php esc_html_e('Please, take few seconds of', 'max-upload-file-size-manager'); ?> <a href="https://wordpress.org/plugins/wc-order-analytics-add-on/" target="_blank"><?php esc_html_e('rate it on WordPress.org', 'max-upload-file-size-manager'); ?></a></p>
            <div class="review-img">
                <img src="<?php echo esc_url(MXUPLOAD_PLUGIN_URL . '/assets/img/review.png'); ?>" alt=""/>
            </div>
        </div>
    </div>
    <div class="mxupload-settings-wrapper">
        <!-- Only one of the tabs will be active at a time -->
        <form class="mxupload-form" action="#" method="post">
            <?php wp_nonce_field('mxupload_nonce_action', 'mxupload_nonce'); ?>
            <div class="mxupload-settings-area">

                <div class="mxupload-settings-nav-area">
                    <div class="maxupload-content-nav-area">
                        <div class="mxupload-settings-brand">
                            <a href="https://brainfleck.com" target="_blank">
                                <img src="<?php echo esc_url(MXUPLOAD_PLUGIN_URL . '/assets/img/logo.png'); ?>" alt="<?php esc_attr_e('img', 'max-upload-file-size-manager'); ?>" />
                            </a>
                        </div>

                        <div class="mxupload-wrapper">
                            <ul class="mxupload-nav-wrapper">
                                <?php
                                $count = 1;
                                foreach ($settings as $value) {
                                    $ac_class = ($count == 1) ? 'active' : '';
                                    $count++;
                                ?>
                                    <li class="<?php echo esc_attr($value['id']); ?> <?php echo esc_attr($ac_class); ?>">
                                        <a href="#<?php echo esc_attr($value['id']); ?>" title="<?php echo esc_attr($value['title']); ?>">
                                            <div class="mxupload-nav-item">
                                                <div class="mxupload-nav-icon">
                                                    <img class="icon-seting" src="<?php echo esc_url($value['icon']); ?>" alt="img" title="" />
                                                </div>
                                                <div class="mxupload-nav-title">
                                                    <h4><?php echo esc_html($value['title']); ?></h4>
                                                    <p><?php echo esc_html($value['desc']); ?></p>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                <?php } ?>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="mxupload-settings-content-area">
                <?php
                $count = 1;
                $activeTab = isset($_GET['tab']) ? sanitize_key(wp_unslash($_GET['tab'])) : 'mxupload_settings'; // Default tab
                foreach ($settings as $value) {
                    $ac_class = ($value['id'] == $activeTab) ? 'active' : ''; ?>
                    <section id="<?php echo esc_attr(isset($value['id']) ? $value['id'] : '#'); ?>" class="tabs <?php echo esc_attr($ac_class); ?>">
                        <div class="mxupload-settings-content-header">
                            <h2><span class="mxupload-cheading-icon"><img class="icon-seting" src="<?php echo esc_url($value['icon']); ?>" alt="img"></span><?php echo esc_html($value['title']); ?></h2>
                        </div>
                        <div class="mxupload-settings-content">
                            <?php do_action($value['id'] . '_content'); ?>
                        </div>
                        <div class="mxupload-settings-footer">
                            <button type="submit" name="mxupload-btn" class="mxupload-btn" id="mxupload-btn"><?php esc_html_e('Save', 'max-upload-file-size-manager'); ?></button>
                        </div>
                    </section>
                <?php
                    $count++;
                }
                ?>
                </div>
            </div>
        </form>
    </div>
</div>