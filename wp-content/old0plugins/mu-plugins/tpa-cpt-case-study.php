<?php
/**
 * Plugin Name: TPA CPT - Case Study
 */

add_action('init', function () {
  $labels = [
    'name'               => 'Case Studies',
    'singular_name'      => 'Case Study',
    'add_new'            => 'Add New',
    'add_new_item'       => 'Add New Case Study',
    'edit_item'          => 'Edit Case Study',
    'new_item'           => 'New Case Study',
    'view_item'          => 'View Case Study',
    'search_items'       => 'Search Case Studies',
  ];
  register_post_type('case-study', [
    'labels'        => $labels,
    'public'        => true,
    'show_in_rest'  => true,                 // ← importante para REST
    'has_archive'   => false,
    'menu_position' => 21,
    'supports'      => ['title','editor','excerpt','thumbnail'],
    'rewrite'       => ['slug' => 'case-study'],
  ]);
});
