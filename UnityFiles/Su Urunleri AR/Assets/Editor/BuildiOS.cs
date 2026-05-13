using UnityEditor;
using UnityEngine;

public class BuildiOS
{
    [MenuItem("Build/iOS Build")]
    public static void PerformBuild()
    {
        string outputPath = System.IO.Path.GetFullPath(
            System.IO.Path.Combine(Application.dataPath, "../../../unity/builds/ios"));
        
        Debug.Log($"[BuildiOS] Output path: {outputPath}");
        
        // Get all scenes in build settings
        string[] scenes = new string[EditorBuildSettings.scenes.Length];
        for (int i = 0; i < EditorBuildSettings.scenes.Length; i++)
        {
            scenes[i] = EditorBuildSettings.scenes[i].path;
            Debug.Log($"[BuildiOS] Scene {i}: {scenes[i]}");
        }
        
        if (scenes.Length == 0)
        {
            // Fallback: find any scene
            string[] allScenes = System.IO.Directory.GetFiles(
                Application.dataPath, "*.unity", System.IO.SearchOption.AllDirectories);
            if (allScenes.Length > 0)
            {
                scenes = new string[] { "Assets" + allScenes[0].Replace(Application.dataPath, "").Replace("\\", "/") };
                Debug.Log($"[BuildiOS] Fallback scene: {scenes[0]}");
            }
        }

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = outputPath,
            target = BuildTarget.iOS,
            options = BuildOptions.AcceptExternalModificationsToPlayer
        };

        var report = BuildPipeline.BuildPlayer(options);
        Debug.Log($"[BuildiOS] Result: {report.summary.result}");
        
        if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.LogError($"[BuildiOS] Build FAILED: {report.summary.totalErrors} errors");
            EditorApplication.Exit(1);
        }
        else
        {
            Debug.Log("[BuildiOS] Build SUCCEEDED!");
            EditorApplication.Exit(0);
        }
    }
}
