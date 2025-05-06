<?php

defined('ABSPATH') || exit('Forbidden');

use Moonsio\Fields\FieldTypes;

$block_prefix = basename(dirname(__FILE__));

return [
    'fields' => [
        FieldTypes::accordion($block_prefix, 'text', 'Text'),
        FieldTypes::text($block_prefix, 'title', 'Titel'),
        FieldTypes::wysiwyg_basic($block_prefix, 'text', 'Tekst'),
        FieldTypes::accordion($block_prefix, 'image_settings', 'Afbeelding'),
        FieldTypes::image($block_prefix, 'image', 'Afbeelding'),
        FieldTypes::text($block_prefix, 'image_alt', 'Alt tekst'),
        FieldTypes::accordion($block_prefix, 'colors', 'Kleuren'),
        FieldTypes::text_color($block_prefix, 'text_color', 'Tekst kleur'),
        FieldTypes::margin_accordion($block_prefix),
        FieldTypes::margin($block_prefix, 'top'),
        FieldTypes::margin($block_prefix, 'bottom'),
        FieldTypes::margin($block_prefix, 'left'),
        FieldTypes::margin($block_prefix, 'right')
    ],
]; 