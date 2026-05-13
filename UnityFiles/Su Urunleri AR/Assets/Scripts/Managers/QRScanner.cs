using System;
using Unity.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using ZXing;

namespace ARAquarium.Managers
{
    public class QRScanner : MonoBehaviour
    {
        [Header("AR Configuration")]
        [SerializeField] private ARCameraManager arCameraManager;
        
        [Header("State")]
        public bool isScanning = true;
        [SerializeField] private float scanInterval = 0.5f;
        private float scanTimer = 0f;

        private IBarcodeReader barcodeReader;

        public delegate void QRScannedAction(string fishID);
        public event QRScannedAction OnQRScanned;

        // The expected JSON structure when reading QR code
        [Serializable]
        private class QRCodeData
        {
            public string id;
            public string format;
        }

        void Start()
        {
            barcodeReader = new BarcodeReader
            {
                AutoRotate = true,
                Options = new ZXing.Common.DecodingOptions
                {
                    TryHarder = false,
                    PossibleFormats = new System.Collections.Generic.List<BarcodeFormat> { BarcodeFormat.QR_CODE }
                }
            };
        }

        void OnEnable()
        {
            if (arCameraManager != null)
                arCameraManager.frameReceived += OnCameraFrameReceived;
        }

        void OnDisable()
        {
            if (arCameraManager != null)
                arCameraManager.frameReceived -= OnCameraFrameReceived;
        }

        void OnCameraFrameReceived(ARCameraFrameEventArgs eventArgs)
        {
            if (!isScanning) return;

            scanTimer += Time.deltaTime;
            if (scanTimer < scanInterval) return;

            if (arCameraManager.TryAcquireLatestCpuImage(out XRCpuImage image))
            {
                scanTimer = 0f;
                DecodeImage(image);
            }
        }

        private void DecodeImage(XRCpuImage image)
        {
            try
            {
                var conversionParams = new XRCpuImage.ConversionParams
                {
                    inputRect = new RectInt(0, 0, image.width, image.height),
                    outputDimensions = new Vector2Int(image.width / 2, image.height / 2),
                    outputFormat = TextureFormat.R8,
                    transformation = XRCpuImage.Transformation.None
                };

                int size = image.GetConvertedDataSize(conversionParams);
                byte[] rawData = new byte[size];
                var gcHandle = System.Runtime.InteropServices.GCHandle.Alloc(rawData, System.Runtime.InteropServices.GCHandleType.Pinned);
                
                try
                {
                    image.Convert(conversionParams, gcHandle.AddrOfPinnedObject(), size);
                }
                finally
                {
                    gcHandle.Free();
                }

                var lumaSource = new RGBLuminanceSource(rawData, conversionParams.outputDimensions.x, conversionParams.outputDimensions.y, RGBLuminanceSource.BitmapFormat.Gray8);
                var result = barcodeReader.Decode(lumaSource);

                if (result != null)
                {
                    HandleScanResult(result.Text);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[QRScanner] Scan Error: {ex.Message}");
            }
            finally
            {
                if (image.valid) image.Dispose();
            }
        }

        private void HandleScanResult(string text)
        {
            Debug.Log($"[QRScanner] Raw Scanned Text: {text}");
            try
            {
                QRCodeData data = JsonUtility.FromJson<QRCodeData>(text);
                if (data != null && !string.IsNullOrEmpty(data.id))
                {
                    isScanning = false;
                    Debug.Log($"[QRScanner] Successfully matched QR JSON. Fish ID: {data.id}");
                    OnQRScanned?.Invoke(data.id);
                }
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[QRScanner] Valid JSON expected but got: {text}. Error: {e.Message}");
            }
        }

        public void ResumeScanning()
        {
            isScanning = true;
            scanTimer = 0f;
        }
    }
}
