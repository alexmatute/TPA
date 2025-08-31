<?php
/**
 * Plugin Name: Site Navigation REST
 * Description: Exponer navegación FSE (wp_navigation) como árbol JSON.
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
  register_rest_route('site/v1', '/navigation/(?P<slug>[a-z0-9\-]+)', [
    'methods'  => 'GET',
    'callback' => function($request) {
      $slug = sanitize_title($request['slug']);

      // 1) Buscar por slug exacto (post_name)
      $nav = get_posts([
        'post_type'      => 'wp_navigation',
        'name'           => $slug,
        'posts_per_page' => 1,
      ]);
      $nav = $nav[0] ?? null;

      // 2) Fallback: buscar por título parecido
      if (!$nav) {
        $navs = get_posts([
          'post_type'      => 'wp_navigation',
          's'              => $slug,
          'posts_per_page' => 1,
        ]);
        $nav = $navs[0] ?? null;
      }

      // 3) Fallback final: primer wp_navigation disponible
      if (!$nav) {
        $nav = get_posts([
          'post_type'      => 'wp_navigation',
          'posts_per_page' => 1,
        ])[0] ?? null;
      }

      if (!$nav) {
        return new WP_Error('nav_not_found','No wp_navigation found',['status'=>404]);
      }

      $blocks = parse_blocks($nav->post_content);
      $tree   = site_build_nav_tree($blocks);
      return $tree;
    },
    'permission_callback' => '__return_true'
  ]);
});

/**
 * Convierte bloques de navegación en un árbol {title,url,children[]}
 */
function site_build_nav_tree($blocks) {
  $items = [];

  foreach ($blocks as $block) {
    $name  = $block['blockName'] ?? '';
    $attrs = $block['attrs'] ?? [];
    $inner = $block['innerBlocks'] ?? [];

    // 1) contenedor principal (por si viene envuelto)
    if ($name === 'core/navigation') {
      $items = array_merge($items, site_build_nav_tree($inner));
      continue;
    }

    // 2) enlace simple
    if ($name === 'core/navigation-link') {
      $items[] = [
        'title'    => $attrs['label'] ?? ($attrs['title'] ?? ''),
        'url'      => $attrs['url'] ?? '',
        'children' => [],
      ];
      continue;
    }

    // 3) submenú con hijos
    if ($name === 'core/navigation-submenu') {
      $items[] = [
        'title'    => $attrs['label'] ?? ($attrs['title'] ?? ''),
        'url'      => $attrs['url'] ?? '',
        'children' => site_build_nav_tree($inner),
      ];
      continue;
    }

    // 4) Page List → expandir a páginas publicadas
    if ($name === 'core/page-list') {
      $pages = get_pages(['sort_column' => 'menu_order,post_title', 'sort_order' => 'ASC']);
      foreach ($pages as $p) {
        if ($p->post_status !== 'publish') continue;
        $items[] = [
          'title'    => $p->post_title,
          'url'      => get_permalink($p->ID),
          'children' => [], // podrías anidar subpáginas si quieres
        ];
      }
      continue;
    }

    // 5) Otros bloques: entrar a sus hijos
    if (!empty($inner)) {
      $items = array_merge($items, site_build_nav_tree($inner));
    }
  }

  return $items;
}
