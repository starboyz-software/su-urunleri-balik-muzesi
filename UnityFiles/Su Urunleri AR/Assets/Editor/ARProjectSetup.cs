using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using Unity.XR.CoreUtils;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace ARAquarium.EditorTools
{
    /// <summary>
    /// Tek tıkla 9 balık için prefab, FishData ve FishDatabase oluşturan Editor scripti.
    /// Unity menüsünden: AR Aquarium > ⭐ Tümünü Kur
    /// 
    /// Otomatik olarak:
    /// 1. Assets/Models/ altındaki her balık klasörünü tarar
    /// 2. Her FBX için animasyonu loop yapar
    /// 3. Animator Controller oluşturur
    /// 4. Prefab oluşturur (FishRotationHandler ile)
    /// 5. FishData ScriptableObject oluşturur
    /// 6. FishDatabase oluşturur ve tüm FishData'ları bağlar
    /// 7. AR test sahnesini kurar
    /// </summary>
    public static class ARProjectSetup
    {
        // ─── Paths ───────────────────────────────────
        private const string ModelsRoot = "Assets/Models";
        private const string PrefabFolder = "Assets/Prefabs";
        private const string FishDataFolder = "Assets/Resources/FishData";
        private const string DatabasePath = "Assets/Resources/FishDatabase.asset";
        private const string ScenePath = "Assets/Scenes/ARFishTest.unity";

        // ─── Ölçek ──────────────────────────────────
        private const float DefaultFishScale = 0.02f;

        // ─── Balık Verileri ─────────────────────────
        private struct FishInfo
        {
            public string fishID;
            public string folderName;
            public string fishName;
            public string scientificName;
            public string habitat;
            public string description;
            public Color themeColor;
        }

        private static readonly FishInfo[] AllFish = new FishInfo[]
        {
            new FishInfo
            {
                fishID = "fish_01", folderName = "Lüfer", fishName = "Lüfer",
                scientificName = "Pomatomus saltatrix",
                habitat = "Karadeniz, Marmara, Ege",
                description = "Lüfer, hızlı yüzen ve güçlü bir avcı balıktır. Gümüş renkli parlak pulları vardır. Türkiye'nin en sevilen balıklarından biridir! Sonbaharda büyük sürüler halinde göç eder.",
                themeColor = new Color(0.20f, 0.60f, 0.90f)
            },
            new FishInfo
            {
                fishID = "fish_02", folderName = "Çipura", fishName = "Çipura",
                scientificName = "Sparus aurata",
                habitat = "Akdeniz, Ege",
                description = "Çipura, altın sarısı bir çizgiyle tanınan zarif bir balıktır. Deniz çiftliklerinde de yetiştirilir. Lezzetli beyaz etiyle sofrların vazgeçilmezidir!",
                themeColor = new Color(0.90f, 0.70f, 0.15f)
            },
            new FishInfo
            {
                fishID = "fish_03", folderName = "Kefal", fishName = "Kefal",
                scientificName = "Mugil cephalus",
                habitat = "Tüm Türkiye kıyıları",
                description = "Kefal, kıyı sularında ve haliçlerde yaşayan uysal bir balıktır. Geniş başı ve büyük gözleriyle tanınır. Sürüler halinde yüzmeyi sever!",
                themeColor = new Color(0.25f, 0.75f, 0.45f)
            },
            new FishInfo
            {
                fishID = "fish_04", folderName = "Gün Balığı", fishName = "Gün Balığı",
                scientificName = "Lepomis gibbosus",
                habitat = "Tatlı sular, göller",
                description = "Gün Balığı, renkli ve küçük bir tatlısu balığıdır. Turuncu ve mavi renkleriyle göz kamaştırır. Sakin sularda yaşar ve böceklerle beslenir.",
                themeColor = new Color(0.90f, 0.40f, 0.20f)
            },
            new FishInfo
            {
                fishID = "fish_05", folderName = "Kum Mercanı", fishName = "Kum Mercanı",
                scientificName = "Pagellus acarne",
                habitat = "Akdeniz, Ege, Marmara",
                description = "Kum Mercanı, kumlu ve çamurlu deniz tabanlarında yaşar. Pembe-kırmızı rengiyle çok güzel bir balıktır. Küçük kabuklular ve solucanlarla beslenir.",
                themeColor = new Color(0.80f, 0.30f, 0.60f)
            },
            new FishInfo
            {
                fishID = "fish_06", folderName = "Levrek", fishName = "Levrek",
                scientificName = "Dicentrarchus labrax",
                habitat = "Akdeniz, Ege, Karadeniz",
                description = "Levrek, zarif ve güçlü bir avcı balıktır. Gümüşi parlak vücudu ile denizlerin şövalyesidir! Hem açık denizde hem kıyılarda yaşar.",
                themeColor = new Color(0.55f, 0.40f, 0.90f)
            },
            new FishInfo
            {
                fishID = "fish_07", folderName = "Yazılı Hani", fishName = "Yazılı Hani",
                scientificName = "Serranus scriba",
                habitat = "Akdeniz, Ege",
                description = "Yazılı Hani, vücudundaki ilginç çizgi ve desenlerle adını almıştır. Kayalık bölgelerde saklanmayı sever. Küçük ama çok cesur bir balıktır!",
                themeColor = new Color(0.85f, 0.25f, 0.30f)
            },
            new FishInfo
            {
                fishID = "fish_08", folderName = "Sarıkuyruk İstavrit", fishName = "Sarıkuyruk İstavrit",
                scientificName = "Trachurus mediterraneus",
                habitat = "Akdeniz, Karadeniz",
                description = "Sarıkuyruk İstavrit, sarı kuyruk yüzgeciyle kolayca tanınır. Büyük sürüler halinde yüzer ve çok hızlıdır! Denizlerin maratonculusudur.",
                themeColor = new Color(0.30f, 0.80f, 0.80f)
            },
            new FishInfo
            {
                fishID = "fish_09", folderName = "Kupes", fishName = "Küpes",
                scientificName = "Boops boops",
                habitat = "Akdeniz, Ege",
                description = "Küpes, büyük yuvarlak gözleriyle sevimli bir balıktır. Altın sarısı çizgileri vardır. Sürüler halinde kıyı sularında gezer ve yosunlarla beslenir.",
                themeColor = new Color(0.45f, 0.65f, 0.25f)
            }
        };

        // ═══════════════════════════════════════════════
        // MENU ITEMS
        // ═══════════════════════════════════════════════

        [MenuItem("AR Aquarium/⭐ Tümünü Kur (9 Balık)", false, 0)]
        private static void SetupEverything()
        {
            Debug.Log("════════════════════════════════════════");
            Debug.Log("  AR AQUARIUM - 9 BALIK KURULUMU BAŞLIYOR");
            Debug.Log("════════════════════════════════════════");

            // Eski prefab'ı sil
            if (AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Fish_AR.prefab") != null)
            {
                AssetDatabase.DeleteAsset("Assets/Prefabs/Fish_AR.prefab");
                Debug.Log("🗑 Eski Fish_AR.prefab silindi.");
            }

            // Klasörleri oluştur
            EnsureFolder("Assets", "Prefabs");
            EnsureFolder("Assets", "Resources");
            EnsureFolder("Assets/Resources", "FishData");

            // Her balık için prefab + FishData oluştur
            var allFishData = new List<ARAquarium.Data.FishData>();
            int successCount = 0;

            foreach (var fish in AllFish)
            {
                Debug.Log($"\n─── {fish.fishName} ───");
                
                string fbxPath = FindFBXInFolder(fish.folderName);
                if (string.IsNullOrEmpty(fbxPath))
                {
                    Debug.LogWarning($"⚠️ {fish.folderName} klasöründe FBX bulunamadı!");
                    continue;
                }

                // 1. Animasyon loop
                FixAnimationLoop(fbxPath);

                // 2. Animator Controller
                string controllerPath = $"Assets/Models/{fish.folderName}/{fish.fishID}_swim.controller";
                CreateAnimatorController(fbxPath, controllerPath);

                // 3. Prefab
                string prefabPath = $"{PrefabFolder}/{fish.fishID}_{SanitizeName(fish.fishName)}.prefab";
                GameObject prefab = CreateFishPrefab(fbxPath, controllerPath, prefabPath);

                if (prefab == null) continue;

                // 4. FishData ScriptableObject
                string dataPath = $"{FishDataFolder}/{fish.fishID}.asset";
                var fishData = CreateFishData(fish, prefab, dataPath);
                
                if (fishData != null)
                {
                    allFishData.Add(fishData);
                    successCount++;
                }
            }

            // 5. FishDatabase oluştur
            CreateFishDatabase(allFishData);

            // 6. AR sahnesini kur
            SetupARScene();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log("\n════════════════════════════════════════");
            Debug.Log($"  ✅ KURULUM TAMAMLANDI! {successCount}/{AllFish.Length} balık oluşturuldu.");
            Debug.Log("  ▶ Play tuşuna basarak test edin.");
            Debug.Log("  📱 iPhone: File > Build Settings > iOS > Build And Run");
            Debug.Log("════════════════════════════════════════");
        }

        [MenuItem("AR Aquarium/🗑 Tümünü Temizle", false, 50)]
        private static void CleanAll()
        {
            // Prefab'ları sil
            if (AssetDatabase.IsValidFolder(PrefabFolder))
            {
                string[] prefabs = AssetDatabase.FindAssets("t:Prefab", new[] { PrefabFolder });
                foreach (var guid in prefabs)
                    AssetDatabase.DeleteAsset(AssetDatabase.GUIDToAssetPath(guid));
            }

            // FishData'ları sil
            if (AssetDatabase.IsValidFolder(FishDataFolder))
                AssetDatabase.DeleteAsset(FishDataFolder);

            // FishDatabase sil
            if (AssetDatabase.LoadAssetAtPath<ScriptableObject>(DatabasePath) != null)
                AssetDatabase.DeleteAsset(DatabasePath);

            // Controller'ları sil
            string[] controllers = AssetDatabase.FindAssets("t:AnimatorController", new[] { ModelsRoot });
            foreach (var guid in controllers)
                AssetDatabase.DeleteAsset(AssetDatabase.GUIDToAssetPath(guid));

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("🗑 Tüm prefab, FishData, FishDatabase ve controller'lar silindi.");
        }

        // ═══════════════════════════════════════════════
        // FIND FBX
        // ═══════════════════════════════════════════════

        private static string FindFBXInFolder(string folderName)
        {
            string folderPath = $"{ModelsRoot}/{folderName}";
            if (!AssetDatabase.IsValidFolder(folderPath))
            {
                Debug.LogWarning($"⚠️ Klasör bulunamadı: {folderPath}");
                return null;
            }

            string[] guids = AssetDatabase.FindAssets("t:Model", new[] { folderPath });
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                if (path.EndsWith(".fbx", System.StringComparison.OrdinalIgnoreCase))
                {
                    Debug.Log($"   📂 FBX: {path}");
                    return path;
                }
            }
            return null;
        }

        // ═══════════════════════════════════════════════
        // ANIMATION LOOP
        // ═══════════════════════════════════════════════

        private static bool FixAnimationLoop(string fbxPath)
        {
            var importer = AssetImporter.GetAtPath(fbxPath) as ModelImporter;
            if (importer == null) return false;

            var defaultClips = importer.defaultClipAnimations;
            if (defaultClips == null || defaultClips.Length == 0) return false;

            bool changed = false;
            foreach (var clip in defaultClips)
            {
                if (!clip.loopTime)
                {
                    clip.loopTime = true;
                    clip.loop = true;
                    changed = true;
                }
            }

            if (changed)
            {
                importer.clipAnimations = defaultClips;
                importer.SaveAndReimport();
                Debug.Log($"   🔄 {defaultClips.Length} animasyon loop yapıldı.");
            }
            return true;
        }

        // ═══════════════════════════════════════════════
        // ANIMATOR CONTROLLER
        // ═══════════════════════════════════════════════

        private static bool CreateAnimatorController(string fbxPath, string controllerPath)
        {
            // Zaten varsa atla
            if (AssetDatabase.LoadAssetAtPath<RuntimeAnimatorController>(controllerPath) != null)
            {
                Debug.Log($"   ✅ Controller zaten var: {controllerPath}");
                return true;
            }

            var allAssets = AssetDatabase.LoadAllAssetsAtPath(fbxPath);
            var clips = allAssets
                .OfType<AnimationClip>()
                .Where(c => !c.name.StartsWith("__preview"))
                .ToArray();

            if (clips.Length == 0)
            {
                Debug.LogWarning("   ⚠️ Animasyon klibi bulunamadı.");
                return false;
            }

            var controller = AnimatorController.CreateAnimatorControllerAtPath(controllerPath);
            var rootStateMachine = controller.layers[0].stateMachine;
            var state = rootStateMachine.AddState(clips[0].name);
            state.motion = clips[0];
            state.speed = 1f;
            rootStateMachine.defaultState = state;

            AssetDatabase.SaveAssets();
            Debug.Log($"   ✅ Controller: {controllerPath}");
            return true;
        }

        // ═══════════════════════════════════════════════
        // PREFAB
        // ═══════════════════════════════════════════════

        private static GameObject CreateFishPrefab(string fbxPath, string controllerPath, string prefabPath)
        {
            // Zaten varsa atla
            var existing = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (existing != null)
            {
                Debug.Log($"   ✅ Prefab zaten var: {prefabPath}");
                return existing;
            }

            var fbxModel = AssetDatabase.LoadAssetAtPath<GameObject>(fbxPath);
            if (fbxModel == null)
            {
                Debug.LogError($"   ❌ FBX yüklenemedi: {fbxPath}");
                return null;
            }

            var controller = AssetDatabase.LoadAssetAtPath<RuntimeAnimatorController>(controllerPath);
            var instance = (GameObject)PrefabUtility.InstantiatePrefab(fbxModel);
            instance.name = Path.GetFileNameWithoutExtension(prefabPath);

            // Animator
            var animator = instance.GetComponent<Animator>();
            if (animator == null) animator = instance.AddComponent<Animator>();
            if (controller != null) animator.runtimeAnimatorController = controller;
            animator.applyRootMotion = false;
            animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;

            // FishRotationHandler
            instance.AddComponent<ARAquarium.Managers.FishRotationHandler>();

            // Kaydet
            var prefab = PrefabUtility.SaveAsPrefabAsset(instance, prefabPath);
            Object.DestroyImmediate(instance);

            if (prefab != null)
            {
                Debug.Log($"   ✅ Prefab: {prefabPath}");
                return prefab;
            }

            Debug.LogError($"   ❌ Prefab oluşturulamadı: {prefabPath}");
            return null;
        }

        // ═══════════════════════════════════════════════
        // FISH DATA (ScriptableObject)
        // ═══════════════════════════════════════════════

        private static ARAquarium.Data.FishData CreateFishData(FishInfo info, GameObject prefab, string dataPath)
        {
            // Zaten varsa güncelle
            var existing = AssetDatabase.LoadAssetAtPath<ARAquarium.Data.FishData>(dataPath);
            if (existing != null)
            {
                existing.arPrefab = prefab;
                EditorUtility.SetDirty(existing);
                Debug.Log($"   ✅ FishData güncellendi: {dataPath}");
                return existing;
            }

            var fishData = ScriptableObject.CreateInstance<ARAquarium.Data.FishData>();
            fishData.fishID = info.fishID;
            fishData.fishName = info.fishName;
            fishData.scientificName = info.scientificName;
            fishData.habitat = info.habitat;
            fishData.fishDescription = info.description;
            fishData.arPrefab = prefab;
            fishData.modelScale = DefaultFishScale;
            fishData.themeColor = info.themeColor;

            AssetDatabase.CreateAsset(fishData, dataPath);
            Debug.Log($"   ✅ FishData: {dataPath}");
            return fishData;
        }

        // ═══════════════════════════════════════════════
        // FISH DATABASE
        // ═══════════════════════════════════════════════

        private static void CreateFishDatabase(List<ARAquarium.Data.FishData> allFishData)
        {
            var existing = AssetDatabase.LoadAssetAtPath<ARAquarium.Data.FishDatabase>(DatabasePath);
            
            if (existing != null)
            {
                existing.fishes = allFishData;
                EditorUtility.SetDirty(existing);
                Debug.Log($"\n✅ FishDatabase güncellendi: {DatabasePath} ({allFishData.Count} balık)");
                return;
            }

            var db = ScriptableObject.CreateInstance<ARAquarium.Data.FishDatabase>();
            db.fishes = allFishData;
            AssetDatabase.CreateAsset(db, DatabasePath);
            Debug.Log($"\n✅ FishDatabase oluşturuldu: {DatabasePath} ({allFishData.Count} balık)");
        }

        // ═══════════════════════════════════════════════
        // AR SCENE SETUP
        // ═══════════════════════════════════════════════

        private static bool SetupARScene()
        {
            Debug.Log("\n[Sahne] AR test sahnesi kuruluyor...");

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            // Light
            var lightGO = new GameObject("Directional Light");
            var light = lightGO.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1f;
            light.color = new Color(1f, 0.96f, 0.84f);
            lightGO.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            // AR Session
            var arSessionGO = new GameObject("AR Session");
            arSessionGO.AddComponent<ARSession>();

            // XR Origin
            var xrOriginGO = new GameObject("XR Origin");
            var xrOrigin = xrOriginGO.AddComponent<XROrigin>();

            var cameraOffsetGO = new GameObject("Camera Offset");
            cameraOffsetGO.transform.SetParent(xrOriginGO.transform);

            var cameraGO = new GameObject("Main Camera");
            cameraGO.tag = "MainCamera";
            cameraGO.transform.SetParent(cameraOffsetGO.transform);

            var camera = cameraGO.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = Color.black;
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 50f;

            cameraGO.AddComponent<ARCameraManager>();
            cameraGO.AddComponent<ARCameraBackground>();
            AddTrackedPoseDriver(cameraGO);

            xrOrigin.CameraFloorOffsetObject = cameraOffsetGO;
            xrOrigin.Camera = camera;

            // Game Manager
            var gmGO = new GameObject("Game Manager");
            gmGO.AddComponent<ARAquarium.Managers.GameManager>();

            // UI Manager
            var uiGO = new GameObject("UI Manager");
            uiGO.AddComponent<ARAquarium.UI.UIManager>();

            // Test Spawner
            var spawnerGO = new GameObject("[TEST] Fish Spawner");
            var spawner = spawnerGO.AddComponent<ARAquarium.Managers.ARFishTestSpawner>();

            // FishDatabase ve kamerayı ata
            var fishDB = AssetDatabase.LoadAssetAtPath<ARAquarium.Data.FishDatabase>(DatabasePath);

            var so = new SerializedObject(spawner);
            SetField(so, "fishDatabase", fishDB);
            SetField(so, "arCamera", camera);
            so.ApplyModifiedProperties();

            if (fishDB != null)
                Debug.Log($"   ✅ FishDatabase ({fishDB.fishes?.Count ?? 0} balık) ve kamera atandı.");
            else
                Debug.LogWarning("   ⚠️ FishDatabase bulunamadı!");

            // Sahneyi kaydet
            if (!AssetDatabase.IsValidFolder("Assets/Scenes"))
                AssetDatabase.CreateFolder("Assets", "Scenes");

            EditorSceneManager.SaveScene(scene, ScenePath);
            AddSceneToBuildSettings(ScenePath);

            Debug.Log($"✅ Sahne: {ScenePath}");
            return true;
        }

        // ═══════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════

        private static void AddTrackedPoseDriver(GameObject cameraGO)
        {
            var tpdType = System.Type.GetType(
                "UnityEngine.InputSystem.XR.TrackedPoseDriver, Unity.InputSystem");
            if (tpdType != null)
            {
                cameraGO.AddComponent(tpdType);
                return;
            }

            var legacyType = System.Type.GetType(
                "UnityEngine.SpatialTracking.TrackedPoseDriver, UnityEngine.SpatialTracking");
            if (legacyType != null)
            {
                cameraGO.AddComponent(legacyType);
                return;
            }

            Debug.LogWarning("⚠️ TrackedPoseDriver eklenemedi.");
        }

        private static void SetField(SerializedObject so, string field, Object value)
        {
            var prop = so.FindProperty(field);
            if (prop != null) prop.objectReferenceValue = value;
        }

        private static void AddSceneToBuildSettings(string path)
        {
            var scenes = EditorBuildSettings.scenes.ToList();
            if (scenes.Any(s => s.path == path)) return;
            scenes.Insert(0, new EditorBuildSettingsScene(path, true));
            EditorBuildSettings.scenes = scenes.ToArray();
        }

        private static void EnsureFolder(string parent, string child)
        {
            string fullPath = $"{parent}/{child}";
            if (!AssetDatabase.IsValidFolder(fullPath))
                AssetDatabase.CreateFolder(parent, child);
        }

        private static string SanitizeName(string name)
        {
            return name
                .Replace(" ", "_")
                .Replace("İ", "I")
                .Replace("ı", "i")
                .Replace("ö", "o")
                .Replace("ü", "u")
                .Replace("ş", "s")
                .Replace("ç", "c")
                .Replace("ğ", "g")
                .Replace("Ö", "O")
                .Replace("Ü", "U")
                .Replace("Ş", "S")
                .Replace("Ç", "C")
                .Replace("Ğ", "G");
        }
    }
}
