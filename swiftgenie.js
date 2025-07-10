// swiftgenie.js - Generate SwiftUI apps from GPT-4 + Templates

#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OUTPUT_DIR = path.join(process.cwd(), 'SwiftGenieApps');

async function main() {
  console.log("\n✨ Welcome to SwiftGenie - your GPT-4 SwiftUI app wizard! ✨\n");

  const { appIdea } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appIdea',
      message: 'Describe your SwiftUI app idea (e.g., "a journaling app with tabs"):',
    },
  ]);

  console.log("\n🧠 Generating app using GPT-4...\n");

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a SwiftUI expert. Generate a complete SwiftUI iOS app based on the user\'s description, with all Views, basic Models, and Navigation in a single App.swift file. Use modular Swift code and comments.',
      },
      {
        role: 'user',
        content: appIdea,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const code = gptResponse.data.choices[0].message.content;

  const appName = appIdea.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
  const appPath = path.join(OUTPUT_DIR, appName);

  fs.ensureDirSync(appPath);
  fs.writeFileSync(path.join(appPath, 'App.swift'), code);

  console.log(`✅ App generated at: ${appPath}`);
  console.log("\n📱 Open it in Xcode and start vibecoding!\n");

  const { open } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'open',
      message: 'Do you want to open it in Xcode now?',
      default: false,
    },
  ]);

  if (open) {
    try {
      execSync(`open -a Xcode ${appPath}`);
    } catch (err) {
      console.error("❌ Failed to open in Xcode. Is Xcode installed?");
    }
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
});
