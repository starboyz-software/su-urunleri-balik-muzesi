using UnityEngine;

namespace ARAquarium.Managers
{
    /// <summary>
    /// Merkezi oyun yöneticisi. Singleton.
    /// Framerate, sleep timeout ve AR oturum kontrolü.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }
        
        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            
            // Limit framerate to 60 to prevent device overheating while ensuring smooth AR
            Application.targetFrameRate = 60;
            
            // Further optimization: 
            // Avoid screen dimming while user is walking around the museum
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
        }
        
        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }
    }
}
