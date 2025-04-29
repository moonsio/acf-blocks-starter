import fs from "node:fs/promises";
import prompts from "prompts";

const DIR = "blocks";

const QUESTIONS = [
	{
		type: "text",
		name: "namespace",
		message: "Block Namespace",
		initial: "moonsio",
	},
	{
		type: "text",
		name: "title",
		message: "Block Name",
	},
	{
		type: "multiselect",
		name: "fields",
		message: "Select the fields you want to add to the block",
		choices: [
			{ title: "Text accordion", value: "textAccordion" },
			{ title: "Title", value: "title" },
			{ title: "Text", value: "text" },
			{ title: "Image", value: "image" },
			{ title: "Colors accordion", value: "colorsAccordion" },
			{ title: "Text color", value: "textColor" },
			{ title: "Background color", value: "bgColor" },
			{ title: "Buttons", value: "buttons" },
		],
		hint: "- Space to select. Return to submit",
	},
	{
		type: "text",
		name: "description",
		message: "Block description",
		initial: "",
	},
	{
		type: "list",
		name: "keywords",
		message: "Keywords",
		initial: "moonsio",
	},
	{
		type: "text",
		name: "icon",
		message: "Dashicon",
		initial: "star-filled",
	},
];
let cancelled = false;

process.on("SIGINT", () => {
	console.log("Cancelled.");
	cancelled = true;
});
const createFile = async (path, content, successMessage, errorMessage) => {
	try {
		await fs.writeFile(path, content);
		console.log(successMessage);
	} catch (error) {
		console.error(errorMessage, error);
	}
};

