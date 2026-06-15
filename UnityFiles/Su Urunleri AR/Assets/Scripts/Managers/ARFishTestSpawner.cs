using UnityEngine;
using System.Collections;
using ARAquarium.Data;

namespace ARAquarium.Managers
{
    /// <summary>
    /// TEST MODU: Ekranda balık isimleri buton halinde gösterilir.
    /// Butona basınca ilgili balık AR'da spawn olur.
    /// Mesh offset'i her frame otomatik düzeltilir — balık HER ZAMAN ekranda kalır.
    /// </summary>
    public class ARFishTestSpawner : MonoBehaviour
    {
        [Header("═══ Bağımlılıklar ═══")]
        [SerializeField] private FishDatabase fishDatabase;
        [SerializeField] private Camera arCamera;

        [Header("═══ Spawn ═══")]
        [SerializeField] private float spawnDistance = 2.0f;
        [SerializeField] private float defaultScale = 0.15f;

        [Header("═══ İdle Hareket ═══")]
        [SerializeField] private float bobAmplitude = 0.02f;
        [SerializeField] private float bobSpeed = 1.5f;

        // ─── Private ─────────────────────────────────
        private GameObject spawnedFish;
        private Renderer fishRenderer;
        private FishData currentFishData;
        private Vector3 desiredWorldCenter;
        private bool fishActive = false;
        private bool isReady = false;
        private string statusText = "AR başlatılıyor...";
        private float currentScale;
        
        // ─── Scroll ──────────────────────────────────
        private Vector2 fishListScroll = Vector2.zero;
        private bool showFishList = true;

        // ─── GUI Styles (cached) ─────────────────────
        private GUIStyle buttonStyle;
        private GUIStyle fishBtnStyle;
        private GUIStyle infoStyle;
        private GUIStyle titleStyle;
        private GUIStyle headerStyle;
        private bool stylesInitialized = false;

        void OnEnable()
        {
            Application.logMessageReceived += HandleLog;
        }

        void OnDisable()
        {
            Application.logMessageReceived -= HandleLog;
        }

        private void HandleLog(string logString, string stackTrace, LogType type)
        {
            #if UNITY_IOS && !UNITY_EDITOR
            try
            {
                // Accessing sendMessageToMobileApp through NativeAPI defined in ARAquarium.Managers
                NativeAPI.sendMessageToMobileApp($"LOG:[{type}] {logString}");
            }
            catch (System.Exception) {}
            #endif
        }

        // ─── Start ───────────────────────────────────
        void Start()
        {
            if (arCamera == null) arCamera = Camera.main;

            if (arCamera == null)
            {
                statusText = "❌ Kamera bulunamadı!";
                return;
            }

            currentScale = defaultScale;
            StartCoroutine(WaitForAR());
        }

        private IEnumerator WaitForAR()
        {
            yield return new WaitForSeconds(1.5f);
            isReady = true;
            
            if (fishDatabase != null && fishDatabase.fishes != null && fishDatabase.fishes.Count > 0)
                statusText = $"Hazır! {fishDatabase.fishes.Count} balık mevcut. Birini seçin.";
            else
                statusText = "⚠️ FishDatabase bulunamadı veya boş!";
        }

        // ─── Bridge Methods (Called from React Native) ───
        public void OnReceiveFishID(string fishID)
        {
            Debug.Log($"[ARFishTest] Received Fish ID from React Native: {fishID}");
            if (fishDatabase == null) return;
            FishData data = fishDatabase.GetFishByID(fishID);
            if (data != null)
            {
                DoSpawn(data);
            }
            else
            {
                Debug.LogWarning($"[ARFishTest] Fish not found in database: {fishID}");
            }
        }

        public void StartARSession(string _)
        {
            UnityEngine.XR.ARFoundation.ARSession arSession = FindObjectOfType<UnityEngine.XR.ARFoundation.ARSession>();
            if (arSession != null)
            {
                arSession.enabled = true;
                arSession.Reset();
                Debug.Log("[ARFishTest] ARSession Started manually via React Native.");
            }
        }

