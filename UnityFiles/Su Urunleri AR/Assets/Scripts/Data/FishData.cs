using UnityEngine;

namespace ARAquarium.Data
{
    [CreateAssetMenu(fileName = "New Fish Data", menuName = "AR Aquarium/Fish Data")]
    public class FishData : ScriptableObject
    {
        [Tooltip("The unique ID that matches the QR JSON (e.g., 'fish_01')")]
        public string fishID;
        
        [Tooltip("The display name of the fish")]
        public string fishName;
        
        [Tooltip("Scientific name of the fish species")]
        public string scientificName;
        
        [Tooltip("Natural habitat description")]
        public string habitat;
        
        [TextArea(3, 10)]
        [Tooltip("Information about the fish that will be displayed to children")]
        public string fishDescription;
        
        [Tooltip("The 3D model/prefab of the fish that will be spawned in AR")]
        public GameObject arPrefab;
        
        [Tooltip("Scale multiplier for the AR model")]
        public float modelScale = 0.15f;
        
        [Tooltip("Thumbnail sprite for UI display")]
        public Sprite thumbnail;
        
        [Tooltip("Theme color for the info card background")]
        public Color themeColor = new Color(0.1f, 0.55f, 0.85f);
    }
}
