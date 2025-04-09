#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Paths to files containing version information
const packageJsonPath = path.join(rootDir, 'package.json');
const pluginPhpPath = path.join(rootDir, 'moonsio-acf-blocks-starter.php');
const composerJsonPath = path.join(rootDir, 'composer.json');

// Read the current version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current plugin version: ${currentVersion}`);

// Parse plugin PHP file to confirm version
const pluginPhp = fs.readFileSync(pluginPhpPath, 'utf8');
const versionMatch = pluginPhp.match(/Version:\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
const phpVersion = versionMatch ? versionMatch[1] : 'not found';

// Check composer.json version if it exists
let composerJson;
try {
  composerJson = JSON.parse(fs.readFileSync(composerJsonPath, 'utf8'));
  const composerVersion = composerJson.version || 'not found';
  
  if (composerVersion !== currentVersion) {
    console.warn(`Warning: Version mismatch between package.json (${currentVersion}) and composer.json (${composerVersion})`);
  }
} catch (error) {
  console.warn('Warning: Could not read composer.json');
}

if (phpVersion !== currentVersion) {
  console.warn(`Warning: Version mismatch between package.json (${currentVersion}) and PHP file (${phpVersion})`);
}

// Calculate the next version options
const [major, minor, patch] = currentVersion.split('.').map(Number);
const nextVersions = {
  patch: `${major}.${minor}.${patch + 1}`,
  minor: `${major}.${minor + 1}.0`,
  major: `${major + 1}.0.0`
};

// Ask the user how they want to update the version
const questions = [
  {
    type: 'select',
    name: 'updateType',
    message: 'What type of update would you like to make?',
    choices: [
      { title: `Patch (${nextVersions.patch})`, value: 'patch' },
      { title: `Minor (${nextVersions.minor})`, value: 'minor' },
      { title: `Major (${nextVersions.major})`, value: 'major' },
      { title: 'Custom', value: 'custom' }
    ],
    initial: 0
  }
];

// If the user chooses a custom update, ask for the version
const versionQuestion = {
  type: 'text',
  name: 'customVersion',
  message: 'Enter the new version (e.g., 1.2.3):',
  validate: value => {
    if (/^\d+\.\d+\.\d+$/.test(value)) return true;
    return 'Please enter a valid version number (e.g., 1.2.3)';
  }
};

// Run the prompts
const run = async () => {
  try {
    // Ask for update type
    const response = await prompts(questions);
    
    if (!response.updateType) {
      console.log('Operation canceled');
      return;
    }
    
    // Get the new version
    let newVersion;
    if (response.updateType === 'custom') {
      const customResponse = await prompts(versionQuestion);
      if (!customResponse.customVersion) {
        console.log('Operation canceled');
        return;
      }
      newVersion = customResponse.customVersion;
    } else {
      newVersion = nextVersions[response.updateType];
    }
    
    // Confirm the update
    const confirmResponse = await prompts({
      type: 'confirm',
      name: 'confirmUpdate',
      message: `Update version from ${currentVersion} to ${newVersion}?`,
      initial: true
    });
    
    if (!confirmResponse.confirmUpdate) {
      console.log('Operation canceled');
      return;
    }
    
    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');
    
    // Update plugin PHP file
    const updatedPluginPhp = pluginPhp.replace(
      /Version:\s*([0-9]+\.[0-9]+\.[0-9]+)/i,
      `Version: ${newVersion}`
    );
    fs.writeFileSync(pluginPhpPath, updatedPluginPhp);
    
    // Update composer.json
    if (composerJson) {
      composerJson.version = newVersion;
      fs.writeFileSync(composerJsonPath, JSON.stringify(composerJson, null, 4) + '\n');
    }
    
    console.log(`\n🎉 Version updated to ${newVersion}`);
    console.log('✅ Updated files:');
    console.log(`  - ${path.relative(rootDir, packageJsonPath)}`);
    console.log(`  - ${path.relative(rootDir, pluginPhpPath)}`);
    if (composerJson) {
      console.log(`  - ${path.relative(rootDir, composerJsonPath)}`);
    }
    
  } catch (error) {
    console.error('Error updating version:', error);
  }
};

// Execute the script
run(); 