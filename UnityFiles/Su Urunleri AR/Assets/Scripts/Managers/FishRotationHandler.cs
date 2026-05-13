using UnityEngine;

namespace ARAquarium.Managers
{
    public class FishRotationHandler : MonoBehaviour
    {
        [Header("Rotation Settings")]
        [SerializeField] private float rotationSpeed = 0.5f;
        [SerializeField] private float inertiaDecay = 2.5f;
        
        [Header("Zoom Settings")]
        [SerializeField] private float minScale = 0.005f;
        [SerializeField] private float maxScale = 10.0f;
        
        // ─── Private ─────────────────────────────────
        private Vector2 lastTouchPos;
        private Vector2 rotationVelocity;
        private bool isDragging = false;
        private float initialPinchDistance;
        private Vector3 initialScale;
        
        void Update()
        {
            if (Input.touchCount == 1)
            {
                HandleSingleTouch(Input.GetTouch(0));
            }
            else if (Input.touchCount == 2)
            {
                HandlePinchZoom(Input.GetTouch(0), Input.GetTouch(1));
                isDragging = false;
            }
            else if (Input.touchCount == 0)
            {
                if (isDragging)
                    isDragging = false;
            }
            
            // Editor: Mouse desteği
            #if UNITY_EDITOR
            if (Input.touchCount == 0)
                HandleMouseInput();
            #endif
            
            ApplyInertia();
        }
        
        private void HandleSingleTouch(UnityEngine.Touch touch)
        {
            // React Native UI handles its own touches. Any touch that reaches here is a valid drag.
            Vector2 pos = touch.position;
            
            if (touch.phase == UnityEngine.TouchPhase.Began)
            {
                lastTouchPos = pos;
                isDragging = true;
                rotationVelocity = Vector2.zero;
            }
            else if (touch.phase == UnityEngine.TouchPhase.Moved && isDragging)
            {
                Vector2 delta = pos - lastTouchPos;
                ApplyRotation(delta);
                rotationVelocity = delta;
                lastTouchPos = pos;
            }
            else if (touch.phase == UnityEngine.TouchPhase.Ended || touch.phase == UnityEngine.TouchPhase.Canceled)
            {
                isDragging = false;
            }
        }
        
        private void HandlePinchZoom(UnityEngine.Touch t0, UnityEngine.Touch t1)
        {
            if (t0.phase == UnityEngine.TouchPhase.Began || t1.phase == UnityEngine.TouchPhase.Began)
            {
                initialPinchDistance = Vector2.Distance(t0.position, t1.position);
                initialScale = transform.localScale;
                return;
            }
            
            float currentDistance = Vector2.Distance(t0.position, t1.position);
            if (Mathf.Approximately(initialPinchDistance, 0f)) return;
            
            float scaleFactor = currentDistance / initialPinchDistance;
            Vector3 newScale = initialScale * scaleFactor;
            
            float clampedScale = Mathf.Clamp(newScale.x, minScale, maxScale);
            transform.localScale = Vector3.one * clampedScale;
        }
        
        private void HandleMouseInput()
        {
            if (Input.GetMouseButtonDown(0))
            {
                lastTouchPos = Input.mousePosition;
                isDragging = true;
                rotationVelocity = Vector2.zero;
            }
            else if (Input.GetMouseButton(0) && isDragging)
            {
                Vector2 delta = (Vector2)Input.mousePosition - lastTouchPos;
                ApplyRotation(delta);
                rotationVelocity = delta;
                lastTouchPos = Input.mousePosition;
            }
            else if (Input.GetMouseButtonUp(0))
            {
                isDragging = false;
            }
        }
        
        private void ApplyRotation(Vector2 delta)
        {
            float rotY = -delta.x * rotationSpeed;
            float rotX = delta.y * rotationSpeed;
            
            // X ekseninde döndürmeyi kapatalım (balık sadece sağa sola dönsün)
            transform.Rotate(Vector3.up, rotY, Space.World);
            // transform.Rotate(Vector3.right, rotX, Space.World);
        }
        
        private void ApplyInertia()
        {
            if (isDragging || rotationVelocity.sqrMagnitude < 0.01f) return;
            
            ApplyRotation(rotationVelocity * Time.deltaTime * 5f);
            rotationVelocity = Vector2.Lerp(rotationVelocity, Vector2.zero, Time.deltaTime * inertiaDecay);
        }
    }
}
