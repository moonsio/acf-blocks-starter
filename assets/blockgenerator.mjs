import fs from "fs/promises";
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
    type: "text",
    name: "description",
    message: "Block description",
    initial: "",
  },
  {
    type: "list",
    name: "keywords",
    message: "Keywords",
    initial: [],
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
  const qualifiedName = namespace + "/" + slug;
  const folder = "/" + slug;
  const absolute = DIR + folder;
  const css = ".wp-block-" + namespace + "-" + slug + " {}";

  if (cancelled) {
    console.log("Aborting...");
    return;
  }

  try {
    await fs.access(absolute);

    console.log(
      "Error: A directory called " + slug + " was already found. Aborting."
    );
    return;
  } catch (error) {
    try {
      await fs.mkdir(absolute, { recursive: true });
    } catch (mkdirError) {
      console.error("Error creating directory " + slug + ":", mkdirError);
      return;
    }
  }

  await createFile(
    `${absolute}/_block.scss`,
    `// ${css}`,
    `_block.scss created`,
    "Error creating SCSS file:"
  );
  await createFile(
    `${absolute}/editor.css`,
    `/* ${css} */`,
    `editor.css created`,
    "Error creating editor CSS file:"
  );
  await createFile(
    `${absolute}/editor.scss`,
    `// ${css}`,
    `editor.scss created`,
    "Error creating editor SCSS file:"
  );
  await createFile(
    `${absolute}/config.php`,
    `<?php defined('ABSPATH') || exit('Forbidden');
    return [
    'fields' => []
    ];`,
    `config.php created`,
    "Error creating editor SCSS file:"
  );

  if (cancelled) {
    console.log("Aborting.");
    return;
  }

  let phpTemplate = "stubs/block.php.txt";
  try {
    let data = await fs.readFile(`${phpTemplate}`, "utf8");
    data = data
      .replace(/XYZ/g, title)
      .replace(/QWY/g, slug)
      .replace(/DX9S/g, namespace)
      .replace(/\r\n/g, "\n");
    await createFile(
      `${absolute}/view.php`,
      data,
      `view.php created`,
      "Error creating PHP template:"
    );
  } catch (error) {
    console.error("Error creating PHP template:", error);
  }

  if (cancelled) {
    console.log("Aborting.");
    return;
  }

  let jsonTemplate = "stubs/block.json.txt";
  try {
    let raw = await fs.readFile(`${jsonTemplate}`);
    let template = JSON.parse(raw);
    template.name = qualifiedName;
    template.title = title;
    template.description = response.description;
    template.icon = response.icon;
    template.keywords = response.keywords;
    template.editorStyle = `file:./editor.css`;
    template.acf.renderTemplate = `view.php`;
    let jsonContent = JSON.stringify(template, null, "\t");
    await createFile(
      `${absolute}/block.json`,
      jsonContent,
      "block.json created",
      "Error creating JSON template:"
    );
  } catch (error) {
    console.error("Error creating JSON template:", error);
  }
})();
