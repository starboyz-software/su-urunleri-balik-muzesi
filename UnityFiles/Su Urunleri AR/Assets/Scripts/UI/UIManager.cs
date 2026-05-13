using UnityEngine;
using ARAquarium.Data;

namespace ARAquarium.UI
{
    /// <summary>
    /// Merkezi UI yönetim singleton'ı.
    /// Balık bilgi panelini açıp kapatır.
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }
        
        [SerializeField] private FishInfoUI fishInfoUI;
        
        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }
        
        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }
        
        /// <summary>
        /// Balık bilgi panelini açar.
        /// </summary>
        public void ShowFishCard(FishData data)
        {
            if (fishInfoUI != null)
                fishInfoUI.Show(data);
        }
        
        /// <summary>
        /// Balık bilgi panelini kapatır.
        /// </summary>
        public void HideFishCard()
        {
            if (fishInfoUI != null)
                fishInfoUI.Hide();
        }
    }
}
