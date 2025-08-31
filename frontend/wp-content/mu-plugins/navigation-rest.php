<?php
/**
 * Plugin Name: Site Navigation REST
 * Description: Exponer navegación (FSE) como árbol JSON vía REST para headless frontend.
 * Author: Alexander + Dev Team
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
  register_rest_route('site/v1', '/navigation/(?P<slug>[a-z0-9\-]+)', [
    'methods'  => 'GET',
    'callback' => function($request) {
      $slug = sanitize_title($request['slug']);

      // Buscar el post de tipo wp_navigation por slug
      $nav = get_page_by_path($slug, OBJECT, 'wp_navigation');

      // Fallback: si no existe por slug, toma el primero que haya
      if (!$nav) {
        $nav = get_posts(['post_type'=>'wp_navigation', 'numberposts'=>1])[0] ?? null;
      }
      if (!$nav) {
        return new WP_Error('nav_not_found','Navigation not found',['status'=>404]);
      }

      $blocks = parse_blocks($nav->post_content);
      $tree   = site_build_nav_tree($blocks);
      return $tree;
    },
    'permission_callback' => '__return_true',
  ]);
});

/**
 * Construye un árbol de navegación desde bloques de Navigation.
 */
function site_build_nav_tree($blocks) {
  $items = [];
  foreach ($blocks as $block) {
    $name  = $block['blockName'] ?? '';
    $attrs = $block['attrs'] ?? [];
    $inner = $block['innerBlocks'] ?? [];

    // Entra al contenedor principal de navegación
    if ($name === 'core/navigation') {
      $items = array_merge($items, site_build_nav_tree($inner));
      continue;
    }

    // Link simple
    if ($name === 'core/navigation-link') {
      $items[] = [
        'title'    => $attrs['label'] ?? ($attrs['title'] ?? ''),
        'url'      => $attrs['url']   ?? '',
        'children' => [],
      ];
      continue;
    }

    // Submenú (con hijos)
    if ($name === 'core/navigation-submenu') {
      $items[] = [
        'title'    => $attrs['label'] ?? ($attrs['title'] ?? ''),
        'url'      => $attrs['url']   ?? '',
        'children' => site_build_nav_tree($inner),
      ];
      continue;
    }

    // Otros bloques dentro (por si hay wrappers/columns/etc.)
    if (!empty($inner)) {
      $items = array_merge($items, site_build_nav_tree($inner));
    }
  }
  return $items;
}
