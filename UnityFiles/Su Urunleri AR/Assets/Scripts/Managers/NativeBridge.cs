using UnityEngine;
using System.Runtime.InteropServices;
using ARAquarium.Managers;

namespace ARAquarium.Managers
{
    public class NativeAPI {
#if UNITY_IOS && !UNITY_EDITOR
        [DllImport("__Internal")]
        public static extern void sendMessageToMobileApp(string message);
#endif
    }

    public class NativeBridge : MonoBehaviour
    {
        [SerializeField] private FishSpawnerManager spawnerManager;

        void Start()
        {
            if (spawnerManager == null)
                spawnerManager = GetComponent<FishSpawnerManager>();
            
            if (spawnerManager == null)
                spawnerManager = FindObjectOfType<FishSpawnerManager>();

            // REPORT IDENTITY AND READY STATE TO REACT NATIVE
            string myName = gameObject.name;
            Debug.Log($"[NativeBridge] Reporting identity to RN: {myName}");
            
            #if UNITY_IOS && !UNITY_EDITOR
            // Report who I am
            NativeAPI.sendMessageToMobileApp("Identity:" + myName);
            // Report that I am ready to receive messages
            NativeAPI.sendMessageToMobileApp("Ready");
            #endif
        }

        public void StartARSession(string _)
        {
            UnityEngine.XR.ARFoundation.ARSession arSession = FindObjectOfType<UnityEngine.XR.ARFoundation.ARSession>();
            if (arSession != null)
            {
                arSession.enabled = true;
                arSession.Reset();
                Debug.Log("[NativeBridge] ARSession Started manually.");
            }
        }

        /// <summary>
        /// This method is called from React Native via UnityMessageManager or UnitySendMessage.
        /// </summary>
        /// <param name="fishID">The ID of the fish to spawn (e.g., "fish_01")</param>
        public void OnReceiveFishID(string fishID)
        {
            Debug.Log($"[NativeBridge] BRIDGE_IN: OnReceiveFishID -> {fishID}");
            if (spawnerManager != null)
            {
                spawnerManager.SpawnByID(fishID);
            }
            else
            {
                Debug.LogError("[NativeBridge] SpawnerManager is missing!");
            }
        }

        public void OnScaleChange(string direction)
        {
            Debug.Log($"[NativeBridge] BRIDGE_IN: OnScaleChange -> {direction}");
            if (spawnerManager != null)
            {
                spawnerManager.ScaleCurrentFish(direction);
            }
        }

        public void OnRotateChange(string direction)
        {
            Debug.Log($"[NativeBridge] BRIDGE_IN: OnRotateChange -> {direction}");
            if (spawnerManager != null)
            {
                spawnerManager.OnRotateChange(direction);
            }
        }
    }
}
