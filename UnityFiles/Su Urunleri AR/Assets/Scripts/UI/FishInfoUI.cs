using UnityEngine;
using UnityEngine.UI;
using System.Collections;

namespace ARAquarium.UI
{
    /// <summary>
    /// Çocuklara yönelik, renkli ve animasyonlu balık bilgi paneli.
    /// Canvas üzerinde balık adı, açıklaması, bilimsel ismi ve yaşam alanını gösterir.
    /// </summary>
    public class FishInfoUI : MonoBehaviour
    {
        [Header("Panel")]
        [SerializeField] private RectTransform panelRoot;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Image backgroundImage;
        
        [Header("Text Fields")]
        [SerializeField] private Text fishNameText;
        [SerializeField] private Text descriptionText;
        [SerializeField] private Text scientificNameText;
        [SerializeField] private Text habitatText;
        
        [Header("Close Button")]
        [SerializeField] private Button closeButton;
        
        [Header("Animation")]
        [SerializeField] private float animDuration = 0.35f;
        
        private bool isVisible = false;
        
        void Awake()
        {
            if (closeButton != null)
                closeButton.onClick.AddListener(Hide);
            
            // Başlangıçta gizle
            if (panelRoot != null)
                panelRoot.gameObject.SetActive(false);
        }
        
        /// <summary>
        /// Balık bilgi panelini gösterir.
        /// </summary>
        public void Show(ARAquarium.Data.FishData data)
        {
            if (data == null || panelRoot == null) return;
            
            // Alanları doldur
            if (fishNameText != null)
            {
                fishNameText.text = $"🐟 {data.fishName}";
                fishNameText.color = Color.white;
            }
            
            if (descriptionText != null)
                descriptionText.text = data.fishDescription;
            
            if (scientificNameText != null)
                scientificNameText.text = !string.IsNullOrEmpty(data.scientificName) 
                    ? $"📖 {data.scientificName}" : "";
            
            if (habitatText != null)
                habitatText.text = !string.IsNullOrEmpty(data.habitat)
                    ? $"🌊 {data.habitat}" : "";
            
            // Tema rengini uygula
            if (backgroundImage != null)
            {
                Color bgColor = data.themeColor;
                bgColor.a = 0.92f;
                backgroundImage.color = bgColor;
            }
            
            panelRoot.gameObject.SetActive(true);
            StopAllCoroutines();
            StartCoroutine(AnimateShow());
            isVisible = true;
        }
        
        /// <summary>
        /// Paneli gizler.
        /// </summary>
        public void Hide()
        {
            if (!isVisible) return;
            StopAllCoroutines();
            StartCoroutine(AnimateHide());
        }
        
        private IEnumerator AnimateShow()
        {
            float elapsed = 0f;
            panelRoot.localScale = Vector3.one * 0.5f;
            if (canvasGroup != null) canvasGroup.alpha = 0f;
            
            while (elapsed < animDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / animDuration;
                float eased = 1f - Mathf.Pow(1f - t, 3f); // ease-out cubic
                
                panelRoot.localScale = Vector3.Lerp(Vector3.one * 0.5f, Vector3.one, eased);
                if (canvasGroup != null)
                    canvasGroup.alpha = Mathf.Lerp(0f, 1f, eased);
                
                yield return null;
            }
            
            panelRoot.localScale = Vector3.one;
            if (canvasGroup != null) canvasGroup.alpha = 1f;
        }
        
        private IEnumerator AnimateHide()
        {
            float elapsed = 0f;
            
            while (elapsed < animDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / animDuration;
                float eased = t * t; // ease-in quadratic
                
                panelRoot.localScale = Vector3.Lerp(Vector3.one, Vector3.one * 0.5f, eased);
                if (canvasGroup != null)
                    canvasGroup.alpha = Mathf.Lerp(1f, 0f, eased);
                
                yield return null;
            }
            
            panelRoot.gameObject.SetActive(false);
            isVisible = false;
        }
    }
}