        // ─── LateUpdate: Mesh'i HER FRAME hedef noktada tut ─────
        void LateUpdate()
        {
            if (!fishActive || spawnedFish == null) return;

            // İdle bob hareketi
            float yBob = Mathf.Sin(Time.time * bobSpeed) * bobAmplitude;
            float xBob = Mathf.Sin(Time.time * bobSpeed * 0.7f) * bobAmplitude * 0.3f;

            if (arCamera != null && spawnedFish.transform.parent == arCamera.transform)
            {
                Vector3 desiredLocal = new Vector3(xBob, yBob, 1.2f);
                spawnedFish.transform.localPosition = Vector3.Lerp(spawnedFish.transform.localPosition, desiredLocal, Time.deltaTime * 10f);
            }
            else
            {
                Vector3 desired = desiredWorldCenter + new Vector3(xBob, yBob, 0f);
                spawnedFish.transform.position = Vector3.Lerp(spawnedFish.transform.position, desired, Time.deltaTime * 10f);
            }
        }

        // ─── Spawn ──────────────────────────────────
        private void DoSpawn(FishData data)
        {
            if (data == null || data.arPrefab == null)
            {
                statusText = "❌ Prefab atanmamış!";
                return;
            }

            // Eski balığı sil
            if (spawnedFish != null) Destroy(spawnedFish);
            fishActive = false;
            currentFishData = data;
            currentScale = (data.modelScale >= 0.1f) ? data.modelScale : defaultScale;

            Debug.Log($"[ARFishTest] Spawning: {data.fishName} (ID: {data.fishID})");

            // WRAPPER PATTERN: Pivot = görsel merkez, ölçekleme kaymasını önler
            GameObject wrapper = new GameObject($"FishWrapper_{data.fishID}");
            if (arCamera != null)
            {
                wrapper.transform.SetParent(arCamera.transform, false);
                wrapper.transform.localPosition = new Vector3(0f, 0f, 1.2f);
                wrapper.transform.localRotation = Quaternion.Euler(0f, 180f, 0f); // Face the camera
            }
            else
            {
                Ray centerRay = Camera.main != null ? Camera.main.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0f)) : arCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0f));
                desiredWorldCenter = centerRay.GetPoint(1.2f);
                wrapper.transform.position = desiredWorldCenter;
            }
            wrapper.transform.localScale = Vector3.one * currentScale;

            // Balığı orijinde spawn et (temiz bounds hesabı için)
            GameObject fishModel = Instantiate(data.arPrefab, Vector3.zero, Quaternion.identity);
            fishModel.name = $"Fish_{data.fishID}";

            // Mesh'in görsel merkezini hesapla ve wrapper pivot'una hizala
            Renderer[] renderers = fishModel.GetComponentsInChildren<Renderer>();
            if (renderers.Length > 0)
            {
                Bounds bounds = renderers[0].bounds;
                for (int i = 1; i < renderers.Length; i++)
                {
                    bounds.Encapsulate(renderers[i].bounds);
                }
                // Mesh'i kaydırarak görsel merkezini (0,0,0)'a getir
                fishModel.transform.position = -bounds.center;
            }

            // Wrapper'ın child'ı yap (localPosition korunur = centering korunur)
            fishModel.transform.SetParent(wrapper.transform, false);

            spawnedFish = wrapper;

            // Renderer'ı kaydet (child'da)
            fishRenderer = fishModel.GetComponentInChildren<Renderer>();
            if (fishRenderer == null)
            {
                statusText = "❌ Renderer bulunamadı!";
                Debug.LogError("[ARFishTest] Renderer bulunamadı!");
                return;
            }

            // FishRotationHandler ekle (wrapper'a)
            if (wrapper.GetComponent<FishRotationHandler>() == null)
                wrapper.AddComponent<FishRotationHandler>();

            // Animator
            Animator animator = fishModel.GetComponentInChildren<Animator>();
            if (animator != null)
            {
                animator.enabled = true;
                animator.speed = 1f;
            }

            fishActive = true;
            showFishList = false;
            statusText = $"🐟 {data.fishName}";

            Debug.Log($"[ARFishTest] ✅ {data.fishName} spawn edildi (wrapper centered). Scale: {currentScale}");
        }

        // ─── Styles ─────────────────────────────────
        private void InitStyles()
        {
            if (stylesInitialized) return;
            
            float s = Mathf.Max(Screen.dpi / 160f, 1f);
            
            // Genel buton stili
            buttonStyle = new GUIStyle(GUI.skin.button);
            buttonStyle.fontStyle = FontStyle.Bold;
            buttonStyle.normal.textColor = Color.white;
            buttonStyle.fontSize = Mathf.RoundToInt(24 * s);
            
            // Balık seçim butonu — büyük, renkli
            fishBtnStyle = new GUIStyle(GUI.skin.button);
            fishBtnStyle.fontStyle = FontStyle.Bold;
            fishBtnStyle.normal.textColor = Color.white;
            fishBtnStyle.fontSize = Mathf.RoundToInt(28 * s);
            fishBtnStyle.alignment = TextAnchor.MiddleLeft;
            fishBtnStyle.padding = new RectOffset(
                Mathf.RoundToInt(20 * s), Mathf.RoundToInt(20 * s),
                Mathf.RoundToInt(12 * s), Mathf.RoundToInt(12 * s));
            
            // Durum mesajı
            infoStyle = new GUIStyle(GUI.skin.label);
            infoStyle.fontStyle = FontStyle.Bold;
            infoStyle.normal.textColor = Color.white;
            infoStyle.alignment = TextAnchor.MiddleCenter;
            infoStyle.wordWrap = true;
            infoStyle.fontSize = Mathf.RoundToInt(20 * s);
            
            // Başlık
            titleStyle = new GUIStyle(GUI.skin.label);
            titleStyle.fontStyle = FontStyle.Bold;
            titleStyle.normal.textColor = new Color(1f, 0.85f, 0.2f);
            titleStyle.alignment = TextAnchor.MiddleCenter;
            titleStyle.fontSize = Mathf.RoundToInt(32 * s);
            
            // Header
            headerStyle = new GUIStyle(GUI.skin.label);
            headerStyle.fontStyle = FontStyle.Bold;
            headerStyle.normal.textColor = new Color(0.7f, 0.9f, 1f);
            headerStyle.alignment = TextAnchor.MiddleCenter;
            headerStyle.fontSize = Mathf.RoundToInt(22 * s);
            
            stylesInitialized = true;
        }

        // ═══ UI ═══════════════════════════════════════
        void OnGUI()
        {
            // The React Native app provides its own native UI buttons, so we don't need Unity's legacy OnGUI.
            // All buttons and text (including the yellow status bar) are disabled here.
        }

        // --- Helper methods for legacy UI removed to avoid clutter ---

        // ─── Scale / Rotate methods (called from React Native) ───
        public void OnScaleChange(string direction)
        {
            Debug.Log($"[ARFishTest] OnScaleChange -> {direction}");
            if (spawnedFish == null) return;

            float factor = (direction == "increase") ? 1.2f : 0.8f;
            currentScale = spawnedFish.transform.localScale.x * factor;
            currentScale = Mathf.Clamp(currentScale, 0.001f, 10.0f);
            spawnedFish.transform.localScale = Vector3.one * currentScale;
            Debug.Log($"[ARFishTest] Scale Adjusted: {direction}. New Scale: {currentScale}");
        }

        public void OnRotateChange(string direction)
        {
            Debug.Log($"[ARFishTest] OnRotateChange -> {direction}");
            if (spawnedFish == null) return;

            float amount = direction == "left" ? 15f : -15f;
            spawnedFish.transform.Rotate(Vector3.up, amount, Space.Self);
        }

        public void OnDragRotate(string deltaStr)
        {
            Debug.Log($"[ARFishTest] OnDragRotate -> {deltaStr}");
            if (spawnedFish == null) return;

            if (float.TryParse(deltaStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out float deltaX))
            {
                spawnedFish.transform.Rotate(Vector3.up, -deltaX * 2.0f, Space.Self);
            }
        }
    }
}
