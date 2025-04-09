<?php

defined('ABSPATH') || exit('Forbidden');

use Moonsio\Helpers\Utils;

// Get field values
$title = get_field('title');
$content = get_field('content');
$background_color = get_field('background_color');
$classname = isset($block['className']) ? $block['className'] : '';

// Build block classes
$class = Utils::clean_classes([
  'starter-block',
  "starter-block--{$background_color}",
  $classname
]);

// Display block title in editor
if (is_admin()) {
  Utils::display_block_title_in_editor($block);
}

?>
<div class="<?php echo $class; ?>">
  <div class="starter-block__content">
    <?php if ($title) : ?>
      <h2 class="starter-block__title"><?php echo esc_html($title); ?></h2>
    <?php endif; ?>

    <?php if ($content) : ?>
      <div class="starter-block__text">
        <?php echo wp_kses_post($content); ?>
      </div>
    <?php endif; ?>
  </div>
</div>