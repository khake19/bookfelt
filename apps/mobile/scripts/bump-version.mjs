#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Semver bump logic
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}. Use: major, minor, or patch`);
  }
}

// Get current version from app.config.js
function getCurrentVersion() {
  const configPath = join(ROOT, 'app.config.js');
  const content = readFileSync(configPath, 'utf8');
  const match = content.match(/version:\s*["']([^"']+)["']/);

  if (!match) {
    throw new Error('Could not find version in app.config.js');
  }

  return match[1];
}

// Update app.config.js with version, versionCode, and buildNumber
function updateAppConfig(newVersion, newVersionCode) {
  const configPath = join(ROOT, 'app.config.js');
  let content = readFileSync(configPath, 'utf8');

  // Update version string
  content = content.replace(
    /version:\s*["'][^"']+["']/,
    `version: "${newVersion}"`
  );

  // Update or add android.versionCode
  if (content.includes('versionCode:')) {
    content = content.replace(
      /versionCode:\s*\d+/,
      `versionCode: ${newVersionCode}`
    );
  } else {
    // Add versionCode to android section
    content = content.replace(
      /(android:\s*\{[^}]*)(package:)/,
      `$1versionCode: ${newVersionCode},\n      $2`
    );
  }

  // Update or add ios.buildNumber
  const buildNumber = String(newVersionCode);
  if (content.includes('buildNumber:')) {
    content = content.replace(
      /buildNumber:\s*["'][^"']+["']/,
      `buildNumber: "${buildNumber}"`
    );
  } else {
    // Add buildNumber to ios section
    content = content.replace(
      /(ios:\s*\{[^}]*)(supportsTablet:)/,
      `$1buildNumber: "${buildNumber}",\n      $2`
    );
  }

  writeFileSync(configPath, content, 'utf8');
  console.log(`✅ Updated app.config.js to ${newVersion} (versionCode: ${newVersionCode})`);
}

// Update package.json
function updatePackageJson(newVersion) {
  const packagePath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));

  pkg.version = newVersion;

  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json to ${newVersion}`);
}

// Update Android build.gradle (only if it exists - for bare workflow compatibility)
function updateBuildGradle(newVersion, newVersionCode) {
  const gradlePath = join(ROOT, 'android/app/build.gradle');

  try {
    let content = readFileSync(gradlePath, 'utf8');

    // Update versionCode
    content = content.replace(
      /versionCode\s+\d+/,
      `versionCode ${newVersionCode}`
    );

    // Update versionName
    content = content.replace(
      /versionName\s+["'][^"']+["']/,
      `versionName "${newVersion}"`
    );

    writeFileSync(gradlePath, content, 'utf8');
    console.log(`✅ Updated build.gradle to ${newVersion} (versionCode: ${newVersionCode})`);
  } catch (error) {
    console.log(`⚠️  Skipping build.gradle update (file not found - using prebuild workflow)`);
  }
}

// Get current versionCode from app.config.js (or build.gradle as fallback)
function getCurrentVersionCode() {
  // Try to read from app.config.js first (prebuild approach)
  const configPath = join(ROOT, 'app.config.js');
  const configContent = readFileSync(configPath, 'utf8');
  const configMatch = configContent.match(/versionCode:\s*(\d+)/);

  if (configMatch) {
    return parseInt(configMatch[1], 10);
  }

  // Fallback to build.gradle (bare workflow)
  try {
    const gradlePath = join(ROOT, 'android/app/build.gradle');
    const gradleContent = readFileSync(gradlePath, 'utf8');
    const gradleMatch = gradleContent.match(/versionCode\s+(\d+)/);

    if (gradleMatch) {
      return parseInt(gradleMatch[1], 10);
    }
  } catch (error) {
    // build.gradle doesn't exist, default to version parts
  }

  // If neither exists, derive from version string (major * 1000 + minor * 100 + patch)
  const version = getCurrentVersion();
  const [major, minor, patch] = version.split('.').map(Number);
  return major * 1000 + minor * 100 + patch;
}

// Create git commit
function createGitCommit(newVersion, skipCommit) {
  if (skipCommit) {
    console.log('\n⚠️  Skipping git commit (--no-commit flag)');
    return;
  }

  try {
    // Add app.config.js and package.json (always), build.gradle (if exists)
    execSync('git add app.config.js package.json', {
      cwd: ROOT,
      stdio: 'inherit'
    });

    // Try to add build.gradle if it exists and is tracked
    try {
      execSync('git add android/app/build.gradle', {
        cwd: ROOT,
        stdio: 'pipe'
      });
    } catch {
      // build.gradle not tracked (prebuild workflow), skip
    }

    execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
      cwd: ROOT,
      stdio: 'inherit'
    });

    console.log(`\n✅ Created git commit for version ${newVersion}`);
    console.log(`\n📝 Don't forget to push: git push origin main`);
  } catch (error) {
    console.error('\n❌ Failed to create git commit:', error.message);
    console.log('Files have been updated but not committed.');
  }
}

// Main
function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0];
  const skipCommit = args.includes('--no-commit');

  if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
    console.error(`
Usage: node bump-version.mjs <major|minor|patch> [--no-commit]

Examples:
  node bump-version.mjs patch           # 1.0.1 → 1.0.2
  node bump-version.mjs minor           # 1.0.1 → 1.1.0
  node bump-version.mjs major           # 1.0.1 → 2.0.0
  node bump-version.mjs patch --no-commit  # Skip git commit
    `);
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const currentVersionCode = getCurrentVersionCode();
  const newVersion = bumpVersion(currentVersion, bumpType);
  const newVersionCode = currentVersionCode + 1;

  console.log(`\n📦 Bumping version from ${currentVersion} to ${newVersion}`);
  console.log(`📱 Version code: ${currentVersionCode} → ${newVersionCode}\n`);

  // Update all files
  updateAppConfig(newVersion, newVersionCode);
  updatePackageJson(newVersion);
  updateBuildGradle(newVersion, newVersionCode);

  // Create git commit
  createGitCommit(newVersion, skipCommit);

  console.log(`\n🎉 Version bump complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review the changes: git diff`);
  console.log(`  2. Push to GitHub: git push origin main`);
  console.log(`  3. Build new version: eas build --platform android --profile production`);
}

main();
