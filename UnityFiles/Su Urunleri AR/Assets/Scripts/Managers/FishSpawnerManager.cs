using ARAquarium.Data;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace ARAquarium.Managers
{
    public class FishSpawnerManager : MonoBehaviour
    {
        [Header("Dependencies")]
        [SerializeField] private QRScanner qrScanner;
        [SerializeField] private FishDatabase fishDatabase;
        [SerializeField] private ARRaycastManager raycastManager;
        [SerializeField] private Camera arCamera;

        [Header("Spawn Settings")]
        [Tooltip("Default distance from camera if no plane is found")]
        [SerializeField] private float defaultSpawnDistance = 1.5f;

        private GameObject currentSpawnedFish;

        void Start()
        {
            if (fishDatabase == null)
                fishDatabase = FindObjectOfType<FishDatabase>();

            if (fishDatabase == null)
                Debug.LogError("[FishSpawner] CRITICAL: FishDatabase not found in scene!");
        }

        void OnEnable()
        {
            if (qrScanner != null)
                qrScanner.OnQRScanned += OnFishQRScanned;
        }

        void OnDisable()
        {
            if (qrScanner != null)
                qrScanner.OnQRScanned -= OnFishQRScanned;
        }

        private void OnFishQRScanned(string fishID)
        {
            if (fishDatabase == null) 
            {
                Debug.LogError("[FishSpawner] FishDatabase is not assigned!");
                return;
            }

            FishData data = fishDatabase.GetFishByID(fishID);
            if (data == null)
            {
                Debug.LogWarning($"[FishSpawner] FishData not found for ID: {fishID}. Resuming scan.");
                qrScanner.ResumeScanning();
                return;
            }

            if (data.arPrefab == null)
            {
                Debug.LogWarning($"[FishSpawner] AR Prefab is missing for fish: {data.fishName} ({fishID}).");
                qrScanner.ResumeScanning();
                return;
            }

            SpawnFish(data);
        }

        private string lastReceivedID = "NONE";

        public void SpawnByID(string fishID)
        {
            lastReceivedID = fishID;
            Debug.Log($"[FishSpawner] SpawnByID called with ID: '{fishID}'");
            if (fishDatabase == null) 
            {
                Debug.LogError("[FishSpawner] FishDatabase is NULL!");
                return;
            }

            if (fishDatabase.fishes != null)
            {
                Debug.Log($"[FishSpawner] Database has {fishDatabase.fishes.Count} fishes.");
                foreach (var f in fishDatabase.fishes)
                {
                    if (f != null)
                        Debug.Log($"[FishSpawner] DB Entry: ID='{f.fishID}' Name='{f.fishName}' Prefab='{(f.arPrefab != null ? f.arPrefab.name : "NULL")}'");
                    else
                        Debug.LogWarning("[FishSpawner] Found a NULL FishData entry in the database list!");
                }
            }
            else
            {
                Debug.LogError("[FishSpawner] database fishes list is NULL!");
            }

            FishData data = fishDatabase.GetFishByID(fishID);
            if (data != null) 
            {
                Debug.Log($"[FishSpawner] Successfully found FishData for ID '{fishID}': Name='{data.fishName}' Prefab='{(data.arPrefab != null ? data.arPrefab.name : "NULL")}'");
                SpawnFish(data);
            }
            else
            {
                Debug.LogWarning($"[FishSpawner] ID not found in database: '{fishID}'");
            }
        }

        public void SpawnFish(FishData data)
        {
            if (data == null || data.arPrefab == null)
            {
                Debug.LogError("[FishSpawner] Cannot spawn: FishData or Prefab is NULL!");
                return;
            }

            if (currentSpawnedFish != null)
            {
                Destroy(currentSpawnedFish);
            }

            // Screen center calculation (more reliable than just forward vector)
            if (arCamera == null) arCamera = Camera.main;
            
            // Cast a ray from the center of the screen
            Ray centerRay = arCamera.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0f));
            Vector3 spawnPosition = centerRay.GetPoint(1.2f); // 1.2m away, centered
            
            // Look towards the camera but keep it level
            Vector3 lookDirection = arCamera.transform.position - spawnPosition;
            lookDirection.y = 0;
            Quaternion spawnRotation = lookDirection != Vector3.zero ? Quaternion.LookRotation(lookDirection) : Quaternion.identity;
            
            Debug.Log("[FishSpawner] INSTANT SPAWN: Placing fish directly in front of camera.");

            // Scale calculation
            float scale = (data.modelScale >= 0.1f ? data.modelScale : 0.15f) * 3.0f;
            
            // Create a wrapper object to act as the true center pivot
            GameObject wrapper = new GameObject($"FishWrapper_{data.fishID}");
            if (arCamera != null)
            {
                wrapper.transform.SetParent(arCamera.transform, false);
                wrapper.transform.localPosition = new Vector3(0f, 0f, 1.2f);
                wrapper.transform.localRotation = Quaternion.Euler(0f, 180f, 0f); // Face the camera
            }
            else
            {
                wrapper.transform.position = spawnPosition;
                wrapper.transform.rotation = spawnRotation;
            }
            wrapper.transform.localScale = Vector3.one * scale;

            // Instantiate prefab at world origin to calculate clean bounds
            GameObject fishModel = Instantiate(data.arPrefab, Vector3.zero, Quaternion.identity);
            
            // Center the child model inside the wrapper
            Renderer[] renderers = fishModel.GetComponentsInChildren<Renderer>();
            if (renderers.Length > 0)
            {
                Bounds bounds = renderers[0].bounds;
                for (int i = 1; i < renderers.Length; i++)
                {
                    bounds.Encapsulate(renderers[i].bounds);
                }

                // The offset needed to move the visual center to 0,0,0
                Vector3 centerOffset = -bounds.center;
                fishModel.transform.position = centerOffset;
            }

            // Re-parent to wrapper. Keep local position (false) so the offset is maintained.
            fishModel.transform.SetParent(wrapper.transform, false);

            currentSpawnedFish = wrapper;
            
            if (currentSpawnedFish.GetComponent<FishRotationHandler>() == null)
                currentSpawnedFish.AddComponent<FishRotationHandler>();
            
            Debug.Log($"[FishSpawner] SUCCESS: Spawned {data.fishName} centered inside wrapper with scale {scale}");
        }

        // --- DIAGNOSTIC GUI REMOVED ---
        // The React Native app provides its own native UI buttons, so we don't need Unity's legacy OnGUI.

        public void ScaleCurrentFish(string direction)
        {
            if (currentSpawnedFish == null) return;
            
            // Use multiplicative scaling for smoother transitions
            float factor = (direction == "increase") ? 1.2f : 0.8f;
            Vector3 targetScale = currentSpawnedFish.transform.localScale * factor;

            // Apply and Clamp to reasonable sizes
            float finalScale = Mathf.Clamp(targetScale.x, 0.001f, 10.0f);
            currentSpawnedFish.transform.localScale = Vector3.one * finalScale;
            
            Debug.Log($"[FishSpawner] Scale Adjusted: {direction}. New Scale: {finalScale}");
        }

        public void OnRotateChange(string direction)
        {
            if (currentSpawnedFish == null) return;
            
            float amount = direction == "left" ? 15f : -15f;
            currentSpawnedFish.transform.Rotate(Vector3.up, amount, Space.Self);
        }

        public void OnDragRotate(string deltaStr)
        {
            if (currentSpawnedFish == null) return;
            
            if (float.TryParse(deltaStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out float deltaX))
            {
                // Balığı sürükleme miktarına göre döndür
                currentSpawnedFish.transform.Rotate(Vector3.up, -deltaX * 2.0f, Space.Self);
            }
        }
    }
}
