using UnityEngine;
using UnityEngine.UI;
using ARAquarium.Managers;

namespace ARAquarium.UI
{
    public class ARInteractionCanvas : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private FishSpawnerManager spawnerManager;

        private void Awake()
        {
            if (spawnerManager == null)
                spawnerManager = FindObjectOfType<FishSpawnerManager>();

            CreateUI();
        }

        private void CreateUI()
        {
            // 1. Create Canvas
            GameObject canvasGO = new GameObject("AR_Interaction_Canvas");
            Canvas canvas = canvasGO.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGO.AddComponent<CanvasScaler>().uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            canvasGO.AddComponent<GraphicRaycaster>();

            // 2. Create Panel for Buttons (Right Side)
            GameObject panelGO = new GameObject("Control_Panel");
            panelGO.transform.SetParent(canvasGO.transform);
            RectTransform panelRect = panelGO.AddComponent<RectTransform>();
            panelRect.anchorMin = new Vector2(1, 0.5f);
            panelRect.anchorMax = new Vector2(1, 0.5f);
            panelRect.pivot = new Vector2(1, 0.5f);
            panelRect.anchoredPosition = new Vector2(-20, 0);
            panelRect.sizeDelta = new Vector2(100, 250);

            // 3. Create Zoom In Button (+)
            CreateButton(panelGO.transform, "ZoomIn_Btn", "+", new Vector2(0, 60), () => {
                if (spawnerManager != null) spawnerManager.ScaleCurrentFish("increase");
            });

            // 4. Create Zoom Out Button (-)
            CreateButton(panelGO.transform, "ZoomOut_Btn", "-", new Vector2(0, -60), () => {
                if (spawnerManager != null) spawnerManager.ScaleCurrentFish("decrease");
            });
        }

        private void CreateButton(Transform parent, string name, string label, Vector2 pos, UnityEngine.Events.UnityAction onClick)
        {
            GameObject btnGO = new GameObject(name);
            btnGO.transform.SetParent(parent);
            
            Image img = btnGO.AddComponent<Image>();
            img.color = new Color(0, 0, 0, 0.5f); // Semi-transparent black

            Button btn = btnGO.AddComponent<Button>();
            btn.onClick.AddListener(onClick);

            RectTransform rect = btnGO.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(80, 80);
            rect.anchoredPosition = pos;

            // Add Text
            GameObject textGO = new GameObject("Text");
            textGO.transform.SetParent(btnGO.transform);
            Text t = textGO.AddComponent<Text>();
            t.text = label;
            t.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            t.fontSize = 40;
            t.alignment = TextAnchor.MiddleCenter;
            t.color = Color.white;

            RectTransform textRect = textGO.GetComponent<RectTransform>();
            textRect.sizeDelta = rect.sizeDelta;
            textRect.anchoredPosition = Vector2.zero;
        }
    }
}
