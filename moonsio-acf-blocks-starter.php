<?php

/**
 * Plugin Name: Moonsio ACF Blocks Starter
 * Plugin URI: https://moonsio.nl
 * Description: A starter plugin for ACF blocks using the moonsio theme block registration system
 * Version: 0.5.0
 * Author: Moonsio
 * Author URI: https://moonsio.nl
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: moonsio-acf-blocks
 * Domain Path: /languages
 */

defined('ABSPATH') || exit('Forbidden');

use Moonsio\Blocks\BlockRegistry;

/**
 * Check if theme and ACF dependencies exist
 */
function moonsio_blocks_check_dependencies()
{
  if (!class_exists('ACF')) {
    add_action('admin_notices', function () {
      echo '<div class="error"><p>' .
        esc_html__('The Moonsio ACF Blocks Starter plugin requires Advanced Custom Fields to be installed and activated.', 'moonsio-blocks') .
        '</p></div>';
    });
    return false;
  }

  if (!class_exists('\Moonsio\Fields\FieldTypes')) {
    add_action('admin_notices', function () {
      echo '<div class="error"><p>' .
        esc_html__('The Moonsio ACF Blocks Starter plugin requires the Moonsio theme to be installed and activated.', 'moonsio-blocks') .
        '</p></div>';
    });
    return false;
  }

  if (!class_exists('\Moonsio\Blocks\BlockRegistry')) {
    add_action('admin_notices', function () {
      echo '<div class="error"><p>' .
        esc_html__('The Moonsio ACF Blocks Starter plugin requires the Moonsio theme with BlockRegistry to be installed and activated.', 'moonsio-blocks') .
        '</p></div>';
    });
    return false;
  }

  return true;
}

/**
 * Get all block directories from the plugin
 * 
 * @return array Array of block directory names
 */
function moonsio_blocks_get_blocks()
{
  $blocks_dir = plugin_dir_path(__FILE__) . 'blocks/';

  if (!is_dir($blocks_dir)) {
    return [];
  }

  // Get all directory names and filter out . and ..
  $all_files = scandir($blocks_dir);
  return array_filter($all_files, function ($item) use ($blocks_dir) {
    return is_dir($blocks_dir . $item) && $item !== '.' && $item !== '..';
  });
}

/**
 * Register all plugin blocks
 */
function moonsio_blocks_register_blocks()
{
  if (!moonsio_blocks_check_dependencies()) {
    return;
  }

  $plugin_path = plugin_dir_path(__FILE__);
  $plugin_url = plugin_dir_url(__FILE__);

  // Find all blocks in the blocks directory
  $blocks = moonsio_blocks_get_blocks();

  if (empty($blocks)) {
    return;
  }

  // Get or create BlockRegistry instance
  global $moonsio_block_registry;

  if (!($moonsio_block_registry instanceof BlockRegistry)) {
    $moonsio_block_registry = new BlockRegistry();
  }

  // Register all blocks with the registry
  foreach ($blocks as $block_name) {
    $moonsio_block_registry->register_plugin_block(
      $block_name,
      $plugin_path,
      $plugin_url,
      'moonsio'
    );
  }
}

// Initialize the plugin using ACF's init hook (before the registry runs)
add_action('acf/init', 'moonsio_blocks_register_blocks', 1);
