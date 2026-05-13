using System.Collections.Generic;
using UnityEngine;

namespace ARAquarium.Data
{
    [CreateAssetMenu(fileName = "Fish Database", menuName = "AR Aquarium/Fish Database")]
    public class FishDatabase : ScriptableObject
    {
        public List<FishData> fishes;

        /// <summary>
        /// Retrieves the corresponding FishData for a given fishID.
        /// </summary>
        public FishData GetFishByID(string id)
        {
            if (string.IsNullOrEmpty(id) || fishes == null) return null;
            return fishes.Find(f => f.fishID == id);
        }
    }
}
