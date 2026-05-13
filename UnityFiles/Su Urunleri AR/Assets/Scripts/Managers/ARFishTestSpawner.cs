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
        [SerializeField] private float defaultScale = 0.02f;

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
            if (!fishActive || spawnedFish == null || fishRenderer == null) return;

            // İdle bob hareketi
            float yBob = Mathf.Sin(Time.time * bobSpeed) * bobAmplitude;
            float xBob = Mathf.Sin(Time.time * bobSpeed * 0.7f) * bobAmplitude * 0.3f;
            Vector3 desired = desiredWorldCenter + new Vector3(xBob, yBob, 0f);

            // Objenin pivot noktasını baz alarak kaydır
            Vector3 correction = desired - spawnedFish.transform.position;
            // Yumuşak geçiş için Lerp (isteğe bağlı ama titremeyi azaltır)
            spawnedFish.transform.position = Vector3.Lerp(spawnedFish.transform.position, desired, Time.deltaTime * 10f);
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
            currentScale = data.modelScale > 0 ? data.modelScale : defaultScale;

            // Hedef nokta: Ekranın TAM ORTASINA ray at, 1.2m mesafeye yerleştir
            // Balıkların pivot noktası genelde altta olduğu için biraz aşağı (-0.15f) ofset veriyoruz.
            Ray centerRay = arCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0f));
            desiredWorldCenter = centerRay.GetPoint(1.2f) + new Vector3(0f, -0.15f, 0f);

            Debug.Log($"[ARFishTest] Spawning: {data.fishName} (ID: {data.fishID})");

            // Balığı spawn et
            spawnedFish = Instantiate(data.arPrefab);
            spawnedFish.name = $"Fish_{data.fishID}";
            spawnedFish.transform.localScale = Vector3.one * currentScale;

            // Renderer'ı kaydet
            fishRenderer = spawnedFish.GetComponentInChildren<Renderer>();
            if (fishRenderer == null)
            {
                statusText = "❌ Renderer bulunamadı!";
                Debug.LogError("[ARFishTest] Renderer bulunamadı!");
                return;
            }

            // FishRotationHandler ekle
            var rotHandler = spawnedFish.GetComponent<FishRotationHandler>();
            if (rotHandler == null)
                spawnedFish.AddComponent<FishRotationHandler>();

            // Animator
            Animator animator = spawnedFish.GetComponentInChildren<Animator>();
            if (animator != null)
            {
                animator.enabled = true;
                animator.speed = 1f;
            }

            fishActive = true;
            showFishList = false;
            statusText = $"🐟 {data.fishName}";

            // Bilgi panelini göster
            // if (ARAquarium.UI.UIManager.Instance != null)
            //     ARAquarium.UI.UIManager.Instance.ShowFishCard(data);

            Debug.Log($"[ARFishTest] ✅ {data.fishName} spawn edildi. Scale: {currentScale}");
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
    }
}
