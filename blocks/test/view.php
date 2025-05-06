<?php 

defined('ABSPATH') || exit('Forbidden');

use Moonsio\Helpers\Utils;
use Moonsio\Images\Image;

// Block Name (slugified).
$block_name = 'test';
$namespace = 'moonsio';
$block_name = 'wp-block-' . $namespace . '-' . $block_name;

$anchor = (empty($block['anchor'])) ? '' : 'id="' . $block['anchor'] . '"';
$classname = $block['className'] ?? '';

// Field declarations
$title = get_field('title');
$text = get_field('text');
$image = get_field('image');
$image_alt = get_field('image_alt');
$text_color = get_field('text_color') ? 'text-' . get_field('text_color') : '';

$classes = Utils::clean_classes([
    $block_name,
    $bg_color ?? '',
    $text_color ?? '',
    $classname,
]);

?>

<div <?php echo $anchor; ?> class="<?php echo esc_attr($classes); ?>">
    <div class="<?php echo sprintf('%s__container container', $block_name); ?>">
        <?php if ($image): ?>
        <div class="<?php echo esc_attr(sprintf('%s__img-container', $block_name)); ?>">
            <?php 
            Image::render(
                $image,
                'medium',
                [
                    'class' => sprintf('%s__img', esc_attr($block_name)),
                    'alt' => $image_alt ? esc_attr($image_alt) : sprintf(esc_attr__('Afbeelding voor %s', 'moonsio'), esc_attr($title)),
                    'style' => is_admin() ? 'height: 100%' : '',
                ],
            ); ?>
        </div>
    <?php endif; ?>


				<?php if ($title): ?>
                <h2 class="<?php echo esc_attr(sprintf('%s__title text-xl text-primary-dark', $block_name)); ?>">
                    <?php echo esc_html($title); ?>
                </h2>
            <?php endif; ?>


            <?php if ($text): ?>
                <div class="<?php echo esc_attr(sprintf('%s__text', $block_name)); ?>">
                    <?php echo wp_kses_post($text); ?>
                </div>
            <?php endif; ?>
    </div>
</div>