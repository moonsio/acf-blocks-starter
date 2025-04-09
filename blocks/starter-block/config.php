<?php

defined('ABSPATH') || exit('Forbidden');

use Moonsio\Fields\FieldTypes;

// Get block name from directory
$block_name = basename(dirname(__FILE__));

// Convert to underscore format for ACF field keys
$block_key = str_replace('-', '_', $block_name);

return [
  // Fields for this block
  'fields' => [
    FieldTypes::text($block_key, 'title', 'Title', [
      'instructions' => __('Enter the block title', 'moonsio-blocks'),
      'required' => true,
    ]),
    FieldTypes::wysiwyg_basic($block_key, 'content', 'Content', [
      'instructions' => __('Enter the block content', 'moonsio-blocks'),
    ]),
  ]
];
