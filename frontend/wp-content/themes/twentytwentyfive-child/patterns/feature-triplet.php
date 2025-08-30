<?php
/**
 * Title: Feature Triplet (Hero Icons Row)
 * Slug: yourtheme/feature-triplet
 * Categories: featured, text
 * Description: Tres columnas con icono, título, descripción y fondo ilustración responsive.
 * Block Types: core/group
 * Inserter: true
 */
$bg = get_stylesheet_directory_uri() . '/assets/map-bg.svg'; // cambia la ruta
?>
<!-- wp:group {"className":"is-feature-triplet-bg","style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}, "color":{"background":"#ffffff00"}, "background":{"backgroundImage":{"url":"<?php echo esc_url($bg); ?>","id":0,"source":"file"},"backgroundSize":"cover","backgroundPosition":"50% 50%","backgroundRepeat":"no-repeat"}}} -->
<div class="wp-block-group is-feature-triplet-bg" style="padding-top:4rem;padding-bottom:4rem;background-color:#ffffff00;background-image:url(<?php echo esc_url($bg); ?>);background-position:50% 50%;background-repeat:no-repeat;background-size:cover">
  <!-- wp:group {"layout":{"type":"constrained","contentSize":"1200px"}} -->
  <div class="wp-block-group">
    <!-- título -->
    <!-- wp:heading {"textAlign":"center","level":2,"fontSize":"x-large"} -->
    <h2 class="wp-block-heading has-text-align-center has-x-large-font-size">Rorem ipsum dolor</h2>
    <!-- /wp:heading -->

    <!-- subrayado -->
    <!-- wp:separator {"align":"center","className":"is-style-wide","style":{"spacing":{"margin":{"top":"0.8rem","bottom":"2rem"}}}} -->
    <hr class="wp-block-separator aligncenter has-alpha-channel-opacity is-style-wide" style="margin-top:0.8rem;margin-bottom:2rem"/>
    <!-- /wp:separator -->

    <!-- 3 columnas -->
    <!-- wp:columns {"align":"wide"} -->
    <div class="wp-block-columns alignwide">

      <!-- columna 1 -->
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:html -->
        <div style="display:flex;justify-content:center;margin-bottom:12px">
          <svg viewBox="0 0 24 24" width="48" height="48"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></svg>
        </div>
        <!-- /wp:html -->

        <!-- wp:heading {"textAlign":"center","level":3} -->
        <h3 class="wp-block-heading has-text-align-center">Vorem ipsum dolor</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center">Yorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->

      <!-- columna 2 -->
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:html -->
        <div style="display:flex;justify-content:center;margin-bottom:12px">
          <svg viewBox="0 0 24 24" width="48" height="48"><path d="M7 4h10a2 2 0 0 1 2 2v14l-7-4-7 4V6a2 2 0 0 1 2-2z"/></svg>
        </div>
        <!-- /wp:html -->

        <!-- wp:heading {"textAlign":"center","level":3} -->
        <h3 class="wp-block-heading has-text-align-center">Jorem ipsum dolor sit</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center">Korem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->

      <!-- columna 3 -->
      <!-- wp:column -->
      <div class="wp-block-column">
        <!-- wp:html -->
        <div style="display:flex;justify-content:center;margin-bottom:12px">
          <svg viewBox="0 0 24 24" width="48" height="48"><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 7h6a4 4 0 0 1 4 4v2M7 9v6a4 4 0 0 0 4 4h6"/></svg>
        </div>
        <!-- /wp:html -->

        <!-- wp:heading {"textAlign":"center","level":3} -->
        <h3 class="wp-block-heading has-text-align-center">Gorem ipsum</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center">Forem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
  </div>
  <!-- /wp:group -->
</div>
<!-- /wp:group -->