(async () => {
	const response = await prompts(QUESTIONS, {
		onCancel: () => {
			cancelled = true;
		},
	});

	const title = response.title;
	const slug = response.title.replace(/\s+/g, "-").toLowerCase();
	const namespace = response.namespace.replace(/\s+/g, "-").toLowerCase();
	const qualifiedName = `${namespace}/${slug}`;
	const folder = `/${slug}`;
	const absolute = DIR + folder;
	const css = `.wp-block-${namespace}-${slug} {}`;

	if (cancelled) {
		console.log("Aborting...");
		return;
	}

	try {
		await fs.access(absolute);

		console.log(
			`Error: A directory called ${slug} was already found. Aborting.`,
		);
		return;
	} catch (error) {
		try {
			await fs.mkdir(absolute, { recursive: true });
		} catch (mkdirError) {
			console.error(`Error creating directory ${slug}:`, mkdirError);
			return;
		}
	}

	await createFile(
		`${absolute}/block.css`,
		`/* ${css} */`,
		"block.css created",
		"Error creating CSS file:",
	);
	await createFile(
		`${absolute}/editor.css`,
		`/* ${css} */`,
		"editor.css created",
		"Error creating editor CSS file:",
	);

	if (cancelled) {
		console.log("Aborting.");
		return;
	}

	const configTemplate = "stubs/config.php.txt";

	try {
		const configData = await fs.readFile(`${configTemplate}`, "utf8");

		// Generate fields based on selection
		const fieldConfigs = [];

		if (response.fields.includes("textAccordion")) {
			fieldConfigs.push(`FieldTypes::accordion($block_prefix, 'text', 'Text')`);
		}

		if (response.fields.includes("title")) {
			fieldConfigs.push(`FieldTypes::text($block_prefix, 'title', 'Titel')`);
		}

		if (response.fields.includes("content")) {
			fieldConfigs.push(
				`FieldTypes::wysiwyg_basic($block_prefix, 'content', 'Content')`,
			);
		}

		if (response.fields.includes("image")) {
			fieldConfigs.push(
				`FieldTypes::accordion($block_prefix, 'image_settings', 'Afbeelding')`,
				`FieldTypes::image($block_prefix, 'image', 'Afbeelding')`,
				`FieldTypes::text($block_prefix, 'image_alt', 'Alt tekst')`,
			);
		}

		if (response.fields.includes("buttons")) {
			fieldConfigs.push(
				`...FieldTypes::buttons($block_prefix, 'buttons', 'Knoppen')`,
			);
		}

		if (response.fields.includes("colorsAccordion")) {
			fieldConfigs.push(
				`FieldTypes::accordion($block_prefix, 'colors', 'Kleuren')`,
			);
		}

		if (response.fields.includes("textColor")) {
			fieldConfigs.push(
				`FieldTypes::text_color($block_prefix, 'text_color', 'Tekst kleur')`,
			);
		}

		if (response.fields.includes("bgColor")) {
			fieldConfigs.push(
				`FieldTypes::bg_color($block_prefix, 'bg_color', 'Achtergrond kleur')`,
			);
		}

		const fieldsString = fieldConfigs.join(",\n        ");
		const configContent = configData.replace(
			"// FIELD_PLACEHOLDER - DO NOT REMOVE THIS LINE",
			fieldsString,
		);

		await createFile(
			`${absolute}/config.php`,
			configContent,
			"config.php created",
			"Error creating config PHP file:",
		);
	} catch (error) {
		console.error("Error creating config PHP file:", error);
	}

	const phpTemplate = "stubs/block.php.txt";
	try {
		const data = await fs.readFile(`${phpTemplate}`, "utf8");

		// Generate field declarations
		const fieldDeclarations = [];

		if (response.fields.includes("textAccordion")) {
			fieldDeclarations.push(`$title = get_field('title');`);
			fieldDeclarations.push(`$text = get_field('text');`);
		}

		if (response.fields.includes("image")) {
			fieldDeclarations.push(`$image = get_field('image');`);
			fieldDeclarations.push(`$image_alt = get_field('image_alt');`);
		}

		if (response.fields.includes("buttons")) {
			fieldDeclarations.push(`$buttons = get_field('buttons');`);
		}

		if (response.fields.includes("bgColor")) {
			fieldDeclarations.push(
				`$bg_color = get_field('bg_color') ? 'bg-' . get_field('bg_color') : '';`,
			);
		}

		if (response.fields.includes("textColor")) {
			fieldDeclarations.push(
				`$text_color = get_field('text_color') ? 'text-' . get_field('text_color') : '';`,
			);
		}

		// Generate content sections
		const contentSections = [];

		if (response.fields.includes("image")) {
			contentSections.push(`<?php if ($image): ?>
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
    <?php endif; ?>`);
		}

		if (response.fields.includes("title")) {
			contentSections.push(`
				<?php if ($title): ?>
                <h2 class="<?php echo esc_attr(sprintf('%s__title', $block_name)); ?>">
                    <?php echo esc_html($title); ?>
                </h2>
            <?php endif; ?>`);
		}
		if (response.fields.includes("text")) {
			contentSections.push(`
            <?php if ($text): ?>
                <div class="<?php echo esc_attr(sprintf('%s__text', $block_name)); ?>">
                    <?php echo wp_kses_post($text); ?>
                </div>
            <?php endif; ?>`);
		}

		if (response.fields.includes("buttons")) {
			contentSections.push(`<?php if ($buttons): ?>
        <div class="<?php echo esc_attr(sprintf('%s__buttons', $block_name)); ?>">
            <?php foreach ($buttons as $button): ?>
                <a href="<?php echo esc_url($button['url']); ?>" 
                   class="<?php echo esc_attr(sprintf('%s__button btn', $block_name)); ?>"
                   <?php echo $button['is_external'] ? 'target="_blank" rel="noopener"' : ''; ?>>
                    <?php echo esc_html($button['label']); ?>
                </a>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>`);
		}

		const declarationsString = fieldDeclarations.join("\n");
		const contentString = contentSections.join("\n\n");

		const phpContent = data
			.replace(/XYZ/g, title)
			.replace(/QWY/g, slug)
			.replace(/DX9S/g, namespace)
			.replace("// FIELD_DECLARATIONS", declarationsString)
			.replace("// FIELD_CONTENT", contentString)
			.replace(/\r\n/g, "\n");

		await createFile(
			`${absolute}/view.php`,
			phpContent,
			"view.php created",
			"Error creating PHP template:",
		);
	} catch (error) {
		console.error("Error creating PHP template:", error);
	}

	if (cancelled) {
		console.log("Aborting.");
		return;
	}

	const jsonTemplate = "stubs/block.json.txt";
	try {
		const raw = await fs.readFile(`${jsonTemplate}`);
		const template = JSON.parse(raw);
		template.name = qualifiedName;
		template.title = title;
		template.description = response.description;
		template.icon = response.icon;
		template.keywords = response.keywords;
		template.editorStyle = "file:./editor.css";
		template.acf.renderTemplate = "view.php";
		const jsonContent = JSON.stringify(template, null, "\t");
		await createFile(
			`${absolute}/block.json`,
			jsonContent,
			"block.json created",
			"Error creating JSON template:",
		);
	} catch (error) {
		console.error("Error creating JSON template:", error);
	}
})();
