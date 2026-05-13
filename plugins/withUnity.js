const { withXcodeProject, withAppBuildGradle, withSettingsGradle, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const withUnity = (config) => {
  // --- Android ---
  config = withSettingsGradle(config, (config) => {
    const unityPath = '../unity/builds/android/unityLibrary';
    if (!config.modResults.contents.includes("include ':unityLibrary'")) {
      config.modResults.contents += `\ninclude ':unityLibrary'\nproject(':unityLibrary').projectDir = new File(rootProject.projectDir, '${unityPath}')\n`;
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("implementation project(':unityLibrary')")) {
      const implementationString = "    implementation project(':unityLibrary')\n    implementation fileTree(dir: project(':unityLibrary').projectDir.toString() + '/libs', include: ['*.jar'])\n";
      config.modResults.contents = config.modResults.contents.replace(/dependencies\s?\{/, `dependencies {\n${implementationString}`);
    }
    return config;
  });

  // --- iOS ---
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in configurations) {
      if (typeof configurations[key].buildSettings !== 'undefined') {
        const buildSettings = configurations[key].buildSettings;
        // Only set Bitcode here, LD_RUNPATH will be handled by Podfile to avoid conflicts
        buildSettings.ENABLE_BITCODE = 'NO';
      }
    }
    return config;
  });

  // --- CRITICAL NATIVE PATCH ---
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const filePath = path.join(projectRoot, 'node_modules/@azesmway/react-native-unity/ios/RNUnityView.mm');
      
      if (fs.existsSync(filePath)) {
        let contents = fs.readFileSync(filePath, 'utf8');
        if (!contents.includes('PATCHED_V4')) {
          const windowAddSubview = 'addSubview:self.ufw.appController.rootView];';
          if (contents.includes(windowAddSubview)) {
             contents = contents.replace(/\[\[\[\[self ufw\] appController\] window\]\s+addSubview:self\.ufw\.appController\.rootView\];/g, '[self addSubview:self.ufw.appController.rootView]; // PATCHED_V4');
             contents = contents.replace(/\[\[\[\[self ufw\] appController\] window\][\s\n]+addSubview:self\.ufw\.appController\.rootView\];/g, '[self addSubview:self.ufw.appController.rootView]; // PATCHED_V4');
          }
          contents = contents.replace(/\[\[\[\[self ufw\] appController\] window\] makeKeyAndVisible\];/g, '// makeKeyAndVisible DISABLED // PATCHED_V4');
          contents = contents.replace(/\[self addSubview:self\.ufw\.appController\.rootView\];/g, 'if (![self.subviews containsObject:self.ufw.appController.rootView]) { [self addSubview:self.ufw.appController.rootView]; } // PATCHED_V4');
          fs.writeFileSync(filePath, contents);
        }
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withUnity;
