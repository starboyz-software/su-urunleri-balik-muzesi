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
        if (!contents.includes('PATCHED_V5')) {
          // Replace the entire initialization block from runEmbedded to setNeedsLayout
          const targetBlockPattern = /\[self\.ufw\.appController\.rootView\s+removeFromSuperview\];[\s\S]*?\[\[\[\[\[\[self\s+ufw\]\s+appController\]\s+window\]\s+rootViewController\]\s+view\]\s+setNeedsLayout\];/g;
          
          const replacementBlock = `[self.ufw.appController.rootView removeFromSuperview];

        UIWindow *mainWindow = nil;
        if (@available(iOS 13.0, *)) {
            for (UIScene *scene in [UIApplication sharedApplication].connectedScenes) {
                if (scene.activationState == UISceneActivationStateForegroundActive && [scene isKindOfClass:[UIWindowScene class]]) {
                    UIWindowScene *windowScene = (UIWindowScene *)scene;
                    for (UIWindow *window in windowScene.windows) {
                        if (window.isKeyWindow) {
                            mainWindow = window;
                            break;
                        }
                    }
                }
                if (mainWindow) break;
            }
        }
        if (!mainWindow) {
            mainWindow = [[[UIApplication sharedApplication] delegate] window];
        }

        UIWindow *unityWindow = [[[self ufw] appController] window];
        if (unityWindow != nil) {
            if (@available(iOS 13.0, *)) {
                if (mainWindow != nil && mainWindow.windowScene != nil) {
                    [unityWindow setWindowScene: mainWindow.windowScene];
                }
            } else {
                [unityWindow setScreen: [UIScreen mainScreen]];
            }
            
            if (![self.subviews containsObject:self.ufw.appController.rootView]) { 
                [self addSubview:self.ufw.appController.rootView]; 
            } // PATCHED_V5
            
            [unityWindow makeKeyAndVisible]; // Temporarily activate Unity window to initialize graphics pipeline // PATCHED_V5
            
            if (mainWindow != nil) {
                [mainWindow makeKeyAndVisible]; // Immediately restore React Native main window as key // PATCHED_V5
            }
        }`;

          if (contents.match(targetBlockPattern)) {
            contents = contents.replace(targetBlockPattern, replacementBlock);
          } else {
            // Fallback patch if it was already modified or slightly different
            contents = contents.replace(/if\s*\(@available\(iOS\s+13\.0,\s*\*\)\)\s*\{[\s\S]*?\}\s*else\s*\{[\s\S]*?\}/g, replacementBlock);
          }

          // Make sure we also patch layoutSubviews
          contents = contents.replace(/\[self\s+addSubview:self\.ufw\.appController\.rootView\];/g, 'if (![self.subviews containsObject:self.ufw.appController.rootView]) { [self addSubview:self.ufw.appController.rootView]; } // PATCHED_V5');

          fs.writeFileSync(filePath, contents);
        }
      }
      return config;
    },
  ]);

  return config;
};

module.exports = withUnity;
